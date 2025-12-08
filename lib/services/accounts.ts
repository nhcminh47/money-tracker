import { db, type Account } from '@/lib/db'
import { triggerBackgroundSync } from './sync'

/**
 * Account service - handles all account-related operations
 * ONE-WAY FLOW: IndexedDB → Changelog → Background Sync
 */

// Re-export Account type
export type { Account } from '@/lib/db'

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

export async function createAccount(data: { name: string; type: Account['type']; currency: string; icon?: string }): Promise<Account> {
  const now = new Date().toISOString()
  const account: Account = {
    id: crypto.randomUUID(),
    name: data.name,
    type: data.type,
    currency: data.currency,
    icon: data.icon || getDefaultIcon(data.type),
    createdAt: now,
    updatedAt: now,
  }

  // 1. Write to IndexedDB first (single source of truth)
  await db.accounts.add(account)

  // 2. Add to changelog for background sync
  await saveToChangelog('account', account.id, 'create', account)

  // 3. Trigger background sync (debounced)
  triggerBackgroundSync()

  // 4. Return immediately - UI can show data right away
  return account
}

export async function getAccount(id: string): Promise<Account | undefined> {
  return await db.accounts.get(id)
}

export async function getAllAccounts(): Promise<Account[]> {
  // Always read from IndexedDB (single source of truth)
  return await db.accounts.toArray()
}

export async function updateAccount(id: string, updates: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  // 1. Get existing account from IndexedDB
  const existing = await db.accounts.get(id)
  if (!existing) {
    throw new Error('Account not found')
  }

  // 2. Merge updates with existing data
  const updated: Account = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  // 3. Write to IndexedDB first
  await db.accounts.put(updated)

  // 4. Add to changelog for background sync
  await saveToChangelog('account', id, 'update', updated)

  // 5. Trigger background sync (debounced)
  triggerBackgroundSync()
}

export async function deleteAccount(id: string): Promise<void> {
  // 1. Verify account exists
  const existing = await db.accounts.get(id)
  if (!existing) {
    throw new Error('Account not found')
  }

  // 2. Delete from IndexedDB first
  await db.accounts.delete(id)

  // 3. Add to changelog for background sync
  await saveToChangelog('account', id, 'delete', { id })

  // 4. Trigger background sync (debounced)
  triggerBackgroundSync()
}

export async function getAccountBalance(accountId: string): Promise<number> {
  // Calculate balance from IndexedDB transactions
  const transactions = await db.transactions
    .filter((tx) => !tx.deleted && (tx.accountId === accountId || tx.toAccountId === accountId))
    .toArray()

  let balance = 0

  for (const tx of transactions) {
    if (tx.accountId === accountId) {
      // Money out from this account
      if (tx.type === 'Expense' || tx.type === 'Transfer') {
        balance -= tx.amount
      } else if (tx.type === 'Income') {
        balance += tx.amount
      }
    }

    if (tx.toAccountId === accountId && tx.type === 'Transfer') {
      // Money in to this account
      balance += tx.amount
    }
  }

  return balance
}

export async function getAccountsWithBalances(): Promise<(Account & { balance: number })[]> {
  const accounts = await getAllAccounts()

  const accountsWithBalances = await Promise.all(
    accounts.map(async (account) => ({
      ...account,
      balance: await getAccountBalance(account.id),
    })),
  )

  return accountsWithBalances
}

function getDefaultIcon(type: Account['type']): string {
  const icons: Record<Account['type'], string> = {
    Cash: '💵',
    Bank: '🏦',
    Card: '💳',
    Wallet: '👛',
    Other: '💰',
  }
  return icons[type]
}
