-- Drop the insecure policy that allows anyone to insert monthly reports
DROP POLICY IF EXISTS "System can insert monthly reports log" ON public.monthly_reports_log;

-- Note: The monthly_reports_log table will now only accept inserts from:
-- 1. Edge functions using the service role key (which bypass RLS)
-- 2. Database triggers or functions with SECURITY DEFINER
-- Regular authenticated users cannot insert records, preventing forgery attacks