
-- Aggiungi una policy per permettere la visualizzazione pubblica dei profili tipster
CREATE POLICY "Anyone can view tipster profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (profile_type = 'tipster');
