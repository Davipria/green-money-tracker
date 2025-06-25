-- Add profile_type column to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN profile_type text DEFAULT 'personal' CHECK (profile_type IN ('personal', 'tipster')); 