-- Migrazione: aggiunta vincolo UNIQUE su username
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_username_unique UNIQUE (username); 