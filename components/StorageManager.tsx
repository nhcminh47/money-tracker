'use client';

import { usePersistentStorage } from '@/lib/hooks/usePersistentStorage';

/**
 * Client component to initialize persistent storage
 * This runs on mount and requests storage persistence for the app
 */
export function StorageManager() {
  usePersistentStorage();
  return null; // This component doesn't render anything
}
