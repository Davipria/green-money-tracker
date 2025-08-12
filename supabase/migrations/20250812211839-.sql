-- Drop the current policy that allows anyone to view tipster profiles
DROP POLICY IF EXISTS "Anyone can view tipster profiles" ON public.profiles;

-- Create a new policy that restricts tipster profile viewing to authenticated users only
CREATE POLICY "Authenticated users can view tipster profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (profile_type = 'tipster'::text);