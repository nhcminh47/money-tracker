'use client'

import { useTranslation } from '@/lib/i18n/useTranslation'
import { formatCurrency } from '@/lib/utils'
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useMemo } from 'react'
import type { DateRange } from './DateRangePicker'
import type { ReportFilters } from './ReportFilters'

interface Account {
  id: string
  name: string
  type: string
  balance: number
  icon?: string
}

interface NetWorthReportProps {
  accounts: Account[]
  dateRange: DateRange
  filters: ReportFilters
  currencySymbol: string
}

export default function NetWorthReport({ accounts, dateRange, filters, currencySymbol }: NetWorthReportProps) {
  const { t } = useTranslation()

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      if (filters.accounts.length > 0 && !filters.accounts.includes(acc.id)) return false
      return true
    })
  }, [accounts, filters])

  const netWorthData = useMemo(() => {
    const assets = filteredAccounts.filter((acc) => acc.balance >= 0)
    const liabilities = filteredAccounts.filter((acc) => acc.balance < 0)

    const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0)
    const totalLiabilities = Math.abs(liabilities.reduce((sum, acc) => sum + acc.balance, 0))
    const netWorth = totalAssets - totalLiabilities

    // Group by account type
    const assetsByType = new Map<string, { total: number; count: number; accounts: Account[] }>()
    assets.forEach((acc) => {
      const existing = assetsByType.get(acc.type)
      if (existing) {
        existing.total += acc.balance
        existing.count += 1
        existing.accounts.push(acc)
      } else {
        assetsByType.set(acc.type, { total: acc.balance, count: 1, accounts: [acc] })
      }
    })

    const liabilitiesByType = new Map<string, { total: number; count: number; accounts: Account[] }>()
    liabilities.forEach((acc) => {
      const existing = liabilitiesByType.get(acc.type)
      const absBalance = Math.abs(acc.balance)
      if (existing) {
        existing.total += absBalance
        existing.count += 1
        existing.accounts.push(acc)
      } else {
        liabilitiesByType.set(acc.type, { total: absBalance, count: 1, accounts: [acc] })
      }
    })

    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      assetCount: assets.length,
      liabilityCount: liabilities.length,
      assetsByType: Array.from(assetsByType.entries()).map(([type, data]) => ({ type, ...data })),
      liabilitiesByType: Array.from(liabilitiesByType.entries()).map(([type, data]) => ({ type, ...data })),
    }
  }, [filteredAccounts])

  if (filteredAccounts.length === 0) {
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
        <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-card p-6 border border-green-200'>
          <div className='flex items-start justify-between mb-2'>
            <div className='w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center'>
              <TrendingUp
                size={20}
                className='text-white'
              />
            </div>
          </div>
          <p className='text-sm text-green-700 font-medium mb-1'>Total Assets</p>
          <p className='text-2xl font-bold text-green-900'>{formatCurrency(netWorthData.totalAssets, currencySymbol)}</p>
          <p className='text-xs text-green-600 mt-2'>{netWorthData.assetCount} accounts</p>
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
          <p className='text-sm text-red-700 font-medium mb-1'>Total Liabilities</p>
          <p className='text-2xl font-bold text-red-900'>{formatCurrency(netWorthData.totalLiabilities, currencySymbol)}</p>
          <p className='text-xs text-red-600 mt-2'>{netWorthData.liabilityCount} accounts</p>
        </div>

        <div
          className={`bg-gradient-to-br rounded-card p-6 border ${
            netWorthData.netWorth >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'
          }`}
        >
          <div className='flex items-start justify-between mb-2'>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                netWorthData.netWorth >= 0 ? 'bg-blue-500' : 'bg-orange-500'
              }`}
            >
              <Wallet
                size={20}
                className='text-white'
              />
            </div>
          </div>
          <p className={`text-sm font-medium mb-1 ${netWorthData.netWorth >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Net Worth</p>
          <p className={`text-2xl font-bold ${netWorthData.netWorth >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
            {formatCurrency(netWorthData.netWorth, currencySymbol)}
          </p>
          <p className={`text-xs mt-2 ${netWorthData.netWorth >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Assets - Liabilities</p>
        </div>
      </div>

      {/* Asset Breakdown */}
      {netWorthData.assetsByType.length > 0 && (
        <div className='bg-white rounded-card p-6 shadow-soft'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
            <TrendingUp
              size={20}
              className='text-green-500'
            />
            Asset Breakdown
          </h3>
          <div className='space-y-4'>
            {netWorthData.assetsByType.map((item, index) => {
              const percentage = netWorthData.totalAssets > 0 ? (item.total / netWorthData.totalAssets) * 100 : 0
              return (
                <div
                  key={index}
                  className='space-y-2'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3 flex-1 min-w-0'>
                      <span className='text-sm font-medium text-gray-900 capitalize'>{item.type}</span>
                      <span className='text-xs text-gray-500'>({item.count} accounts)</span>
                    </div>
                    <div className='text-right flex-shrink-0 ml-4'>
                      <p className='text-sm font-semibold text-gray-900'>{formatCurrency(item.total, currencySymbol)}</p>
                      <p className='text-xs text-gray-500'>{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
                    <div
                      className='h-full rounded-full bg-green-500 transition-all duration-300'
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {/* Account details */}
                  <div className='ml-4 space-y-1'>
                    {item.accounts.map((acc, accIndex) => (
                      <div
                        key={accIndex}
                        className='flex items-center justify-between text-xs text-gray-600'
                      >
                        <span>
                          {acc.icon} {acc.name}
                        </span>
                        <span className='font-medium'>{formatCurrency(acc.balance, currencySymbol)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Liability Breakdown */}
      {netWorthData.liabilitiesByType.length > 0 && (
        <div className='bg-white rounded-card p-6 shadow-soft'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
            <TrendingDown
              size={20}
              className='text-red-500'
            />
            Liability Breakdown
          </h3>
          <div className='space-y-4'>
            {netWorthData.liabilitiesByType.map((item, index) => {
              const percentage = netWorthData.totalLiabilities > 0 ? (item.total / netWorthData.totalLiabilities) * 100 : 0
              return (
                <div
                  key={index}
                  className='space-y-2'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3 flex-1 min-w-0'>
                      <span className='text-sm font-medium text-gray-900 capitalize'>{item.type}</span>
                      <span className='text-xs text-gray-500'>({item.count} accounts)</span>
                    </div>
                    <div className='text-right flex-shrink-0 ml-4'>
                      <p className='text-sm font-semibold text-gray-900'>{formatCurrency(item.total, currencySymbol)}</p>
                      <p className='text-xs text-gray-500'>{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
                    <div
                      className='h-full rounded-full bg-red-500 transition-all duration-300'
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {/* Account details */}
                  <div className='ml-4 space-y-1'>
                    {item.accounts.map((acc, accIndex) => (
                      <div
                        key={accIndex}
                        className='flex items-center justify-between text-xs text-gray-600'
                      >
                        <span>
                          {acc.icon} {acc.name}
                        </span>
                        <span className='font-medium'>{formatCurrency(Math.abs(acc.balance), currencySymbol)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
