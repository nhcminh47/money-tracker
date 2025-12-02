import { db } from '@/lib/db';
import type { Account, Transaction, Category } from '@/lib/db';
import { seedCategories } from '@/lib/db/utils';

/**
 * Generate demo accounts
 */
async function seedDemoAccounts(): Promise<Account[]> {
  const now = new Date().toISOString();
  
  const accounts: Account[] = [
    {
      id: 'demo-checking',
      name: 'Checking Account',
      type: 'Bank',
      balance: 0,
      currency: 'USD',
      icon: '🏦',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'demo-savings',
      name: 'Savings Account',
      type: 'Bank',
      balance: 0,
      currency: 'USD',
      icon: '💰',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'demo-credit',
      name: 'Credit Card',
      type: 'Card',
      balance: 0,
      currency: 'USD',
      icon: '💳',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'demo-cash',
      name: 'Cash Wallet',
      type: 'Cash',
      balance: 0,
      currency: 'USD',
      icon: '💵',
      createdAt: now,
      updatedAt: now,
    },
  ];
  
  await db.accounts.bulkPut(accounts);
  return accounts;
}

/**
 * Generate demo transactions for the past 3 months
 */
async function seedDemoTransactions(categories: Category[]): Promise<Transaction[]> {
  const now = new Date();
  const transactions: Transaction[] = [];
  
  // Helper to get random date in the past N days
  const randomPastDate = (daysAgo: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    return date.toISOString();
  };
  
  // Helper to get random amount
  const randomAmount = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min) + min);
  };
  
  // Helper to get category by name
  const getCategoryId = (name: string) => {
    return categories.find(c => c.name === name)?.id || null;
  };
  
  // Income transactions (salary, freelance)
  const incomeTransactions: Omit<Transaction, 'id'>[] = [
    {
      accountId: 'demo-checking',
      amount: 5000,
      currency: 'USD',
      categoryId: getCategoryId('Salary'),
      type: 'Income',
      toAccountId: null,
      notes: 'Monthly salary',
      date: randomPastDate(30),
      cleared: true,
      recurring: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deleted: false,
    },
    {
      accountId: 'demo-checking',
      amount: 5000,
      currency: 'USD',
      categoryId: getCategoryId('Salary'),
      type: 'Income',
      toAccountId: null,
      notes: 'Monthly salary',
      date: randomPastDate(60),
      cleared: true,
      recurring: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deleted: false,
    },
    {
      accountId: 'demo-checking',
      amount: 1500,
      currency: 'USD',
      categoryId: getCategoryId('Freelance'),
      type: 'Income',
      toAccountId: null,
      notes: 'Freelance project payment',
      date: randomPastDate(45),
      cleared: true,
      recurring: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deleted: false,
    },
  ];
  
  // Expense transactions (various categories)
  const expenseData = [
    { category: 'Groceries', amounts: [120, 85, 95, 110, 78, 92], notes: 'Weekly groceries', recurring: false },
    { category: 'Restaurants', amounts: [45, 67, 52, 38, 71], notes: 'Dining out', recurring: false },
    { category: 'Transportation', amounts: [60, 55, 58], notes: 'Gas and parking', recurring: false },
    { category: 'Utilities', amounts: [150, 145], notes: 'Monthly utilities', recurring: true },
    { category: 'Entertainment', amounts: [35, 48, 22, 65], notes: 'Movies, games, etc', recurring: false },
    { category: 'Shopping', amounts: [200, 85, 120], notes: 'Clothing and accessories', recurring: false },
    { category: 'Healthcare', amounts: [75, 120], notes: 'Doctor visit and pharmacy', recurring: false },
    { category: 'Education', amounts: [299], notes: 'Online course subscription', recurring: true },
  ];
  
  const expenseTransactions: Omit<Transaction, 'id'>[] = [];
  
  expenseData.forEach(({ category, amounts, notes, recurring }) => {
    amounts.forEach(amount => {
      expenseTransactions.push({
        accountId: Math.random() > 0.5 ? 'demo-checking' : 'demo-credit',
        amount,
        currency: 'USD',
        categoryId: getCategoryId(category),
        type: 'Expense',
        toAccountId: null,
        notes,
        date: randomPastDate(90),
        cleared: true,
        recurring,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
    });
  });
  
  // Transfer transactions
  const transferTransactions: Omit<Transaction, 'id'>[] = [
    {
      accountId: 'demo-checking',
      amount: 1000,
      currency: 'USD',
      categoryId: null,
      type: 'Transfer',
      toAccountId: 'demo-savings',
      notes: 'Monthly savings',
      date: randomPastDate(30),
      cleared: true,
      recurring: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deleted: false,
    },
    {
      accountId: 'demo-checking',
      amount: 1000,
      currency: 'USD',
      categoryId: null,
      type: 'Transfer',
      toAccountId: 'demo-savings',
      notes: 'Monthly savings',
      date: randomPastDate(60),
      cleared: true,
      recurring: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deleted: false,
    },
    {
      accountId: 'demo-checking',
      amount: 500,
      currency: 'USD',
      categoryId: null,
      type: 'Transfer',
      toAccountId: 'demo-credit',
      notes: 'Credit card payment',
      date: randomPastDate(20),
      cleared: true,
      recurring: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deleted: false,
    },
  ];
  
  // Combine all transactions and add IDs
  const allTransactions = [
    ...incomeTransactions,
    ...expenseTransactions,
    ...transferTransactions,
  ];
  
  allTransactions.forEach((tx, index) => {
    transactions.push({
      ...tx,
      id: `demo-tx-${index + 1}`,
    });
  });
  
  await db.transactions.bulkPut(transactions);
  return transactions;
}

/**
 * Seed demo data (accounts, categories, transactions)
 */
export async function seedDemoData(): Promise<{
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
}> {
  try {
    // First, seed categories
    await seedCategories();
    const categories = await db.categories.toArray();
    
    // Then seed accounts
    const accounts = await seedDemoAccounts();
    
    // Finally seed transactions
    const transactions = await seedDemoTransactions(categories);
    
    return { accounts, categories, transactions };
  } catch (error) {
    console.error('Failed to seed demo data:', error);
    throw error;
  }
}

/**
 * Clear all demo data
 */
export async function clearDemoData(): Promise<void> {
  try {
    // Delete demo accounts
    await db.accounts.where('id').startsWith('demo-').delete();
    
    // Delete demo transactions
    await db.transactions.where('id').startsWith('demo-tx-').delete();
  } catch (error) {
    console.error('Failed to clear demo data:', error);
    throw error;
  }
}

/**
 * Check if demo data exists
 */
export async function hasDemoData(): Promise<boolean> {
  const demoAccountsCount = await db.accounts.where('id').startsWith('demo-').count();
  return demoAccountsCount > 0;
}
