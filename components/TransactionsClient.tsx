'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dropdown } from '@/components/ui/Dropdown'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { db } from '@/lib/db'
import { seedCategories } from '@/lib/db/utils'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { getAllAccounts, type Account } from '@/lib/services/accounts'
import { formatCurrency, getSettings, type AppSettings } from '@/lib/services/settings'
import {
  createTransaction,
  deleteTransaction,
  getAllTransactions,
  getTransactionSummary,
  toggleCleared,
  updateTransaction,
  type Transaction,
  type TransactionFormData,
  type TransactionSummary,
} from '@/lib/services/transactions'
import { createClient } from '@/lib/supabase/client'
import { downloadCSV, exportTransactionsCSV } from '@/lib/utils/export'
import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'

type TransactionType = 'Income' | 'Expense' | 'Transfer'

export default function TransactionsClient() {
  const { t } = useTranslation()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string; icon?: string; type: 'income' | 'expense' }>>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 0,
    totalExpense: 0,
    netAmount: 0,
    transactionCount: 0,
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [formData, setFormData] = useState<TransactionFormData>({
    accountId: '',
    amount: 0,
    currency: 'USD',
    type: 'Expense',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [filterAccountId, setFilterAccountId] = useState<string>('')
  const [filterStartDate, setFilterStartDate] = useState<string>('')
  const [filterEndDate, setFilterEndDate] = useState<string>('')

  // Load data
  useEffect(() => {
    loadData()
  }, [filterAccountId, filterStartDate, filterEndDate])

  // Set up Realtime subscriptions for live updates
  useEffect(() => {
    const supabase = createClient()

    // Subscribe to transactions table changes
    const transactionsChannel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
        },
        (payload) => {
          console.log('Transaction change detected:', payload)
          // Reload data when changes are detected from other devices
          loadData()
        },
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(transactionsChannel)
    }
  }, [])

  async function loadData() {
    try {
      await seedCategories()
      const [txns, accts, cats, appSettings] = await Promise.all([
        getAllTransactions(),
        getAllAccounts(),
        db.categories.toArray(),
        getSettings(),
      ])

      let filtered = txns
      if (filterAccountId) {
        filtered = filtered.filter((tx) => tx.accountId === filterAccountId || tx.toAccountId === filterAccountId)
      }
      if (filterStartDate && filterEndDate) {
        filtered = filtered.filter((tx) => tx.date >= filterStartDate && tx.date <= filterEndDate)
      }

      // Sort by date desc
      filtered.sort((a, b) => b.date.localeCompare(a.date))

      setTransactions(filtered)
      setAccounts(accts)
      setCategories(cats)
      setSettings(appSettings)

      const summaryData = await getTransactionSummary(
        filterAccountId || undefined,
        filterStartDate || undefined,
        filterEndDate || undefined,
      )
      setSummary(summaryData)
    } catch (error) {
      console.error('Failed to load data:', error)
      showToast(t.transactions?.loadFailed || 'Failed to load transactions', 'error')
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
  }

  function openCreateModal() {
    setEditingTransaction(null)
    setFormData({
      accountId: '',
      amount: 0,
      currency: 'USD',
      type: 'Expense',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    })
    setIsModalOpen(true)
  }

  function openEditModal(transaction: Transaction) {
    setEditingTransaction(transaction)
    setFormData({
      accountId: transaction.accountId,
      amount: transaction.amount,
      currency: transaction.currency,
      type: transaction.type,
      categoryId: transaction.categoryId,
      date: transaction.date,
      notes: transaction.notes || '',
      toAccountId: transaction.toAccountId,
      cleared: transaction.cleared,
    })
    setIsModalOpen(true)
  }

  async function handleSubmit(e?: React.FormEvent | React.MouseEvent) {
    if (e) e.preventDefault()

    // Validation
    if (!formData.accountId) {
      showToast(t.transactions?.selectAccountError || 'Please select an account', 'error')
      return
    }
    if (formData.amount <= 0) {
      showToast(t.transactions?.amountError || 'Amount must be greater than 0', 'error')
      return
    }
    if (formData.type === 'Transfer' && !formData.toAccountId) {
      showToast(t.transactions?.selectDestinationError || 'Please select a destination account for transfer', 'error')
      return
    }
    if (formData.type !== 'Transfer' && !formData.categoryId) {
      showToast(t.transactions?.selectCategoryError || 'Please select a category', 'error')
      return
    }

    try {
      const submitData = {
        ...formData,
        categoryId: formData.categoryId || null,
      }

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, submitData)
        showToast(t.transactions?.updateSuccess || 'Transaction updated successfully', 'success')
      } else {
        await createTransaction(submitData)
        showToast(t.transactions?.createSuccess || 'Transaction created successfully', 'success')
      }
      setIsModalOpen(false)
      loadData()
    } catch (error) {
      console.error('Failed to save transaction:', error)
      showToast((error as Error).message || t.transactions?.saveFailed || 'Failed to save transaction', 'error')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t.transactions?.deleteConfirm || 'Are you sure you want to delete this transaction?')) {
      return
    }

    try {
      await deleteTransaction(id)
      showToast(t.transactions?.deleteSuccess || 'Transaction deleted successfully', 'success')
      loadData()
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      showToast(t.transactions?.deleteFailed || 'Failed to delete transaction', 'error')
    }
  }

  async function handleToggleCleared(id: string) {
    try {
      await toggleCleared(id)
      loadData()
      // Trigger sync to push changes to other devices
    } catch (error) {
      console.error('Failed to toggle cleared status:', error)
      showToast(t.transactions?.saveFailed || 'Failed to update transaction', 'error')
    }
  }

  function handleTypeChange(type: TransactionType) {
    setFormData({
      ...formData,
      type,
      categoryId: type === 'Transfer' ? null : formData.categoryId,
      toAccountId: type === 'Transfer' ? formData.toAccountId : null,
    })
  }

  const filteredCategories = categories.filter((cat) => (formData.type === 'Income' ? cat.type === 'income' : cat.type === 'expense'))

  const getAccountName = (accountId?: string) => {
    if (!accountId) return ''
    return accounts.find((a) => a.id === accountId)?.name || ''
  }

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return ''
    return categories.find((c) => c.id === categoryId)?.name || ''
  }

  async function handleExportCSV() {
    try {
      const csv = await exportTransactionsCSV()
      const filename = `transactions-${new Date().toISOString().split('T')[0]}.csv`
      downloadCSV(csv, filename)
      showToast(t.transactions?.exportSuccess || 'Transactions exported successfully', 'success')
    } catch (error) {
      console.error('Failed to export transactions:', error)
      showToast(t.transactions?.exportFailed || 'Failed to export transactions', 'error')
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between pl-14 md:pl-0'>
        <h1 className='text-3xl font-bold text-gray-900'>{t.transactions?.title || 'Transactions'}</h1>
        <div className='hidden md:flex gap-2'>
          <Button
            onClick={handleExportCSV}
            variant='secondary'
            className='flex items-center gap-2'
          >
            <Download className='w-4 h-4' />
            {t.transactions?.export || 'Export CSV'}
          </Button>
          <Button onClick={openCreateModal}>{t.transactions?.addTransaction || 'Add Transaction'}</Button>
        </div>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={openCreateModal}
        className='md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all'
        aria-label={t.transactions?.addTransaction || 'Add Transaction'}
      >
        <span className='text-2xl'>+</span>
      </button>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <div className='space-y-1'>
            <p className='text-sm text-gray-500'>{t.transactions?.totalIncome || 'Total Income'}</p>
            <p className='text-2xl font-bold text-green-600'>{formatCurrency(summary.totalIncome, settings?.currency)}</p>
          </div>
        </Card>
        <Card>
          <div className='space-y-1'>
            <p className='text-sm text-gray-500'>{t.transactions?.totalExpense || 'Total Expense'}</p>
            <p className='text-2xl font-bold text-red-600'>{formatCurrency(summary.totalExpense, settings?.currency)}</p>
          </div>
        </Card>
        <Card>
          <div className='space-y-1'>
            <p className='text-sm text-gray-500'>{t.transactions?.netAmount || 'Net Amount'}</p>
            <p className={`text-2xl font-bold ${summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.netAmount, settings?.currency)}
            </p>
          </div>
        </Card>
        <Card>
          <div className='space-y-1'>
            <p className='text-sm text-gray-500'>{t.transactions?.totalTransactions || 'Total Transactions'}</p>
            <p className='text-2xl font-bold text-gray-900'>{summary.transactionCount}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <Dropdown
            label={t.transactions?.filterByAccount || 'Filter by Account'}
            value={filterAccountId}
            onChange={(value) => setFilterAccountId(value)}
            placeholder={t.transactions?.allAccounts || 'All Accounts'}
            options={[
              { value: '', label: t.transactions?.allAccounts || 'All Accounts' },
              ...accounts.map((account) => ({
                value: account.id,
                label: account.name,
              })),
            ]}
          />
          <Input
            type='date'
            label={t.transactions?.startDate || 'Start Date'}
            value={filterStartDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterStartDate(e.target.value)}
          />
          <Input
            type='date'
            label={t.transactions?.endDate || 'End Date'}
            value={filterEndDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterEndDate(e.target.value)}
          />
        </div>
      </Card>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <Card>
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg mb-4'>{t.transactions?.noTransactions || 'No transactions yet'}</p>
            <Button onClick={openCreateModal}>{t.transactions?.addFirstTransaction || 'Add Your First Transaction'}</Button>
          </div>
        </Card>
      ) : (
        <div className='space-y-3'>
          {transactions.map((transaction) => (
            <Card
              key={transaction.id}
              className='hover:shadow-md transition-shadow'
            >
              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                <div className='flex-1 space-y-1'>
                  <div className='flex items-center gap-3 flex-wrap'>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        transaction.type === 'Income'
                          ? 'bg-green-100 text-green-800'
                          : transaction.type === 'Expense'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {transaction.type === 'Income'
                        ? t.transactions?.income || 'Income'
                        : transaction.type === 'Expense'
                        ? t.transactions?.expense || 'Expense'
                        : t.transactions?.transfer || 'Transfer'}
                    </span>
                    <span className='text-sm text-gray-600'>{transaction.date}</span>
                    {transaction.cleared && (
                      <span className='text-xs text-green-600 font-medium'>✓ {t.transactions?.clearedBadge || 'Cleared'}</span>
                    )}
                  </div>
                  <div className='flex items-baseline gap-2'>
                    <p className='font-medium text-gray-900'>{getAccountName(transaction.accountId)}</p>
                    {transaction.toAccountId && <p className='text-sm text-gray-600'>→ {getAccountName(transaction.toAccountId)}</p>}
                  </div>
                  {transaction.categoryId && <p className='text-sm text-gray-600'>{getCategoryName(transaction.categoryId)}</p>}
                  {transaction.notes && <p className='text-sm text-gray-500'>{transaction.notes}</p>}
                </div>
                <div className='flex flex-col md:flex-row md:items-center gap-3 md:gap-4'>
                  <p className={`text-xl font-bold ${transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'Expense' ? '-' : '+'}
                    {formatCurrency(transaction.amount, settings?.currency)}
                  </p>
                  <div className='flex gap-2 flex-wrap'>
                    <Button
                      variant='secondary'
                      size='sm'
                      onClick={() => openEditModal(transaction)}
                    >
                      {t.common?.edit || 'Edit'}
                    </Button>
                    <Button
                      variant='secondary'
                      size='sm'
                      onClick={() => handleDelete(transaction.id)}
                    >
                      {t.common?.delete || 'Delete'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingTransaction ? t.transactions?.editTransaction || 'Edit Transaction' : t.transactions?.addTransaction || 'Add Transaction'
        }
        footer={
          <>
            <Button
              variant='secondary'
              onClick={() => setIsModalOpen(false)}
            >
              {t.common?.cancel || 'Cancel'}
            </Button>
            <Button
              variant='primary'
              onClick={handleSubmit}
            >
              {editingTransaction ? t.common?.update || 'Update Transaction' : t.common?.add || 'Add Transaction'}
            </Button>
          </>
        }
      >
        <form className='space-y-4'>
          {/* Note: form wrapper kept for semantic HTML */}
          <Dropdown
            key='transaction-type'
            label={t.transactions?.type || 'Type'}
            value={formData.type}
            onChange={(value) => handleTypeChange(value as TransactionType)}
            options={[
              { value: 'Expense', label: t.transactions?.expense || 'Expense' },
              { value: 'Income', label: t.transactions?.income || 'Income' },
              { value: 'Transfer', label: t.transactions?.transfer || 'Transfer' },
            ]}
          />

          <Dropdown
            key='transaction-account'
            label={formData.type === 'Transfer' ? t.transactions?.fromAccount || 'From Account' : t.transactions?.account || 'Account'}
            value={formData.accountId}
            onChange={(value) => setFormData({ ...formData, accountId: value })}
            placeholder={t.transactions?.selectAccount || 'Select Account'}
            options={accounts.map((account) => ({
              value: account.id,
              label: `${account.icon || ''} ${account.name}`,
            }))}
          />

          {formData.type === 'Transfer' && (
            <Dropdown
              key='transaction-to-account'
              label={t.transactions?.toAccount || 'To Account'}
              value={formData.toAccountId || ''}
              onChange={(value) => setFormData({ ...formData, toAccountId: value })}
              placeholder={t.transactions?.selectAccount || 'Select Account'}
              options={accounts
                .filter((account) => account.id !== formData.accountId)
                .map((account) => ({
                  value: account.id,
                  label: `${account.icon || ''} ${account.name}`,
                }))}
            />
          )}

          {formData.type !== 'Transfer' && (
            <Dropdown
              key='transaction-category'
              label={t.transactions?.category || 'Category'}
              value={formData.categoryId || ''}
              onChange={(value) => setFormData({ ...formData, categoryId: value })}
              placeholder={t.transactions?.selectCategory || 'Select Category'}
              options={filteredCategories.map((category) => ({
                value: category.id,
                label: `${category.icon || ''} ${category.name}`,
              }))}
            />
          )}

          <Input
            key='transaction-amount'
            type='number'
            label={t.transactions?.amount || 'Amount'}
            value={formData.amount || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            required
            min='0'
            step='0.01'
          />

          <Input
            key='transaction-date'
            type='date'
            label={t.transactions?.date || 'Date'}
            value={formData.date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <Input
            key='transaction-notes'
            type='text'
            label={t.transactions?.notes || 'Notes (optional)'}
            value={formData.notes || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className='flex items-center gap-2'>
            <input
              type='checkbox'
              id='cleared-checkbox'
              checked={formData.cleared || false}
              onChange={(e) => setFormData({ ...formData, cleared: e.target.checked })}
              className='w-4 h-4 text-sky-500 border-gray-300 rounded focus:ring-sky-500'
            />
            <label
              htmlFor='cleared-checkbox'
              className='text-sm text-gray-700 dark:text-gray-300'
            >
              ✓ {t.transactions?.cleared || 'Mark as cleared/reconciled'}
            </label>
          </div>
        </form>
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
