import { db, type Account, type Transaction, type Category } from './index';

// Utility to generate UUID (fallback if crypto.randomUUID not available)
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Simple UUID v4 fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Get current device ID (create if doesn't exist)
export async function getDeviceId(): Promise<string> {
  const existing = await db.meta.get('deviceId');
  if (existing) {
    return existing.value;
  }
  const deviceId = generateId();
  await db.meta.put({ key: 'deviceId', value: deviceId });
  return deviceId;
}

// Create changelog entry
export async function logChange(
  entity: string,
  entityId: string,
  op: 'create' | 'update' | 'delete',
  payload: any
) {
  const deviceId = await getDeviceId();
  await db.changelog.add({
    id: generateId(),
    entity,
    entityId,
    op,
    payload,
    timestamp: new Date().toISOString(),
    deviceId,
  });
}

// Default categories
export const defaultCategories: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Food & Dining', type: 'expense', color: '#ef4444', icon: '🍔', parentId: null },
  { name: 'Shopping', type: 'expense', color: '#f59e0b', icon: '🛍️', parentId: null },
  { name: 'Transportation', type: 'expense', color: '#3b82f6', icon: '🚗', parentId: null },
  { name: 'Bills & Utilities', type: 'expense', color: '#8b5cf6', icon: '💡', parentId: null },
  { name: 'Entertainment', type: 'expense', color: '#ec4899', icon: '🎬', parentId: null },
  { name: 'Healthcare', type: 'expense', color: '#10b981', icon: '⚕️', parentId: null },
  { name: 'Other Expense', type: 'expense', color: '#6b7280', icon: '📦', parentId: null },
  { name: 'Salary', type: 'income', color: '#22c55e', icon: '💰', parentId: null },
  { name: 'Freelance', type: 'income', color: '#14b8a6', icon: '💼', parentId: null },
  { name: 'Investment', type: 'income', color: '#06b6d4', icon: '📈', parentId: null },
  { name: 'Other Income', type: 'income', color: '#84cc16', icon: '💵', parentId: null },
];

// Seed default categories
export async function seedCategories() {
  const count = await db.categories.count();
  if (count === 0) {
    const now = new Date().toISOString();
    const categories = defaultCategories.map((cat) => ({
      ...cat,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }));
    await db.categories.bulkAdd(categories);
  }
}

// Calculate account balance
export async function calculateAccountBalance(accountId: string): Promise<number> {
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
      // For transfers, subtract from source account
      balance -= tx.amount;
    }
  }

  // Add transfers TO this account
  const transfersTo = await db.transactions
    .where('toAccountId')
    .equals(accountId)
    .and((tx) => !tx.deleted && tx.type === 'Transfer')
    .toArray();

  for (const tx of transfersTo) {
    balance += tx.amount;
  }

  return balance;
}
