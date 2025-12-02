import { db } from '@/lib/db';
import type { Budget } from '@/lib/db';

/**
 * Create a new budget
 */
export async function createBudget(
  categoryId: string,
  amount: number,
  period: 'monthly' | 'yearly' = 'monthly'
): Promise<Budget> {
  const now = new Date().toISOString();
  const budget: Budget = {
    id: `budget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    categoryId,
    amount,
    period,
    startDate: new Date().toISOString().split('T')[0], // Today
    createdAt: now,
    updatedAt: now,
  };

  await db.budgets.add(budget);
  return budget;
}

/**
 * Update an existing budget
 */
export async function updateBudget(
  id: string,
  updates: Partial<Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Budget | undefined> {
  const budget = await db.budgets.get(id);
  if (!budget) return undefined;

  const updated: Budget = {
    ...budget,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await db.budgets.put(updated);
  return updated;
}

/**
 * Delete a budget
 */
export async function deleteBudget(id: string): Promise<void> {
  await db.budgets.delete(id);
}

/**
 * Get all budgets
 */
export async function getAllBudgets(): Promise<Budget[]> {
  return await db.budgets.toArray();
}

/**
 * Get budget by category
 */
export async function getBudgetByCategory(categoryId: string): Promise<Budget | undefined> {
  return await db.budgets.where('categoryId').equals(categoryId).first();
}

/**
 * Get budget spending status for current month
 */
export async function getBudgetStatus(categoryId: string): Promise<{
  budget: Budget | undefined;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}> {
  const budget = await getBudgetByCategory(categoryId);
  
  if (!budget) {
    return {
      budget: undefined,
      spent: 0,
      remaining: 0,
      percentage: 0,
      isOverBudget: false,
    };
  }

  // Get current month's start and end dates
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  // Calculate spent amount for this category in current month
  const transactions = await db.transactions
    .where('categoryId')
    .equals(categoryId)
    .and((tx) => !tx.deleted && tx.type === 'Expense' && tx.date >= startOfMonth && tx.date <= endOfMonth)
    .toArray();

  const spent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const remaining = budget.amount - spent;
  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

  return {
    budget,
    spent,
    remaining,
    percentage,
    isOverBudget: spent > budget.amount,
  };
}

/**
 * Get all budget statuses
 */
export async function getAllBudgetStatuses(): Promise<Array<{
  categoryId: string;
  categoryName: string;
  budget: Budget | undefined;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}>> {
  const budgets = await getAllBudgets();
  const categories = await db.categories.toArray();
  
  const statuses = await Promise.all(
    budgets.map(async (budget) => {
      const status = await getBudgetStatus(budget.categoryId);
      const category = categories.find((c) => c.id === budget.categoryId);
      
      return {
        categoryId: budget.categoryId,
        categoryName: category?.name || 'Unknown',
        ...status,
      };
    })
  );

  return statuses;
}
