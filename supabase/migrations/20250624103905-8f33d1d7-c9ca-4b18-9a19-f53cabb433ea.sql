
-- Creare la tabella per le scommesse
CREATE TABLE public.bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  sport TEXT,
  event TEXT NOT NULL,
  bet_type TEXT NOT NULL,
  odds DECIMAL(10,2) NOT NULL,
  stake DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'won', 'lost', 'cashout')),
  payout DECIMAL(10,2),
  profit DECIMAL(10,2),
  cashout_amount DECIMAL(10,2),
  notes TEXT,
  bookmaker TEXT,
  tipster TEXT,
  timing TEXT CHECK (timing IN ('prematch', 'live')),
  selection TEXT,
  multiple_title TEXT,
  system_type TEXT,
  liability DECIMAL(10,2),
  commission DECIMAL(5,2),
  exchange_type TEXT CHECK (exchange_type IN ('back', 'lay')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Abilitare Row Level Security
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- Policy per vedere le proprie scommesse
CREATE POLICY "Users can view their own bets" 
  ON public.bets 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy per creare le proprie scommesse
CREATE POLICY "Users can create their own bets" 
  ON public.bets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy per aggiornare le proprie scommesse
CREATE POLICY "Users can update their own bets" 
  ON public.bets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy per eliminare le proprie scommesse
CREATE POLICY "Users can delete their own bets" 
  ON public.bets 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Tabella per le scommesse multiple/sistema
CREATE TABLE public.bet_selections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bet_id UUID REFERENCES public.bets(id) ON DELETE CASCADE NOT NULL,
  sport TEXT,
  event TEXT NOT NULL,
  odds DECIMAL(10,2) NOT NULL,
  selection TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS per bet_selections
ALTER TABLE public.bet_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bet selections" 
  ON public.bet_selections 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.bets 
    WHERE bets.id = bet_selections.bet_id 
    AND bets.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own bet selections" 
  ON public.bet_selections 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.bets 
    WHERE bets.id = bet_selections.bet_id 
    AND bets.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own bet selections" 
  ON public.bet_selections 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.bets 
    WHERE bets.id = bet_selections.bet_id 
    AND bets.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own bet selections" 
  ON public.bet_selections 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.bets 
    WHERE bets.id = bet_selections.bet_id 
    AND bets.user_id = auth.uid()
  ));
