'use client'

import { useTranslation } from '@/lib/i18n/useTranslation'
import { ChevronDown, Filter } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export interface ReportFilters {
  accounts: string[]
  categories: string[]
  transactionTypes: ('income' | 'expense' | 'transfer')[]
  clearedStatus: 'all' | 'cleared' | 'uncleared'
}

interface ReportFiltersProps {
  filters: ReportFilters
  onChange: (filters: ReportFilters) => void
  accounts: { id: string; name: string }[]
  categories: { id: string; name: string; type: 'income' | 'expense' }[]
  className?: string
}

export default function ReportFiltersComponent({ filters, onChange, accounts, categories, className = '' }: ReportFiltersProps) {
  const { t } = useTranslation()
  const [showAccountsDropdown, setShowAccountsDropdown] = useState(false)
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)

  const accountsRef = useRef<HTMLDivElement>(null)
  const categoriesRef = useRef<HTMLDivElement>(null)
  const typeRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountsRef.current && !accountsRef.current.contains(event.target as Node)) {
        setShowAccountsDropdown(false)
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setShowCategoriesDropdown(false)
      }
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false)
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClearAll = () => {
    onChange({
      accounts: [],
      categories: [],
      transactionTypes: [],
      clearedStatus: 'all',
    })
  }

  const toggleAccount = (accountId: string) => {
    const newAccounts = filters.accounts.includes(accountId)
      ? filters.accounts.filter((id) => id !== accountId)
      : [...filters.accounts, accountId]
    onChange({ ...filters, accounts: newAccounts })
  }

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((id) => id !== categoryId)
      : [...filters.categories, categoryId]
    onChange({ ...filters, categories: newCategories })
  }

  const toggleTransactionType = (type: 'income' | 'expense' | 'transfer') => {
    const newTypes = filters.transactionTypes.includes(type)
      ? filters.transactionTypes.filter((t) => t !== type)
      : [...filters.transactionTypes, type]
    onChange({ ...filters, transactionTypes: newTypes })
  }

  const hasActiveFilters =
    filters.accounts.length > 0 || filters.categories.length > 0 || filters.transactionTypes.length > 0 || filters.clearedStatus !== 'all'

  return (
    <div className={`bg-white rounded-card p-4 shadow-soft ${className}`}>
      <div className='flex items-center gap-3 flex-wrap'>
        {/* Filter Icon & Title */}
        <div className='flex items-center gap-2'>
          <Filter
            size={18}
            className='text-coral-500'
          />
          <span className='font-medium text-gray-900'>{t.reports.filters.title}</span>
        </div>

        {/* Accounts Dropdown Pill */}
        <div
          className='relative'
          ref={accountsRef}
        >
          <button
            onClick={() => setShowAccountsDropdown(!showAccountsDropdown)}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
              filters.accounts.length > 0
                ? 'bg-coral-500 text-white border-2 border-coral-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
            }`}
          >
            {t.reports.filters.accounts}
            {filters.accounts.length > 0 && (
              <span className='bg-white text-coral-500 rounded-full px-1.5 py-0.5 text-xs'>{filters.accounts.length}</span>
            )}
            <ChevronDown size={16} />
          </button>
          {showAccountsDropdown && (
            <div className='absolute top-full mt-2 bg-white rounded-card shadow-lg border border-gray-200 p-4 z-50 min-w-[200px] max-h-64 overflow-y-auto'>
              {accounts.map((account) => (
                <label
                  key={account.id}
                  className='flex items-center gap-2 cursor-pointer py-2 hover:bg-gray-50 px-2 rounded'
                >
                  <input
                    type='checkbox'
                    checked={filters.accounts.includes(account.id)}
                    onChange={() => toggleAccount(account.id)}
                    className='w-4 h-4 text-coral-500 border-gray-300 rounded'
                  />
                  <span className='text-sm text-gray-700'>{account.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Categories Dropdown Pill */}
        <div
          className='relative'
          ref={categoriesRef}
        >
          <button
            onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
              filters.categories.length > 0
                ? 'bg-coral-500 text-white border-2 border-coral-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
            }`}
          >
            {t.reports.filters.categories}
            {filters.categories.length > 0 && (
              <span className='bg-white text-coral-500 rounded-full px-1.5 py-0.5 text-xs'>{filters.categories.length}</span>
            )}
            <ChevronDown size={16} />
          </button>
          {showCategoriesDropdown && (
            <div className='absolute top-full mt-2 bg-white rounded-card shadow-lg border border-gray-200 p-4 z-50 min-w-[200px] max-h-64 overflow-y-auto'>
              {categories.map((category) => (
                <label
                  key={category.id}
                  className='flex items-center gap-2 cursor-pointer py-2 hover:bg-gray-50 px-2 rounded'
                >
                  <input
                    type='checkbox'
                    checked={filters.categories.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                    className='w-4 h-4 text-coral-500 border-gray-300 rounded'
                  />
                  <span className='text-sm text-gray-700'>{category.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Transaction Type Dropdown Pill */}
        <div
          className='relative'
          ref={typeRef}
        >
          <button
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
              filters.transactionTypes.length > 0 && filters.transactionTypes.length < 3
                ? 'bg-coral-500 text-white border-2 border-coral-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
            }`}
          >
            {t.reports.filters.transactionType}
            {filters.transactionTypes.length > 0 && filters.transactionTypes.length < 3 && (
              <span className='bg-white text-coral-500 rounded-full px-1.5 py-0.5 text-xs'>{filters.transactionTypes.length}</span>
            )}
            <ChevronDown size={16} />
          </button>
          {showTypeDropdown && (
            <div className='absolute top-full mt-2 bg-white rounded-card shadow-lg border border-gray-200 p-4 z-50 min-w-[180px]'>
              {(['income', 'expense', 'transfer'] as const).map((type) => (
                <label
                  key={type}
                  className='flex items-center gap-2 cursor-pointer py-2 hover:bg-gray-50 px-2 rounded'
                >
                  <input
                    type='checkbox'
                    checked={filters.transactionTypes.includes(type)}
                    onChange={() => toggleTransactionType(type)}
                    className='w-4 h-4 text-coral-500 border-gray-300 rounded'
                  />
                  <span className='text-sm text-gray-700 capitalize'>{t.transactions[type]}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Cleared Status Dropdown Pill */}
        <div
          className='relative'
          ref={statusRef}
        >
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
              filters.clearedStatus !== 'all'
                ? 'bg-coral-500 text-white border-2 border-coral-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
            }`}
          >
            {t.reports.filters.clearedStatus}
            <ChevronDown size={16} />
          </button>
          {showStatusDropdown && (
            <div className='absolute top-full mt-2 bg-white rounded-card shadow-lg border border-gray-200 p-4 z-50 min-w-[150px]'>
              {(['all', 'cleared', 'uncleared'] as const).map((status) => (
                <label
                  key={status}
                  className='flex items-center gap-2 cursor-pointer py-2 hover:bg-gray-50 px-2 rounded'
                >
                  <input
                    type='radio'
                    name='clearedStatus'
                    checked={filters.clearedStatus === status}
                    onChange={() => onChange({ ...filters, clearedStatus: status })}
                    className='w-4 h-4 text-coral-500 border-gray-300'
                  />
                  <span className='text-sm text-gray-700'>{status === 'all' ? t.reports.filters.allTypes : t.reports.filters[status]}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className='px-4 py-2 text-sm text-gray-600 hover:text-coral-500 font-medium transition-colors'
          >
            {t.reports.filters.clearAll}
          </button>
        )}
      </div>
    </div>
  )
}
