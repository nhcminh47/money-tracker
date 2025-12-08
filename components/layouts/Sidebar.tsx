'use client'

import { useAuth } from '@/lib/auth/AuthContext'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { ArrowLeftRight, ChevronLeft, ChevronRight, LayoutDashboard, LogOut, Palette, PiggyBank, Settings, Tag, Wallet } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useSidebar } from './SidebarContext'

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { isMobileOpen, toggleMobile } = useSidebar()

  const navItems = [
    { href: '/', label: t.nav.dashboard, icon: LayoutDashboard },
    { href: '/accounts', label: t.nav.accounts, icon: Wallet },
    { href: '/transactions', label: t.nav.transactions, icon: ArrowLeftRight },
    { href: '/budgets', label: t.nav.budgets, icon: PiggyBank },
    { href: '/categories', label: t.nav.categories, icon: Tag },
    ...(process.env.NODE_ENV === 'development' ? [{ href: '/style-guide', label: 'Style Guide', icon: Palette }] : []),
    { href: '/settings', label: t.nav.settings, icon: Settings },
  ]

  const SidebarContent = () => (
    <>
      {/* User Profile Section */}
      {user && !isCollapsed && (
        <div className='p-6 border-b border-cream-300'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-full bg-gradient-to-br from-coral-400 to-coral-500 flex items-center justify-center text-white text-lg font-semibold shadow-md'>
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='font-semibold text-gray-900 truncate text-sm'>{user.email?.split('@')[0] || 'User'}</p>
              <p className='text-xs text-gray-500'>Managing Director</p>
            </div>
          </div>
        </div>
      )}

      {/* Logo (collapsed state) */}
      {isCollapsed && (
        <div className='p-4 border-b border-cream-300 flex justify-center'>
          <div className='w-10 h-10 rounded-full bg-gradient-to-br from-coral-400 to-coral-500 flex items-center justify-center text-white text-lg font-semibold shadow-md'>
            {user?.email?.[0]?.toUpperCase() || '💰'}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className='flex-1 p-4 space-y-1'>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={toggleMobile}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-button
                transition-all duration-200 ease-in-out
                ${isActive ? 'bg-coral-400 text-white font-medium shadow-soft' : 'text-gray-700 hover:bg-gray-100 hover:text-coral-500'}
                ${isCollapsed ? 'justify-center px-3' : ''}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                size={20}
                className='flex-shrink-0'
              />
              {!isCollapsed && <span className='text-sm font-medium'>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      {user && (
        <div className={`p-4 border-t border-cream-300`}>
          <button
            onClick={signOut}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-button
              text-gray-700 hover:bg-red-50 hover:text-red-600
              transition-all duration-200 font-medium
              ${isCollapsed ? 'justify-center px-3' : ''}
            `}
            title={isCollapsed ? t.auth?.signOut || 'Sign Out' : undefined}
          >
            <LogOut
              size={20}
              className='flex-shrink-0'
            />
            {!isCollapsed && <span className='text-sm'>{t.auth?.signOut || 'Sign Out'}</span>}
          </button>
        </div>
      )}

      {/* Collapse Toggle - Desktop Only */}
      <div className='hidden md:block p-4'>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='w-full flex items-center justify-center gap-2 px-4 py-2 rounded-button
                     text-gray-600 hover:bg-gray-100
                     transition-all duration-200 text-sm font-medium'
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!isCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className='md:hidden fixed inset-0 bg-black/50 z-40'
          onClick={toggleMobile}
        />
      )}

      {/* Mobile Sidebar with L-shape */}
      <div className='md:hidden'>
        {/* Mobile Sidebar Panel */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40
            w-64 bg-cream-200 border-r border-cream-300
            transform transition-transform duration-300 ease-in-out
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className='h-full flex flex-col'>
            <SidebarContent />
          </div>
        </aside>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden md:flex md:flex-col
          bg-cream-200 backdrop-blur-sm
          border-r border-cream-300
          transition-all duration-300 ease-in-out
          shadow-soft
          ${isCollapsed ? 'md:w-20' : 'md:w-72'}
        `}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
