import type { Budget } from '@/lib/db'
import { db } from '@/lib/db'
import { triggerBackgroundSync } from './sync'

// Helper to save to changelog for offline sync
async function saveToChangelog(entity: string, entityId: string, operation: 'create' | 'update' | 'delete', data: any): Promise<void> {
  const deviceId =
    typeof window !== 'undefined'
      ? localStorage.getItem('deviceId') ||
        (() => {
          const id = crypto.randomUUID()
          localStorage.setItem('deviceId', id)
          return id
        })()
      : 'server'

  await db.changelog.add({
    id: crypto.randomUUID(),
    entity,
    entityId,
    op: operation,
    payload: data,
    timestamp: new Date().toISOString(),
    deviceId,
  })
}

/**
 * Create a new budget
 * ONE-WAY FLOW: IndexedDB → Changelog → Background Sync
 */
export async function createBudget(categoryId: string, amount: number, period: 'monthly' | 'yearly' = 'monthly'): Promise<Budget> {
  const now = new Date().toISOString()
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const budget: Budget = {
    id: crypto.randomUUID(),
    categoryId,
    amount,
    period,
    startDate: startOfMonth.toISOString(),
    endDate: undefined,
    createdAt: now,
    updatedAt: now,
  }

  // 1. Write to IndexedDB first (single source of truth)
  await db.budgets.add(budget)

  // 2. Add to changelog for background sync
  await saveToChangelog('budget', budget.id, 'create', budget)

  // 3. Trigger background sync (debounced)
  triggerBackgroundSync()

  // 4. Return immediately
  return budget
}

/**
 * Update an existing budget
 */
export async function updateBudget(
  id: string,
  updates: Partial<Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<Budget | undefined> {
  // 1. Get existing budget from IndexedDB
  const existing = await db.budgets.get(id)
  if (!existing) {
    throw new Error('Budget not found')
  }

  // 2. Merge updates with existing data
  const updated: Budget = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  // 3. Write to IndexedDB first
  await db.budgets.put(updated)

  // 4. Add to changelog for background sync
  await saveToChangelog('budget', id, 'update', updated)

  // 5. Trigger background sync (debounced)
  triggerBackgroundSync()

  return updated
}

/**
 * Delete a budget
 */
export async function deleteBudget(id: string): Promise<void> {
  // 1. Verify budget exists
  const existing = await db.budgets.get(id)
  if (!existing) {
    throw new Error('Budget not found')
  }

  // 2. Delete from IndexedDB first
  await db.budgets.delete(id)

  // 3. Add to changelog for background sync
  await saveToChangelog('budget', id, 'delete', { id })

  // 4. Trigger background sync (debounced)
  triggerBackgroundSync()
}

/**
 * Get all budgets
 */
export async function getAllBudgets(): Promise<Budget[]> {
  // Always read from IndexedDB (single source of truth)
  return await db.budgets.toArray()
}

/**
 * Get budget by category
 */
export async function getBudgetByCategory(categoryId: string): Promise<Budget | undefined> {
  return await db.budgets.where('categoryId').equals(categoryId).first()
}

/**
 * Get budget spending status for current month
 */
export async function getBudgetStatus(categoryId: string): Promise<{
  budget: Budget | undefined
  spent: number
  remaining: number
  percentage: number
  isOverBudget: boolean
}> {
  const budget = await getBudgetByCategory(categoryId)

  if (!budget) {
    return {
      budget: undefined,
      spent: 0,
      remaining: 0,
      percentage: 0,
      isOverBudget: false,
    }
  }

  // Get current month's start and end dates
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  // Calculate spent amount for this category in current month
  const transactions = await db.transactions
    .where('categoryId')
    .equals(categoryId)
    .and((tx) => !tx.deleted && tx.type === 'Expense' && tx.date >= startOfMonth && tx.date <= endOfMonth)
    .toArray()

  const spent = transactions.reduce((sum, tx) => sum + tx.amount, 0)
  const remaining = budget.amount - spent
  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0

  return {
    budget,
    spent,
    remaining,
    percentage,
    isOverBudget: spent > budget.amount,
  }
}

/**
 * Get all budget statuses
 */
export async function getAllBudgetStatuses(): Promise<
  Array<{
    categoryId: string
    categoryName: string
    budget: Budget | undefined
    spent: number
    remaining: number
    percentage: number
    isOverBudget: boolean
  }>
> {
  const budgets = await getAllBudgets()
  const categories = await db.categories.toArray()

  const statuses = await Promise.all(
    budgets.map(async (budget) => {
      const status = await getBudgetStatus(budget.categoryId)
      const category = categories.find((c) => c.id === budget.categoryId)

      return {
        categoryId: budget.categoryId,
        categoryName: category?.name || 'Unknown',
        ...status,
      }
    }),
  )

  return statuses
}
