'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  PiggyBank, 
  Tag, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Palette
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { href: '/', label: t.nav.dashboard, icon: LayoutDashboard },
    { href: '/accounts', label: t.nav.accounts, icon: Wallet },
    { href: '/transactions', label: t.nav.transactions, icon: ArrowLeftRight },
    { href: '/budgets', label: t.nav.budgets, icon: PiggyBank },
    { href: '/categories', label: t.nav.categories, icon: Tag },
    { href: '/style-guide', label: 'Style Guide', icon: Palette },
    { href: '/settings', label: t.nav.settings, icon: Settings },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo/Header */}
      <div className={`p-6 border-b border-notion-border ${isCollapsed ? 'px-3' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          {!isCollapsed && (
            <span className="font-semibold text-notion-text-primary">Money Tracker</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg
                transition-all duration-200
                ${isActive
                  ? 'bg-notion-hover text-notion-accent font-medium'
                  : 'text-notion-text-secondary hover:bg-notion-hover hover:text-notion-text-primary'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      {user && (
        <div className={`p-3 border-t border-notion-border ${isCollapsed ? 'px-2' : ''}`}>
          {!isCollapsed && (
            <div className="mb-2 px-3">
              <p className="text-xs text-notion-text-secondary truncate">
                {user.email}
              </p>
            </div>
          )}
          <button
            onClick={signOut}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg
              text-notion-text-secondary hover:bg-notion-hover hover:text-notion-danger
              transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? t.auth?.signOut || 'Sign Out' : undefined}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm">{t.auth?.signOut || 'Sign Out'}</span>
            )}
          </button>
        </div>
      )}

      {/* Collapse Toggle - Desktop Only */}
      <div className="hidden md:block p-3 border-t border-notion-border">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                     text-notion-text-secondary hover:bg-notion-hover hover:text-notion-text-primary
                     transition-all duration-200"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!isCollapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar with L-shape */}
      <div className="md:hidden">
        {/* Mobile Sidebar Panel */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40
            w-64 bg-white dark:bg-notion-bg-dark border-r border-notion-border
            transform transition-transform duration-300 ease-in-out
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="h-full flex flex-col">
            <SidebarContent />
          </div>
        </aside>

        {/* Hamburger Button Tab - Moves with sidebar */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className={`
            fixed top-8 z-50 p-3 rounded-r-lg bg-white dark:bg-gray-800 
            border border-l-0 border-notion-border shadow-lg
            transform transition-transform duration-300 ease-in-out
            ${isMobileOpen ? 'translate-x-64' : 'translate-x-0'}
          `}
          style={{ left: 0 }}
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden md:flex md:flex-col
          bg-white dark:bg-notion-bg-dark border-r border-notion-border
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'md:w-16' : 'md:w-64'}
        `}
      >
        <div className="fixed h-screen flex flex-col" style={{ width: isCollapsed ? '4rem' : '16rem' }}>
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}
