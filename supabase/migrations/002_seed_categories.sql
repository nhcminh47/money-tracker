-- Seed initial categories for users
-- This will insert default categories for the currently authenticated user

INSERT INTO categories (id, user_id, name, type, color, icon, parent_id, created_at, updated_at, deleted)
VALUES
  -- Expense categories
  (gen_random_uuid(), auth.uid(), 'Food & Dining', 'expense', '#ef4444', '🍔', NULL, NOW(), NOW(), FALSE),
  (gen_random_uuid(), auth.uid(), 'Shopping', 'expense', '#f59e0b', '🛍️', NULL, NOW(), NOW(), FALSE),
  (gen_random_uuid(), auth.uid(), 'Transportation', 'expense', '#3b82f6', '🚗', NULL, NOW(), NOW(), FALSE),
  (gen_random_uuid(), auth.uid(), 'Utilities', 'expense', '#f97316', '💡', NULL, NOW(), NOW(), FALSE),
  (gen_random_uuid(), auth.uid(), 'Entertainment', 'expense', '#8b5cf6', '🎬', NULL, NOW(), NOW(), FALSE),
  (gen_random_uuid(), auth.uid(), 'Healthcare', 'expense', '#ec4899', '⚕️', NULL, NOW(), NOW(), FALSE),
  (gen_random_uuid(), auth.uid(), 'Other', 'expense', '#64748b', '📦', NULL, NOW(), NOW(), FALSE),
  (gen_random_uuid(), auth.uid(), 'Groceries', 'expense', '#22c55e', '🛒', NULL, NOW(), NOW(), FALSE),
  (gen_random_uuid(), auth.uid(), 'Rent', 'expense', '#6366f1', '🏠', NULL, NOW(), NOW(), FALSE),
  (gen_random_uuid(), auth.uid(), 'Education', 'expense', '#14b8a6', '🎓', NULL, NOW(), NOW(), FALSE),
  
  -- Income categories
  (gen_random_uuid(), auth.uid(), 'Salary', 'income', '#10b981', '💰', NULL, NOW(), NOW(), FALSE),
  (gen_random_uuid(), auth.uid(), 'Freelance', 'income', '#06b6d4', '💼', NULL, NOW(), NOW(), FALSE),
  (gen_random_uuid(), auth.uid(), 'Investment', 'income', '#84cc16', '📈', NULL, NOW(), NOW(), FALSE),
  (gen_random_uuid(), auth.uid(), 'Gift', 'income', '#a855f7', '🎁', NULL, NOW(), NOW(), FALSE),
  (gen_random_uuid(), auth.uid(), 'Other Income', 'income', '#6b7280', '💵', NULL, NOW(), NOW(), FALSE);
