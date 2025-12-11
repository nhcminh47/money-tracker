'use client'

import { useTranslation } from '@/lib/i18n/useTranslation'
import { formatCurrency } from '@/lib/utils'
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'
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

interface Account {
  id: string
  name: string
  type: string
  balance: number
  icon?: string
}

interface AccountSummaryReportProps {
  transactions: Transaction[]
  accounts: Account[]
  dateRange: DateRange
  filters: ReportFilters
  currencySymbol: string
}

export default function AccountSummaryReport({ transactions, accounts, dateRange, filters, currencySymbol }: AccountSummaryReportProps) {
  const { t } = useTranslation()

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      if (txn.date < dateRange.startDate || txn.date > dateRange.endDate) return false
      if (filters.categories.length > 0 && txn.category_id && !filters.categories.includes(txn.category_id)) return false
      if (filters.transactionTypes.length > 0 && !filters.transactionTypes.includes(txn.type)) return false
      if (filters.clearedStatus === 'cleared' && !txn.cleared) return false
      if (filters.clearedStatus === 'uncleared' && txn.cleared) return false
      return true
    })
  }, [transactions, dateRange, filters])

  const accountData = useMemo(() => {
    const accountMap = new Map<
      string,
      {
        name: string
        type: string
        icon?: string
        currentBalance: number
        deposits: number
        withdrawals: number
        transfersIn: number
        transfersOut: number
        netChange: number
        transactionCount: number
        avgTransactionSize: number
      }
    >()

    // Initialize with all accounts
    accounts.forEach((account) => {
      if (filters.accounts.length > 0 && !filters.accounts.includes(account.id)) return

      accountMap.set(account.id, {
        name: account.name,
        type: account.type,
        icon: account.icon,
        currentBalance: account.balance,
        deposits: 0,
        withdrawals: 0,
        transfersIn: 0,
        transfersOut: 0,
        netChange: 0,
        transactionCount: 0,
        avgTransactionSize: 0,
      })
    })

    // Process transactions
    filteredTransactions.forEach((txn) => {
      if (txn.type === 'income' && txn.account_id) {
        const acc = accountMap.get(txn.account_id)
        if (acc) {
          acc.deposits += txn.amount
          acc.netChange += txn.amount
          acc.transactionCount += 1
        }
      } else if (txn.type === 'expense' && txn.account_id) {
        const acc = accountMap.get(txn.account_id)
        if (acc) {
          acc.withdrawals += txn.amount
          acc.netChange -= txn.amount
          acc.transactionCount += 1
        }
      } else if (txn.type === 'transfer' && txn.from_account_id && txn.to_account_id) {
        const fromAcc = accountMap.get(txn.from_account_id)
        if (fromAcc) {
          fromAcc.transfersOut += txn.amount
          fromAcc.netChange -= txn.amount
          fromAcc.transactionCount += 1
        }

        const toAcc = accountMap.get(txn.to_account_id)
        if (toAcc) {
          toAcc.transfersIn += txn.amount
          toAcc.netChange += txn.amount
          toAcc.transactionCount += 1
        }
      }
    })

    // Calculate averages
    accountMap.forEach((acc) => {
      if (acc.transactionCount > 0) {
        const totalActivity = acc.deposits + acc.withdrawals + acc.transfersIn + acc.transfersOut
        acc.avgTransactionSize = totalActivity / acc.transactionCount
      }
    })

    return Array.from(accountMap.values()).sort((a, b) => b.currentBalance - a.currentBalance)
  }, [filteredTransactions, accounts, filters])

  const summary = useMemo(() => {
    return {
      totalBalance: accountData.reduce((sum, acc) => sum + acc.currentBalance, 0),
      totalDeposits: accountData.reduce((sum, acc) => sum + acc.deposits, 0),
      totalWithdrawals: accountData.reduce((sum, acc) => sum + acc.withdrawals, 0),
      totalTransactions: accountData.reduce((sum, acc) => sum + acc.transactionCount, 0),
      activeAccounts: accountData.filter((acc) => acc.transactionCount > 0).length,
    }
  }, [accountData])

  if (accountData.length === 0) {
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
        <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-card p-6 border border-blue-200'>
          <div className='flex items-start justify-between mb-2'>
            <div className='w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center'>
              <Wallet
                size={20}
                className='text-white'
              />
            </div>
          </div>
          <p className='text-sm text-blue-700 font-medium mb-1'>Total Balance</p>
          <p className='text-2xl font-bold text-blue-900'>{formatCurrency(summary.totalBalance, currencySymbol)}</p>
          <p className='text-xs text-blue-600 mt-2'>Across all accounts</p>
        </div>

        <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-card p-6 border border-green-200'>
          <div className='flex items-start justify-between mb-2'>
            <div className='w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center'>
              <TrendingUp
                size={20}
                className='text-white'
              />
            </div>
          </div>
          <p className='text-sm text-green-700 font-medium mb-1'>Total Deposits</p>
          <p className='text-2xl font-bold text-green-900'>{formatCurrency(summary.totalDeposits, currencySymbol)}</p>
          <p className='text-xs text-green-600 mt-2'>In selected period</p>
        </div>

        <div className='bg-gradient-to-br from-red-50 to-red-100 rounded-card p-6 border border-red-200'>
          <div className='flex items-start justify-between mb-2'>
            <div className='w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center'>
              <TrendingDown
                size={20}
                className='text-white'
              />
            </div>
          </div>
          <p className='text-sm text-red-700 font-medium mb-1'>Total Withdrawals</p>
          <p className='text-2xl font-bold text-red-900'>{formatCurrency(summary.totalWithdrawals, currencySymbol)}</p>
          <p className='text-xs text-red-600 mt-2'>In selected period</p>
        </div>

        <div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-card p-6 border border-purple-200'>
          <div className='flex items-start justify-between mb-2'>
            <div className='w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white text-sm font-bold'>#</div>
          </div>
          <p className='text-sm text-purple-700 font-medium mb-1'>Active Accounts</p>
          <p className='text-2xl font-bold text-purple-900'>{summary.activeAccounts}</p>
          <p className='text-xs text-purple-600 mt-2'>{summary.totalTransactions} transactions</p>
        </div>
      </div>

      {/* Account Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {accountData.map((account, index) => (
          <div
            key={index}
            className='bg-white rounded-card p-6 shadow-soft hover:shadow-medium transition-all'
          >
            <div className='flex items-start justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-coral-400 to-coral-500 flex items-center justify-center text-2xl'>
                  {account.icon || '💳'}
                </div>
                <div>
                  <h4 className='font-semibold text-gray-900'>{account.name}</h4>
                  <p className='text-xs text-gray-500 capitalize'>{account.type}</p>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-lg font-bold text-gray-900'>{formatCurrency(account.currentBalance, currencySymbol)}</p>
                <p className={`text-xs font-medium ${account.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {account.netChange >= 0 ? '+' : ''}
                  {formatCurrency(account.netChange, currencySymbol)}
                </p>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4 pt-4 border-t border-gray-200'>
              <div>
                <p className='text-xs text-gray-500 mb-1'>Deposits</p>
                <p className='text-sm font-semibold text-green-600'>{formatCurrency(account.deposits, currencySymbol)}</p>
              </div>
              <div>
                <p className='text-xs text-gray-500 mb-1'>Withdrawals</p>
                <p className='text-sm font-semibold text-red-600'>{formatCurrency(account.withdrawals, currencySymbol)}</p>
              </div>
              <div>
                <p className='text-xs text-gray-500 mb-1'>Transfers In</p>
                <p className='text-sm font-semibold text-blue-600'>{formatCurrency(account.transfersIn, currencySymbol)}</p>
              </div>
              <div>
                <p className='text-xs text-gray-500 mb-1'>Transfers Out</p>
                <p className='text-sm font-semibold text-orange-600'>{formatCurrency(account.transfersOut, currencySymbol)}</p>
              </div>
            </div>

            <div className='mt-4 pt-4 border-t border-gray-200'>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-gray-500'>Transactions</span>
                <span className='font-semibold text-gray-900'>{account.transactionCount}</span>
              </div>
              <div className='flex items-center justify-between text-xs mt-2'>
                <span className='text-gray-500'>Avg Amount</span>
                <span className='font-semibold text-gray-900'>{formatCurrency(account.avgTransactionSize, currencySymbol)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
