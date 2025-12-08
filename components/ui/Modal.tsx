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
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Modal Container */}
      <div
        className='fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none'
        role='dialog'
        aria-modal='true'
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Modal */}
        <div
          ref={modalRef}
          tabIndex={-1}
          className={cn(
            'relative bg-white rounded-card shadow-card-hover w-full max-h-[90vh] flex flex-col animate-slide-up focus:outline-none pointer-events-auto',
            sizes[size]
          )}
        >
        {/* Header */}
        {title && (
          <div className='flex items-center justify-between p-6 border-b border-cream-300'>
            <h2
              id='modal-title'
              className='text-xl font-bold text-gray-900'
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label='Close modal'
              className='w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all'
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
        <div className='p-6 overflow-y-auto scrollbar-hide flex-1'>{children}</div>

        {/* Footer */}
        {footer && <div className='flex items-center justify-end gap-3 p-6 border-t border-cream-300'>{footer}</div>}
        </div>
      </div>
    </>
  )
}
