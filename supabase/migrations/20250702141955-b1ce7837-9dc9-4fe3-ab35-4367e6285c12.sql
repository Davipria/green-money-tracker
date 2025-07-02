
-- Add status column to bet_selections table to track individual selection outcomes
ALTER TABLE public.bet_selections 
ADD COLUMN IF NOT EXISTS individual_status TEXT DEFAULT 'pending' 
CHECK (individual_status IN ('pending', 'won', 'lost', 'void', 'cashout'));

-- Update existing records to have a default status
UPDATE public.bet_selections 
SET individual_status = 'pending' 
WHERE individual_status IS NULL;
