'use client'

import { useTranslation } from '@/lib/i18n/useTranslation'
import { formatCurrency } from '@/lib/utils'
import { ArrowDownCircle, ArrowUpCircle, DollarSign, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import type { DateRange } from './DateRangePicker'
import type { ReportFilters } from './ReportFilters'

interface Transaction {
  id: string
  type: 'income' | 'expense' | 'transfer'
  amount: number
  date: string
  account_id: string
  from_account_id?: string
  to_account_id?: string
  category_id?: string
  cleared: boolean
}

interface CashFlowReportProps {
  transactions: Transaction[]
  dateRange: DateRange
  filters: ReportFilters
  currencySymbol: string
}

export default function CashFlowReport({ transactions, dateRange, filters, currencySymbol }: CashFlowReportProps) {
  const { t } = useTranslation()

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      if (txn.date < dateRange.startDate || txn.date > dateRange.endDate) return false
      if (filters.accounts.length > 0) {
        const accountMatch =
          filters.accounts.includes(txn.account_id) ||
          (txn.from_account_id && filters.accounts.includes(txn.from_account_id)) ||
          (txn.to_account_id && filters.accounts.includes(txn.to_account_id))
        if (!accountMatch) return false
      }
      if (filters.categories.length > 0 && txn.category_id && !filters.categories.includes(txn.category_id)) return false
      if (filters.transactionTypes.length > 0 && !filters.transactionTypes.includes(txn.type)) return false
      if (filters.clearedStatus === 'cleared' && !txn.cleared) return false
      if (filters.clearedStatus === 'uncleared' && txn.cleared) return false
      return true
    })
  }, [transactions, dateRange, filters])

  const cashFlowData = useMemo(() => {
    const income = filteredTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)

    const expenses = filteredTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

    const transfersIn = filteredTransactions.filter((t) => t.type === 'transfer').reduce((sum, t) => sum + t.amount, 0)

    const transfersOut = transfersIn // Transfers are neutral overall

    const operatingCashFlow = income - expenses
    const totalInflow = income + transfersIn
    const totalOutflow = expenses + transfersOut
    const netCashFlow = totalInflow - totalOutflow

    return {
      income,
      expenses,
      transfersIn,
      transfersOut,
      operatingCashFlow,
      totalInflow,
      totalOutflow,
      netCashFlow,
      incomeCount: filteredTransactions.filter((t) => t.type === 'income').length,
      expenseCount: filteredTransactions.filter((t) => t.type === 'expense').length,
      transferCount: filteredTransactions.filter((t) => t.type === 'transfer').length,
    }
  }, [filteredTransactions])

  // Monthly breakdown
  const monthlyData = useMemo(() => {
    const monthMap = new Map<
      string,
      {
        month: string
        income: number
        expense: number
        netFlow: number
      }
    >()

    filteredTransactions.forEach((txn) => {
      const monthKey = txn.date.substring(0, 7) // YYYY-MM
      const existing = monthMap.get(monthKey)

      if (existing) {
        if (txn.type === 'income') existing.income += txn.amount
        if (txn.type === 'expense') existing.expense += txn.amount
        existing.netFlow = existing.income - existing.expense
      } else {
        monthMap.set(monthKey, {
          month: monthKey,
          income: txn.type === 'income' ? txn.amount : 0,
          expense: txn.type === 'expense' ? txn.amount : 0,
          netFlow: txn.type === 'income' ? txn.amount : txn.type === 'expense' ? -txn.amount : 0,
        })
      }
    })

    return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month))
  }, [filteredTransactions])

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
        <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-card p-6 border border-green-200'>
          <div className='flex items-start justify-between mb-2'>
            <div className='w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center'>
              <ArrowDownCircle
                size={20}
                className='text-white'
              />
            </div>
          </div>
          <p className='text-sm text-green-700 font-medium mb-1'>Total Inflow</p>
          <p className='text-2xl font-bold text-green-900'>{formatCurrency(cashFlowData.totalInflow, currencySymbol)}</p>
          <p className='text-xs text-green-600 mt-2'>{cashFlowData.incomeCount + cashFlowData.transferCount} transactions</p>
        </div>

        <div className='bg-gradient-to-br from-red-50 to-red-100 rounded-card p-6 border border-red-200'>
          <div className='flex items-start justify-between mb-2'>
            <div className='w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center'>
              <ArrowUpCircle
                size={20}
                className='text-white'
              />
            </div>
          </div>
          <p className='text-sm text-red-700 font-medium mb-1'>Total Outflow</p>
          <p className='text-2xl font-bold text-red-900'>{formatCurrency(cashFlowData.totalOutflow, currencySymbol)}</p>
          <p className='text-xs text-red-600 mt-2'>{cashFlowData.expenseCount + cashFlowData.transferCount} transactions</p>
        </div>

        <div
          className={`bg-gradient-to-br rounded-card p-6 border ${
            cashFlowData.netCashFlow >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'
          }`}
        >
          <div className='flex items-start justify-between mb-2'>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                cashFlowData.netCashFlow >= 0 ? 'bg-blue-500' : 'bg-orange-500'
              }`}
            >
              <DollarSign
                size={20}
                className='text-white'
              />
            </div>
          </div>
          <p className={`text-sm font-medium mb-1 ${cashFlowData.netCashFlow >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Net Cash Flow</p>
          <p className={`text-2xl font-bold ${cashFlowData.netCashFlow >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
            {formatCurrency(cashFlowData.netCashFlow, currencySymbol)}
          </p>
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
          <p className='text-sm text-purple-700 font-medium mb-1'>Operating Cash Flow</p>
          <p className='text-2xl font-bold text-purple-900'>{formatCurrency(cashFlowData.operatingCashFlow, currencySymbol)}</p>
          <p className='text-xs text-purple-600 mt-2'>Excluding transfers</p>
        </div>
      </div>

      {/* Cash Flow Breakdown */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Inflows */}
        <div className='bg-white rounded-card p-6 shadow-soft'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
            <ArrowDownCircle
              size={20}
              className='text-green-500'
            />
            Cash Inflows
          </h3>
          <div className='space-y-4'>
            <div className='flex items-center justify-between p-4 bg-green-50 rounded-lg'>
              <div>
                <p className='text-sm font-medium text-gray-700'>Income</p>
                <p className='text-xs text-gray-500'>{cashFlowData.incomeCount} transactions</p>
              </div>
              <p className='text-lg font-bold text-green-600'>{formatCurrency(cashFlowData.income, currencySymbol)}</p>
            </div>
            <div className='flex items-center justify-between p-4 bg-blue-50 rounded-lg'>
              <div>
                <p className='text-sm font-medium text-gray-700'>Transfers In</p>
                <p className='text-xs text-gray-500'>{cashFlowData.transferCount} transactions</p>
              </div>
              <p className='text-lg font-bold text-blue-600'>{formatCurrency(cashFlowData.transfersIn, currencySymbol)}</p>
            </div>
            <div className='pt-4 border-t border-gray-200'>
              <div className='flex items-center justify-between'>
                <p className='text-sm font-semibold text-gray-900'>Total Inflows</p>
                <p className='text-xl font-bold text-gray-900'>{formatCurrency(cashFlowData.totalInflow, currencySymbol)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Outflows */}
        <div className='bg-white rounded-card p-6 shadow-soft'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
            <ArrowUpCircle
              size={20}
              className='text-red-500'
            />
            Cash Outflows
          </h3>
          <div className='space-y-4'>
            <div className='flex items-center justify-between p-4 bg-red-50 rounded-lg'>
              <div>
                <p className='text-sm font-medium text-gray-700'>Expenses</p>
                <p className='text-xs text-gray-500'>{cashFlowData.expenseCount} transactions</p>
              </div>
              <p className='text-lg font-bold text-red-600'>{formatCurrency(cashFlowData.expenses, currencySymbol)}</p>
            </div>
            <div className='flex items-center justify-between p-4 bg-orange-50 rounded-lg'>
              <div>
                <p className='text-sm font-medium text-gray-700'>Transfers Out</p>
                <p className='text-xs text-gray-500'>{cashFlowData.transferCount} transactions</p>
              </div>
              <p className='text-lg font-bold text-orange-600'>{formatCurrency(cashFlowData.transfersOut, currencySymbol)}</p>
            </div>
            <div className='pt-4 border-t border-gray-200'>
              <div className='flex items-center justify-between'>
                <p className='text-sm font-semibold text-gray-900'>Total Outflows</p>
                <p className='text-xl font-bold text-gray-900'>{formatCurrency(cashFlowData.totalOutflow, currencySymbol)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      {monthlyData.length > 0 && (
        <div className='bg-white rounded-card p-6 shadow-soft'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Monthly Cash Flow</h3>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-gray-200'>
                  <th className='text-left py-3 px-2 font-semibold text-gray-700'>Month</th>
                  <th className='text-right py-3 px-2 font-semibold text-gray-700'>Income</th>
                  <th className='text-right py-3 px-2 font-semibold text-gray-700'>Expenses</th>
                  <th className='text-right py-3 px-2 font-semibold text-gray-700'>Net Flow</th>
                  <th className='text-right py-3 px-2 font-semibold text-gray-700'>Trend</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month, index) => (
                  <tr
                    key={index}
                    className='border-b border-gray-100 hover:bg-gray-50 transition-colors'
                  >
                    <td className='py-3 px-2 font-medium text-gray-900'>
                      {new Date(month.month + '-01').toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className='py-3 px-2 text-right text-green-600 font-semibold'>{formatCurrency(month.income, currencySymbol)}</td>
                    <td className='py-3 px-2 text-right text-red-600 font-semibold'>{formatCurrency(month.expense, currencySymbol)}</td>
                    <td className={`py-3 px-2 text-right font-bold ${month.netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {formatCurrency(month.netFlow, currencySymbol)}
                    </td>
                    <td className='py-3 px-2 text-right'>
                      {month.netFlow >= 0 ? (
                        <TrendingUp
                          size={16}
                          className='text-green-500 inline'
                        />
                      ) : (
                        <TrendingUp
                          size={16}
                          className='text-red-500 inline rotate-180'
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
