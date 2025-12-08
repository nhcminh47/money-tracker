'use client'

import ActivityChart from '@/components/ActivityChart'
import CategoryChart from '@/components/CategoryChart'
import { InsightsDashboard } from '@/components/InsightsDashboard'
import PageHeader from '@/components/PageHeader'
import type { Account, Category, Transaction } from '@/lib/db'
import { seedCategories } from '@/lib/db/utils'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { getAccountsWithBalances } from '@/lib/services/accounts'
import { getAllBudgetStatuses } from '@/lib/services/budgets'
import { getAllCategories } from '@/lib/services/categories'
import type { AppSettings } from '@/lib/services/settings'
import { formatCurrency, getSettings } from '@/lib/services/settings'
import { getAllTransactions, getTransactionSummary } from '@/lib/services/transactions'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function DashboardClient() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [accounts, setAccounts] = useState<(Account & { balance: number })[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netAmount: 0,
    transactionCount: 0,
  })
  const [categoryBreakdown, setCategoryBreakdown] = useState<
    Array<{
      name: string
      amount: number
      color: string
      percentage: number
    }>
  >([])
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [budgetStatuses, setBudgetStatuses] = useState<
    Array<{
      categoryId: string
      categoryName: string
      spent: number
      remaining: number
      percentage: number
      isOverBudget: boolean
    }>
  >([])
  const [activeTab, setActiveTab] = useState<'overview' | 'insights'>('overview')
  const [incomeCount, setIncomeCount] = useState(0)
  const [expenseCount, setExpenseCount] = useState(0)
  const [chartPeriod, setChartPeriod] = useState<'7D' | '1M' | '3M' | '1Y'>('7D')
  const [activityData, setActivityData] = useState<{
    labels: string[]
    income: number[]
    expense: number[]
  }>({ labels: [], income: [], expense: [] })

  useEffect(() => {
    initializeApp()
  }, [])

  async function initializeApp() {
    try {
      await seedCategories()

      const [accts, txns, cats, summaryData, appSettings, budgets] = await Promise.all([
        getAccountsWithBalances(),
        getAllTransactions(),
        getAllCategories(),
        getTransactionSummary(),
        getSettings(),
        getAllBudgetStatuses(),
      ])

      setAccounts(accts)
      setCategories(cats)
      setSummary(summaryData)
      setSettings(appSettings)
      setBudgetStatuses(budgets)

      // Get recent transactions (last 10)
      const recent = txns
        .filter((tx) => !tx.deleted)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)
      setRecentTransactions(recent)

      // Calculate transaction counts by type
      const incomeCountValue = txns.filter((tx) => !tx.deleted && tx.type === 'Income').length
      const expenseCountValue = txns.filter((tx) => !tx.deleted && tx.type === 'Expense').length
      setIncomeCount(incomeCountValue)
      setExpenseCount(expenseCountValue)

      // Calculate category breakdown for expenses
      const expensesByCategory = new Map<string, number>()
      txns
        .filter((tx) => !tx.deleted && tx.type === 'Expense' && tx.categoryId)
        .forEach((tx) => {
          const current = expensesByCategory.get(tx.categoryId!) || 0
          expensesByCategory.set(tx.categoryId!, current + tx.amount)
        })

      const breakdown = Array.from(expensesByCategory.entries())
        .map(([categoryId, amount]) => {
          const category = cats.find((c) => c.id === categoryId)
          return {
            name: category?.name || 'Unknown',
            amount,
            color: category?.color || '#6b7280',
            percentage: summaryData.totalExpense > 0 ? (amount / summaryData.totalExpense) * 100 : 0,
          }
        })
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)

      setCategoryBreakdown(breakdown)

      // Generate activity chart data
      generateActivityData(txns, '7D')
    } catch (error) {
      console.error('Failed to initialize app:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function generateActivityData(transactions: Transaction[], period: '7D' | '1M' | '3M' | '1Y') {
    const now = new Date()
    const days = period === '7D' ? 7 : period === '1M' ? 30 : period === '3M' ? 90 : 365
    const labels: string[] = []
    const income: number[] = []
    const expense: number[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      // Format label based on period
      let label = ''
      if (period === '7D') {
        label = date.toLocaleDateString('en-US', { weekday: 'short' })
      } else if (period === '1M') {
        label = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
      } else {
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }

      labels.push(label)

      // Calculate income and expense for this day
      const dayTransactions = transactions.filter((tx) => {
        const txDate = new Date(tx.date).toISOString().split('T')[0]
        return txDate === dateStr && !tx.deleted
      })

      const dayIncome = dayTransactions.filter((tx) => tx.type === 'Income').reduce((sum, tx) => sum + tx.amount, 0)

      const dayExpense = dayTransactions.filter((tx) => tx.type === 'Expense').reduce((sum, tx) => sum + tx.amount, 0)

      income.push(dayIncome)
      expense.push(dayExpense)
    }

    setActivityData({ labels, income, expense })
  }

  function handlePeriodChange(period: '7D' | '1M' | '3M' | '1Y') {
    setChartPeriod(period)
    getAllTransactions().then((txns) => {
      generateActivityData(txns, period)
    })
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  const getAccountName = (accountId: string) => {
    return accounts.find((a) => a.id === accountId)?.name || ''
  }

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return ''
    return categories.find((c) => c.id === categoryId)?.name || ''
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[50vh]'>
        <div className='text-center'>
          <div className='w-12 h-12 border-4 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>{t.common.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <PageHeader
        title={t.dashboard.title}
        description={t.dashboard.subtitle}
      />

      {/* Tab Navigation */}
      <div className='mb-8'>
        <div className='flex gap-2 p-1 bg-cream-100 rounded-button'>
          <button
            onClick={() => setActiveTab('overview')}
            className={`
                flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-button font-semibold text-sm
                transition-all duration-200
                ${activeTab === 'overview' ? 'bg-white text-gray-900 shadow-soft' : 'text-gray-600 hover:text-gray-900'}
              `}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`
                flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-button font-semibold text-sm
                transition-all duration-200
                ${activeTab === 'insights' ? 'bg-white text-gray-900 shadow-soft' : 'text-gray-600 hover:text-gray-900'}
              `}
          >
            🤖 AI Insights
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'insights' ? (
        <div>
          <div className='mb-6 p-4 bg-gradient-to-r from-coral-50 to-cream-100 border border-coral-200 rounded-lg'>
            <h2 className='text-lg font-semibold text-coral-900 mb-2'>🤖 AI-Powered Financial Insights</h2>
            <p className='text-sm text-coral-800'>
              Get personalized recommendations and smart analysis of your spending patterns using local AI processing. All analysis happens
              on your device.
            </p>
          </div>
          <InsightsDashboard />
        </div>
      ) : (
        <>
          {/* Overview Content */}

          {/* Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {/* Total Balance */}
            <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-card p-6 shadow-card hover:shadow-card-hover transition-all'>
              <div className='mb-3'>
                <span className='text-sm font-medium text-gray-600'>{t.dashboard.totalBalance}</span>
              </div>
              <p className='text-3xl font-bold text-gray-900 mb-1'>{formatCurrency(totalBalance, settings?.currency, true)}</p>
              <span className='text-xs text-gray-500'>
                {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
              </span>
            </div>

            {/* Total Income */}
            <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-card p-6 shadow-card hover:shadow-card-hover transition-all'>
              <div className='mb-3'>
                <span className='text-sm font-medium text-gray-600'>{t.dashboard.totalIncome}</span>
              </div>
              <p className='text-3xl font-bold text-chart-green mb-1'>{formatCurrency(summary.totalIncome, settings?.currency, true)}</p>
              <span className='text-xs text-gray-500'>
                {incomeCount} {incomeCount === 1 ? 'transaction' : 'transactions'}
              </span>
            </div>

            {/* Total Expense */}
            <div className='bg-gradient-to-br from-red-50 to-red-100 rounded-card p-6 shadow-card hover:shadow-card-hover transition-all'>
              <div className='mb-3'>
                <span className='text-sm font-medium text-gray-600'>{t.dashboard.totalExpense}</span>
              </div>
              <p className='text-3xl font-bold text-chart-red mb-1'>{formatCurrency(summary.totalExpense, settings?.currency, true)}</p>
              <span className='text-xs text-gray-500'>
                {expenseCount} {expenseCount === 1 ? 'transaction' : 'transactions'}
              </span>
            </div>

            {/* Net Amount */}
            <div className='bg-gradient-to-br from-coral-50 to-coral-100 rounded-card p-6 shadow-card hover:shadow-card-hover transition-all'>
              <div className='mb-3'>
                <span className='text-sm font-medium text-gray-600'>{t.dashboard.netAmount}</span>
              </div>
              <p className={`text-3xl font-bold mb-1 ${summary.netAmount >= 0 ? 'text-chart-green' : 'text-chart-red'}`}>
                {formatCurrency(summary.netAmount, settings?.currency, true)}
              </p>
              <span className='text-xs text-gray-500'>
                {summary.totalIncome > 0
                  ? `${((summary.netAmount / summary.totalIncome) * 100).toFixed(1)}% savings rate`
                  : 'No income yet'}
              </span>
            </div>
          </div>

          {/* Main Content - Single Column */}
          <div className='space-y-8'>
            {/* Activity Chart */}
            <div className='bg-white rounded-card shadow-card'>
              <div className='p-6 border-b border-cream-300'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-xl font-bold text-gray-900'>Activity Overview</h2>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => handlePeriodChange('7D')}
                      className={`px-3 py-1 text-sm font-medium rounded-button transition-colors ${
                        chartPeriod === '7D' ? 'text-coral-500 bg-coral-50 hover:bg-coral-100' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      7D
                    </button>
                    <button
                      onClick={() => handlePeriodChange('1M')}
                      className={`px-3 py-1 text-sm font-medium rounded-button transition-colors ${
                        chartPeriod === '1M' ? 'text-coral-500 bg-coral-50 hover:bg-coral-100' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      1M
                    </button>
                    <button
                      onClick={() => handlePeriodChange('3M')}
                      className={`px-3 py-1 text-sm font-medium rounded-button transition-colors ${
                        chartPeriod === '3M' ? 'text-coral-500 bg-coral-50 hover:bg-coral-100' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      3M
                    </button>
                    <button
                      onClick={() => handlePeriodChange('1Y')}
                      className={`px-3 py-1 text-sm font-medium rounded-button transition-colors ${
                        chartPeriod === '1Y' ? 'text-coral-500 bg-coral-50 hover:bg-coral-100' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      1Y
                    </button>
                  </div>
                </div>
              </div>
              <div className='p-6'>
                <ActivityChart
                  data={activityData}
                  period={chartPeriod}
                  currency={settings?.currency}
                />
              </div>
            </div>

            {/* Grid for Accounts, Categories, and Transactions */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              {/* Accounts */}
              <div className='bg-white rounded-card shadow-card'>
                <div className='p-6 border-b border-cream-300'>
                  <div className='flex items-center justify-between'>
                    <h2 className='text-xl font-bold text-gray-900'>{t.dashboard.accounts}</h2>
                    <Link
                      href='/accounts'
                      className='text-sm text-coral-500 hover:text-coral-600 font-medium transition-colors'
                    >
                      {t.dashboard.viewAll} →
                    </Link>
                  </div>
                </div>
                <div className='p-6'>
                  {accounts.length === 0 ? (
                    <p className='text-gray-500 text-center py-8'>{t.dashboard.noAccounts}</p>
                  ) : (
                    <div className='space-y-3'>
                      {accounts.map((account) => (
                        <div
                          key={account.id}
                          className='flex items-center justify-between p-4 rounded-button bg-cream-50 hover:bg-cream-100 transition-all cursor-pointer'
                        >
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 bg-coral-400 rounded-full flex items-center justify-center'>
                              <svg
                                className='w-5 h-5 text-white'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
                                />
                              </svg>
                            </div>
                            <div>
                              <p className='font-semibold text-gray-900'>{account.name}</p>
                              <p className='text-xs text-gray-500'>{account.type}</p>
                            </div>
                          </div>
                          <p className={`font-bold text-lg ${account.balance >= 0 ? 'text-chart-green' : 'text-chart-red'}`}>
                            {formatCurrency(account.balance, settings?.currency)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className='bg-white rounded-card shadow-card'>
                <div className='p-6 border-b border-cream-300'>
                  <div className='flex items-center justify-between'>
                    <h2 className='text-xl font-bold text-gray-900'>{t.dashboard.recentTransactions}</h2>
                    <Link
                      href='/transactions'
                      className='text-sm text-coral-500 hover:text-coral-600 font-medium transition-colors'
                    >
                      {t.dashboard.viewAll} →
                    </Link>
                  </div>
                </div>
                <div className='p-6'>
                  {recentTransactions.length === 0 ? (
                    <p className='text-gray-500 text-center py-8'>{t.dashboard.noTransactions}</p>
                  ) : (
                    <div className='space-y-3'>
                      {recentTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className='flex items-center justify-between p-3 rounded-button bg-cream-50 hover:bg-cream-100 transition-all cursor-pointer'
                        >
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 mb-1'>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  tx.type === 'Income'
                                    ? 'bg-green-100 text-green-800'
                                    : tx.type === 'Expense'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {tx.type}
                              </span>
                            </div>
                            <p className='text-sm font-medium text-gray-900 truncate'>{tx.notes || t.common.noDescription}</p>
                            <p className='text-xs text-gray-500'>
                              {getAccountName(tx.accountId)}
                              {tx.categoryId && ` • ${getCategoryName(tx.categoryId)}`}
                            </p>
                          </div>
                          <div className='text-right ml-4'>
                            <p className={`text-sm font-bold ${tx.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                              {tx.type === 'Income' ? '+' : '-'}
                              {formatCurrency(tx.amount, settings?.currency)}
                            </p>
                            <p className='text-xs text-gray-500'>{new Date(tx.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Category Breakdown & Quick Actions */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              {/* Category Breakdown */}
              <div className='bg-white rounded-card shadow-card'>
                <div className='p-6 border-b border-cream-300'>
                  <h2 className='text-xl font-bold text-gray-900'>{t.dashboard.topSpending}</h2>
                </div>
                <div className='p-6'>
                  {categoryBreakdown.length === 0 ? (
                    <p className='text-gray-500 text-center py-8'>{t.dashboard.noExpenseData}</p>
                  ) : (
                    <>
                      {/* Doughnut Chart */}
                      <div className='mb-6'>
                        <CategoryChart
                          data={categoryBreakdown}
                          currency={settings?.currency}
                        />
                      </div>

                      {/* Category List */}
                      <div className='space-y-4'>
                        {categoryBreakdown.map((cat) => (
                          <div key={cat.name}>
                            <div className='flex items-center justify-between mb-2'>
                              <div className='flex items-center gap-2'>
                                <div
                                  className='w-3 h-3 rounded-full'
                                  style={{ backgroundColor: cat.color }}
                                />
                                <span className='text-sm font-medium text-gray-900'>{cat.name}</span>
                              </div>
                              <div className='flex items-center gap-3'>
                                <span className='text-sm text-gray-600'>{cat.percentage.toFixed(1)}%</span>
                                <span className='text-sm font-semibold text-gray-900'>
                                  {formatCurrency(cat.amount, settings?.currency)}
                                </span>
                              </div>
                            </div>
                            <div className='w-full bg-gray-200 rounded-full h-2'>
                              <div
                                className='h-2 rounded-full transition-all'
                                style={{
                                  width: `${cat.percentage}%`,
                                  backgroundColor: cat.color,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className='bg-white rounded-card shadow-card'>
                <div className='p-6 border-b border-cream-300'>
                  <h2 className='text-xl font-bold text-gray-900'>{t.dashboard.quickActions}</h2>
                </div>
                <div className='p-6'>
                  <div className='grid grid-cols-2 gap-4'>
                    <Link
                      href='/transactions/new?type=Income'
                      className='flex flex-col items-center justify-center p-5 rounded-button bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all shadow-soft hover:shadow-card'
                    >
                      <div className='w-10 h-10 bg-chart-green rounded-full flex items-center justify-center mb-2'>
                        <svg
                          className='w-5 h-5 text-white'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 4v16m8-8H4'
                          />
                        </svg>
                      </div>
                      <span className='text-sm font-semibold text-gray-900'>{t.dashboard.addIncome}</span>
                    </Link>

                    <Link
                      href='/transactions/new?type=Expense'
                      className='flex flex-col items-center justify-center p-5 rounded-button bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 transition-all shadow-soft hover:shadow-card'
                    >
                      <div className='w-10 h-10 bg-chart-red rounded-full flex items-center justify-center mb-2'>
                        <svg
                          className='w-5 h-5 text-white'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M20 12H4'
                          />
                        </svg>
                      </div>
                      <span className='text-sm font-semibold text-gray-900'>{t.dashboard.addExpense}</span>
                    </Link>

                    <Link
                      href='/accounts'
                      className='flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-coral-500 hover:bg-coral-50 transition-colors'
                    >
                      <svg
                        className='w-8 h-8 text-coral-500 mb-2'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
                        />
                      </svg>
                      <span className='text-sm font-medium text-gray-900'>{t.dashboard.newAccount}</span>
                    </Link>

                    <Link
                      href='/transactions/new?type=Transfer'
                      className='flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-coral-500 hover:bg-coral-50 transition-colors'
                    >
                      <svg
                        className='w-8 h-8 text-coral-500 mb-2'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
                        />
                      </svg>
                      <span className='text-sm font-medium text-gray-900'>{t.dashboard.transfer}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
