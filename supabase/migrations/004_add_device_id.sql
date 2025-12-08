-- Migration: Add device_id for multi-device sync echo prevention
-- Date: 2025-12-08
-- Purpose: Track which device created/updated each record to prevent duplicate syncs

-- Add device_id to transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Add device_id to accounts
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Add device_id to categories
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Add device_id to budgets
ALTER TABLE budgets
ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_device_id ON transactions(device_id);
CREATE INDEX IF NOT EXISTS idx_accounts_device_id ON accounts(device_id);
CREATE INDEX IF NOT EXISTS idx_categories_device_id ON categories(device_id);
CREATE INDEX IF NOT EXISTS idx_budgets_device_id ON budgets(device_id);

-- Add comments explaining the purpose
COMMENT ON COLUMN transactions.device_id IS 'Device ID that created/updated this record, used for echo prevention in realtime sync';
COMMENT ON COLUMN accounts.device_id IS 'Device ID that created/updated this record, used for echo prevention in realtime sync';
COMMENT ON COLUMN categories.device_id IS 'Device ID that created/updated this record, used for echo prevention in realtime sync';
COMMENT ON COLUMN budgets.device_id IS 'Device ID that created/updated this record, used for echo prevention in realtime sync';
