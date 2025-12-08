import { db, type Category } from '@/lib/db'
import { triggerBackgroundSync } from './sync'

/**
 * Category service - handles all category-related operations
 * ONE-WAY FLOW: IndexedDB → Changelog → Background Sync
 */

// Re-export Category type
export type { Category } from '@/lib/db'

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

export async function createCategory(data: {
  name: string
  type: Category['type']
  color: string
  icon: string
  parentId?: string | null
}): Promise<Category> {
  const now = new Date().toISOString()
  const category: Category = {
    id: crypto.randomUUID(),
    name: data.name,
    type: data.type,
    color: data.color,
    icon: data.icon,
    parentId: data.parentId || null,
    createdAt: now,
    updatedAt: now,
  }

  // 1. Write to IndexedDB first (single source of truth)
  await db.categories.add(category)

  // 2. Add to changelog for background sync
  await saveToChangelog('category', category.id, 'create', category)

  // 3. Trigger background sync (debounced)
  triggerBackgroundSync()

  // 4. Return immediately
  return category
}

export async function getCategory(id: string): Promise<Category | undefined> {
  return await db.categories.get(id)
}

export async function getAllCategories(): Promise<Category[]> {
  // Always read from IndexedDB (single source of truth)
  return await db.categories.toArray()
}

export async function getCategoriesByType(type: 'income' | 'expense'): Promise<Category[]> {
  return await db.categories.where('type').equals(type).sortBy('name')
}

export async function updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  // 1. Get existing category from IndexedDB
  const existing = await db.categories.get(id)
  if (!existing) {
    throw new Error('Category not found')
  }

  // 2. Merge updates with existing data
  const updated: Category = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  // 3. Write to IndexedDB first
  await db.categories.put(updated)

  // 4. Add to changelog for background sync
  await saveToChangelog('category', id, 'update', updated)

  // 5. Trigger background sync (debounced)
  triggerBackgroundSync()
}

export async function deleteCategory(id: string): Promise<void> {
  // 1. Verify category exists
  const existing = await db.categories.get(id)
  if (!existing) {
    throw new Error('Category not found')
  }

  // 2. Check if category has child categories
  const childCount = await db.categories.where('parentId').equals(id).count()
  if (childCount > 0) {
    throw new Error('Cannot delete category with subcategories')
  }

  // 3. Delete from IndexedDB first
  await db.categories.delete(id)

  // 4. Add to changelog for background sync
  await saveToChangelog('category', id, 'delete', { id })

  // 5. Trigger background sync (debounced)
  triggerBackgroundSync()
}

export async function getSubcategories(parentId: string): Promise<Category[]> {
  return await db.categories.where('parentId').equals(parentId).sortBy('name')
}

export async function getCategoryStats(categoryId: string): Promise<{
  transactionCount: number
  totalAmount: number
}> {
  const transactions = await db.transactions
    .where('categoryId')
    .equals(categoryId)
    .filter((tx) => !tx.deleted)
    .toArray()

  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0)

  return {
    transactionCount: transactions.length,
    totalAmount,
  }
}
