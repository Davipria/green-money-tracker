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
    profitPercent: number;
  };
  bets?: Bet[];
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

      console.log("🔍 Fetching tipsters...");

      // Recupera tutti i profili che hanno profile_type = 'tipster'
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("profile_type", "tipster");

      if (profileError) {
        console.error("❌ Error fetching profiles:", profileError);
        throw profileError;
      }

      console.log("📊 Found tipster profiles:", profiles?.length || 0);
      console.log("👥 Tipster profiles:", profiles);

      // Per ogni tipster, calcola le statistiche
      const tipstersWithStats = await Promise.all(
        profiles.map(async (profile) => {
          console.log(`📈 Fetching bets for tipster: ${profile.username || profile.first_name}`);
          
          const { data: dbBets, error: betsError } = await supabase
            .from("bets")
            .select("*")
            .eq("user_id", profile.id);

          if (betsError) {
            console.error(`❌ Error fetching bets for ${profile.id}:`, betsError);
            throw betsError;
          }

          console.log(`🎯 Found ${dbBets?.length || 0} bets for tipster: ${profile.username || profile.first_name}`);

          const bets = dbBets.map(convertToBet);
          const stats = calculateTipsterStats(bets, profile.bankroll);

          return {
            ...profile,
            stats,
            bets,
          };
        })
      );

      console.log("✅ Tipsters with stats loaded:", tipstersWithStats.length);
      setTipsters(tipstersWithStats);
    } catch (err) {
      console.error("💥 Errore nel recupero dei tipster:", err);
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  };

  const getTipsterById = async (tipsterId: string): Promise<TipsterProfile | null> => {
    try {
      console.log(`🔍 Fetching tipster by ID: ${tipsterId}`);
      
      // Recupera il profilo del tipster
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", tipsterId)
        .eq("profile_type", "tipster")
        .single();

      if (profileError) {
        console.error("❌ Error fetching tipster profile:", profileError);
        throw profileError;
      }

      console.log("👤 Found tipster profile:", profile);

      // Recupera le scommesse del tipster
      const { data: dbBets, error: betsError } = await supabase
        .from("bets")
        .select("*")
        .eq("user_id", tipsterId)
        .order("date", { ascending: false });

      if (betsError) {
        console.error("❌ Error fetching tipster bets:", betsError);
        throw betsError;
      }

      console.log(`🎯 Found ${dbBets?.length || 0} bets for tipster`);

      const bets = dbBets.map(convertToBet);
      const stats = calculateTipsterStats(bets, profile.bankroll);

      return {
        ...profile,
        stats,
        bets,
      };
    } catch (error) {
      console.error("💥 Errore nel recupero del tipster:", error);
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

/**
 * Recupera tutti i tipster e le loro stats solo per il periodo selezionato (start, end inclusi)
 * Le scommesse sono filtrate per status valido e per data UTC
 * Ottimizzato: una sola query per tutte le scommesse del periodo
 */
export const getTipstersWithStatsByPeriod = async (start: Date, end: Date) => {
  const startISO = start.toISOString();
  const endISO = end.toISOString();

  // Recupera tutti i tipster
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("profile_type", "tipster");
  if (profileError) throw profileError;

  // Recupera tutte le scommesse del periodo e status valido
  const { data: allBets, error: betsError } = await supabase
    .from("bets")
    .select("*")
    .in("status", ["won", "lost", "cashout"])
    .gte("date", startISO)
    .lte("date", endISO);
  if (betsError) throw betsError;

  // Raggruppa le scommesse per tipster (user_id)
  const betsByTipster = {};
  for (const dbBet of allBets) {
    const bet = convertToBet(dbBet);
    if (!betsByTipster[bet.user_id]) betsByTipster[bet.user_id] = [];
    betsByTipster[bet.user_id].push(bet);
  }

  // Per ogni tipster, calcola le stats solo sulle sue scommesse del periodo
  const tipstersWithStats = profiles.map(profile => {
    const bets = betsByTipster[profile.id] || [];
    const stats = calculateTipsterStats(bets, profile.bankroll);
    return {
      ...profile,
      stats,
      bets,
      periodBets: bets.length,
    };
  });
  return tipstersWithStats;
};

// Funzione di utilità globale per calcolare le stats di un tipster su un array di bets
export const calculateTipsterStats = (bets: Bet[], bankroll?: number | null) => {
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
  const profitPercent = bankroll && bankroll > 0 ? (totalProfit / bankroll) * 100 : 0;
  return {
    totalBets,
    winRate,
    totalProfit,
    totalStake,
    roi,
    avgOdds,
    bestStreak,
    currentStreak,
    profitPercent,
  };
};
