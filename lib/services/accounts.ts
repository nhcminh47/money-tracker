import { db, type Account } from '@/lib/db';

/**
 * Account service - handles all account-related operations
 */

// Re-export Account type
export type { Account } from '@/lib/db';

export async function createAccount(data: {
  name: string;
  type: Account['type'];
  currency: string;
  icon?: string;
}): Promise<Account> {
  const now = new Date().toISOString();
  const account: Account = {
    id: crypto.randomUUID(),
    name: data.name,
    type: data.type,
    currency: data.currency,
    icon: data.icon || getDefaultIcon(data.type),
    createdAt: now,
    updatedAt: now,
  };

  await db.accounts.add(account);
  return account;
}

export async function getAccount(id: string): Promise<Account | undefined> {
  return await db.accounts.get(id);
}

export async function getAllAccounts(): Promise<Account[]> {
  return await db.accounts.orderBy('createdAt').reverse().toArray();
}

export async function updateAccount(
  id: string,
  updates: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  await db.accounts.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteAccount(id: string): Promise<void> {
  // Check if account has transactions
  const transactionCount = await db.transactions
    .where('accountId')
    .equals(id)
    .and((tx) => !tx.deleted)
    .count();

  if (transactionCount > 0) {
    throw new Error('Cannot delete account with transactions. Please delete or move transactions first.');
  }

  await db.accounts.delete(id);
}

export async function getAccountBalance(accountId: string): Promise<number> {
  const transactions = await db.transactions
    .where('accountId')
    .equals(accountId)
    .and((tx) => !tx.deleted)
    .toArray();

  let balance = 0;

  for (const tx of transactions) {
    if (tx.type === 'Income') {
      balance += tx.amount;
    } else if (tx.type === 'Expense') {
      balance -= tx.amount;
    } else if (tx.type === 'Transfer') {
      // Transfer from this account (debit)
      if (tx.accountId === accountId) {
        balance -= tx.amount;
      }
      // Transfer to this account (credit)
      if (tx.toAccountId === accountId) {
        balance += tx.amount;
      }
    }
  }

  return balance;
}

export async function getAccountsWithBalances(): Promise<(Account & { balance: number })[]> {
  const accounts = await getAllAccounts();
  
  const accountsWithBalances = await Promise.all(
    accounts.map(async (account) => ({
      ...account,
      balance: await getAccountBalance(account.id),
    }))
  );

  return accountsWithBalances;
}

function getDefaultIcon(type: Account['type']): string {
  const icons: Record<Account['type'], string> = {
    Cash: '💵',
    Bank: '🏦',
    Card: '💳',
    Wallet: '👛',
    Other: '💰',
  };
  return icons[type];
}
