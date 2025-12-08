import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef, useId } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, fullWidth = true, type = 'text', id: providedId, ...props }, ref) => {
    // Use provided id or generate a stable one with useId
    const generatedId = useId()
    const id = providedId || generatedId
    const errorId = `${id}-error`

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={id}
            className='block text-sm font-medium text-gray-700'
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          className={cn(
            'px-4 py-2.5 border rounded-input bg-white text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-coral-400 focus:border-coral-400',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
            'transition-all duration-200 shadow-soft focus:shadow-md',
            error ? 'border-chart-red focus:ring-chart-red' : 'border-gray-200',
            fullWidth && 'w-full',
            className,
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            className='text-sm text-chart-red'
            role='alert'
          >
            {error}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export { Input }
