/**
 * Frontend API Client - Calls BFF endpoints
 * All Supabase logic is hidden in server-side API routes
 */

class APIClient {
  private async fetchAPI(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Accounts
  async getAccounts() {
    return this.fetchAPI('/api/accounts');
  }

  async getAccount(id: string) {
    return this.fetchAPI(`/api/accounts/${id}`);
  }

  async createAccount(data: {
    name: string;
    type: string;
    currency: string;
    icon?: string;
    color?: string;
  }) {
    return this.fetchAPI('/api/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAccount(id: string, data: any) {
    return this.fetchAPI(`/api/accounts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAccount(id: string) {
    return this.fetchAPI(`/api/accounts/${id}`, {
      method: 'DELETE',
    });
  }

  async getAccountBalance(id: string) {
    return this.fetchAPI(`/api/accounts/${id}/balance`);
  }

  // Categories
  async getCategories() {
    return this.fetchAPI('/api/categories');
  }

  async getCategory(id: string) {
    return this.fetchAPI(`/api/categories/${id}`);
  }

  async createCategory(data: {
    name: string;
    type: 'income' | 'expense';
    color?: string;
    icon?: string;
  }) {
    return this.fetchAPI('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: any) {
    return this.fetchAPI(`/api/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.fetchAPI(`/api/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Transactions
  async getTransactions(params?: {
    account_id?: string;
    category_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return this.fetchAPI(`/api/transactions${query ? `?${query}` : ''}`);
  }

  async getTransaction(id: string) {
    return this.fetchAPI(`/api/transactions/${id}`);
  }

  async createTransaction(data: {
    account_id: string;
    category_id?: string;
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    description?: string;
    date: string;
    recurring?: boolean;
    to_account_id?: string;
  }) {
    return this.fetchAPI('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTransaction(id: string, data: any) {
    return this.fetchAPI(`/api/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(id: string) {
    return this.fetchAPI(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  async getTransactionSummary(params?: {
    account_id?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return this.fetchAPI(`/api/transactions/summary${query ? `?${query}` : ''}`);
  }

  // Budgets
  async getBudgets() {
    return this.fetchAPI('/api/budgets');
  }

  async getBudget(id: string) {
    return this.fetchAPI(`/api/budgets/${id}`);
  }

  async createBudget(data: {
    category_id: string;
    amount: number;
    period: 'monthly' | 'yearly';
    start_date?: string;
    end_date?: string;
  }) {
    return this.fetchAPI('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBudget(id: string, data: any) {
    return this.fetchAPI(`/api/budgets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBudget(id: string) {
    return this.fetchAPI(`/api/budgets/${id}`, {
      method: 'DELETE',
    });
  }

  async getBudgetStatuses() {
    return this.fetchAPI('/api/budgets/status');
  }

  // Settings
  async getSettings() {
    return this.fetchAPI('/api/settings');
  }

  async updateSettings(data: {
    currency?: string;
    date_format?: string;
    theme?: 'light' | 'dark' | 'system';
    language?: string;
  }) {
    return this.fetchAPI('/api/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const api = new APIClient();
