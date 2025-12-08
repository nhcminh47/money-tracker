import { db } from '@/lib/db'

export interface AppSettings {
  id: string
  currency: string
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  theme: 'light' | 'dark' | 'auto'
  language: 'en' | 'vi'
  updatedAt: string
}

const SETTINGS_KEY = 'app-settings'

const defaultSettings: AppSettings = {
  id: SETTINGS_KEY,
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  theme: 'auto',
  language: 'en',
  updatedAt: new Date().toISOString(),
}

/**
 * Get current app settings
 */
export async function getSettings(): Promise<AppSettings> {
  const meta = await db.meta.get(SETTINGS_KEY)

  if (meta?.value) {
    return meta.value as AppSettings
  }

  // Return default settings if not found
  return defaultSettings
}

/**
 * Update app settings
 */
export async function updateSettings(updates: Partial<Omit<AppSettings, 'id' | 'updatedAt'>>): Promise<AppSettings> {
  const current = await getSettings()

  const updated: AppSettings = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  await db.meta.put({
    key: SETTINGS_KEY,
    value: updated,
  })

  return updated
}

/**
 * Reset settings to defaults
 */
export async function resetSettings(): Promise<AppSettings> {
  const reset = {
    ...defaultSettings,
    updatedAt: new Date().toISOString(),
  }

  await db.meta.put({
    key: SETTINGS_KEY,
    value: reset,
  })

  return reset
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    VND: '₫',
    CNY: '¥',
    INR: '₹',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'Fr',
  }

  return symbols[currency] || currency
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency?: string, compact: boolean = false): string {
  if (!currency) {
    // Use default currency
    currency = 'USD'
  }

  const symbol = getCurrencySymbol(currency)
  const absAmount = Math.abs(amount)

  // Compact format for large numbers
  if (compact) {
    if (absAmount >= 1000000) {
      return `${symbol}${(absAmount / 1000000).toFixed(1)}M`
    } else if (absAmount >= 1000) {
      return `${symbol}${(absAmount / 1000).toFixed(1)}K`
    }
  }

  // Format with thousands separator
  const formatted = absAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return `${symbol}${formatted}`
}

/**
 * Format date according to settings
 */
export function formatDate(date: string | Date, format?: AppSettings['dateFormat']): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (!format) {
    format = 'MM/DD/YYYY'
  }

  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    case 'MM/DD/YYYY':
    default:
      return `${month}/${day}/${year}`
  }
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: AppSettings['theme']) {
  if (typeof window === 'undefined') return

  const root = document.documentElement

  if (theme === 'auto') {
    // Use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  } else if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}
