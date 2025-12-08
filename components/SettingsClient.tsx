'use client'

import PageHeader from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { applyTheme, getSettings, resetSettings, updateSettings, type AppSettings } from '@/lib/services/settings'
import { validatePassphrase } from '@/lib/utils/crypto'
import { clearDemoData, hasDemoData, seedDemoData } from '@/lib/utils/demoData'
import { downloadBackup, downloadCSV, exportData, exportEncrypted, exportTransactionsCSV, importEncrypted } from '@/lib/utils/export'
import { useEffect, useState } from 'react'

export default function SettingsClient() {
  const { t } = useTranslation()
  const [showExportModal, setShowExportModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [passphrase, setPassphrase] = useState('')
  const [confirmPassphrase, setConfirmPassphrase] = useState('')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [demoDataExists, setDemoDataExists] = useState(false)

  useEffect(() => {
    loadSettings()
    checkDemoData()
  }, [])

  async function checkDemoData() {
    const exists = await hasDemoData()
    setDemoDataExists(exists)
  }

  async function loadSettings() {
    try {
      const current = await getSettings()
      setSettings(current)
      applyTheme(current.theme)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setIsLoadingSettings(false)
    }
  }

  async function handleSettingChange<K extends keyof Omit<AppSettings, 'id' | 'updatedAt'>>(key: K, value: AppSettings[K]) {
    try {
      const updated = await updateSettings({ [key]: value })
      setSettings(updated)

      // Apply theme immediately if changed
      if (key === 'theme') {
        applyTheme(value as AppSettings['theme'])
      }

      // Reload page if language changed
      if (key === 'language') {
        showToast(t.settings.settingsSaved, 'success')
        setTimeout(() => window.location.reload(), 1000)
        return
      }

      showToast(t.settings.settingsSaved, 'success')
    } catch (error) {
      console.error('Failed to update settings:', error)
      showToast(t.settings.failedToSave, 'error')
    }
  }

  async function handleResetSettings() {
    if (!confirm(t.settings.resetConfirm)) {
      return
    }

    try {
      const reset = await resetSettings()
      setSettings(reset)
      applyTheme(reset.theme)
      showToast(t.settings.settingsReset, 'success')
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      console.error('Failed to reset settings:', error)
      showToast(t.settings.failedToReset, 'error')
    }
  }

  async function handleSeedDemo() {
    if (!confirm(t.settings.demoAddConfirm)) {
      return
    }

    setIsProcessing(true)
    try {
      await seedDemoData()
      setDemoDataExists(true)
      showToast(t.settings.demoAdded, 'success')
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      console.error('Failed to seed demo data:', error)
      showToast(t.settings.demoAddFailed, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleClearDemo() {
    if (!confirm(t.settings.demoClearConfirm)) {
      return
    }

    setIsProcessing(true)
    try {
      await clearDemoData()
      setDemoDataExists(false)
      showToast(t.settings.demoCleared, 'success')
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      console.error('Failed to clear demo data:', error)
      showToast(t.settings.demoClearFailed, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
  }

  async function handleExportJSON() {
    try {
      const data = await exportData()
      const jsonString = JSON.stringify(data, null, 2)
      const filename = `money-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
      downloadBackup(jsonString, filename)
      showToast(t.settings.dataExported, 'success')
    } catch (error) {
      console.error('Export failed:', error)
      showToast(t.settings.exportFailed, 'error')
    }
  }

  async function handleExportEncrypted() {
    if (!passphrase) {
      showToast(t.settings.enterPassphraseError, 'error')
      return
    }

    if (passphrase !== confirmPassphrase) {
      showToast(t.settings.passphraseMismatch, 'error')
      return
    }

    const validation = validatePassphrase(passphrase)
    if (!validation.valid) {
      showToast(validation.errors[0], 'error')
      return
    }

    setIsProcessing(true)
    try {
      const encrypted = await exportEncrypted(passphrase)
      const filename = `money-tracker-encrypted-${new Date().toISOString().split('T')[0]}.enc`
      downloadBackup(encrypted, filename)
      showToast(t.settings.backupCreated, 'success')
      setShowExportModal(false)
      setPassphrase('')
      setConfirmPassphrase('')
    } catch (error) {
      console.error('Encrypted export failed:', error)
      showToast(t.settings.backupFailed, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleExportCSV() {
    try {
      const csv = await exportTransactionsCSV()
      const filename = `transactions-${new Date().toISOString().split('T')[0]}.csv`
      downloadCSV(csv, filename)
      showToast(t.settings.csvExported, 'success')
    } catch (error) {
      console.error('CSV export failed:', error)
      showToast(t.settings.csvFailed, 'error')
    }
  }

  async function handleImport() {
    if (!importFile) {
      showToast(t.settings.selectFile, 'error')
      return
    }

    if (!passphrase) {
      showToast(t.settings.enterPassphraseImport, 'error')
      return
    }

    setIsProcessing(true)
    try {
      const text = await importFile.text()
      await importEncrypted(text, passphrase, true)
      showToast(t.settings.dataImportedRefresh, 'success')
      setShowImportModal(false)

      // Reload page to reflect imported data
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      console.error('Import failed:', error)
      showToast((error as Error).message || 'Import failed', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className='space-y-8'>
      <PageHeader
        title={t.settings?.title || 'Settings'}
        description='Manage your app preferences and data'
      />

      {/* App Settings */}
      <div className='bg-white rounded-card shadow-card p-6'>
        <h3 className='text-xl font-bold mb-6'>{t.settings.appSettings}</h3>
        {isLoadingSettings ? (
          <p className='text-gray-500'>{t.common.loading}</p>
        ) : settings ? (
          <div className='space-y-4'>
            {/* Currency */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>{t.settings.currency}</label>
              <select
                value={settings.currency}
                onChange={(e) => handleSettingChange('currency', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-400 focus:border-coral-400'
              >
                <option value='USD'>USD - US Dollar ($)</option>
                <option value='EUR'>EUR - Euro (€)</option>
                <option value='GBP'>GBP - British Pound (£)</option>
                <option value='JPY'>JPY - Japanese Yen (¥)</option>
                <option value='VND'>VND - Vietnamese Dong (₫)</option>
                <option value='CNY'>CNY - Chinese Yuan (¥)</option>
                <option value='INR'>INR - Indian Rupee (₹)</option>
                <option value='AUD'>AUD - Australian Dollar (A$)</option>
                <option value='CAD'>CAD - Canadian Dollar (C$)</option>
                <option value='CHF'>CHF - Swiss Franc (Fr)</option>
              </select>
            </div>

            {/* Date Format */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>{t.settings.dateFormat}</label>
              <select
                value={settings.dateFormat}
                onChange={(e) => handleSettingChange('dateFormat', e.target.value as AppSettings['dateFormat'])}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-400 focus:border-coral-400'
              >
                <option value='MM/DD/YYYY'>MM/DD/YYYY (12/31/2024)</option>
                <option value='DD/MM/YYYY'>DD/MM/YYYY (31/12/2024)</option>
                <option value='YYYY-MM-DD'>YYYY-MM-DD (2024-12-31)</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>{t.settings.language}</label>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value as AppSettings['language'])}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-400 focus:border-coral-400'
              >
                <option value='en'>English</option>
                <option value='vi'>Tiếng Việt</option>
              </select>
            </div>

            {/* Reset Settings */}
            <div className='pt-4 border-t border-gray-200'>
              <Button
                variant='secondary'
                onClick={handleResetSettings}
                className='w-full'
              >
                {t.settings.resetDefaults}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {/* App Info */}
      <div className='bg-white rounded-card shadow-card p-6'>
        <h3 className='text-xl font-bold mb-6'>{t.settings.appInfo}</h3>
        <div className='space-y-3'>
          <div className='flex justify-between items-center'>
            <span className='text-gray-600'>{t.version}</span>
            <span className='font-mono text-sm bg-gray-100 px-2 py-1 rounded'>{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-gray-600'>{t.settings.type}</span>
            <span className='text-sm bg-coral-100 text-coral-800 px-2 py-1 rounded'>{t.settings.pwaType}</span>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className='bg-white rounded-card shadow-card p-6'>
        <h3 className='text-xl font-bold mb-6'>{t.settings.dataManagement}</h3>
        <div className='space-y-2'>
          <Button
            variant='secondary'
            onClick={handleExportJSON}
            className='w-full justify-start'
          >
            <span className='mr-2'>📥</span>
            {t.settings.exportJSON}
          </Button>
          <Button
            variant='secondary'
            onClick={() => setShowExportModal(true)}
            className='w-full justify-start'
          >
            <span className='mr-2'>🔒</span>
            {t.settings.exportEncrypted}
          </Button>
          <Button
            variant='secondary'
            onClick={handleExportCSV}
            className='w-full justify-start'
          >
            <span className='mr-2'>📊</span>
            {t.settings.exportCSV}
          </Button>
          <Button
            variant='secondary'
            onClick={() => setShowImportModal(true)}
            className='w-full justify-start'
          >
            <span className='mr-2'>📤</span>
            {t.settings.importEncrypted}
          </Button>
        </div>
      </div>

      {/* Demo Data */}
      <div className='bg-white rounded-card shadow-card p-6'>
        <h3 className='text-xl font-bold mb-6'>{t.settings.demoData}</h3>
        <p className='text-sm text-gray-600 mb-4'>{t.settings.demoDataDesc}</p>
        <div className='space-y-2'>
          {demoDataExists ? (
            <Button
              variant='secondary'
              onClick={handleClearDemo}
              disabled={isProcessing}
              className='w-full justify-start'
            >
              <span className='mr-2'>🗑️</span>
              {isProcessing ? t.settings.clearing : t.settings.clearDemo}
            </Button>
          ) : (
            <Button
              variant='secondary'
              onClick={handleSeedDemo}
              disabled={isProcessing}
              className='w-full justify-start'
            >
              <span className='mr-2'>🎲</span>
              {isProcessing ? t.settings.adding : t.settings.addDemo}
            </Button>
          )}
        </div>
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title={t.settings.createBackupTitle}
      >
        <div className='space-y-4'>
          <p className='text-sm text-gray-600'>{t.settings.createBackupDesc}</p>
          <Input
            key='export-passphrase'
            type='password'
            label={t.settings.passphrase}
            value={passphrase}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassphrase(e.target.value)}
            placeholder={t.settings.enterPassphrase}
          />
          <Input
            key='export-confirm'
            type='password'
            label={t.settings.confirmPassphrase}
            value={confirmPassphrase}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassphrase(e.target.value)}
            placeholder={t.settings.reenterPassphrase}
          />
          <div className='text-xs text-gray-500 space-y-1'>
            <p>{t.settings.passphraseReqs}</p>
            <ul className='list-disc list-inside space-y-1'>
              <li>{t.settings.minChars}</li>
              <li>{t.settings.oneUpper}</li>
              <li>{t.settings.oneLower}</li>
              <li>{t.settings.oneNumber}</li>
            </ul>
          </div>
          <div className='flex gap-3 pt-4'>
            <Button
              onClick={handleExportEncrypted}
              disabled={isProcessing}
              className='flex-1'
            >
              {isProcessing ? t.settings.creating : t.settings.createBackup}
            </Button>
            <Button
              variant='secondary'
              onClick={() => setShowExportModal(false)}
              className='flex-1'
            >
              {t.common.cancel}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title={t.settings.importBackupTitle}
      >
        <div className='space-y-4'>
          <p className='text-sm text-red-600 font-medium'>{t.settings.importWarning}</p>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>{t.settings.backupFile}</label>
            <input
              type='file'
              accept='.enc,.json'
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-coral-50 file:text-coral-700 hover:file:bg-coral-100'
            />
          </div>
          <Input
            key='import-passphrase'
            type='password'
            label={t.settings.passphrase}
            value={passphrase}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassphrase(e.target.value)}
            placeholder={t.settings.enterYourPassphrase}
          />
          <div className='flex gap-3 pt-4'>
            <Button
              onClick={handleImport}
              disabled={isProcessing || !importFile}
              className='flex-1'
            >
              {isProcessing ? t.settings.importing : t.settings.importData}
            </Button>
            <Button
              variant='secondary'
              onClick={() => setShowImportModal(false)}
              className='flex-1'
            >
              {t.common.cancel}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
