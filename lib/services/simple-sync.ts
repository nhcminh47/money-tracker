import { getCurrentUserId, isAuthenticated, isOnline } from '@/lib/api/supabase-client'
import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/client'

export interface SyncStatus {
  isSyncing: boolean
  pendingChanges: number
  lastSync: string | null
  error: string | null
}

let syncStatus: SyncStatus = {
  isSyncing: false,
  pendingChanges: 0,
  lastSync: null,
  error: null,
}

export function getSyncStatus(): SyncStatus {
  return { ...syncStatus }
}

/**
 * Sync pending changes from changelog to Supabase
 */
export async function syncPendingChanges(): Promise<void> {
  if (!isOnline() || !(await isAuthenticated())) {
    console.log('Cannot sync: offline or not authenticated')
    return
  }

  if (syncStatus.isSyncing) {
    console.log('Sync already in progress')
    return
  }

  syncStatus.isSyncing = true
  syncStatus.error = null

  try {
    const supabase = createClient()
    const userId = await getCurrentUserId()

    if (!userId) {
      throw new Error('No user ID')
    }

    // Get all pending changes
    const changes = await db.changelog.orderBy('timestamp').toArray()
    syncStatus.pendingChanges = changes.length

    if (changes.length === 0) {
      syncStatus.isSyncing = false
      return
    }

    console.log(`Syncing ${changes.length} pending changes...`)

    // Process each change
    for (const change of changes) {
      const tableName =
        change.entity === 'transaction'
          ? 'transactions'
          : change.entity === 'account'
          ? 'accounts'
          : change.entity === 'category'
          ? 'categories'
          : change.entity === 'budget'
          ? 'budgets'
          : null

      if (!tableName) continue

      const payload = {
        ...change.payload,
        user_id: userId,
      }

      // Convert camelCase to snake_case
      const supabasePayload = toSnakeCase(payload)

      try {
        if (change.op === 'create') {
          const { error } = await supabase.from(tableName).insert(supabasePayload)
          if (error) throw error
        } else if (change.op === 'update') {
          const { error } = await supabase
            .from(tableName)
            // @ts-expect-error - Dynamic table update
            .update(supabasePayload)
            .eq('id', change.entityId)
            .eq('user_id', userId)
          if (error) throw error
        } else if (change.op === 'delete') {
          const { error } = await supabase
            .from(tableName)
            // @ts-expect-error - Dynamic table update
            .update({ deleted: true, updated_at: new Date().toISOString() })
            .eq('id', change.entityId)
            .eq('user_id', userId)
          if (error) throw error
        }

        // Remove from changelog after successful sync
        await db.changelog.delete(change.id)
      } catch (error) {
        console.error(`Failed to sync change ${change.id}:`, error)
        // Continue with next change
      }
    }

    syncStatus.pendingChanges = 0
    syncStatus.lastSync = new Date().toISOString()
    console.log('Sync completed successfully')
  } catch (error) {
    console.error('Sync failed:', error)
    syncStatus.error = error instanceof Error ? error.message : 'Sync failed'
  } finally {
    syncStatus.isSyncing = false
  }
}

// Convert camelCase to snake_case
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

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    console.log('Back online, syncing pending changes...')
    await syncPendingChanges()
  })

  // Check for pending changes on load
  setTimeout(async () => {
    const pendingCount = await db.changelog.count()
    syncStatus.pendingChanges = pendingCount

    if (pendingCount > 0 && isOnline() && (await isAuthenticated())) {
      console.log(`Found ${pendingCount} pending changes, syncing...`)
      await syncPendingChanges()
    }
  }, 2000)
}
