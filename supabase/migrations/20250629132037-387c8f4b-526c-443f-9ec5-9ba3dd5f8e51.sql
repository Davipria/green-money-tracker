
-- Aggiungi la colonna status alla tabella bet_selections per tracciare l'esito di ogni singola selezione
ALTER TABLE public.bet_selections 
ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'void'));

-- Aggiungi anche la colonna payout per le singole selezioni (utile per cashout parziali)
ALTER TABLE public.bet_selections 
ADD COLUMN payout numeric DEFAULT NULL;
