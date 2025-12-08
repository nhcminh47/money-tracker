'use client'

import { cn } from '@/lib/utils'
import { useEffect } from 'react'

export interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const types = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-orange-50 text-orange-800 border-orange-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <div
      role='alert'
      aria-live='polite'
      aria-atomic='true'
      className={cn('flex items-center gap-3 px-4 py-3 rounded-button shadow-card border animate-slide-up', types[type])}
    >
      <span
        aria-hidden='true'
        className='text-lg font-semibold'
      >
        {icons[type]}
      </span>
      <p className='flex-1 text-sm font-medium'>{message}</p>
      <button
        onClick={onClose}
        aria-label='Close notification'
        className='text-current opacity-60 hover:opacity-100 transition-opacity'
      >
        <span
          aria-hidden='true'
          className='text-xl'
        >
          ×
        </span>
      </button>
    </div>
  )
}

export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      className='fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm'
      aria-label='Notifications'
      role='region'
    >
      {children}
    </div>
  )
}
