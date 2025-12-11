import Dexie, { type EntityTable } from 'dexie'

// Type definitions
export interface Account {
  id: string
  name: string
  type: 'Cash' | 'Bank' | 'Card' | 'Wallet' | 'Other'
  currency: string
  icon: string
  balance?: number // Computed
  createdAt: string
  updatedAt: string
  deleted?: boolean
}

export interface Transaction {
  id: string
  accountId: string
  amount: number
  currency: string
  categoryId: string | null
  type: 'Expense' | 'Income' | 'Transfer'
  toAccountId: string | null // For Transfer type
  notes: string
  date: string
  cleared: boolean
  recurring: boolean // Flag for recurring monthly costs
  createdAt: string
  updatedAt: string
  deleted: boolean
  meta?: {
    deviceId?: string
    syncVersion?: number
  }
}

export interface Category {
  id: string
  name: string
  parentId: string | null
  color: string
  type: 'expense' | 'income'
  icon: string
  createdAt: string
  updatedAt: string
}

export interface ChangeLogEntry {
  id: string
  entity: string
  entityId: string
  op: 'create' | 'update' | 'delete'
  payload: any
  timestamp: string
  deviceId: string
}

export interface Budget {
  id: string
  categoryId: string
  amount: number
  period: 'monthly' | 'yearly'
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

export interface Meta {
  key: string
  value: any
}

// Database
const db = new Dexie('MoneyTrackerDB') as Dexie & {
  accounts: EntityTable<Account, 'id'>
  transactions: EntityTable<Transaction, 'id'>
  categories: EntityTable<Category, 'id'>
  budgets: EntityTable<Budget, 'id'>
  changelog: EntityTable<ChangeLogEntry, 'id'>
  meta: EntityTable<Meta, 'key'>
}

// Schema
db.version(1).stores({
  accounts: 'id, name, type, currency, createdAt',
  transactions: 'id, accountId, date, categoryId, type, toAccountId, [accountId+date], createdAt, deleted',
  categories: 'id, name, type, parentId',
  changelog: 'id, entity, entityId, timestamp, deviceId, [deviceId+timestamp]',
  meta: 'key',
})

// Add budgets table in version 2
db.version(2).stores({
  accounts: 'id, name, type, currency, createdAt',
  transactions: 'id, accountId, date, categoryId, type, toAccountId, recurring, [accountId+date], createdAt, deleted',
  categories: 'id, name, type, parentId',
  budgets: 'id, categoryId, period, startDate',
  changelog: 'id, entity, entityId, timestamp, deviceId, [deviceId+timestamp]',
  meta: 'key',
})

export { db }
