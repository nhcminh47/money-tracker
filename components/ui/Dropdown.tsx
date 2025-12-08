'use client'

import { cn } from '@/lib/utils'
import { useEffect, useId, useRef, useState } from 'react'

export interface DropdownOption {
  value: string
  label: string
}

export interface DropdownProps {
  label?: string
  error?: string
  fullWidth?: boolean
  options: DropdownOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function Dropdown({
  label,
  error,
  fullWidth = true,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)
  const selectedIndex = options.findIndex((opt) => opt.value === value)

  // Use useId for stable IDs across server and client
  const uniqueId = useId()
  const buttonId = `dropdown-button-${uniqueId}`
  const listId = `dropdown-list-${uniqueId}`
  const labelId = label ? `dropdown-label-${uniqueId}` : undefined
  const errorId = error ? `dropdown-error-${uniqueId}` : undefined

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          setIsOpen(false)
          buttonRef.current?.focus()
          break
        case 'ArrowDown':
          event.preventDefault()
          setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0))
          break
        case 'ArrowUp':
          event.preventDefault()
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1))
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          if (focusedIndex >= 0) {
            handleSelect(options[focusedIndex].value)
          }
          break
        case 'Home':
          event.preventDefault()
          setFocusedIndex(0)
          break
        case 'End':
          event.preventDefault()
          setFocusedIndex(options.length - 1)
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, focusedIndex, options])

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue)
    setIsOpen(false)
    buttonRef.current?.focus()
  }

  // Reset focused index when opening
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0)
    }
  }, [isOpen, selectedIndex])

  return (
    <div className={cn('space-y-2', fullWidth && 'w-full', 'hidden md:block')}>
      {label && (
        <label
          id={labelId}
          className='block text-sm font-medium text-gray-700'
        >
          {label}
        </label>
      )}
      <div
        ref={dropdownRef}
        className='relative'
      >
        <button
          ref={buttonRef}
          id={buttonId}
          type='button'
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          role='combobox'
          aria-expanded={isOpen}
          aria-haspopup='listbox'
          aria-controls={listId}
          aria-labelledby={labelId}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={errorId}
          className={cn(
            'w-full px-4 py-3 pr-10 border rounded-input bg-white',
            'text-left text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-coral-400/50 focus:border-coral-400',
            'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
            'transition-all duration-200',
            'shadow-soft hover:shadow-md',
            error ? 'border-red-300' : 'border-gray-200',
            className,
          )}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>{selectedOption ? selectedOption.label : placeholder}</span>

          {/* Dropdown arrow */}
          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500'>
            <svg
              className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </div>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div
            ref={listRef}
            id={listId}
            role='listbox'
            aria-labelledby={labelId}
            className='absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-input shadow-card overflow-hidden animate-fade-in'
          >
            <div className='max-h-60 overflow-y-auto py-1'>
              {options.length === 0 ? (
                <div className='px-4 py-3 text-center text-gray-500'>No options available</div>
              ) : (
                options.map((option, index) => (
                  <div
                    key={option.value}
                    role='option'
                    aria-selected={option.value === value}
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={cn(
                      'w-full px-4 py-3 text-left transition-all duration-150 cursor-pointer',
                      'hover:bg-gradient-to-r hover:from-coral-50 hover:to-coral-100',
                      index === focusedIndex && 'bg-gradient-to-r from-coral-50 to-coral-100',
                      option.value === value ? 'bg-gradient-to-r from-coral-100 to-coral-200 text-coral-900 font-medium' : 'text-gray-700',
                    )}
                  >
                    {option.label}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p
          id={errorId}
          className='text-sm text-red-600'
          role='alert'
        >
          {error}
        </p>
      )}
    </div>
  )
}
