
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Bet } from "@/types/bet";

export type TipsterProfile = Tables<"profiles"> & {
  stats?: {
    totalBets: number;
    winRate: number;
    totalProfit: number;
    totalStake: number;
    roi: number;
    avgOdds: number;
    bestStreak: number;
    currentStreak: number;
  };
};

// Funzione helper per convertire i dati dal database al tipo Bet
const convertToBet = (dbBet: any): Bet => ({
  id: dbBet.id,
  date: dbBet.date,
  sport: dbBet.sport || "",
  event: dbBet.event,
  manifestation: dbBet.manifestation,
  bet_type: dbBet.bet_type,
  odds: dbBet.odds,
  stake: dbBet.stake,
  status: dbBet.status as 'pending' | 'won' | 'lost' | 'cashout',
  payout: dbBet.payout,
  profit: dbBet.profit,
  notes: dbBet.notes,
  bookmaker: dbBet.bookmaker,
  tipster: dbBet.tipster,
  timing: dbBet.timing,
  selection: dbBet.selection,
  multiple_title: dbBet.multiple_title,
  system_type: dbBet.system_type,
  liability: dbBet.liability,
  commission: dbBet.commission,
  exchange_type: dbBet.exchange_type,
  cashout_amount: dbBet.cashout_amount,
  created_at: dbBet.created_at,
  updated_at: dbBet.updated_at,
  user_id: dbBet.user_id,
});

export const useTipsters = () => {
  const [tipsters, setTipsters] = useState<TipsterProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTipsters = async () => {
    try {
      setLoading(true);
      setError(null);

      // Recupera tutti i profili che hanno profile_type = 'tipster'
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("profile_type", "tipster");

      if (profileError) throw profileError;

      // Per ogni tipster, calcola le statistiche
      const tipstersWithStats = await Promise.all(
        profiles.map(async (profile) => {
          const { data: dbBets, error: betsError } = await supabase
            .from("bets")
            .select("*")
            .eq("user_id", profile.id);

          if (betsError) throw betsError;

          const bets = dbBets.map(convertToBet);
          const stats = calculateTipsterStats(bets);

          return {
            ...profile,
            stats,
          };
        })
      );

      setTipsters(tipstersWithStats);
    } catch (err) {
      console.error("Errore nel recupero dei tipster:", err);
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  };

  const calculateTipsterStats = (bets: Bet[]) => {
    const totalBets = bets.length;
    const wonBets = bets.filter(bet => bet.status === "won").length;
    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
    const totalProfit = bets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
    const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
    const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
    const avgOdds = bets.length > 0 ? bets.reduce((sum, bet) => sum + bet.odds, 0) / bets.length : 0;

    // Calcola le streak
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < bets.length; i++) {
      if (bets[i].status === "won") {
        tempStreak++;
        currentStreak = i === 0 ? tempStreak : currentStreak;
      } else {
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
        tempStreak = 0;
        if (i > 0) currentStreak = 0;
      }
    }

    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }

    return {
      totalBets,
      winRate,
      totalProfit,
      totalStake,
      roi,
      avgOdds,
      bestStreak,
      currentStreak,
    };
  };

  const getTipsterById = async (tipsterId: string): Promise<TipsterProfile | null> => {
    try {
      // Recupera il profilo del tipster
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", tipsterId)
        .eq("profile_type", "tipster")
        .single();

      if (profileError) throw profileError;

      // Recupera le scommesse del tipster
      const { data: dbBets, error: betsError } = await supabase
        .from("bets")
        .select("*")
        .eq("user_id", tipsterId)
        .order("date", { ascending: false });

      if (betsError) throw betsError;

      const bets = dbBets.map(convertToBet);
      const stats = calculateTipsterStats(bets);

      return {
        ...profile,
        stats,
      };
    } catch (error) {
      console.error("Errore nel recupero del tipster:", error);
      return null;
    }
  };

  const getTipsterBets = async (tipsterId: string): Promise<Bet[]> => {
    try {
      const { data: dbBets, error } = await supabase
        .from("bets")
        .select("*")
        .eq("user_id", tipsterId)
        .order("date", { ascending: false });

      if (error) throw error;
      return dbBets.map(convertToBet);
    } catch (error) {
      console.error("Errore nel recupero delle scommesse del tipster:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchTipsters();
  }, []);

  return {
    tipsters,
    loading,
    error,
    fetchTipsters,
    getTipsterById,
    getTipsterBets,
  };
};
