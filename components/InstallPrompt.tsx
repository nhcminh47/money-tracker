'use client'

import { usePWAInstall } from '@/lib/hooks/usePWAInstall'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { Download, X } from 'lucide-react'
import { useState } from 'react'

export function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall()
  const [dismissed, setDismissed] = useState(false)
  const { t } = useTranslation()

  // Don't show if already installed, dismissed, or not installable
  if (isInstalled || dismissed || !isInstallable) {
    return null
  }

  const handleInstall = async () => {
    const installed = await promptInstall()
    if (!installed) {
      setDismissed(true)
    }
  }

  return (
    <div className='fixed bottom-32 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-40'>
      <button
        onClick={() => setDismissed(true)}
        className='absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors'
        aria-label={t.common.dismiss}
      >
        <X className='w-4 h-4' />
      </button>

      <div className='flex items-start gap-3 pr-6'>
        <div className='flex-shrink-0 w-10 h-10 bg-coral-100 rounded-lg flex items-center justify-center'>
          <Download className='w-5 h-5 text-coral-600' />
        </div>

        <div className='flex-1 min-w-0'>
          <h3 className='text-sm font-semibold text-gray-900 mb-1'>{t.installApp}</h3>
          <p className='text-xs text-gray-600 mb-3'>{t.installAppDescription}</p>

          <button
            onClick={handleInstall}
            className='w-full bg-coral-500 hover:bg-coral-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors'
          >
            {t.install}
          </button>
        </div>
      </div>
    </div>
  )
}
