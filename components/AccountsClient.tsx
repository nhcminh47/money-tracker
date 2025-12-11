'use client'

import PageHeader from '@/components/PageHeader'
import { Badge, Button, EmptyState, Input, Modal, ResponsiveSelect, Spinner, Toast, ToastContainer } from '@/components/ui'
import type { Account } from '@/lib/db'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { createAccount, deleteAccount, getAccountBalance, getAllAccounts, updateAccount } from '@/lib/services/accounts'
import type { AppSettings } from '@/lib/services/settings'
import { formatCurrency, getSettings } from '@/lib/services/settings'
import { onDataChange } from '@/lib/services/sync'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const ACCOUNT_TYPES: Array<{ value: Account['type']; label: string }> = [
  { value: 'Cash', label: '💵 Cash' },
  { value: 'Bank', label: '🏦 Bank Account' },
  { value: 'Card', label: '💳 Credit/Debit Card' },
  { value: 'Wallet', label: '👛 E-Wallet' },
  { value: 'Other', label: '💰 Other' },
]

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'VND', label: 'VND - Vietnamese Dong' },
]

export default function AccountsClient() {
  const { t } = useTranslation()
  const router = useRouter()
  const [accounts, setAccounts] = useState<(Account & { balance: number })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [settings, setSettings] = useState<AppSettings | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [type, setType] = useState<Account['type']>('Bank')
  const [currency, setCurrency] = useState('USD')
  const [icon, setIcon] = useState('')

  useEffect(() => {
    loadAccounts()
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const userSettings = await getSettings()
      setSettings(userSettings)
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  // Listen for data changes from sync system
  useEffect(() => {
    const unsubscribe = onDataChange(() => {
      console.log('Data changed, reloading accounts...')
      loadAccounts()
    })

    return unsubscribe
  }, [])

  async function loadAccounts() {
    try {
      const accountsList = await getAllAccounts()
      const accountsWithBalances = await Promise.all(
        accountsList.map(async (account) => ({
          ...account,
          balance: await getAccountBalance(account.id),
        })),
      )
      setAccounts(accountsWithBalances)
    } catch (error) {
      console.error('Failed to load accounts:', error)
      showToast(t.accounts?.loadFailed || 'Failed to load accounts', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  function openCreateModal() {
    setEditingAccount(null)
    setName('')
    setType('Bank')
    setCurrency('USD')
    setIcon('')
    setIsModalOpen(true)
  }

  function openEditModal(account: Account) {
    setEditingAccount(account)
    setName(account.name)
    setType(account.type)
    setCurrency(account.currency)
    setIcon(account.icon)
    setIsModalOpen(true)
  }

  async function handleSubmit() {
    if (!name.trim()) {
      showToast(t.accounts?.nameRequired || 'Account name is required', 'error')
      return
    }

    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, {
          name: name.trim(),
          type,
          currency,
          icon: icon || undefined,
        })
        showToast(t.accounts?.updateSuccess || 'Account updated successfully', 'success')
      } else {
        await createAccount({
          name: name.trim(),
          type,
          currency,
          icon: icon || undefined,
        })
        showToast(t.accounts?.createSuccess || 'Account created successfully', 'success')
      }
      setIsModalOpen(false)
      loadAccounts()
    } catch (error) {
      console.error('Failed to save account:', error)
      showToast(t.accounts?.saveFailed || 'Failed to save account', 'error')
    }
  }

  async function handleDelete(account: Account) {
    if (!confirm(`${t.accounts?.deleteConfirm || 'Are you sure you want to delete'} "${account.name}"?`)) {
      return
    }

    try {
      await deleteAccount(account.id)
      showToast(t.accounts?.deleteSuccess || 'Account deleted successfully', 'success')
      loadAccounts()
    } catch (error: any) {
      console.error('Failed to delete account:', error)
      showToast(error.message || t.accounts?.deleteFailed || 'Failed to delete account', 'error')
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[50vh]'>
        <div className='text-center'>
          <Spinner size='lg' />
          <p className='mt-4 text-gray-600'>{t.accounts?.loadingAccounts || 'Loading accounts...'}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-6xl mx-auto'>
          <PageHeader
            title={t.accounts?.title || 'Accounts'}
            description='Manage your financial accounts'
          />

          <div className='flex justify-between items-center mb-6'>
            <div className='text-sm text-gray-600'>
              {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
            </div>
            <Button
              variant='primary'
              onClick={openCreateModal}
              className='hidden md:inline-flex'
            >
              <span className='mr-2'>+</span>
              {t.accounts?.newAccount || 'New Account'}
            </Button>
          </div>

          {/* Mobile FAB */}
          <button
            onClick={openCreateModal}
            className='md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-coral-400 hover:bg-coral-500 text-white rounded-full shadow-button hover:shadow-card flex items-center justify-center transition-all active:scale-95'
            aria-label={t.accounts?.newAccount || 'New Account'}
          >
            <span className='text-2xl'>+</span>
          </button>

          {accounts.length === 0 ? (
            <div className='bg-white rounded-card shadow-card p-12'>
              <EmptyState
                icon='💳'
                title={t.accounts?.noAccounts || 'No accounts yet'}
                description={t.accounts?.createFirstAccount || 'Create your first account to start tracking your finances!'}
                action={
                  <Button
                    variant='primary'
                    onClick={openCreateModal}
                  >
                    {t.accounts?.createAccount || 'Create Account'}
                  </Button>
                }
              />
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className='bg-white rounded-card shadow-card hover:shadow-card-hover transition-all p-6'
                >
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-12 h-12 bg-gradient-to-br from-coral-400 to-coral-500 rounded-full flex items-center justify-center text-2xl shadow-soft'>
                        {account.icon}
                      </div>
                      <div>
                        <h3 className='font-bold text-gray-900 text-lg'>{account.name}</h3>
                        <Badge variant='default'>{account.type}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className='mb-6'>
                    <p className='text-sm text-gray-500 mb-1'>{t.accounts?.balance || 'Balance'}</p>
                    <p className={`text-3xl font-bold ${account.balance >= 0 ? 'text-chart-green' : 'text-chart-red'}`}>
                      {formatCurrency(account.balance, settings?.currency)}
                    </p>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      variant='secondary'
                      size='sm'
                      fullWidth
                      onClick={() => openEditModal(account)}
                    >
                      {t.common?.edit || 'Edit'}
                    </Button>
                    <Button
                      variant='danger'
                      size='sm'
                      fullWidth
                      onClick={() => handleDelete(account)}
                    >
                      {t.common?.delete || 'Delete'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Account Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAccount ? t.accounts?.editAccount || 'Edit Account' : t.accounts?.createAccount || 'Create Account'}
        footer={
          <>
            <Button
              variant='ghost'
              onClick={() => setIsModalOpen(false)}
            >
              {t.common?.cancel || 'Cancel'}
            </Button>
            <Button
              variant='primary'
              onClick={handleSubmit}
            >
              {editingAccount ? t.common?.update || 'Update' : t.common?.create || 'Create'}
            </Button>
          </>
        }
      >
        <div className='space-y-4'>
          <Input
            key='account-name'
            label={t.accounts?.accountName || 'Account Name'}
            placeholder={t.accounts?.accountNamePlaceholder || 'e.g., Main Checking'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <ResponsiveSelect
            key='account-type'
            label={t.accounts?.accountType || 'Account Type'}
            options={ACCOUNT_TYPES}
            value={type}
            onChange={(value) => setType(value as Account['type'])}
            fullWidth
          />
          <ResponsiveSelect
            key='account-currency'
            label={t.accounts?.currency || 'Currency'}
            options={CURRENCIES}
            value={currency}
            onChange={setCurrency}
            fullWidth
          />
          <Input
            key='account-icon'
            label={t.accounts?.icon || 'Icon (optional emoji)'}
            placeholder={t.accounts?.iconPlaceholder || 'e.g., 🏦'}
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            fullWidth
          />
        </div>
      </Modal>

      {/* Toast Notifications */}
      {toast && (
        <ToastContainer>
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </ToastContainer>
      )}
    </>
  )
}
