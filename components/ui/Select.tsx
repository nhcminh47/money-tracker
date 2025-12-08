import { cn } from '@/lib/utils'
import { SelectHTMLAttributes, forwardRef, useId } from 'react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  fullWidth?: boolean
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, fullWidth = true, children, id: providedId, ...props }, ref) => {
    // Use provided id or generate a stable one with useId
    const generatedId = useId()
    const id = providedId || generatedId
    const errorId = `${id}-error`

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full', 'md:hidden')}>
        {label && (
          <label
            htmlFor={id}
            className='block text-sm font-medium text-gray-700'
          >
            {label}
          </label>
        )}
        <div className='relative'>
          <select
            ref={ref}
            id={id}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              'appearance-none w-full px-4 py-3 pr-10 border rounded-input bg-white text-gray-900',
              'focus:outline-none focus:ring-2 focus:ring-coral-400/50 focus:border-coral-400',
              'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
              'transition-all duration-200',
              'shadow-soft hover:shadow-md',
              error ? 'border-red-300' : 'border-gray-200',
              className,
            )}
            {...props}
          >
            {children}
          </select>
          {/* Dropdown arrow */}
          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500'>
            <svg
              className='h-4 w-4'
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
  },
)

Select.displayName = 'Select'

export { Select }
