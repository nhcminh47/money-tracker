import { db, type Category } from '@/lib/db'

/**
 * Category service - handles all category-related operations
 */

// Re-export Category type
export type { Category } from '@/lib/db'

export async function createCategory(data: {
  name: string
  type: Category['type']
  color: string
  icon: string
  parentId?: string | null
}): Promise<Category> {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create category')
  }

  return await response.json()
}

export async function getCategory(id: string): Promise<Category | undefined> {
  return await db.categories.get(id)
}

export async function getAllCategories(): Promise<Category[]> {
  const response = await fetch('/api/categories')

  if (!response.ok) {
    throw new Error('Failed to fetch categories')
  }

  return await response.json()
}

export async function getCategoriesByType(type: 'income' | 'expense'): Promise<Category[]> {
  return await db.categories.where('type').equals(type).sortBy('name')
}

export async function updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update category')
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete category')
  }

  // Check if category has child categories
  const childCount = await db.categories.where('parentId').equals(id).count()

  if (childCount > 0) {
    throw new Error('Cannot delete category with subcategories')
  }
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
