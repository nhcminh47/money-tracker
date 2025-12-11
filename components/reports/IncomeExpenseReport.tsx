'use client'

import { useTranslation } from '@/lib/i18n/useTranslation'
import { formatCurrency } from '@/lib/utils'
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp } from 'lucide-react'
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

interface IncomeExpenseReportProps {
  transactions: Transaction[]
  dateRange: DateRange
  filters: ReportFilters
  currencySymbol: string
}

export default function IncomeExpenseReport({ transactions, dateRange, filters, currencySymbol }: IncomeExpenseReportProps) {
  const { t } = useTranslation()

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      // Date range filter
      if (txn.date < dateRange.startDate || txn.date > dateRange.endDate) return false

      // Account filter
      if (filters.accounts.length > 0 && !filters.accounts.includes(txn.account_id)) return false

      // Category filter
      if (filters.categories.length > 0 && txn.category_id && !filters.categories.includes(txn.category_id)) return false

      // Transaction type filter
      if (filters.transactionTypes.length > 0 && !filters.transactionTypes.includes(txn.type)) return false

      // Cleared status filter
      if (filters.clearedStatus === 'cleared' && !txn.cleared) return false
      if (filters.clearedStatus === 'uncleared' && txn.cleared) return false

      return true
    })
  }, [transactions, dateRange, filters])

  const summary = useMemo(() => {
    const income = filteredTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)

    const expense = filteredTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

    const netIncome = income - expense
    const savingsRate = income > 0 ? (netIncome / income) * 100 : 0

    const daysDiff =
      Math.ceil((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1

    const incomeCount = filteredTransactions.filter((t) => t.type === 'income').length
    const expenseCount = filteredTransactions.filter((t) => t.type === 'expense').length

    return {
      totalIncome: income,
      totalExpense: expense,
      netIncome,
      savingsRate,
      avgDailyIncome: income / daysDiff,
      avgDailyExpense: expense / daysDiff,
      incomeCount,
      expenseCount,
      totalCount: incomeCount + expenseCount,
    }
  }, [filteredTransactions, dateRange])

  if (filteredTransactions.length === 0) {
    return (
      <div className='bg-white rounded-card p-12 shadow-soft text-center'>
        <p className='text-gray-500 text-lg'>{t.reports.noData}</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Total Income */}
        <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-card p-6 border border-green-200'>
          <div className='flex items-start justify-between mb-2'>
            <div className='w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center'>
              <ArrowDown
                size={20}
                className='text-white'
              />
            </div>
            <TrendingUp
              size={16}
              className='text-green-600'
            />
          </div>
          <p className='text-sm text-green-700 font-medium mb-1'>{t.reports.summary.totalIncome}</p>
          <p className='text-2xl font-bold text-green-900'>{formatCurrency(summary.totalIncome, currencySymbol)}</p>
          <p className='text-xs text-green-600 mt-2'>
            {summary.incomeCount} {t.reports.summary.transactionCount}
          </p>
        </div>

        {/* Total Expense */}
        <div className='bg-gradient-to-br from-red-50 to-red-100 rounded-card p-6 border border-red-200'>
          <div className='flex items-start justify-between mb-2'>
            <div className='w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center'>
              <ArrowUp
                size={20}
                className='text-white'
              />
            </div>
            <TrendingDown
              size={16}
              className='text-red-600'
            />
          </div>
          <p className='text-sm text-red-700 font-medium mb-1'>{t.reports.summary.totalExpense}</p>
          <p className='text-2xl font-bold text-red-900'>{formatCurrency(summary.totalExpense, currencySymbol)}</p>
          <p className='text-xs text-red-600 mt-2'>
            {summary.expenseCount} {t.reports.summary.transactionCount}
          </p>
        </div>

        {/* Net Income */}
        <div
          className={`bg-gradient-to-br rounded-card p-6 border ${
            summary.netIncome >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'
          }`}
        >
          <div className='flex items-start justify-between mb-2'>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                summary.netIncome >= 0 ? 'bg-blue-500' : 'bg-orange-500'
              }`}
            >
              {summary.netIncome >= 0 ? (
                <TrendingUp
                  size={20}
                  className='text-white'
                />
              ) : (
                <TrendingDown
                  size={20}
                  className='text-white'
                />
              )}
            </div>
          </div>
          <p className={`text-sm font-medium mb-1 ${summary.netIncome >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            {t.reports.summary.netIncome}
          </p>
          <p className={`text-2xl font-bold ${summary.netIncome >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
            {formatCurrency(summary.netIncome, currencySymbol)}
          </p>
        </div>

        {/* Savings Rate */}
        <div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-card p-6 border border-purple-200'>
          <div className='flex items-start justify-between mb-2'>
            <div className='w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white text-sm font-bold'>%</div>
          </div>
          <p className='text-sm text-purple-700 font-medium mb-1'>{t.reports.summary.savingsRate}</p>
          <p className='text-2xl font-bold text-purple-900'>{summary.savingsRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='bg-white rounded-card p-6 shadow-soft'>
          <h4 className='text-sm font-semibold text-gray-700 mb-4'>{t.reports.summary.avgDailyIncome}</h4>
          <p className='text-xl font-bold text-green-600'>{formatCurrency(summary.avgDailyIncome, currencySymbol)}</p>
        </div>
        <div className='bg-white rounded-card p-6 shadow-soft'>
          <h4 className='text-sm font-semibold text-gray-700 mb-4'>{t.reports.summary.avgDailyExpense}</h4>
          <p className='text-xl font-bold text-red-600'>{formatCurrency(summary.avgDailyExpense, currencySymbol)}</p>
        </div>
      </div>

      {/* Period Info */}
      <div className='bg-gradient-to-br from-gray-50 to-gray-100 rounded-card p-4 border border-gray-200'>
        <p className='text-sm text-gray-600 text-center'>
          Period: <span className='font-semibold text-gray-900'>{dateRange.startDate}</span> to{' '}
          <span className='font-semibold text-gray-900'>{dateRange.endDate}</span>
        </p>
        <p className='text-xs text-gray-500 text-center mt-1'>Total: {summary.totalCount} transactions analyzed</p>
      </div>
    </div>
  )
}
