
-- Aggiungi la colonna bonus alla tabella bets
ALTER TABLE public.bets 
ADD COLUMN bonus numeric DEFAULT NULL;

-- Aggiungi un commento per documentare la colonna
COMMENT ON COLUMN public.bets.bonus IS 'Importo bonus aggiuntivo che viene aggiunto al profitto per le scommesse vinte';
