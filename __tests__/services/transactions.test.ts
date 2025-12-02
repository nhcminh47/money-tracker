import { db } from '@/lib/db';
import {
  createTransaction,
  getAllTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
} from '@/lib/services/transactions';
import { createAccount } from '@/lib/services/accounts';

describe('Transaction Service', () => {
  let testAccountId: string;
  let testCategoryId: string;

  beforeEach(async () => {
    // Clear database
    await db.transactions.clear();
    await db.accounts.clear();
    await db.categories.clear();

    // Create test account
    const account = await createAccount({
      name: 'Test Account',
      type: 'Bank',
      currency: 'USD',
    });
    testAccountId = account.id;

    // Create test category
    const categoryId = crypto.randomUUID();
    await db.categories.add({
      id: categoryId,
      name: 'Test Category',
      type: 'expense',
      color: '#FF0000',
      icon: '🍔',
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    testCategoryId = categoryId;
  });

  afterAll(async () => {
    await db.delete();
  });

  describe('createTransaction', () => {
    it('should create an expense transaction', async () => {
      const txData = {
        
        type: 'Expense' as const,
        amount: 50,
        currency: 'USD',
        accountId: testAccountId,
        categoryId: testCategoryId,
        date: '2024-12-01',
        notes: 'Test expense',
        cleared: false,
      };

      const transaction = await createTransaction(txData);

      expect(transaction).toBeDefined();
      expect(transaction.id).toBeDefined();
      expect(transaction.type).toBe('Expense');
      expect(transaction.amount).toBe(50);
      expect(transaction.notes).toBe('Test expense');
      expect(transaction.cleared).toBe(false);
    });

    it('should create an income transaction', async () => {
      const txData = {
        
        type: 'Income' as const,
        amount: 1000,
        currency: 'USD',
        accountId: testAccountId,
        categoryId: testCategoryId,
        date: '2024-12-01',
        notes: 'Salary',
        cleared: true,
      };

      const transaction = await createTransaction(txData);

      expect(transaction.type).toBe('Income');
      expect(transaction.amount).toBe(1000);
      expect(transaction.cleared).toBe(true);
    });

    it('should create a transfer transaction', async () => {
      // Create second account
      const account2 = await createAccount({
        name: 'Savings Account',
        type: 'Bank',
        currency: 'USD',
      });

      const txData = {
        
        type: 'Transfer' as const,
        amount: 200,
        currency: 'USD',
        accountId: testAccountId,
        categoryId: null,
        toAccountId: account2.id,
        date: '2024-12-01',
        notes: 'Transfer to savings',
        cleared: true,
      };

      const transaction = await createTransaction(txData);

      expect(transaction.type).toBe('Transfer');
      expect(transaction.toAccountId).toBe(account2.id);
      expect(transaction.categoryId).toBeNull();
    });
  });

  describe('getAllTransactions', () => {
    it('should return all non-deleted transactions', async () => {
      await createTransaction({
        
        type: 'Expense',
        amount: 50,
        currency: 'USD',
        accountId: testAccountId,
        categoryId: testCategoryId,
        date: '2024-12-01',
        cleared: false,
      });

      await createTransaction({
        
        type: 'Income',
        amount: 100,
        currency: 'USD',
        accountId: testAccountId,
        categoryId: testCategoryId,
        date: '2024-12-02',
        cleared: false,
      });

      const transactions = await getAllTransactions();

      expect(transactions).toHaveLength(2);
    });

    it('should not return deleted transactions', async () => {
      const tx1 = await createTransaction({
        
        type: 'Expense',
        amount: 50,
        currency: 'USD',
        accountId: testAccountId,
        categoryId: testCategoryId,
        date: '2024-12-01',
        cleared: false,
      });

      await createTransaction({
        
        type: 'Income',
        amount: 100,
        currency: 'USD',
        accountId: testAccountId,
        categoryId: testCategoryId,
        date: '2024-12-02',
        cleared: false,
      });

      await deleteTransaction(tx1.id);

      const transactions = await getAllTransactions();

      expect(transactions).toHaveLength(1);
    });
  });

  describe('getTransactionSummary', () => {
    beforeEach(async () => {
      // Create test transactions
      await createTransaction({
        
        type: 'Income',
        amount: 1000,
        currency: 'USD',
        accountId: testAccountId,
        categoryId: testCategoryId,
        date: '2024-12-01',
        cleared: false,
      });

      await createTransaction({
        
        type: 'Expense',
        amount: 300,
        currency: 'USD',
        accountId: testAccountId,
        categoryId: testCategoryId,
        date: '2024-12-02',
        cleared: false,
      });

      await createTransaction({
        
        type: 'Expense',
        amount: 200,
        currency: 'USD',
        accountId: testAccountId,
        categoryId: testCategoryId,
        date: '2024-12-03',
        cleared: false,
      });
    });

    it('should calculate correct summary', async () => {
      const summary = await getTransactionSummary();

      expect(summary.totalIncome).toBe(1000);
      expect(summary.totalExpense).toBe(500);
      expect(summary.netAmount).toBe(500);
      expect(summary.transactionCount).toBe(3);
    });

    it('should filter by account', async () => {
      const account2 = await createAccount({
        name: 'Account 2',
        type: 'Cash',
        currency: 'USD',
      });

      await createTransaction({
        
        type: 'Expense',
        amount: 100,
        currency: 'USD',
        accountId: account2.id,
        categoryId: testCategoryId,
        date: '2024-12-04',
        cleared: false,
      });

      const summary = await getTransactionSummary(testAccountId);

      expect(summary.transactionCount).toBe(3); // Original 3, not the new one
    });
  });

  describe('updateTransaction', () => {
    it('should update transaction fields', async () => {
      const transaction = await createTransaction({
        
        type: 'Expense',
        amount: 50,
        currency: 'USD',
        accountId: testAccountId,
        categoryId: testCategoryId,
        date: '2024-12-01',
        notes: 'Original note',
        cleared: false,
      });

      await updateTransaction(transaction.id, {
        amount: 75,
        notes: 'Updated note',
        cleared: true,
      });

      const updated = await getTransaction(transaction.id);

      expect(updated).toBeDefined();
      expect(updated!.amount).toBe(75);
      expect(updated!.notes).toBe('Updated note');
      expect(updated!.cleared).toBe(true);
    });
  });

  describe('deleteTransaction', () => {
    it('should soft delete a transaction', async () => {
      const transaction = await createTransaction({
        
        type: 'Expense',
        amount: 50,
        currency: 'USD',
        accountId: testAccountId,
        categoryId: testCategoryId,
        date: '2024-12-01',
        cleared: false,
      });

      await deleteTransaction(transaction.id);

      // Should not be returned by getAllTransactions (default excludes deleted)
      const allTransactions = await getAllTransactions();
      expect(allTransactions).toHaveLength(0);

      // But it's still in DB marked as deleted
      const dbTransaction = await db.transactions.get(transaction.id);
      expect(dbTransaction?.deleted).toBe(true);
    });
  });
});
