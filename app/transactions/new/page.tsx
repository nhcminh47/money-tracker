'use client'

import AppLayout from '@/components/layouts/AppLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ResponsiveSelect } from '@/components/ui/ResponsiveSelect'
import { Toast } from '@/components/ui/Toast'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { getAllAccounts, type Account } from '@/lib/services/accounts'
import { getAllCategories, type Category } from '@/lib/services/categories'
import { createTransaction } from '@/lib/services/transactions'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

type TransactionType = 'income' | 'expense' | 'transfer'

function NewTransactionForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')

  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [formData, setFormData] = useState({
    accountId: '',
    amount: '',
    type: (typeParam?.toLowerCase() || 'expense') as TransactionType,
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    toAccountId: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [accountsData, categoriesData] = await Promise.all([getAllAccounts(), getAllCategories()])

      setAccounts(accountsData)
      setCategories(categoriesData)

      // Set default account if available
      if (accountsData.length > 0 && !formData.accountId) {
        setFormData((prev) => ({ ...prev, accountId: accountsData[0].id }))
      }

      // Set default category based on type
      const typeCategories = categoriesData.filter((c: Category) => c.type === formData.type)
      if (typeCategories.length > 0 && !formData.categoryId) {
        setFormData((prev) => ({ ...prev, categoryId: typeCategories[0].id }))
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      setToast({ message: t.transactions?.loadFailed || 'Failed to load data', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.accountId || !formData.amount || !formData.categoryId) {
      setToast({ message: t.transactions?.fillRequired || 'Please fill in all required fields', type: 'error' })
      return
    }

    if (formData.type === 'transfer' && !formData.toAccountId) {
      setToast({ message: t.transactions?.selectDestinationRequired || 'Please select a destination account for transfer', type: 'error' })
      return
    }

    setSubmitting(true)
    try {
      await createTransaction({
        accountId: formData.accountId,
        amount: parseFloat(formData.amount),
        type: (formData.type.charAt(0).toUpperCase() + formData.type.slice(1)) as 'Income' | 'Expense' | 'Transfer',
        categoryId: formData.categoryId,
        date: formData.date,
        notes: formData.description || '',
        toAccountId: formData.type === 'transfer' ? formData.toAccountId : undefined,
        currency: accounts.find((a) => a.id === formData.accountId)?.currency || 'USD',
      })

      setToast({ message: t.transactions?.createSuccess || 'Transaction created successfully', type: 'success' })
      setTimeout(() => router.push('/transactions'), 1000)
    } catch (error) {
      console.error('Failed to create transaction:', error)
      setToast({ message: t.transactions?.createFailed || 'Failed to create transaction', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const filteredCategories = categories.filter((c: Category) => c.type === formData.type)

  if (loading) {
    return (
      <AppLayout>
        <div className='flex items-center justify-center min-h-[50vh]'>
          <div className='text-gray-600 dark:text-gray-400'>{t.common?.loading || 'Loading...'}</div>
        </div>
      </AppLayout>
    )
  }

  // Show message if no accounts exist
  if (accounts.length === 0) {
    return (
      <AppLayout>
        <div className='container mx-auto px-4 py-8'>
          <div className='max-w-2xl mx-auto'>
            <div className='mb-6 flex items-center gap-4 pl-14 md:pl-0'>
              <Button
                onClick={() => router.back()}
                variant='secondary'
              >
                ← {t.common?.cancel || 'Back'}
              </Button>
            </div>

            <div className='bg-white rounded-card shadow-card p-12'>
              <div className='text-center'>
                <div className='text-6xl mb-4'>🏦</div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>{t.accounts?.noAccounts || 'No Accounts Found'}</h3>
                <p className='text-gray-600 mb-6'>
                  {t.transactions?.noAccountsMessage || 'You need to create an account before adding transactions.'}
                </p>
                <Button onClick={() => router.push('/accounts')}>{t.accounts?.newAccount || 'Add Account'}</Button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-2xl mx-auto'>
          <div className='mb-8'>
            <h1 className='text-4xl font-bold text-gray-900 mb-2'>
              {t.transactions?.newTransaction || 'New'} {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
            </h1>
            <p className='text-gray-600'>Add a new transaction to your account</p>
          </div>

          <div className='bg-white rounded-card shadow-card p-8'>
            <form
              onSubmit={handleSubmit}
              className='space-y-4'
            >
              <ResponsiveSelect
                label={t.transactions?.type || 'Type'}
                value={formData.type}
                onChange={(value) => {
                  const newType = value as TransactionType
                  setFormData((prev) => ({
                    ...prev,
                    type: newType,
                    categoryId: categories.find((c) => c.type === newType)?.id || '',
                  }))
                }}
                options={[
                  { value: 'income', label: t.transactions?.income || 'Income' },
                  { value: 'expense', label: t.transactions?.expense || 'Expense' },
                  { value: 'transfer', label: t.transactions?.transfer || 'Transfer' },
                ]}
              />

              <ResponsiveSelect
                label={t.transactions?.account || 'Account'}
                value={formData.accountId}
                onChange={(value) => setFormData((prev) => ({ ...prev, accountId: value }))}
                placeholder={t.transactions?.selectAccount || 'Select account'}
                options={accounts.map((account) => ({
                  value: account.id,
                  label: `${account.icon} ${account.name}`,
                }))}
              />

              {formData.type === 'transfer' && (
                <ResponsiveSelect
                  label={t.transactions?.toAccount || 'To Account'}
                  value={formData.toAccountId}
                  onChange={(value) => setFormData((prev) => ({ ...prev, toAccountId: value }))}
                  placeholder={t.transactions?.selectDestination || 'Select destination account'}
                  options={accounts
                    .filter((account) => account.id !== formData.accountId)
                    .map((account) => ({
                      value: account.id,
                      label: `${account.icon} ${account.name}`,
                    }))}
                />
              )}

              <Input
                label={t.transactions?.amount || 'Amount'}
                type='number'
                step='0.01'
                min='0.01'
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                required
              />

              <ResponsiveSelect
                label={t.transactions?.category || 'Category'}
                value={formData.categoryId}
                onChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                placeholder={t.transactions?.selectCategory || 'Select category'}
                options={filteredCategories.map((category) => ({
                  value: category.id,
                  label: `${category.icon} ${category.name}`,
                }))}
              />

              <Input
                label={t.transactions?.date || 'Date'}
                type='date'
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                required
              />

              <Input
                label={t.transactions?.description || 'Description (Optional)'}
                type='text'
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder={t.transactions?.descriptionPlaceholder || 'Add a note...'}
              />

              <div className='flex gap-3 pt-4'>
                <Button
                  type='submit'
                  disabled={submitting}
                  className='flex-1'
                >
                  {submitting ? t.common?.loading || 'Creating...' : t.transactions?.createTransaction || 'Create Transaction'}
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  onClick={() => router.back()}
                >
                  {t.common?.cancel || 'Cancel'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AppLayout>
  )
}

export default function NewTransactionPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <AppLayout>
            <div className='flex items-center justify-center min-h-[50vh]'>
              <div className='text-gray-600 dark:text-gray-400'>Loading...</div>
            </div>
          </AppLayout>
        }
      >
        <NewTransactionForm />
      </Suspense>
    </ProtectedRoute>
  )
}
