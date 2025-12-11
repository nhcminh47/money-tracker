'use client'

import { useTranslation } from '@/lib/i18n/useTranslation'
import { formatCurrency } from '@/lib/utils'
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import type { DateRange } from './DateRangePicker'
import type { ReportFilters } from './ReportFilters'

interface Transaction {
  id: string
  type: 'income' | 'expense' | 'transfer'
  amount: number
  date: string
  account_id: string
  category_id?: string
  cleared: boolean
}

interface Budget {
  id: string
  category_id: string
  amount: number
  period: string
}

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color?: string
}

interface BudgetPerformanceReportProps {
  transactions: Transaction[]
  budgets: Budget[]
  categories: Category[]
  dateRange: DateRange
  filters: ReportFilters
  currencySymbol: string
}

export default function BudgetPerformanceReport({
  transactions,
  budgets,
  categories,
  dateRange,
  filters,
  currencySymbol,
}: BudgetPerformanceReportProps) {
  const { t } = useTranslation()

  const budgetData = useMemo(() => {
    const budgetMap = new Map<
      string,
      {
        categoryId: string
        categoryName: string
        budgetAmount: number
        actualAmount: number
        variance: number
        variancePercent: number
        transactionCount: number
        status: 'under' | 'near' | 'over'
        color: string
      }
    >()

    // Filter transactions for the period
    const filteredTransactions = transactions.filter((txn) => {
      if (txn.type !== 'expense') return false
      if (txn.date < dateRange.startDate || txn.date > dateRange.endDate) return false
      if (filters.accounts.length > 0 && !filters.accounts.includes(txn.account_id)) return false
      if (filters.categories.length > 0 && txn.category_id && !filters.categories.includes(txn.category_id)) return false
      if (filters.clearedStatus === 'cleared' && !txn.cleared) return false
      if (filters.clearedStatus === 'uncleared' && txn.cleared) return false
      return true
    })

    // Process each budget
    budgets.forEach((budget) => {
      if (filters.categories.length > 0 && !filters.categories.includes(budget.category_id)) return

      const category = categories.find((c) => c.id === budget.category_id)
      if (!category || category.type !== 'expense') return

      const categoryTransactions = filteredTransactions.filter((t) => t.category_id === budget.category_id)
      const actualAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0)
      const variance = budget.amount - actualAmount
      const variancePercent = budget.amount > 0 ? (actualAmount / budget.amount) * 100 : 0

      let status: 'under' | 'near' | 'over' = 'under'
      if (variancePercent >= 100) status = 'over'
      else if (variancePercent >= 80) status = 'near'

      budgetMap.set(budget.category_id, {
        categoryId: budget.category_id,
        categoryName: category.name,
        budgetAmount: budget.amount,
        actualAmount,
        variance,
        variancePercent,
        transactionCount: categoryTransactions.length,
        status,
        color: category.color || '#94a3b8',
      })
    })

    return Array.from(budgetMap.values()).sort((a, b) => b.variancePercent - a.variancePercent)
  }, [transactions, budgets, categories, dateRange, filters])

  const summary = useMemo(() => {
    const totalBudgeted = budgetData.reduce((sum, b) => sum + b.budgetAmount, 0)
    const totalActual = budgetData.reduce((sum, b) => sum + b.actualAmount, 0)
    const overBudget = budgetData.filter((b) => b.status === 'over').length
    const nearLimit = budgetData.filter((b) => b.status === 'near').length
    const underBudget = budgetData.filter((b) => b.status === 'under').length

    return {
      totalBudgeted,
      totalActual,
      totalVariance: totalBudgeted - totalActual,
      utilizationRate: totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0,
      overBudget,
      nearLimit,
      underBudget,
    }
  }, [budgetData])

  if (budgetData.length === 0) {
    return (
      <div className='bg-white rounded-card p-12 shadow-soft text-center'>
        <p className='text-gray-500 text-lg'>No budgets found for the selected period</p>
        <p className='text-gray-400 text-sm mt-2'>Create budgets in the Budgets page to see performance analysis</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-card p-6 border border-blue-200'>
          <div className='flex items-start justify-between mb-2'>
            <div className='w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white text-sm font-bold'>$</div>
          </div>
          <p className='text-sm text-blue-700 font-medium mb-1'>Total Budgeted</p>
          <p className='text-2xl font-bold text-blue-900'>{formatCurrency(summary.totalBudgeted, currencySymbol)}</p>
          <p className='text-xs text-blue-600 mt-2'>{budgetData.length} budgets</p>
        </div>

        <div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-card p-6 border border-purple-200'>
          <div className='flex items-start justify-between mb-2'>
            <div className='w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center'>
              <TrendingUp
                size={20}
                className='text-white'
              />
            </div>
          </div>
          <p className='text-sm text-purple-700 font-medium mb-1'>Total Spent</p>
          <p className='text-2xl font-bold text-purple-900'>{formatCurrency(summary.totalActual, currencySymbol)}</p>
          <p className='text-xs text-purple-600 mt-2'>{summary.utilizationRate.toFixed(1)}% utilized</p>
        </div>

        <div
          className={`bg-gradient-to-br rounded-card p-6 border ${
            summary.totalVariance >= 0 ? 'from-green-50 to-green-100 border-green-200' : 'from-red-50 to-red-100 border-red-200'
          }`}
        >
          <div className='flex items-start justify-between mb-2'>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                summary.totalVariance >= 0 ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {summary.totalVariance >= 0 ? (
                <CheckCircle
                  size={20}
                  className='text-white'
                />
              ) : (
                <AlertCircle
                  size={20}
                  className='text-white'
                />
              )}
            </div>
          </div>
          <p className={`text-sm font-medium mb-1 ${summary.totalVariance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {summary.totalVariance >= 0 ? 'Under Budget' : 'Over Budget'}
          </p>
          <p className={`text-2xl font-bold ${summary.totalVariance >= 0 ? 'text-green-900' : 'text-red-900'}`}>
            {formatCurrency(Math.abs(summary.totalVariance), currencySymbol)}
          </p>
        </div>

        <div className='bg-gradient-to-br from-gray-50 to-gray-100 rounded-card p-6 border border-gray-200'>
          <div className='flex items-start justify-between mb-2'>
            <div className='w-10 h-10 rounded-xl bg-gray-500 flex items-center justify-center text-white text-sm font-bold'>#</div>
          </div>
          <p className='text-sm text-gray-700 font-medium mb-1'>Status Overview</p>
          <div className='flex items-center gap-2 mt-2'>
            <span className='text-xs text-green-600 font-medium'>{summary.underBudget} ✓</span>
            <span className='text-xs text-yellow-600 font-medium'>{summary.nearLimit} ⚠</span>
            <span className='text-xs text-red-600 font-medium'>{summary.overBudget} ✗</span>
          </div>
        </div>
      </div>

      {/* Budget Performance List */}
      <div className='bg-white rounded-card p-6 shadow-soft'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Budget vs Actual</h3>
        <div className='space-y-4'>
          {budgetData.map((item, index) => (
            <div
              key={index}
              className='space-y-2'
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3 flex-1 min-w-0'>
                  <div
                    className='w-3 h-3 rounded-full flex-shrink-0'
                    style={{ backgroundColor: item.color }}
                  />
                  <span className='text-sm font-medium text-gray-900 truncate'>{item.categoryName}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'over'
                        ? 'bg-red-100 text-red-700'
                        : item.status === 'near'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {item.status === 'over' ? 'Over' : item.status === 'near' ? 'Near Limit' : 'On Track'}
                  </span>
                </div>
                <div className='text-right flex-shrink-0 ml-4'>
                  <p className='text-sm font-semibold text-gray-900'>
                    {formatCurrency(item.actualAmount, currencySymbol)} / {formatCurrency(item.budgetAmount, currencySymbol)}
                  </p>
                  <p className={`text-xs ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.variance >= 0 ? 'Remaining: ' : 'Over by: '}
                    {formatCurrency(Math.abs(item.variance), currencySymbol)}
                  </p>
                </div>
              </div>
              <div className='relative w-full bg-gray-200 rounded-full h-3 overflow-hidden'>
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    item.status === 'over' ? 'bg-red-500' : item.status === 'near' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(item.variancePercent, 100)}%` }}
                />
                {item.variancePercent > 100 && (
                  <div
                    className='absolute top-0 h-full bg-red-700 opacity-50'
                    style={{
                      left: '100%',
                      width: `${((item.variancePercent - 100) / item.variancePercent) * 100}%`,
                    }}
                  />
                )}
              </div>
              <div className='flex items-center justify-between text-xs text-gray-500'>
                <span>{item.variancePercent.toFixed(1)}% used</span>
                <span>{item.transactionCount} transactions</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
