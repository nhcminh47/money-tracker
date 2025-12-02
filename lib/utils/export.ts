import { db } from '@/lib/db';
import { encryptData, decryptData } from '@/lib/utils/crypto';

/**
 * Export/Import utilities for data backup
 */

export interface BackupData {
  version: string;
  exportDate: string;
  accounts: any[];
  transactions: any[];
  categories: any[];
  changelog: any[];
}

// Export all data as JSON
export async function exportData(): Promise<BackupData> {
  const [accounts, transactions, categories, changelog] = await Promise.all([
    db.accounts.toArray(),
    db.transactions.toArray(),
    db.categories.toArray(),
    db.changelog.toArray(),
  ]);

  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    accounts,
    transactions,
    categories,
    changelog,
  };
}

// Export data as encrypted JSON string
export async function exportEncrypted(passphrase: string): Promise<string> {
  const data = await exportData();
  const jsonString = JSON.stringify(data, null, 2);
  return await encryptData(jsonString, passphrase);
}

// Import data from JSON
export async function importData(backup: BackupData, replaceExisting: boolean = false): Promise<void> {
  if (replaceExisting) {
    // Clear existing data
    await db.accounts.clear();
    await db.transactions.clear();
    await db.categories.clear();
    await db.changelog.clear();
  }

  // Import data
  await Promise.all([
    db.accounts.bulkPut(backup.accounts),
    db.transactions.bulkPut(backup.transactions),
    db.categories.bulkPut(backup.categories),
    db.changelog.bulkPut(backup.changelog),
  ]);
}

// Import from encrypted string
export async function importEncrypted(
  encryptedData: string,
  passphrase: string,
  replaceExisting: boolean = false
): Promise<void> {
  const decrypted = await decryptData(encryptedData, passphrase);
  const backup: BackupData = JSON.parse(decrypted);
  await importData(backup, replaceExisting);
}

// Download backup file
export function downloadBackup(data: string, filename: string = 'money-tracker-backup.json'): void {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export as CSV (transactions only)
export async function exportTransactionsCSV(): Promise<string> {
  const transactions = await db.transactions.toArray();
  const accounts = await db.accounts.toArray();
  const categories = await db.categories.toArray();

  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const headers = ['Date', 'Type', 'Account', 'Category', 'Amount', 'Currency', 'Notes', 'Cleared'];
  const rows = transactions
    .filter((tx) => !tx.deleted)
    .map((tx) => [
      tx.date,
      tx.type,
      accountMap.get(tx.accountId) || tx.accountId,
      tx.categoryId ? categoryMap.get(tx.categoryId) || tx.categoryId : '',
      tx.amount.toString(),
      tx.currency,
      tx.notes || '',
      tx.cleared ? 'Yes' : 'No',
    ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

  return csv;
}

// Download CSV
export function downloadCSV(csv: string, filename: string = 'transactions.csv'): void {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
