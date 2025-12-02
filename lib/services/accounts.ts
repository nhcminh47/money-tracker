import { db, type Account } from '@/lib/db'

/**
 * Account service - handles all account-related operations
 */

// Re-export Account type
export type { Account } from '@/lib/db'

export async function createAccount(data: { name: string; type: Account['type']; currency: string; icon?: string }): Promise<Account> {
  const response = await fetch('/api/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      type: data.type,
      currency: data.currency,
      icon: data.icon || getDefaultIcon(data.type),
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create account')
  }

  return await response.json()
}

export async function getAccount(id: string): Promise<Account | undefined> {
  return await db.accounts.get(id)
}

export async function getAllAccounts(): Promise<Account[]> {
  const response = await fetch('/api/accounts')

  if (!response.ok) {
    throw new Error('Failed to fetch accounts')
  }

  return await response.json()
}

export async function updateAccount(id: string, updates: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const response = await fetch(`/api/accounts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update account')
  }
}

export async function deleteAccount(id: string): Promise<void> {
  const response = await fetch(`/api/accounts/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete account')
  }

  await db.accounts.delete(id)
}

export async function getAccountBalance(accountId: string): Promise<number> {
  const response = await fetch(`/api/accounts/${accountId}/balance`)

  if (!response.ok) {
    return 0
  }

  const data = await response.json()
  return data.balance || 0
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
