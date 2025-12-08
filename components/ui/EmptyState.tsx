import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(({ className, icon = '📭', title, description, action, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('text-center py-12', className)}
      {...props}
    >
      <div className='text-6xl mb-4 opacity-50'>{icon}</div>
      <h3 className='text-lg font-semibold text-gray-900 mb-2'>{title}</h3>
      {description && <p className='text-gray-500 mb-6'>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
})

EmptyState.displayName = 'EmptyState'

export { EmptyState }
