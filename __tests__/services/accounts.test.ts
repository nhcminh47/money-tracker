import { db } from '@/lib/db';
import {
  createAccount,
  getAllAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
  getAccountsWithBalances,
} from '@/lib/services/accounts';

// Mock user ID for testing
const TEST_USER_ID = 'test-user-123';

describe('Account Service', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.accounts.clear();
    await db.transactions.clear();
  });

  afterAll(async () => {
    // Clean up after all tests
    await db.delete();
  });

  describe('createAccount', () => {
    it('should create a new account with all required fields', async () => {
      const accountData = {
        name: 'Test Checking',
        type: 'Bank' as const,
        currency: 'USD',
      };

      const account = await createAccount(accountData);

      expect(account).toBeDefined();
      expect(account.id).toBeDefined();
      expect(account.name).toBe('Test Checking');
      expect(account.type).toBe('Bank');
      expect(account.currency).toBe('USD');
    });

    it('should create an account with optional icon', async () => {
      const accountData = {
        name: 'Savings',
        type: 'Cash' as const,
        currency: 'USD',
        icon: '💰',
      };

      const account = await createAccount(accountData);

      expect(account.icon).toBe('💰');
    });
  });

  describe('getAllAccounts', () => {
    it('should return all non-deleted accounts', async () => {
      await createAccount({
        name: 'Account 1',
        type: 'Bank',
        currency: 'USD',
      });

      await createAccount({
        name: 'Account 2',
        type: 'Cash',
        currency: 'USD',
      });

      const accounts = await getAllAccounts();

      expect(accounts).toHaveLength(2);
      expect(accounts[0].name).toBe('Account 2'); // Reverse order by createdAt
      expect(accounts[1].name).toBe('Account 1');
    });

    it('should not return deleted accounts', async () => {
      const account1 = await createAccount({
        name: 'Account 1',
        type: 'Bank',
        currency: 'USD',
      });

      await createAccount({
        name: 'Account 2',
        type: 'Cash',
        currency: 'USD',
      });

      await deleteAccount(account1.id);

      const accounts = await getAllAccounts();

      expect(accounts).toHaveLength(1);
      expect(accounts[0].name).toBe('Account 2');
    });
  });

  describe('getAccount', () => {
    it('should return account by ID', async () => {
      const account = await createAccount({
        name: 'Test Account',
        type: 'Bank',
        currency: 'USD',
      });

      const found = await getAccount(account.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(account.id);
      expect(found?.name).toBe('Test Account');
    });

    it('should return undefined for non-existent account', async () => {
      const found = await getAccount('non-existent-id');

      expect(found).toBeUndefined();
    });
  });

  describe('updateAccount', () => {
    it('should update account fields', async () => {
      const account = await createAccount({
        name: 'Original Name',
        type: 'Bank',
        currency: 'USD',
      });

      await updateAccount(account.id, {
        name: 'Updated Name',
        type: 'Card',
        icon: '🏦',
      });

      const updated = await getAccount(account.id);

      expect(updated).toBeDefined();
      expect(updated!.name).toBe('Updated Name');
      expect(updated!.type).toBe('Card');
      expect(updated!.icon).toBe('🏦');
      expect(updated!.currency).toBe('USD'); // Unchanged field
    });
  });

  describe('deleteAccount', () => {
    it('should hard delete an account', async () => {
      const account = await createAccount({
        name: 'Test Account',
        type: 'Bank',
        currency: 'USD',
      });

      await deleteAccount(account.id);

      // getAllAccounts should not return deleted accounts
      const allAccounts = await getAllAccounts();
      expect(allAccounts).toHaveLength(0);

      // Verify it's completely removed from DB (hard delete)
      const dbAccount = await db.accounts.get(account.id);
      expect(dbAccount).toBeUndefined();
    });
  });

  describe('getAccountsWithBalances', () => {
    it('should return accounts with calculated balance', async () => {
      const account = await createAccount({
        name: 'Test Account',
        type: 'Bank',
        currency: 'USD',
      });

      const accounts = await getAccountsWithBalances();

      expect(accounts).toHaveLength(1);
      expect(accounts[0].id).toBe(account.id);
      // Balance starts at 0 (no initial balance)
      expect(accounts[0].balance).toBe(0);
    });
  });
});
