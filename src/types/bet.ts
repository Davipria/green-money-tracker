export interface Bet {
  id: string;
  date: string;
  sport: string;
  event: string;
  manifestation?: string;
  bet_type: string;
  odds: number;
  stake: number;
  status: 'pending' | 'won' | 'lost' | 'cashout' | 'void';
  payout?: number;
  profit?: number;
  notes?: string;
  bookmaker?: string;
  tipster?: string;
  timing?: string;
  selection?: string;
  multiple_title?: string;
  system_type?: string;
  liability?: number;
  commission?: number;
  exchange_type?: string;
  cashout_amount?: number;
  bonus?: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  selections?: BetSelection[];
}

export interface BetSelection {
  id: string;
  bet_id: string;
  sport?: string;
  event: string;
  odds: number;
  selection?: string;
  individual_status?: 'pending' | 'won' | 'lost' | 'void' | 'cashout';
  payout?: number;
  created_at: string;
}

export interface MonthlyStats {
  month: string;
  year: number;
  totalStake: number;
  totalPayout: number;
  profit: number;
  betsCount: number;
  winRate: number;
  roi?: number;
}

export interface ROIData {
  month: string;
  profit: number;
  totalStake: number;
  roi: number;
}
