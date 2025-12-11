'use client'

import { db } from '@/lib/db'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { BarChart3, DollarSign, FileText, PieChart, TrendingUp, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import PageHeader from './PageHeader'
import AccountSummaryReport from './reports/AccountSummaryReport'
import BudgetPerformanceReport from './reports/BudgetPerformanceReport'
import CashFlowReport from './reports/CashFlowReport'
import CategoryAnalysisReport from './reports/CategoryAnalysisReport'
import DateRangePicker, { type DateRange } from './reports/DateRangePicker'
import IncomeExpenseReport from './reports/IncomeExpenseReport'
import NetWorthReport from './reports/NetWorthReport'
import ReportFiltersComponent, { type ReportFilters } from './reports/ReportFilters'

type ReportType = 'income-expense' | 'category-analysis' | 'account-summary' | 'cash-flow' | 'net-worth' | 'budget-performance'

export default function ReportsClient() {
  const { t } = useTranslation()
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState('$')

  // Initialize date range to this month
  const getInitialDateRange = (): DateRange => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    return {
      startDate: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
      endDate: new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0],
    }
  }

  const [dateRange, setDateRange] = useState<DateRange>(getInitialDateRange())
  const [filters, setFilters] = useState<ReportFilters>({
    accounts: [],
    categories: [],
    transactionTypes: [],
    clearedStatus: 'all',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [txns, accts, cats, bdgts] = await Promise.all([
        db.transactions.toArray(),
        db.accounts.toArray(),
        db.categories.toArray(),
        db.budgets.toArray(),
      ])
      setTransactions(txns)
      setAccounts(accts)
      setCategories(cats)
      setBudgets(bdgts)

      // Load currency from localStorage
      const settingsStr = localStorage.getItem('money-tracker-settings')
      if (settingsStr) {
        const settings = JSON.parse(settingsStr)
        setCurrency(settings.currency || '$')
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const reportTypes = [
    {
      id: 'income-expense' as ReportType,
      title: t.reports.reportTypes.incomeExpense,
      description: t.reports.reportTypes.incomeExpenseDesc,
      icon: TrendingUp,
      color: 'from-blue-400 to-blue-500',
    },
    {
      id: 'category-analysis' as ReportType,
      title: t.reports.reportTypes.categoryAnalysis,
      description: t.reports.reportTypes.categoryAnalysisDesc,
      icon: PieChart,
      color: 'from-purple-400 to-purple-500',
    },
    {
      id: 'account-summary' as ReportType,
      title: t.reports.reportTypes.accountSummary,
      description: t.reports.reportTypes.accountSummaryDesc,
      icon: Wallet,
      color: 'from-green-400 to-green-500',
    },
    {
      id: 'cash-flow' as ReportType,
      title: t.reports.reportTypes.cashFlow,
      description: t.reports.reportTypes.cashFlowDesc,
      icon: DollarSign,
      color: 'from-coral-400 to-coral-500',
    },
    {
      id: 'net-worth' as ReportType,
      title: t.reports.reportTypes.netWorth,
      description: t.reports.reportTypes.netWorthDesc,
      icon: BarChart3,
      color: 'from-indigo-400 to-indigo-500',
    },
    {
      id: 'budget-performance' as ReportType,
      title: t.reports.reportTypes.budgetPerformance,
      description: t.reports.reportTypes.budgetPerformanceDesc,
      icon: FileText,
      color: 'from-amber-400 to-amber-500',
    },
  ]

  if (selectedReport) {
    return (
      <div className='min-h-screen bg-cream-50 pb-20 md:pb-0'>
        <div className='container-custom py-6'>
          <PageHeader
            title={reportTypes.find((r) => r.id === selectedReport)?.title || t.reports.title}
            description={reportTypes.find((r) => r.id === selectedReport)?.description}
          />
          <button
            onClick={() => setSelectedReport(null)}
            className='mb-6 text-coral-500 hover:text-coral-600 font-medium flex items-center gap-2 transition-colors'
          >
            ← {t.reports.backToTypes}
          </button>

          {loading ? (
            <div className='bg-white rounded-card p-12 shadow-soft text-center'>
              <p className='text-gray-500'>{t.common.loading}</p>
            </div>
          ) : (
            <div className='space-y-6'>
              {/* Filters at Top - Horizontal Pills */}
              <ReportFiltersComponent
                filters={filters}
                onChange={setFilters}
                accounts={accounts}
                categories={categories}
              />

              {/* Date Range in Middle */}
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />

              {/* Report Content at Bottom */}
              <div>
                {selectedReport === 'income-expense' && (
                  <IncomeExpenseReport
                    transactions={transactions}
                    dateRange={dateRange}
                    filters={filters}
                    currencySymbol={currency}
                  />
                )}
                {selectedReport === 'category-analysis' && (
                  <CategoryAnalysisReport
                    transactions={transactions}
                    categories={categories}
                    dateRange={dateRange}
                    filters={filters}
                    currencySymbol={currency}
                  />
                )}
                {selectedReport === 'account-summary' && (
                  <AccountSummaryReport
                    transactions={transactions}
                    accounts={accounts}
                    dateRange={dateRange}
                    filters={filters}
                    currencySymbol={currency}
                  />
                )}
                {selectedReport === 'cash-flow' && (
                  <CashFlowReport
                    transactions={transactions}
                    dateRange={dateRange}
                    filters={filters}
                    currencySymbol={currency}
                  />
                )}
                {selectedReport === 'net-worth' && (
                  <NetWorthReport
                    accounts={accounts}
                    dateRange={dateRange}
                    filters={filters}
                    currencySymbol={currency}
                  />
                )}
                {selectedReport === 'budget-performance' && (
                  <BudgetPerformanceReport
                    transactions={transactions}
                    budgets={budgets}
                    categories={categories}
                    dateRange={dateRange}
                    filters={filters}
                    currencySymbol={currency}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-cream-50 pb-20 md:pb-0'>
      <div className='container-custom py-6'>
        <PageHeader
          title={t.reports.title}
          description={t.reports.subtitle}
        />
        <main className='py-6'>
          <div className='mb-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>{t.reports.selectReportType}</h2>
            <p className='text-gray-600 text-sm'>Choose a report type to analyze your financial data</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {reportTypes.map((report) => {
              const Icon = report.icon
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className='bg-white rounded-card p-6 shadow-soft hover:shadow-medium transition-all duration-200 text-left group hover:-translate-y-1'
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${report.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon
                      size={28}
                      className='text-white'
                      strokeWidth={2}
                    />
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2 group-hover:text-coral-500 transition-colors'>{report.title}</h3>
                  <p className='text-gray-600 text-sm leading-relaxed'>{report.description}</p>
                </button>
              )
            })}
          </div>

          {/* Quick Info Section */}
          <div className='mt-12 bg-gradient-to-br from-coral-50 to-cream-100 rounded-card p-8 border border-coral-200'>
            <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2'>
              <BarChart3
                size={24}
                className='text-coral-500'
              />
              About Reports
            </h3>
            <div className='space-y-2 text-gray-700'>
              <p className='text-sm leading-relaxed'>
                Reports provide comprehensive analysis of your financial data with customizable date ranges and filters.
              </p>
              <p className='text-sm leading-relaxed'>
                Generate detailed insights on income, expenses, categories, accounts, cash flow, and net worth to make informed financial
                decisions.
              </p>
              <p className='text-sm leading-relaxed font-medium text-coral-600 mt-4'>📊 Select a report type above to get started</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
