'use client';

import { Download, X } from 'lucide-react';
import { useState } from 'react';
import { usePWAInstall } from '@/lib/hooks/usePWAInstall';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const { t } = useTranslation();

  // Don't show if already installed, dismissed, or not installable
  if (isInstalled || dismissed || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (!installed) {
      setDismissed(true);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-40">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        aria-label={t.common.dismiss}
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-3 pr-6">
        <div className="flex-shrink-0 w-10 h-10 bg-sky-100 dark:bg-sky-900 rounded-lg flex items-center justify-center">
          <Download className="w-5 h-5 text-sky-600 dark:text-sky-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {t.installApp}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            {t.installAppDescription}
          </p>
          
          <button
            onClick={handleInstall}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {t.install}
          </button>
        </div>
      </div>
    </div>
  );
}
