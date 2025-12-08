import { db, type Transaction } from '@/lib/db'

/**
 * Transaction service - handles all transaction-related operations
 * Uses BFF API routes with offline fallback
 */

// Re-export Transaction type
export type { Transaction } from '@/lib/db'

// Helper to check if online
function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine
}

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

  if (isOnline()) {
    // Online: Call BFF API
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: transaction.accountId,
          category_id: transaction.categoryId,
          type: transaction.type.toLowerCase(),
          amount: transaction.amount,
          currency: transaction.currency,
          notes: transaction.notes,
          date: transaction.date,
          recurring: transaction.recurring,
          to_account_id: transaction.toAccountId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create transaction')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to create transaction online, saving offline:', error)
      // Fallback to offline
      await saveToChangelog('transaction', transaction.id, 'create', transaction)
      return transaction
    }
  } else {
    // Offline: Save to changelog
    await saveToChangelog('transaction', transaction.id, 'create', transaction)
    return transaction
  }
}

export async function getTransaction(id: string): Promise<Transaction | undefined> {
  return await db.transactions.get(id)
}

export async function getAllTransactions(includeDeleted: boolean = false): Promise<Transaction[]> {
  if (isOnline()) {
    // Online: Fetch from BFF API
    try {
      const response = await fetch('/api/transactions')
      if (response.ok) {
        const data = await response.json()
        // Convert snake_case to camelCase
        return data.map((tx: any) => ({
          id: tx.id,
          accountId: tx.account_id,
          amount: tx.amount,
          currency: tx.currency || 'USD',
          categoryId: tx.category_id,
          type: (tx.type.charAt(0).toUpperCase() + tx.type.slice(1)) as Transaction['type'],
          toAccountId: tx.to_account_id,
          notes: tx.notes || '',
          date: tx.date,
          cleared: tx.cleared || false,
          recurring: tx.recurring || false,
          createdAt: tx.created_at,
          updatedAt: tx.updated_at,
          deleted: tx.deleted || false,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch transactions online:', error)
    }
  }

  // Fallback to IndexedDB
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

  if (isOnline()) {
    // Online: Call BFF API
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: updates.accountId,
          category_id: updates.categoryId,
          type: updates.type?.toLowerCase(),
          amount: updates.amount,
          currency: updates.currency,
          notes: updates.notes,
          date: updates.date,
          recurring: updates.recurring,
          to_account_id: updates.toAccountId,
          cleared: updates.cleared,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update transaction')
      }
    } catch (error) {
      console.error('Failed to update transaction online, saving offline:', error)
      // Fallback to offline
      await saveToChangelog('transaction', id, 'update', { id, ...updates })
    }
  } else {
    // Offline: Save to changelog
    await saveToChangelog('transaction', id, 'update', { id, ...updates })
  }
}

export async function deleteTransaction(id: string, hardDelete: boolean = false): Promise<void> {
  if (isOnline()) {
    // Online: Call BFF API
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete transaction')
      }
    } catch (error) {
      console.error('Failed to delete transaction online, saving offline:', error)
      // Fallback to offline
      await saveToChangelog('transaction', id, 'delete', { id })
    }
  } else {
    // Offline: Save to changelog
    await saveToChangelog('transaction', id, 'delete', { id })
  }
}

export async function toggleCleared(id: string): Promise<void> {
  if (isOnline()) {
    // Online: Get transaction and toggle
    try {
      const response = await fetch(`/api/transactions/${id}`)
      if (!response.ok) throw new Error('Transaction not found')

      const transaction = await response.json()
      const cleared = !transaction.cleared

      const updateResponse = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cleared }),
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to toggle cleared status')
      }
    } catch (error) {
      console.error('Failed to toggle cleared online, saving offline:', error)
      // Fallback to offline
      await saveToChangelog('transaction', id, 'update', { id, cleared: true })
    }
  } else {
    // Offline: Save to changelog (assume toggle to true)
    await saveToChangelog('transaction', id, 'update', { id, cleared: true })
  }
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
