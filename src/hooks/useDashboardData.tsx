import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bet } from "@/types/bet";

interface UserProfile {
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  bankroll: number | null;
}

export const useDashboardData = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        setLoading(false);
        return;
      }

      // Fetch both profile and bets in parallel
      const [profileResponse, betsResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('username, first_name, last_name, bankroll')
          .eq('id', user.user.id)
          .single(),
        supabase
          .from('bets')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (profileResponse.data) {
        setProfile(profileResponse.data);
      }

      if (betsResponse.error) {
        console.error('Errore caricamento scommesse:', betsResponse.error);
        toast({
          title: "Errore",
          description: "Impossibile caricare le scommesse",
          variant: "destructive",
        });
      } else {
        setBets((betsResponse.data || []) as Bet[]);
      }
    } catch (error) {
      console.error('Errore imprevisto:', error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteBet = useCallback(async (betId: string) => {
    try {
      const { error } = await supabase
        .from('bets')
        .delete()
        .eq('id', betId);

      if (error) {
        toast({
          title: "Errore",
          description: "Impossibile eliminare la scommessa",
          variant: "destructive",
        });
        return false;
      } else {
        setBets(prev => prev.filter(bet => bet.id !== betId));
        toast({
          title: "Scommessa eliminata",
          description: "La scommessa è stata eliminata con successo",
        });
        return true;
      }
    } catch (error) {
      console.error('Errore eliminazione scommessa:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore imprevisto",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const refreshBets = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('bets')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setBets(data as Bet[]);
      }
    } catch (error) {
      console.error('Errore ricaricamento scommesse:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    bets,
    profile,
    loading,
    deleteBet,
    refreshBets
  };
};