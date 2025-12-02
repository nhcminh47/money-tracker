import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/client';
import type { ChangeLogEntry } from '@/lib/db';

const DEVICE_ID = typeof window !== 'undefined'
  ? localStorage.getItem('deviceId') || (() => {
      const id = crypto.randomUUID();
      localStorage.setItem('deviceId', id);
      return id;
    })()
  : 'server';

export interface SyncStatus {
  lastSync: string | null;
  pendingChanges: number;
  isSyncing: boolean;
  error: string | null;
}

let syncStatus: SyncStatus = {
  lastSync: null,
  pendingChanges: 0,
  isSyncing: false,
  error: null,
};

// Get current sync status
export function getSyncStatus(): SyncStatus {
  return { ...syncStatus };
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

// Push local changes to Supabase
export async function pushChanges(): Promise<void> {
  if (!await isAuthenticated()) {
    console.log('Skipping push: not authenticated');
    return;
  }

  syncStatus.isSyncing = true;
  syncStatus.error = null;

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    // Get all pending changes from changelog
    const changes = await db.changelog
      .orderBy('timestamp')
      .toArray();

    syncStatus.pendingChanges = changes.length;

    if (changes.length === 0) {
      syncStatus.isSyncing = false;
      return;
    }

    // Group changes by entity type
    const changesByEntity = changes.reduce((acc: Record<string, ChangeLogEntry[]>, change) => {
      if (!acc[change.entity]) acc[change.entity] = [];
      acc[change.entity].push(change);
      return acc;
    }, {});

    // Push changes for each entity type
    for (const [entity, entityChanges] of Object.entries(changesByEntity)) {
      await pushEntityChanges(supabase, user.id, entity, entityChanges);
    }

    // Clear synced changelog entries
    await db.changelog.clear();
    
    syncStatus.pendingChanges = 0;
    syncStatus.lastSync = new Date().toISOString();
  } catch (error) {
    console.error('Push changes failed:', error);
    syncStatus.error = error instanceof Error ? error.message : 'Push failed';
    throw error;
  } finally {
    syncStatus.isSyncing = false;
  }
}

async function pushEntityChanges(
  supabase: any,
  userId: string,
  entity: string,
  changes: ChangeLogEntry[]
): Promise<void> {
  const tableName = entity === 'transaction' ? 'transactions' : 
                   entity === 'account' ? 'accounts' :
                   entity === 'category' ? 'categories' :
                   entity === 'budget' ? 'budgets' : null;

  if (!tableName) {
    console.warn(`Unknown entity type: ${entity}`);
    return;
  }

  for (const change of changes) {
    const payload = {
      ...change.payload,
      user_id: userId,
      id: change.entityId,
    };

    // Convert camelCase to snake_case for Supabase
    const supabasePayload = toSnakeCase(payload);

    try {
      if (change.op === 'create' || change.op === 'update') {
        await supabase
          .from(tableName)
          .upsert(supabasePayload, { onConflict: 'id' });
      } else if (change.op === 'delete') {
        await supabase
          .from(tableName)
          .update({ deleted: true, updated_at: new Date().toISOString() })
          .eq('id', change.entityId);
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
      });
    } catch (error) {
      console.error(`Failed to push ${entity} change:`, error);
      throw error;
    }
  }
}

// Pull remote changes from Supabase
export async function pullChanges(): Promise<void> {
  if (!await isAuthenticated()) {
    console.log('Skipping pull: not authenticated');
    return;
  }

  syncStatus.isSyncing = true;
  syncStatus.error = null;

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const lastSync = syncStatus.lastSync || '1970-01-01T00:00:00Z';

    // Pull changes for each entity type
    await pullEntityChanges(supabase, 'accounts', lastSync);
    await pullEntityChanges(supabase, 'transactions', lastSync);
    await pullEntityChanges(supabase, 'categories', lastSync);
    await pullEntityChanges(supabase, 'budgets', lastSync);

    syncStatus.lastSync = new Date().toISOString();
  } catch (error) {
    console.error('Pull changes failed:', error);
    syncStatus.error = error instanceof Error ? error.message : 'Pull failed';
    throw error;
  } finally {
    syncStatus.isSyncing = false;
  }
}

async function pullEntityChanges(
  supabase: any,
  tableName: string,
  since: string
): Promise<void> {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .gte('updated_at', since)
    .order('updated_at', { ascending: true });

  if (error) {
    console.error(`Failed to pull ${tableName}:`, error);
    throw error;
  }

  if (!data || data.length === 0) return;

  // Convert snake_case to camelCase and merge into IndexedDB
  const entities = data.map((item: any) => toCamelCase(item));

  const dbTable = tableName === 'accounts' ? db.accounts :
                 tableName === 'transactions' ? db.transactions :
                 tableName === 'categories' ? db.categories :
                 tableName === 'budgets' ? db.budgets : null;

  if (!dbTable) return;

  for (const entity of entities) {
    if (entity.deleted) {
      await dbTable.delete(entity.id);
    } else {
      // Last-Write-Wins: Use server timestamp to resolve conflicts
      const existing = await dbTable.get(entity.id);
      if (!existing || new Date(entity.updatedAt) > new Date(existing.updatedAt)) {
        await dbTable.put(entity);
      }
    }
  }
}

// Full sync: push then pull
export async function sync(): Promise<void> {
  if (!await isAuthenticated()) {
    console.log('Skipping sync: user not authenticated');
    return;
  }

  try {
    await pushChanges();
    await pullChanges();
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
}

// Auto-sync on visibility change (when user returns to tab)
if (typeof window !== 'undefined') {
  // Load last sync time from storage
  db.meta.get('lastSyncTime').then(meta => {
    if (meta?.value) {
      syncStatus.lastSync = meta.value;
    }
  });

  document.addEventListener('visibilitychange', async () => {
    if (!document.hidden && await isAuthenticated()) {
      try {
        await sync();
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }
  });

  // Auto-sync when coming back online
  window.addEventListener('online', async () => {
    if (await isAuthenticated()) {
      try {
        await sync();
      } catch (error) {
        console.error('Online sync failed:', error);
      }
    }
  });

  // Initial sync on load (after short delay)
  setTimeout(async () => {
    if (navigator.onLine && await isAuthenticated()) {
      try {
        await sync();
      } catch (error) {
        console.error('Initial sync failed:', error);
      }
    }
  }, 2000);

  // Save sync status periodically
  setInterval(() => {
    if (syncStatus.lastSync) {
      db.meta.put({ key: 'lastSyncTime', value: syncStatus.lastSync });
    }
  }, 10000); // Every 10 seconds
}

// Utility: Convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

// Utility: Convert camelCase to snake_case
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}
