-- Function to seed default categories for new users
CREATE OR REPLACE FUNCTION seed_default_categories_for_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default expense categories
  INSERT INTO categories (id, user_id, name, type, color, icon, parent_id, created_at, updated_at, deleted)
  VALUES
    (gen_random_uuid(), NEW.id, 'Food & Dining', 'expense', '#ef4444', '🍔', NULL, NOW(), NOW(), FALSE),
    (gen_random_uuid(), NEW.id, 'Shopping', 'expense', '#f59e0b', '🛍️', NULL, NOW(), NOW(), FALSE),
    (gen_random_uuid(), NEW.id, 'Transportation', 'expense', '#3b82f6', '🚗', NULL, NOW(), NOW(), FALSE),
    (gen_random_uuid(), NEW.id, 'Utilities', 'expense', '#f97316', '💡', NULL, NOW(), NOW(), FALSE),
    (gen_random_uuid(), NEW.id, 'Entertainment', 'expense', '#8b5cf6', '🎬', NULL, NOW(), NOW(), FALSE),
    (gen_random_uuid(), NEW.id, 'Healthcare', 'expense', '#ec4899', '⚕️', NULL, NOW(), NOW(), FALSE),
    (gen_random_uuid(), NEW.id, 'Other', 'expense', '#64748b', '📦', NULL, NOW(), NOW(), FALSE),
    (gen_random_uuid(), NEW.id, 'Groceries', 'expense', '#22c55e', '🛒', NULL, NOW(), NOW(), FALSE),
    (gen_random_uuid(), NEW.id, 'Rent', 'expense', '#6366f1', '🏠', NULL, NOW(), NOW(), FALSE),
    (gen_random_uuid(), NEW.id, 'Education', 'expense', '#14b8a6', '🎓', NULL, NOW(), NOW(), FALSE),
    
    -- Insert default income categories
    (gen_random_uuid(), NEW.id, 'Salary', 'income', '#10b981', '💰', NULL, NOW(), NOW(), FALSE),
    (gen_random_uuid(), NEW.id, 'Freelance', 'income', '#06b6d4', '💼', NULL, NOW(), NOW(), FALSE),
    (gen_random_uuid(), NEW.id, 'Investment', 'income', '#84cc16', '📈', NULL, NOW(), NOW(), FALSE),
    (gen_random_uuid(), NEW.id, 'Gift', 'income', '#a855f7', '🎁', NULL, NOW(), NOW(), FALSE),
    (gen_random_uuid(), NEW.id, 'Other Income', 'income', '#6b7280', '💵', NULL, NOW(), NOW(), FALSE);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically seed categories when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION seed_default_categories_for_user();
