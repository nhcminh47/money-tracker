import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD', compact: boolean = false): string {
  if (compact) {
    const absAmount = Math.abs(amount)
    const sign = amount < 0 ? '-' : ''

    if (absAmount >= 1000000) {
      return `${sign}$${(absAmount / 1000000).toFixed(1)}M`
    } else if (absAmount >= 1000) {
      return `${sign}$${(absAmount / 1000).toFixed(1)}K`
    }
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}
