'use client'

import { cn } from '@/lib/utils'
import { ReactNode, useEffect, useRef } from 'react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string | ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in'
      role='dialog'
      aria-modal='true'
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn('relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full animate-slide-up focus:outline-none', sizes[size])}
      >
        {/* Header */}
        {title && (
          <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
            <h2
              id='modal-title'
              className='text-xl font-semibold text-gray-900 dark:text-gray-100'
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label='Close modal'
              className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors'
            >
              <span
                aria-hidden='true'
                className='text-2xl'
              >
                ×
              </span>
            </button>
          </div>
        )}

        {/* Content */}
        <div className='p-6 max-h-[calc(100vh-200px)] overflow-y-auto'>{children}</div>

        {/* Footer */}
        {footer && <div className='flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700'>{footer}</div>}
      </div>
    </div>
  )
}
