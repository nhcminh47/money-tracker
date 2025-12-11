import type { ChangeLogEntry } from '@/lib/db'
import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/client'

const DEVICE_ID =
  typeof window !== 'undefined'
    ? localStorage.getItem('deviceId') ||
      (() => {
        const id = crypto.randomUUID()
        localStorage.setItem('deviceId', id)
        return id
      })()
    : 'server'

export interface SyncStatus {
  lastSync: string | null
  pendingChanges: number
  isSyncing: boolean
  error: string | null
}

let syncStatus: SyncStatus = {
  lastSync: null,
  pendingChanges: 0,
  isSyncing: false,
  error: null,
}

let syncDebounceTimer: NodeJS.Timeout | null = null
let isSyncRunning = false
let realtimeChannel: any = null

// Event emitter for data changes
const dataChangeListeners: Set<() => void> = new Set()

// Subscribe to data change events
export function onDataChange(listener: () => void): () => void {
  dataChangeListeners.add(listener)
  return () => dataChangeListeners.delete(listener)
}

// Notify all listeners that data has changed
function notifyDataChange(): void {
  dataChangeListeners.forEach((listener) => {
    try {
      listener()
    } catch (error) {
      console.error('Error in data change listener:', error)
    }
  })
}

// Get current sync status
export function getSyncStatus(): SyncStatus {
  return { ...syncStatus }
}

/**
 * Trigger background sync (debounced to avoid excessive calls)
 * This is called after every write operation
 */
export function triggerBackgroundSync(): void {
  // Clear existing timer
  if (syncDebounceTimer) {
    clearTimeout(syncDebounceTimer)
  }

  // Debounce: wait 5 seconds after last write before syncing
  syncDebounceTimer = setTimeout(() => {
    if (!isSyncRunning) {
      sync().catch((error) => {
        console.error('Background sync failed:', error)
      })
    }
  }, 5000) // 5 second debounce
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return !!user
}

/**
 * Initialize auto-sync listeners
 * This should be called once when the app loads
 */
export function initializeBackgroundSync(): void {
  if (typeof window === 'undefined') return

  console.log('Initializing background sync...')

  // 1. Sync on network reconnect
  window.addEventListener('online', () => {
    console.log('Network reconnected, triggering sync...')
    triggerBackgroundSync()
  })

  // 2. Sync when user returns to tab (visibility change)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log('Tab became visible, checking for sync...')
      checkAndSync()
    }
  })

  // 3. Periodic sync every 60 seconds (if has pending changes)
  setInterval(() => {
    checkAndSync()
  }, 60000) // 60 seconds

  // 4. WebSocket/Realtime for multi-device sync
  initializeRealtimeSync()

  // 5. Sync on page load (initial sync)
  checkAndSync()

  console.log('Background sync initialized')
}

/**
 * Check if sync is needed and trigger if conditions are met
 */
async function checkAndSync(): Promise<void> {
  // Don't sync if already syncing
  if (isSyncRunning) {
    console.log('Sync already running, skipping...')
    return
  }

  // Don't sync if not authenticated
  if (!(await isAuthenticated())) {
    console.log('Not authenticated, skipping sync')
    return
  }

  // Don't sync if offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.log('Offline, skipping sync')
    return
  }

  // Check if there are pending changes
  const pendingChanges = await db.changelog.count()
  if (pendingChanges === 0) {
    console.log('No pending changes, skipping sync')
    // Update status to clear syncing flag
    syncStatus.pendingChanges = 0
    syncStatus.isSyncing = false
    return
  }

  console.log(`Found ${pendingChanges} pending changes, starting sync...`)
  await sync()
}

/**
 * Initialize Supabase Realtime for instant multi-device sync
 * When another device makes changes, this device will receive notifications
 */
function initializeRealtimeSync(): void {
  if (typeof window === 'undefined') return

  const supabase = createClient()

  // Subscribe to all tables for changes
  realtimeChannel = supabase
    .channel('all-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'transactions',
      },
      (payload) => {
        console.log('Realtime: Transaction changed', payload)
        handleRealtimeChange(payload)
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'accounts',
      },
      (payload) => {
        console.log('Realtime: Account changed', payload)
        handleRealtimeChange(payload)
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'categories',
      },
      (payload) => {
        console.log('Realtime: Category changed', payload)
        handleRealtimeChange(payload)
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'budgets',
      },
      (payload) => {
        console.log('Realtime: Budget changed', payload)
        handleRealtimeChange(payload)
      },
    )
    .subscribe()

  console.log('Realtime sync initialized')
}

