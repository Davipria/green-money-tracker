
-- Aggiorna il constraint per includere 'void' come stato possibile
ALTER TABLE public.bets DROP CONSTRAINT IF EXISTS bets_status_check;
ALTER TABLE public.bets ADD CONSTRAINT bets_status_check CHECK (status IN ('pending', 'won', 'lost', 'cashout', 'void'));
