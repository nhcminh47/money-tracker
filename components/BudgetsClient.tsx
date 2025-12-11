'use client'

import PageHeader from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { generateBudgetRecommendations } from '@/lib/ai/insights'
import type { Budget, Category } from '@/lib/db'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { createBudget, deleteBudget, getAllBudgetStatuses, updateBudget } from '@/lib/services/budgets'
import { getAllCategories } from '@/lib/services/categories'
import type { AppSettings } from '@/lib/services/settings'
import { formatCurrency, getSettings } from '@/lib/services/settings'
import { onDataChange } from '@/lib/services/sync'
import { useEffect, useState } from 'react'

interface BudgetStatus {
  categoryId: string
  categoryName: string
  budget: Budget | undefined
  spent: number
  remaining: number
  percentage: number
  isOverBudget: boolean
}

export default function BudgetsClient() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatus[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [loadingAISuggestions, setLoadingAISuggestions] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  // Listen for data changes from sync system
  useEffect(() => {
    const unsubscribe = onDataChange(() => {
      console.log('Data changed, reloading budgets...')
      loadData()
    })

    return unsubscribe
  }, [])

  async function loadData() {
    try {
      const [cats, budgets, appSettings] = await Promise.all([getAllCategories(), getAllBudgetStatuses(), getSettings()])

      // Filter expense categories only
      const expenseCategories = cats.filter((c) => c.type === 'expense')
      setCategories(expenseCategories)
      setBudgetStatuses(budgets)
      setSettings(appSettings)
    } catch (error) {
      console.error('Failed to load budgets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleAddBudget() {
    setEditingBudget(null)
    setSelectedCategoryId('')
    setAmount('')
    setShowModal(true)
  }

  function handleEditBudget(status: BudgetStatus) {
    if (!status.budget) return
    setEditingBudget(status.budget)
    setSelectedCategoryId(status.categoryId)
    setAmount(status.budget.amount.toString())
    setShowModal(true)
  }

  async function handleSaveBudget() {
    const budgetAmount = parseFloat(amount)
    if (!selectedCategoryId || isNaN(budgetAmount) || budgetAmount <= 0) {
      alert(t.budgets?.enterAmount || 'Please select a category and enter a valid amount')
      return
    }

    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, { amount: budgetAmount })
      } else {
        await createBudget(selectedCategoryId, budgetAmount, 'monthly')
      }

      await loadData()
      setShowModal(false)
    } catch (error) {
      console.error('Failed to save budget:', error)
      alert('Failed to save budget')
    }
  }

  async function handleDeleteBudget(budgetId: string) {
    if (!confirm(t.budgets?.deleteConfirm || 'Are you sure you want to delete this budget?')) return

    try {
      await deleteBudget(budgetId)
      await loadData()
    } catch (error) {
      console.error('Failed to delete budget:', error)
      alert('Failed to delete budget')
    }
  }

  async function handleUseAISuggestions() {
    setLoadingAISuggestions(true)
    try {
      const recommendations = await generateBudgetRecommendations()

      if (recommendations.length === 0) {
        alert(t.budgets?.aiNoData || 'Not enough spending data to generate recommendations. Track expenses for at least 3 months.')
        return
      }

      // If modal is open with a category selected, fill that category's amount
      if (selectedCategoryId) {
        const recommendation = recommendations.find((r) => r.categoryId === selectedCategoryId)
        if (recommendation) {
          setAmount(recommendation.suggestedAmount.toString())
        } else {
          alert(t.budgets?.aiNoCategoryData || 'No spending history found for this category.')
        }
      } else {
        // Create budgets for all recommended categories
        if (!confirm(t.budgets?.aiCreateAllConfirm || `Create budgets for ${recommendations.length} categories based on AI analysis?`)) {
          return
        }

        for (const rec of recommendations) {
          try {
            await createBudget(rec.categoryId, rec.suggestedAmount, 'monthly')
          } catch (error) {
            console.error(`Failed to create budget for ${rec.categoryName}:`, error)
          }
        }

        await loadData()
        setShowModal(false)
        alert(t.budgets?.aiSuccess || `Successfully created ${recommendations.length} budgets!`)
      }
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error)
      alert('Failed to generate AI suggestions')
    } finally {
      setLoadingAISuggestions(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[50vh]'>
        <div className='text-center'>
          <div className='w-12 h-12 border-4 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>{t.budgets?.loadingBudgets || 'Loading budgets...'}</p>
        </div>
      </div>
    )
  }

  // Get categories with budgets
  const categoriesWithBudgets = budgetStatuses.filter((s) => s.budget)
  const categoriesWithoutBudgets = categories.filter((c) => !budgetStatuses.some((s) => s.categoryId === c.id && s.budget))

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <PageHeader
        title={t.budgets?.title || 'Budgets'}
        description={t.budgets?.subtitle || 'Set monthly spending limits for your expense categories'}
      />

      <div className='mb-6 flex items-center justify-between'>
        <div className='text-sm text-gray-600'>
          {categoriesWithBudgets.length} {categoriesWithBudgets.length === 1 ? 'budget' : 'budgets'}
        </div>
        <Button
          onClick={handleAddBudget}
          className='hidden md:inline-flex'
        >
          <span className='mr-2'>➕</span>
          {t.budgets?.addBudget || 'Add Budget'}
        </Button>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={handleAddBudget}
        className='md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-coral-400 hover:bg-coral-500 text-white rounded-full shadow-button hover:shadow-card flex items-center justify-center transition-all active:scale-95'
        aria-label={t.budgets?.addBudget || 'Add Budget'}
      >
        <span className='text-2xl'>+</span>
      </button>

      {/* Budget Overview */}
      {categoriesWithBudgets.length > 0 && (
        <div className='mb-8'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>{t.budgets?.activeBudgets || 'Active Budgets'}</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {categoriesWithBudgets.map((status) => (
              <Card key={status.categoryId}>
                <div className='p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>{status.categoryName}</h3>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleEditBudget(status)}
                        className='text-coral-600 hover:text-coral-700 text-sm'
                      >
                        {t.budgets?.edit || 'Edit'}
                      </button>
                      {status.budget && (
                        <button
                          onClick={() => handleDeleteBudget(status.budget!.id)}
                          className='text-red-600 hover:text-red-700 text-sm'
                        >
                          {t.budgets?.delete || 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Budget Progress */}
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>{t.budgets?.spent || 'Spent'}</span>
                      <span className='font-semibold text-gray-900'>{formatCurrency(status.spent, settings?.currency)}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>{t.budgets?.budget || 'Budget'}</span>
                      <span className='font-semibold text-gray-900'>
                        {status.budget && formatCurrency(status.budget.amount, settings?.currency)}
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-3 mt-3'>
                      <div
                        className={`h-3 rounded-full transition-all ${
                          status.isOverBudget ? 'bg-red-500' : status.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(status.percentage, 100)}%`,
                        }}
                      />
                    </div>
                    <div className='flex justify-between text-xs'>
                      <span className={status.isOverBudget ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                        {status.percentage.toFixed(1)}% {t.budgets?.used || 'used'}
                      </span>
                      <span className={status.remaining < 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                        {status.remaining >= 0 ? (t.budgets?.remaining || 'Remaining') + ': ' : (t.budgets?.overBy || 'Over by') + ': '}
                        {formatCurrency(Math.abs(status.remaining), settings?.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Categories without budgets */}
      {categoriesWithoutBudgets.length > 0 && (
        <div>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>{t.budgets?.noBudgets || 'Categories Without Budgets'}</h2>
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
              {categoriesWithoutBudgets.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategoryId(category.id)
                    setEditingBudget(null)
                    setAmount('')
                    setShowModal(true)
                  }}
                  className='flex items-center gap-2 p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-coral-500 hover:bg-coral-50 transition-colors'
                >
                  <span className='text-2xl'>{category.icon}</span>
                  <span className='text-sm font-medium text-gray-900'>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {categoriesWithBudgets.length === 0 && categoriesWithoutBudgets.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-gray-500 mb-4'>
            {t.budgets?.noBudgetsDesc || 'No expense categories available. Create categories first to set budgets.'}
          </p>
        </div>
      )}

      {/* Add/Edit Budget Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingBudget ? t.budgets?.editBudget || 'Edit Budget' : t.budgets?.addBudget || 'Add Budget'}
      >
        <div className='space-y-4'>
          {!editingBudget && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>{t.budgets?.category || 'Category'}</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-400 focus:border-coral-400 bg-white text-gray-900'
              >
                <option value=''>{t.budgets?.selectCategory || 'Select a category'}</option>
                {categories
                  .filter((c) => !budgetStatuses.some((s) => s.categoryId === c.id && s.budget))
                  .map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.id}
                    >
                      {cat.icon} {cat.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <Input
            type='number'
            label={t.budgets?.monthlyBudget || 'Monthly Budget Amount'}
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
            placeholder={t.budgets?.enterBudgetAmount || 'Enter budget amount'}
            min='0'
            step='0.01'
          />

          {/* AI Suggestion Button */}
          {selectedCategoryId && (
            <Button
              variant='secondary'
              onClick={handleUseAISuggestions}
              disabled={loadingAISuggestions}
              className='w-full'
            >
              {loadingAISuggestions ? (
                <>
                  <span className='w-4 h-4 border-2 border-coral-500 border-t-transparent rounded-full animate-spin mr-2' />
                  {t.budgets?.aiLoading || 'Analyzing spending...'}
                </>
              ) : (
                <>
                  <span className='mr-2'>✨</span>
                  {t.budgets?.aiSuggest || 'Use AI Suggestion'}
                </>
              )}
            </Button>
          )}

          <div className='flex gap-3 pt-4'>
            <Button
              onClick={handleSaveBudget}
              className='flex-1'
            >
              {editingBudget ? t.budgets?.updateBudget || 'Update Budget' : t.budgets?.createBudget || 'Create Budget'}
            </Button>
            <Button
              variant='secondary'
              onClick={() => setShowModal(false)}
              className='flex-1'
            >
              {t.budgets?.cancel || 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
