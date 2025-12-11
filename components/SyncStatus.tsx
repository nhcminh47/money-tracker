'use client'

import { getSyncStatus, sync } from '@/lib/services/sync'
import { RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'

export function SyncStatus() {
  const [status, setStatus] = useState<{
    pending: number
    lastSync: string | null
    syncing: boolean
    error: string | null
  }>({
    pending: 0,
    lastSync: null,
    syncing: false,
    error: null,
  })

  useEffect(() => {
    loadStatus()

    // Check status every 10 seconds
    const interval = setInterval(loadStatus, 10000)

    return () => clearInterval(interval)
  }, [])

  async function loadStatus() {
    const syncStatus = getSyncStatus()
    setStatus({
      pending: syncStatus.pendingChanges,
      lastSync: syncStatus.lastSync,
      syncing: syncStatus.isSyncing,
      error: syncStatus.error,
    })
  }

  async function triggerSync() {
    if (status.syncing || !navigator.onLine) return

    try {
      await sync()
      await loadStatus()
    } catch (error) {
      console.error('Manual sync failed:', error)
      await loadStatus()
    }
  }

  // Only show when actively syncing or has error
  // Don't show for pending changes (background sync will handle it)
  if (!status.syncing && !status.error) return null

  return (
    <div className='fixed bottom-24 md:bottom-4 right-4 z-50'>
      <div className='bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2.5 flex items-center gap-2'>
        {status.syncing ? (
          <>
            <RefreshCw className='w-4 h-4 text-coral-500 animate-spin' />
            <span className='text-xs text-gray-700'>Syncing...</span>
          </>
        ) : status.error ? (
          <>
            <div className='w-2 h-2 bg-red-500 rounded-full' />
            <span className='text-xs text-red-600'>Sync failed</span>
            {navigator.onLine && (
              <button
                onClick={triggerSync}
                className='text-xs text-coral-500 hover:text-coral-600 font-medium ml-1'
              >
                Retry
              </button>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