/**
 * Handle realtime change event from Supabase
 * Trigger immediate sync to pull changes from other devices
 */
function handleRealtimeChange(payload: any): void {
  // Check if this change came from this device (to avoid echo)
  const deviceId = localStorage.getItem('deviceId')

  // If the change has device_id and it matches ours, skip
  // (This means we already have this change locally)
  if (payload.new?.device_id === deviceId || payload.old?.device_id === deviceId) {
    console.log('Realtime: Change from this device, skipping sync')
    return
  }

  console.log('Realtime: Change from another device, triggering immediate sync')

  // Trigger immediate sync (no debounce for realtime events)
  if (!isSyncRunning) {
    sync().catch((error) => {
      console.error('Realtime sync failed:', error)
    })
  }
}

/**
 * Cleanup realtime subscription
 */
export function cleanupRealtimeSync(): void {
  if (realtimeChannel) {
    const supabase = createClient()
    supabase.removeChannel(realtimeChannel)
    realtimeChannel = null
    console.log('Realtime sync cleaned up')
  }
}

// Push local changes to Supabase
export async function pushChanges(): Promise<void> {
  if (!(await isAuthenticated())) {
    console.log('Skipping push: not authenticated')
    return
  }

  syncStatus.error = null

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('No user found')

    // Get all pending changes from changelog
    const changes = await db.changelog.orderBy('timestamp').toArray()

    syncStatus.pendingChanges = changes.length

    if (changes.length === 0) {
      return
    }

    // Group changes by entity type
    const changesByEntity = changes.reduce((acc: Record<string, ChangeLogEntry[]>, change) => {
      if (!acc[change.entity]) acc[change.entity] = []
      acc[change.entity].push(change)
      return acc
    }, {})

    // Push changes for each entity type
    for (const [entity, entityChanges] of Object.entries(changesByEntity)) {
      await pushEntityChanges(supabase, user.id, entity, entityChanges)
    }

    // Clear synced changelog entries
    await db.changelog.clear()

    syncStatus.pendingChanges = 0
    syncStatus.lastSync = new Date().toISOString()
  } catch (error) {
    console.error('Push changes failed:', error)
    syncStatus.error = error instanceof Error ? error.message : 'Push failed'
    throw error
  }
}

async function pushEntityChanges(supabase: any, userId: string, entity: string, changes: ChangeLogEntry[]): Promise<void> {
  const tableName =
    entity === 'transaction'
      ? 'transactions'
      : entity === 'account'
      ? 'accounts'
      : entity === 'category'
      ? 'categories'
      : entity === 'budget'
      ? 'budgets'
      : null

  if (!tableName) {
    console.warn(`Unknown entity type: ${entity}`)
    return
  }

  for (const change of changes) {
    const payload = {
      ...change.payload,
      user_id: userId,
      id: change.entityId,
      device_id: DEVICE_ID,
    }

    // Convert camelCase to snake_case for Supabase
    const supabasePayload = toSnakeCase(payload)

    try {
      if (change.op === 'create' || change.op === 'update') {
        await supabase.from(tableName).upsert(supabasePayload, { onConflict: 'id' })
      } else if (change.op === 'delete') {
        await supabase
          .from(tableName)
          .update({ deleted: true, updated_at: new Date().toISOString(), device_id: DEVICE_ID })
          .eq('id', change.entityId)
      }

      // Also log to change_log table
      await supabase.from('change_log').insert({
        user_id: userId,
        entity,
        entity_id: change.entityId,
        operation: change.op,
        payload: change.payload,
        timestamp: change.timestamp,
        device_id: DEVICE_ID,
      })
    } catch (error) {
      console.error(`Failed to push ${entity} change:`, error)
      throw error
    }
  }
}

// Pull remote changes from Supabase
export async function pullChanges(): Promise<void> {
  if (!(await isAuthenticated())) {
    console.log('Skipping pull: not authenticated')
    return
  }

  syncStatus.error = null

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('No user found')

    const lastSync = syncStatus.lastSync || '1970-01-01T00:00:00Z'

    // Pull changes for each entity type
    await pullEntityChanges(supabase, 'accounts', lastSync, user.id)
    await pullEntityChanges(supabase, 'transactions', lastSync, user.id)
    await pullEntityChanges(supabase, 'categories', lastSync, user.id)
    await pullEntityChanges(supabase, 'budgets', lastSync, user.id)

    syncStatus.lastSync = new Date().toISOString()
  } catch (error) {
    console.error('Pull changes failed:', error)
    syncStatus.error = error instanceof Error ? error.message : 'Pull failed'
    throw error
  }
}

