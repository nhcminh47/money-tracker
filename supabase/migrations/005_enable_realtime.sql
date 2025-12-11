-- Enable Realtime for tables
-- This is required for Supabase Realtime subscriptions to work

-- Drop existing publication if it exists
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Create publication for realtime changes
-- This tells Postgres to track changes on these tables
CREATE PUBLICATION supabase_realtime FOR TABLE 
  accounts,
  categories,
  transactions,
  budgets,
  change_log;

-- Alternative: Enable realtime for all tables (if you want)
-- ALTER PUBLICATION supabase_realtime ADD TABLE ALL;

-- IMPORTANT: You MUST also enable Realtime in Supabase Dashboard:
-- 1. Go to Database > Replication in Supabase Dashboard
-- 2. Click on "supabase_realtime" publication
-- 3. Enable Realtime for these tables (toggle the switch):
--    ✅ accounts
--    ✅ categories  
--    ✅ transactions
--    ✅ budgets
--    ✅ change_log
--
-- Without this step, WebSocket subscriptions will not receive events!
