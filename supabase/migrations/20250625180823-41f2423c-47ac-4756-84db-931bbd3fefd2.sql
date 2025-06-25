
-- Add Instagram and Telegram link fields to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN instagram_url text,
ADD COLUMN telegram_url text;
