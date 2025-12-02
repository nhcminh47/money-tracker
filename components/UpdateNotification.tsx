'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function UpdateNotification() {
  const { t } = useTranslation();
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Check for waiting service worker on page load
    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg);
      if (reg.waiting) {
        setShowUpdate(true);
      }

      // Check for updates immediately
      reg.update();

      // Check for updates every hour
      const interval = setInterval(() => {
        reg.update();
      }, 60 * 60 * 1000);

      return () => clearInterval(interval);
    });

    // Listen for new service worker waiting
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    // Listen for update found
    const handleUpdateFound = async () => {
      const reg = await navigator.serviceWorker.ready;
      if (reg.waiting) {
        setShowUpdate(true);
      }
    };

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        handleUpdateFound();
      }
    });
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      // Tell the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdate(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-sky-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <RefreshCw className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm md:text-base">{t.updateAvailable}</p>
            <p className="text-xs md:text-sm text-sky-100">{t.updateDescription}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-white text-sky-600 rounded-md font-medium text-sm hover:bg-sky-50 transition-colors"
          >
            {t.updateNow}
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-sky-700 rounded-md transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
