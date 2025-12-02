'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to request persistent storage permission
 * This prevents data eviction on iOS and other platforms
 */
export function usePersistentStorage() {
  const [isPersisted, setIsPersisted] = useState<boolean | null>(null);

  useEffect(() => {
    async function requestPersistence() {
      if (!navigator.storage || !navigator.storage.persist) {
        console.log('Persistent storage not supported');
        setIsPersisted(false);
        return;
      }

      try {
        // Check if storage is already persisted
        const persisted = await navigator.storage.persisted();
        
        if (persisted) {
          console.log('Storage is already persisted');
          setIsPersisted(true);
          return;
        }

        // Request persistence
        const result = await navigator.storage.persist();
        console.log(`Persistent storage ${result ? 'granted' : 'denied'}`);
        setIsPersisted(result);

        // Log storage estimate
        if (navigator.storage.estimate) {
          const estimate = await navigator.storage.estimate();
          console.log('Storage estimate:', {
            usage: estimate.usage ? `${(estimate.usage / 1024 / 1024).toFixed(2)} MB` : 'unknown',
            quota: estimate.quota ? `${(estimate.quota / 1024 / 1024).toFixed(2)} MB` : 'unknown',
            usagePercent: estimate.usage && estimate.quota 
              ? `${((estimate.usage / estimate.quota) * 100).toFixed(2)}%` 
              : 'unknown',
          });
        }
      } catch (error) {
        console.error('Error requesting persistent storage:', error);
        setIsPersisted(false);
      }
    }

    requestPersistence();
  }, []);

  return isPersisted;
}
