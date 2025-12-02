'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/Button';

export default function Navigation() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  const navItems = [
    { href: '/', label: t.nav.dashboard, icon: '📊' },
    { href: '/accounts', label: t.nav.accounts, icon: '💳' },
    { href: '/transactions', label: t.nav.transactions, icon: '💸' },
    { href: '/budgets', label: t.nav.budgets, icon: '💰' },
    { href: '/categories', label: t.nav.categories, icon: '🏷️' },
    { href: '/settings', label: t.nav.settings, icon: '⚙️' },
  ];

  return (
    <nav className="md:h-full flex flex-col">
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-sm md:static md:border-0 md:shadow-none z-40 md:flex-1">
        <div className="flex justify-around md:flex-col md:gap-1 md:p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col md:flex-row items-center gap-1 md:gap-3 px-4 py-3 md:px-4 md:py-2 rounded-lg
                  transition-colors duration-200
                  ${
                    isActive
                      ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50'
                      : 'text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                <span className="text-xl md:text-lg">{item.icon}</span>
                <span className={`text-xs md:text-sm ${
                  isActive ? 'font-semibold' : ''
                }`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      
      {user && (
        <div className="hidden md:block p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="mb-3 px-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
          <Button
            onClick={signOut}
            variant="secondary"
            className="w-full justify-start text-sm"
          >
            <span className="mr-2">🚪</span>
            {t.auth?.signOut || 'Sign Out'}
          </Button>
        </div>
      )}
    </nav>
  );
}
