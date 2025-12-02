'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { seedCategories } from '@/lib/db/utils';
import { getAccountsWithBalances } from '@/lib/services/accounts';
import { getAllTransactions, getTransactionSummary } from '@/lib/services/transactions';
import { getAllCategories } from '@/lib/services/categories';
import { getSettings, formatCurrency } from '@/lib/services/settings';
import { getAllBudgetStatuses } from '@/lib/services/budgets';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { Account, Transaction, Category } from '@/lib/db';
import type { AppSettings } from '@/lib/services/settings';

export default function DashboardClient() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<(Account & { balance: number })[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netAmount: 0,
    transactionCount: 0,
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState<Array<{
    name: string;
    amount: number;
    color: string;
    percentage: number;
  }>>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [budgetStatuses, setBudgetStatuses] = useState<Array<{
    categoryId: string;
    categoryName: string;
    spent: number;
    remaining: number;
    percentage: number;
    isOverBudget: boolean;
  }>>([]);

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      await seedCategories();
      
      const [accts, txns, cats, summaryData, appSettings, budgets] = await Promise.all([
        getAccountsWithBalances(),
        getAllTransactions(),
        getAllCategories(),
        getTransactionSummary(),
        getSettings(),
        getAllBudgetStatuses(),
      ]);

      setAccounts(accts);
      setCategories(cats);
      setSummary(summaryData);
      setSettings(appSettings);
      setBudgetStatuses(budgets);

      // Get recent transactions (last 10)
      const recent = txns
        .filter((tx) => !tx.deleted)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);
      setRecentTransactions(recent);

      // Calculate category breakdown for expenses
      const expensesByCategory = new Map<string, number>();
      txns
        .filter((tx) => !tx.deleted && tx.type === 'Expense' && tx.categoryId)
        .forEach((tx) => {
          const current = expensesByCategory.get(tx.categoryId!) || 0;
          expensesByCategory.set(tx.categoryId!, current + tx.amount);
        });

      const breakdown = Array.from(expensesByCategory.entries())
        .map(([categoryId, amount]) => {
          const category = cats.find((c) => c.id === categoryId);
          return {
            name: category?.name || 'Unknown',
            amount,
            color: category?.color || '#6b7280',
            percentage: summaryData.totalExpense > 0 ? (amount / summaryData.totalExpense) * 100 : 0,
          };
        })
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      setCategoryBreakdown(breakdown);
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const getAccountName = (accountId: string) => {
    return accounts.find((a) => a.id === accountId)?.name || '';
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return '';
    return categories.find((c) => c.id === categoryId)?.name || '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 pl-14 md:pl-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.dashboard.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t.dashboard.subtitle}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Balance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t.dashboard.totalBalance}
              </span>
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalBalance, settings?.currency)}
            </p>
          </div>

          {/* Total Income */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t.dashboard.totalIncome}
              </span>
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalIncome, settings?.currency)}
            </p>
          </div>

          {/* Total Expense */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t.dashboard.totalExpense}
              </span>
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalExpense, settings?.currency)}
            </p>
          </div>

          {/* Net Amount */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t.dashboard.netAmount}
              </span>
              <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className={`text-2xl font-bold ${summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.netAmount, settings?.currency)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Accounts & Categories */}
          <div className="lg:col-span-2 space-y-8">
            {/* Accounts */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.dashboard.accounts}</h2>
                  <Link
                    href="/accounts"
                    className="text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400 font-medium"
                  >
                    {t.dashboard.viewAll} →
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {accounts.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    {t.dashboard.noAccounts}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {accounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {account.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {account.type}
                          </p>
                        </div>
                        <p className={`font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(account.balance, settings?.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t.dashboard.topSpending}
                </h2>
              </div>
              <div className="p-6">
                {categoryBreakdown.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    {t.dashboard.noExpenseData}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {categoryBreakdown.map((cat) => (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {cat.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {cat.percentage.toFixed(1)}%
                            </span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(cat.amount, settings?.currency)}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${cat.percentage}%`,
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Recent Transactions & Quick Actions */}
          <div className="space-y-8">
            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t.dashboard.recentTransactions}
                  </h2>
                  <Link
                    href="/transactions"
                    className="text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400 font-medium"
                  >
                    {t.dashboard.viewAll} →
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {recentTransactions.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    {t.dashboard.noTransactions}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                tx.type === 'Income'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : tx.type === 'Expense'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}
                            >
                              {tx.type}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {tx.notes || t.common.noDescription}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {getAccountName(tx.accountId)}
                            {tx.categoryId && ` • ${getCategoryName(tx.categoryId)}`}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p
                            className={`text-sm font-bold ${
                              tx.type === 'Income' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {tx.type === 'Income' ? '+' : '-'}{formatCurrency(tx.amount, settings?.currency)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(tx.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.dashboard.quickActions}</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/transactions/new?type=Income"
                    className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  >
                    <svg className="w-8 h-8 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {t.dashboard.addIncome}
                    </span>
                  </Link>

                  <Link
                    href="/transactions/new?type=Expense"
                    className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <svg className="w-8 h-8 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {t.dashboard.addExpense}
                    </span>
                  </Link>

                  <Link
                    href="/accounts"
                    className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {t.dashboard.newAccount}
                    </span>
                  </Link>

                  <Link
                    href="/transactions/new?type=Transfer"
                    className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <svg className="w-8 h-8 text-purple-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {t.dashboard.transfer}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
