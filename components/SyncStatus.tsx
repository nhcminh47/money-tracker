'use client';

import { useState, useEffect } from 'react';
import { getSyncStatus, sync } from '@/lib/services/sync';
import { RefreshCw } from 'lucide-react';

export function SyncStatus() {
  const [status, setStatus] = useState<{
    pending: number;
    lastSync: string | null;
    syncing: boolean;
    error: string | null;
  }>({
    pending: 0,
    lastSync: null,
    syncing: false,
    error: null,
  });

  useEffect(() => {
    loadStatus();

    // Check status every 10 seconds
    const interval = setInterval(loadStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  async function loadStatus() {
    const syncStatus = getSyncStatus();
    setStatus({
      pending: syncStatus.pendingChanges,
      lastSync: syncStatus.lastSync,
      syncing: syncStatus.isSyncing,
      error: syncStatus.error,
    });
  }

  async function triggerSync() {
    if (status.syncing || !navigator.onLine) return;

    try {
      await sync();
      await loadStatus();
    } catch (error) {
      console.error('Manual sync failed:', error);
      await loadStatus();
    }
  }

  // Don't show if no pending changes and not syncing
  if (status.pending === 0 && !status.syncing) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
        {status.syncing ? (
          <>
            <RefreshCw className="w-4 h-4 text-sky-500 animate-spin" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Syncing...</span>
          </>
        ) : status.error ? (
          <>
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-sm text-red-600 dark:text-red-400">Sync failed</span>
            {navigator.onLine && (
              <button
                onClick={triggerSync}
                className="text-xs text-sky-500 hover:text-sky-600 font-medium"
              >
                Retry
              </button>
            )}
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {status.pending} pending
            </span>
            {navigator.onLine && (
              <button
                onClick={triggerSync}
                className="text-xs text-sky-500 hover:text-sky-600 font-medium"
              >
                Sync Now
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
