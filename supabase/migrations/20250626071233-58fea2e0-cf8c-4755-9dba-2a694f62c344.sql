
-- Rinomina la colonna nickname in username nella tabella profiles
ALTER TABLE public.profiles 
RENAME COLUMN nickname TO username;
