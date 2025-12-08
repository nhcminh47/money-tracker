import { db, type Transaction } from '@/lib/db'
import { triggerBackgroundSync } from './sync'

/**
 * Transaction service - handles all transaction-related operations
 * ARCHITECTURE: One-way flow - always write to IndexedDB first, sync in background
 * - All writes go to IndexedDB immediately (single source of truth)
 * - Background sync handles cloud synchronization
 * - No direct API calls from service layer
 */

// Re-export Transaction type
export type { Transaction } from '@/lib/db'

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

// Form data type for creating/updating transactions
export interface TransactionFormData {
  accountId: string
  amount: number
  currency: string
  type: Transaction['type']
  categoryId?: string | null
  toAccountId?: string | null
  notes?: string
  date: string
  cleared?: boolean
}

export interface TransactionSummary {
  totalIncome: number
  totalExpense: number
  netAmount: number
  transactionCount: number
}

export async function createTransaction(data: {
  accountId: string
  amount: number
  currency: string
  categoryId: string | null
  type: Transaction['type']
  toAccountId?: string | null
  notes?: string
  date?: string
  cleared?: boolean
  recurring?: boolean
}): Promise<Transaction> {
  const now = new Date().toISOString()
  const transaction: Transaction = {
    id: crypto.randomUUID(),
    accountId: data.accountId,
    amount: data.amount,
    currency: data.currency,
    categoryId: data.categoryId || null,
    type: data.type,
    toAccountId: data.toAccountId || null,
    notes: data.notes || '',
    date: data.date || now,
    cleared: data.cleared ?? false,
    recurring: data.recurring ?? false,
    createdAt: now,
    updatedAt: now,
    deleted: false,
  }

  // Validate transfer has toAccountId
  if (transaction.type === 'Transfer' && !transaction.toAccountId) {
    throw new Error('Transfer transactions must have a destination account')
  }

  // Validate toAccountId is only used for transfers
  if (transaction.type !== 'Transfer' && transaction.toAccountId) {
    throw new Error('Only Transfer transactions can have a destination account')
  }

  // ONE-WAY FLOW: Always write to IndexedDB first (single source of truth)
  await db.transactions.add(transaction)

  // Add to changelog for background sync
  await saveToChangelog('transaction', transaction.id, 'create', transaction)

  // Trigger background sync (debounced, non-blocking)
  triggerBackgroundSync()

  // Return immediately - UI shows data right away
  return transaction
}

export async function getTransaction(id: string): Promise<Transaction | undefined> {
  return await db.transactions.get(id)
}

export async function getAllTransactions(includeDeleted: boolean = false): Promise<Transaction[]> {
  // ONE-WAY FLOW: Always read from IndexedDB (single source of truth)
  if (includeDeleted) {
    return await db.transactions.orderBy('date').reverse().toArray()
  }
  return await db.transactions
    .orderBy('date')
    .reverse()
    .filter((tx) => !tx.deleted)
    .toArray()
}

export async function getTransactionsByAccount(accountId: string, includeDeleted: boolean = false): Promise<Transaction[]> {
  const query = db.transactions.where('accountId').equals(accountId)

  if (includeDeleted) {
    return await query.reverse().sortBy('date')
  }

  return await query
    .filter((tx) => !tx.deleted)
    .reverse()
    .sortBy('date')
}

export async function getTransactionsByCategory(categoryId: string, includeDeleted: boolean = false): Promise<Transaction[]> {
  const query = db.transactions.where('categoryId').equals(categoryId)

  if (includeDeleted) {
    return await query.reverse().sortBy('date')
  }

  return await query
    .filter((tx) => !tx.deleted)
    .reverse()
    .sortBy('date')
}

export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string,
  includeDeleted: boolean = false,
): Promise<Transaction[]> {
  const query = db.transactions.where('date').between(startDate, endDate, true, true)

  if (includeDeleted) {
    return await query.reverse().sortBy('date')
  }

  return await query
    .filter((tx) => !tx.deleted)
    .reverse()
    .sortBy('date')
}

export async function updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  // Validate transfer constraints
  if (updates.type === 'Transfer' && !updates.toAccountId) {
    throw new Error('Transfer transactions must have a destination account')
  }

  // ONE-WAY FLOW: Always update IndexedDB first
  const existing = await db.transactions.get(id)
  if (!existing) throw new Error('Transaction not found')

  const updated = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  await db.transactions.put(updated)

  // Add to changelog for background sync
  await saveToChangelog('transaction', id, 'update', updated)

  // Trigger background sync
  triggerBackgroundSync()
}

export async function deleteTransaction(id: string, hardDelete: boolean = false): Promise<void> {
  // ONE-WAY FLOW: Always update IndexedDB first (soft delete)
  const existing = await db.transactions.get(id)
  if (!existing) throw new Error('Transaction not found')

  const deleted = {
    ...existing,
    deleted: true,
    updatedAt: new Date().toISOString(),
  }

  await db.transactions.put(deleted)

  // Add to changelog for background sync
  await saveToChangelog('transaction', id, 'delete', deleted)

  // Trigger background sync
  triggerBackgroundSync()
}

export async function toggleCleared(id: string): Promise<void> {
  // ONE-WAY FLOW: Always get from and update IndexedDB first
  const transaction = await db.transactions.get(id)
  if (!transaction) throw new Error('Transaction not found')

  const updated = {
    ...transaction,
    cleared: !transaction.cleared,
    updatedAt: new Date().toISOString(),
  }

  await db.transactions.put(updated)

  // Add to changelog for background sync
  await saveToChangelog('transaction', id, 'update', updated)

  // Trigger background sync
  triggerBackgroundSync()
}

export interface TransactionSummary {
  totalIncome: number
  totalExpense: number
  netAmount: number
  transactionCount: number
}

export async function getTransactionSummary(accountId?: string, startDate?: string, endDate?: string): Promise<TransactionSummary> {
  let transactions: Transaction[]

  if (accountId) {
    transactions = await db.transactions
      .where('accountId')
      .equals(accountId)
      .filter((tx) => !tx.deleted)
      .toArray()
  } else {
    transactions = await db.transactions.filter((tx) => !tx.deleted).toArray()
  }

  if (startDate && endDate) {
    transactions = transactions.filter((tx) => tx.date >= startDate && tx.date <= endDate)
  }

  const summary: TransactionSummary = {
    totalIncome: 0,
    totalExpense: 0,
    netAmount: 0,
    transactionCount: transactions.length,
  }

  for (const tx of transactions) {
    if (tx.type === 'Income') {
      summary.totalIncome += tx.amount
    } else if (tx.type === 'Expense') {
      summary.totalExpense += tx.amount
    }
    // Transfers don't affect net amount in summary
  }

  summary.netAmount = summary.totalIncome - summary.totalExpense

  return summary
}
