'use client'

import { useTranslation } from '@/lib/i18n/useTranslation'
import { Flag, Folder, LayoutDashboard, Plus, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { t } = useTranslation()

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: t.nav.dashboard },
    { href: '/categories', icon: Folder, label: t.nav.categories },
    { href: '/transactions/new', icon: Plus, label: 'Add', isMainAction: true },
    { href: '/budgets', icon: Flag, label: t.nav.budgets },
    { href: '/settings', icon: User, label: t.nav.settings },
  ]

  return (
    <nav className='md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[32px] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-6 pb-6 pt-4'>
      <div className='grid grid-cols-5 items-center relative'>
        {navItems.map((item, index) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          if (item.isMainAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className='flex justify-center relative'
              >
                <div className='absolute -top-8 w-14 h-14 rounded-full bg-gradient-to-br from-coral-400 to-coral-500 shadow-[0_8px_24px_rgba(244,196,168,0.5)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform'>
                  <Icon
                    size={24}
                    className='text-white'
                    strokeWidth={2.5}
                  />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className='flex flex-col items-center gap-1 py-2'
            >
              <Icon
                size={24}
                className={`transition-colors ${isActive ? 'text-coral-500' : 'text-gray-400'}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-coral-500' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Bottom safe area indicator */}
      <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-300 rounded-full' />
    </nav>
  )
}
