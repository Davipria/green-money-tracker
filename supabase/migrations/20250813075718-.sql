-- Fix tipster profile exposure security issue
-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view tipster profiles" ON public.profiles;

-- Create a new policy that only exposes public fields for tipsters
-- This policy will be combined with the existing "Users can view their own profile" policy
-- Users can still see their full profile, but other users only see limited public info for tipsters
CREATE POLICY "Public can view limited tipster info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  profile_type = 'tipster'::text 
  AND auth.uid() != id  -- Only applies to viewing OTHER users' profiles
);

-- We need to modify the SELECT to only return public fields when viewing other tipsters
-- Since RLS works at row level, we need a different approach
-- Let's create a view for public tipster information instead

-- Drop the above policy as it won't work with column-level restrictions
DROP POLICY IF EXISTS "Public can view limited tipster info" ON public.profiles;

-- Instead, we'll modify the existing policy to be more restrictive
-- First, let's create a function that checks if the requesting user should see full profile
CREATE OR REPLACE FUNCTION public.can_view_full_profile(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Users can view their own full profile
  -- For now, we'll restrict tipster profiles to only be viewable by the tipster themselves
  SELECT auth.uid() = profile_user_id;
$$;

-- Create a more restrictive policy for tipster profiles
CREATE POLICY "Restricted tipster profile access"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can always view their own profile
  (auth.uid() = id) 
  OR 
  -- For tipster profiles, only allow viewing if the function permits it
  (profile_type = 'tipster'::text AND public.can_view_full_profile(id))
);

-- Note: This completely restricts access to other tipsters' profiles
-- If you need public tipster discovery, you should create a separate public_tipster_profiles view
-- or modify the application logic to handle this at the application level