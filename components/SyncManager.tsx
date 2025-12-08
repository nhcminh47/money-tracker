'use client'

import { cleanupRealtimeSync, initializeBackgroundSync } from '@/lib/services/sync'
import { useEffect } from 'react'

/**
 * SyncManager - Initializes background sync and WebSocket subscriptions
 * This component should be mounted once at the app root level
 */
export function SyncManager() {
  useEffect(() => {
    // Initialize all sync triggers (WebSocket, after-write, network reconnect, etc.)
    initializeBackgroundSync()

    // Cleanup on unmount (remove WebSocket subscriptions and event listeners)
    return () => {
      cleanupRealtimeSync()
    }
  }, [])

  // This component doesn't render anything visible
  return null
}
