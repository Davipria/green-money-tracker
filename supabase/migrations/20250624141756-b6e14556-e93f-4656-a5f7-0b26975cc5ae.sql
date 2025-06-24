
-- Add email notification preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN monthly_reports_enabled boolean DEFAULT true;

-- Create a table to track monthly report sends to avoid duplicates
CREATE TABLE public.monthly_reports_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  report_month date NOT NULL,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  report_type text NOT NULL CHECK (report_type IN ('analysis', 'archive')),
  UNIQUE(user_id, report_month, report_type)
);

-- Add RLS policies for monthly_reports_log
ALTER TABLE public.monthly_reports_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own monthly reports log" 
  ON public.monthly_reports_log 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert monthly reports log" 
  ON public.monthly_reports_log 
  FOR INSERT 
  WITH CHECK (true);
