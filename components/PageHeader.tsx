'use client'

import { Menu } from 'lucide-react'
import { useSidebar } from './layouts/SidebarContext'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export default function PageHeader({ title, description, children }: PageHeaderProps) {
  const { toggleMobile } = useSidebar()

  return (
    <div className='mb-8'>
      <div className='flex items-center gap-4 mb-2'>
        <button
          onClick={toggleMobile}
          className='md:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors'
          aria-label='Open menu'
        >
          <Menu
            size={24}
            className='text-gray-700'
          />
        </button>
        <div className='flex-1 min-w-0'>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-2'>{title}</h1>
          {description && <p className='text-gray-600 text-sm md:text-base'>{description}</p>}
        </div>
      </div>

      {children}
    </div>
  )
}