async function pullEntityChanges(supabase: any, tableName: string, since: string, userId?: string): Promise<void> {
  let query = supabase.from(tableName).select('*').gte('updated_at', since).order('updated_at', { ascending: true })

  // Filter by user_id if provided
  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) {
    console.error(`Failed to pull ${tableName}:`, error)
    throw error
  }

  if (!data || data.length === 0) return

  // Convert snake_case to camelCase and merge into IndexedDB
  const entities = data.map((item: any) => toCamelCase(item))

  const dbTable =
    tableName === 'accounts'
      ? db.accounts
      : tableName === 'transactions'
      ? db.transactions
      : tableName === 'categories'
      ? db.categories
      : tableName === 'budgets'
      ? db.budgets
      : null

  if (!dbTable) return

  for (const entity of entities) {
    if (entity.deleted) {
      await dbTable.delete(entity.id)
    } else {
      // Last-Write-Wins: Use server timestamp to resolve conflicts
      const existing = await dbTable.get(entity.id)
      if (!existing || new Date(entity.updatedAt) > new Date(existing.updatedAt)) {
        await dbTable.put(entity)
      }
    }
  }

  // Notify components that data has changed
  if (entities.length > 0) {
    console.log(`Pulled ${entities.length} ${tableName} - notifying UI`)
    notifyDataChange()
  }
}

// Full sync: push then pull
export async function sync(): Promise<void> {
  if (isSyncRunning) {
    console.log('Sync already in progress')
    return
  }

  if (!(await isAuthenticated())) {
    console.log('Skipping sync: user not authenticated')
    return
  }

  isSyncRunning = true
  syncStatus.isSyncing = true

  try {
    // 1. Push local changes (from changelog) to Supabase
    console.log('Pushing local changes...')
    await pushChanges()

    // 2. Pull remote changes to IndexedDB
    console.log('Pulling remote changes...')
    await pullChanges()

    // 3. Update sync status
    syncStatus.lastSync = new Date().toISOString()
    syncStatus.pendingChanges = 0
    syncStatus.error = null
    syncStatus.isSyncing = false

    // Save last sync time to storage
    await db.meta.put({ key: 'lastSyncTime', value: syncStatus.lastSync })

    console.log('Sync completed successfully')
  } catch (error) {
    console.error('Sync failed:', error)
    syncStatus.error = error instanceof Error ? error.message : 'Sync failed'
    syncStatus.isSyncing = false
    throw error
  } finally {
    isSyncRunning = false
    syncStatus.isSyncing = false
  }
}

/**
 * Manually trigger sync (for "Sync Now" button in UI)
 */
export async function manualSync(): Promise<void> {
  console.log('Manual sync triggered')
  await sync()
}

// Load last sync time from storage on initialization
if (typeof window !== 'undefined') {
  db.meta.get('lastSyncTime').then((meta) => {
    if (meta?.value) {
      syncStatus.lastSync = meta.value
    }
  })

  // Legacy visibility listener (now handled by initializeBackgroundSync)
  // Keeping for backwards compatibility
  document.addEventListener('visibilitychange', async () => {
    if (!document.hidden && (await isAuthenticated())) {
      try {
        await sync()
      } catch (error) {
        console.error('Auto-sync failed:', error)
      }
    }
  })

  // Auto-sync when coming back online
  window.addEventListener('online', async () => {
    if (await isAuthenticated()) {
      try {
        await sync()
      } catch (error) {
        console.error('Online sync failed:', error)
      }
    }
  })

  // Initial sync on load (after short delay)
  setTimeout(async () => {
    if (navigator.onLine && (await isAuthenticated())) {
      try {
        await sync()
      } catch (error) {
        console.error('Initial sync failed:', error)
      }
    }
  }, 2000)

  // Save sync status periodically
  setInterval(() => {
    if (syncStatus.lastSync) {
      db.meta.put({ key: 'lastSyncTime', value: syncStatus.lastSync })
    }
  }, 10000) // Every 10 seconds
}

// Utility: Convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      acc[camelKey] = toCamelCase(obj[key])
      return acc
    }, {} as any)
  }
  return obj
}

// Utility: Convert camelCase to snake_case
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase)
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      acc[snakeKey] = toSnakeCase(obj[key])
      return acc
    }, {} as any)
  }
  return obj
}
