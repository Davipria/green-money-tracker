
-- Add new profile fields to support the enhanced profile page
ALTER TABLE public.profiles 
ADD COLUMN bio text,
ADD COLUMN favorite_sport text,
ADD COLUMN monthly_budget numeric DEFAULT 200.00,
ADD COLUMN risk_level text DEFAULT 'medium',
ADD COLUMN notifications_email boolean DEFAULT true,
ADD COLUMN notifications_reminders boolean DEFAULT true,
ADD COLUMN dark_mode boolean DEFAULT false,
ADD COLUMN show_balance boolean DEFAULT true;
