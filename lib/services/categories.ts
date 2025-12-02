import { db, type Category } from '@/lib/db';
import { logChange } from '@/lib/db/utils';

/**
 * Category service - handles all category-related operations with changelog tracking
 */

// Re-export Category type
export type { Category } from '@/lib/db';

export async function createCategory(data: {
  name: string;
  type: Category['type'];
  color: string;
  icon: string;
  parentId?: string | null;
}): Promise<Category> {
  const now = new Date().toISOString();
  const category: Category = {
    id: crypto.randomUUID(),
    name: data.name,
    type: data.type,
    color: data.color,
    icon: data.icon,
    parentId: data.parentId || null,
    createdAt: now,
    updatedAt: now,
  };

  await db.categories.add(category);
  await logChange('category', category.id, 'create', category);

  return category;
}

export async function getCategory(id: string): Promise<Category | undefined> {
  return await db.categories.get(id);
}

export async function getAllCategories(): Promise<Category[]> {
  return await db.categories.orderBy('name').toArray();
}

export async function getCategoriesByType(type: 'income' | 'expense'): Promise<Category[]> {
  return await db.categories.where('type').equals(type).sortBy('name');
}

export async function updateCategory(
  id: string,
  updates: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const updatedData = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await db.categories.update(id, updatedData);
  await logChange('category', id, 'update', updatedData);
}

export async function deleteCategory(id: string): Promise<void> {
  // Check if category has transactions
  const transactionCount = await db.transactions
    .where('categoryId')
    .equals(id)
    .filter((tx) => !tx.deleted)
    .count();

  if (transactionCount > 0) {
    throw new Error('Cannot delete category with existing transactions');
  }

  // Check if category has child categories
  const childCount = await db.categories
    .where('parentId')
    .equals(id)
    .count();

  if (childCount > 0) {
    throw new Error('Cannot delete category with subcategories');
  }

  await db.categories.delete(id);
  await logChange('category', id, 'delete', { id });
}

export async function getSubcategories(parentId: string): Promise<Category[]> {
  return await db.categories.where('parentId').equals(parentId).sortBy('name');
}

export async function getCategoryStats(categoryId: string): Promise<{
  transactionCount: number;
  totalAmount: number;
}> {
  const transactions = await db.transactions
    .where('categoryId')
    .equals(categoryId)
    .filter((tx) => !tx.deleted)
    .toArray();

  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  return {
    transactionCount: transactions.length,
    totalAmount,
  };
}
