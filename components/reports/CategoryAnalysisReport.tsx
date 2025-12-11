'use client'

import { useTranslation } from '@/lib/i18n/useTranslation'
import { formatCurrency } from '@/lib/utils'
import { ArrowDown, ArrowUp, TrendingUp } from 'lucide-react'
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

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color?: string
}

interface CategoryAnalysisReportProps {
  transactions: Transaction[]
  categories: Category[]
  dateRange: DateRange
  filters: ReportFilters
  currencySymbol: string
}

export default function CategoryAnalysisReport({
  transactions,
  categories,
  dateRange,
  filters,
  currencySymbol,
}: CategoryAnalysisReportProps) {
  const { t } = useTranslation()

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      if (txn.date < dateRange.startDate || txn.date > dateRange.endDate) return false
      if (filters.accounts.length > 0 && !filters.accounts.includes(txn.account_id)) return false
      if (filters.categories.length > 0 && txn.category_id && !filters.categories.includes(txn.category_id)) return false
      if (filters.transactionTypes.length > 0 && !filters.transactionTypes.includes(txn.type)) return false
      if (filters.clearedStatus === 'cleared' && !txn.cleared) return false
      if (filters.clearedStatus === 'uncleared' && txn.cleared) return false
      return true
    })
  }, [transactions, dateRange, filters])

  const categoryData = useMemo(() => {
    const categoryMap = new Map<
      string,
      {
        name: string
        type: 'income' | 'expense'
        total: number
        count: number
        color: string
        avgAmount: number
      }
    >()

    filteredTransactions.forEach((txn) => {
      if (!txn.category_id) return

      const category = categories.find((c) => c.id === txn.category_id)
      if (!category) return

      const existing = categoryMap.get(txn.category_id)
      if (existing) {
        existing.total += txn.amount
        existing.count += 1
        existing.avgAmount = existing.total / existing.count
      } else {
        categoryMap.set(txn.category_id, {
          name: category.name,
          type: category.type,
          total: txn.amount,
          count: 1,
          color: category.color || '#94a3b8',
          avgAmount: txn.amount,
        })
      }
    })

    return Array.from(categoryMap.values()).sort((a, b) => b.total - a.total)
  }, [filteredTransactions, categories])

  const expenseCategories = useMemo(() => {
    return categoryData.filter((c) => c.type === 'expense')
  }, [categoryData])

  const incomeCategories = useMemo(() => {
    return categoryData.filter((c) => c.type === 'income')
  }, [categoryData])

  const totalExpense = useMemo(() => {
    return expenseCategories.reduce((sum, c) => sum + c.total, 0)
  }, [expenseCategories])

  const totalIncome = useMemo(() => {
    return incomeCategories.reduce((sum, c) => sum + c.total, 0)
  }, [incomeCategories])

  if (categoryData.length === 0) {
    return (
      <div className='bg-white rounded-card p-12 shadow-soft text-center'>
        <p className='text-gray-500 text-lg'>{t.reports.noData}</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-gradient-to-br from-red-50 to-red-100 rounded-card p-6 border border-red-200'>
          <div className='flex items-start justify-between mb-2'>
            <div className='w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center'>
              <ArrowUp
                size={20}
                className='text-white'
              />
            </div>
          </div>
          <p className='text-sm text-red-700 font-medium mb-1'>Expense Categories</p>
          <p className='text-2xl font-bold text-red-900'>{expenseCategories.length}</p>
          <p className='text-xs text-red-600 mt-2'>{formatCurrency(totalExpense, currencySymbol)} total</p>
        </div>

        <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-card p-6 border border-green-200'>
          <div className='flex items-start justify-between mb-2'>
            <div className='w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center'>
              <ArrowDown
                size={20}
                className='text-white'
              />
            </div>
          </div>
          <p className='text-sm text-green-700 font-medium mb-1'>Income Categories</p>
          <p className='text-2xl font-bold text-green-900'>{incomeCategories.length}</p>
          <p className='text-xs text-green-600 mt-2'>{formatCurrency(totalIncome, currencySymbol)} total</p>
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
          <p className='text-sm text-purple-700 font-medium mb-1'>Total Categories</p>
          <p className='text-2xl font-bold text-purple-900'>{categoryData.length}</p>
          <p className='text-xs text-purple-600 mt-2'>Active in this period</p>
        </div>
      </div>

      {/* Expense Categories */}
      {expenseCategories.length > 0 && (
        <div className='bg-white rounded-card p-6 shadow-soft'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
            <ArrowUp
              size={20}
              className='text-red-500'
            />
            Top Expense Categories
          </h3>
          <div className='space-y-4'>
            {expenseCategories.slice(0, 10).map((category, index) => {
              const percentage = totalExpense > 0 ? (category.total / totalExpense) * 100 : 0
              return (
                <div
                  key={index}
                  className='space-y-2'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3 flex-1 min-w-0'>
                      <div
                        className='w-3 h-3 rounded-full flex-shrink-0'
                        style={{ backgroundColor: category.color }}
                      />
                      <span className='text-sm font-medium text-gray-900 truncate'>{category.name}</span>
                      <span className='text-xs text-gray-500'>({category.count} txns)</span>
                    </div>
                    <div className='text-right flex-shrink-0 ml-4'>
                      <p className='text-sm font-semibold text-gray-900'>{formatCurrency(category.total, currencySymbol)}</p>
                      <p className='text-xs text-gray-500'>{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
                    <div
                      className='h-full rounded-full transition-all duration-300'
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Income Categories */}
      {incomeCategories.length > 0 && (
        <div className='bg-white rounded-card p-6 shadow-soft'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
            <ArrowDown
              size={20}
              className='text-green-500'
            />
            Top Income Categories
          </h3>
          <div className='space-y-4'>
            {incomeCategories.slice(0, 10).map((category, index) => {
              const percentage = totalIncome > 0 ? (category.total / totalIncome) * 100 : 0
              return (
                <div
                  key={index}
                  className='space-y-2'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3 flex-1 min-w-0'>
                      <div
                        className='w-3 h-3 rounded-full flex-shrink-0'
                        style={{ backgroundColor: category.color }}
                      />
                      <span className='text-sm font-medium text-gray-900 truncate'>{category.name}</span>
                      <span className='text-xs text-gray-500'>({category.count} txns)</span>
                    </div>
                    <div className='text-right flex-shrink-0 ml-4'>
                      <p className='text-sm font-semibold text-gray-900'>{formatCurrency(category.total, currencySymbol)}</p>
                      <p className='text-xs text-gray-500'>{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
                    <div
                      className='h-full rounded-full transition-all duration-300'
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Category Breakdown Table */}
      <div className='bg-white rounded-card p-6 shadow-soft overflow-x-auto'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Detailed Breakdown</h3>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-gray-200'>
              <th className='text-left py-3 px-2 font-semibold text-gray-700'>Category</th>
              <th className='text-left py-3 px-2 font-semibold text-gray-700'>Type</th>
              <th className='text-right py-3 px-2 font-semibold text-gray-700'>Total</th>
              <th className='text-right py-3 px-2 font-semibold text-gray-700'>Count</th>
              <th className='text-right py-3 px-2 font-semibold text-gray-700'>Avg Amount</th>
              <th className='text-right py-3 px-2 font-semibold text-gray-700'>% of Type</th>
            </tr>
          </thead>
          <tbody>
            {categoryData.map((category, index) => {
              const totalForType = category.type === 'expense' ? totalExpense : totalIncome
              const percentage = totalForType > 0 ? (category.total / totalForType) * 100 : 0
              return (
                <tr
                  key={index}
                  className='border-b border-gray-100 hover:bg-gray-50 transition-colors'
                >
                  <td className='py-3 px-2'>
                    <div className='flex items-center gap-2'>
                      <div
                        className='w-2 h-2 rounded-full'
                        style={{ backgroundColor: category.color }}
                      />
                      <span className='font-medium text-gray-900'>{category.name}</span>
                    </div>
                  </td>
                  <td className='py-3 px-2'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.type === 'expense' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {category.type === 'expense' ? t.categories.expense : t.categories.income}
                    </span>
                  </td>
                  <td className='py-3 px-2 text-right font-semibold text-gray-900'>{formatCurrency(category.total, currencySymbol)}</td>
                  <td className='py-3 px-2 text-right text-gray-600'>{category.count}</td>
                  <td className='py-3 px-2 text-right text-gray-600'>{formatCurrency(category.avgAmount, currencySymbol)}</td>
                  <td className='py-3 px-2 text-right text-gray-600'>{percentage.toFixed(1)}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
