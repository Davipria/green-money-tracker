
export interface Bet {
  id: string;
  date: string;
  sport: string;
  event: string;
  betType: string;
  odds: number;
  stake: number;
  status: 'pending' | 'won' | 'lost';
  payout?: number;
  profit?: number;
  notes?: string;
}

export interface MonthlyStats {
  month: string;
  year: number;
  totalStake: number;
  totalPayout: number;
  profit: number;
  betsCount: number;
  winRate: number;
}
