-- Fix the function search path security issue (already done above)
-- Create a public view for tipster discovery that only exposes safe public information
-- Note: We can't add RLS policies to views, so we'll create a function instead

-- Create a function to get public tipster information
CREATE OR REPLACE FUNCTION public.get_public_tipster_profiles()
RETURNS TABLE (
  id uuid,
  username text,
  bio text,
  favorite_sport text,
  avatar_url text,
  created_at timestamp with time zone,
  profile_type text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT 
    profiles.id,
    profiles.username,
    profiles.bio,
    profiles.favorite_sport,
    profiles.avatar_url,
    profiles.created_at,
    'tipster'::text as profile_type
  FROM public.profiles 
  WHERE profiles.profile_type = 'tipster'::text;
$$;