import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/client'

/**
 * Unified API client that handles both online and offline scenarios
 * - Online: Save directly to Supabase
 * - Offline: Save to IndexedDB changelog for later sync
 */

export interface ApiResponse<T> {
  data: T | null
  error: Error | null
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return !!user
}

// Get current user ID
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id || null
}

// Check if online
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine
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

// Convert snake_case to camelCase
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

/**
 * Insert a record
 */
export async function insert<T>(table: string, data: T): Promise<ApiResponse<T>> {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { data: null, error: new Error('Not authenticated') }
  }

  const payload = { ...data, user_id: userId }
  const supabasePayload = toSnakeCase(payload)

  if (isOnline()) {
    // Online: Save directly to Supabase
    const supabase = createClient()
    const { data: result, error } = await supabase.from(table).insert(supabasePayload).select().single()

    if (error) {
      // If online but failed, save to changelog
      await saveToChangelog(table, data, 'create')
      return { data: null, error: new Error(error.message) }
    }

    return { data: toCamelCase(result) as T, error: null }
  } else {
    // Offline: Save to changelog
    await saveToChangelog(table, data, 'create')
    return { data: data as T, error: null }
  }
}

/**
 * Update a record
 */
export async function update<T extends { id: string }>(table: string, id: string, data: Partial<T>): Promise<ApiResponse<T>> {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { data: null, error: new Error('Not authenticated') }
  }

  const payload = { ...data, user_id: userId, updated_at: new Date().toISOString() }
  const supabasePayload = toSnakeCase(payload)

  if (isOnline()) {
    // Online: Update directly in Supabase
    const supabase = createClient()
    const { data: result, error } = await supabase
      .from(table)
      // @ts-expect-error - Dynamic table update
      .update(supabasePayload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      // If online but failed, save to changelog
      await saveToChangelog(table, { id, ...data }, 'update')
      return { data: null, error: new Error(error.message) }
    }

    return { data: toCamelCase(result) as T, error: null }
  } else {
    // Offline: Save to changelog
    await saveToChangelog(table, { id, ...data }, 'update')
    return { data: { id, ...data } as T, error: null }
  }
}

/**
 * Delete a record (soft delete)
 */
export async function remove(table: string, id: string): Promise<ApiResponse<void>> {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { data: null, error: new Error('Not authenticated') }
  }

  if (isOnline()) {
    // Online: Soft delete in Supabase
    const supabase = createClient()
    const { error } = await supabase
      .from(table)
      // @ts-expect-error - Dynamic table update
      .update({ deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      // If online but failed, save to changelog
      await saveToChangelog(table, { id }, 'delete')
      return { data: null, error: new Error(error.message) }
    }

    return { data: null, error: null }
  } else {
    // Offline: Save to changelog
    await saveToChangelog(table, { id }, 'delete')
    return { data: null, error: null }
  }
}

/**
 * Fetch records
 */
export async function fetch<T>(table: string, filters?: Record<string, any>): Promise<ApiResponse<T[]>> {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { data: null, error: new Error('Not authenticated') }
  }

  if (isOnline()) {
    // Online: Fetch from Supabase
    const supabase = createClient()
    let query = supabase.from(table).select('*').eq('user_id', userId).eq('deleted', false)

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
        query = query.eq(snakeKey, value)
      })
    }

    const { data, error } = await query

    if (error) {
      return { data: null, error: new Error(error.message) }
    }

    return { data: (data || []).map(toCamelCase) as T[], error: null }
  } else {
    // Offline: Fetch from IndexedDB (fallback for cached data)
    return { data: [], error: new Error('Offline: No cached data available') }
  }
}

/**
 * Save change to changelog for later sync
 */
async function saveToChangelog(entity: string, data: any, operation: 'create' | 'update' | 'delete'): Promise<void> {
  const deviceId =
    typeof window !== 'undefined'
      ? localStorage.getItem('deviceId') ||
        (() => {
          const id = crypto.randomUUID()
          localStorage.setItem('deviceId', id)
          return id
        })()
      : 'server'

  await db.changelog.add({
    id: crypto.randomUUID(),
    entity,
    entityId: data.id,
    op: operation,
    payload: data,
    timestamp: new Date().toISOString(),
    deviceId,
  })
}
