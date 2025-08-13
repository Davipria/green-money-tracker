-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.can_view_full_profile(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  -- Users can view their own full profile
  -- For now, we'll restrict tipster profiles to only be viewable by the tipster themselves
  SELECT auth.uid() = profile_user_id;
$$;

-- Create a public view for tipster discovery that only exposes safe public information
CREATE OR REPLACE VIEW public.public_tipster_profiles AS
SELECT 
  id,
  username,
  bio,
  favorite_sport,
  avatar_url,
  created_at,
  -- Don't expose: first_name, last_name, instagram_url, telegram_url, bankroll, monthly_budget, etc.
  'tipster'::text as profile_type
FROM public.profiles 
WHERE profile_type = 'tipster'::text;

-- Enable RLS on the view
ALTER VIEW public.public_tipster_profiles SET (security_barrier = true);

-- Create policy for the public tipster view
CREATE POLICY "Anyone can view public tipster info"
ON public.public_tipster_profiles
FOR SELECT
TO authenticated
USING (true);