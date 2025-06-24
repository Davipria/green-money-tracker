
import { Bet, MonthlyStats } from "@/types/bet";

export const calculateProfit = (bet: Bet): number => {
  if (bet.status === 'won' && bet.payout) {
    return bet.payout - bet.stake;
  } else if (bet.status === 'lost') {
    return -bet.stake;
  }
  return 0;
};

export const groupBetsByMonth = (bets: Bet[]): MonthlyStats[] => {
  const grouped = bets.reduce((acc, bet) => {
    const date = new Date(bet.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    
    if (!acc[key]) {
      acc[key] = {
        month: date.toLocaleDateString('it-IT', { month: 'long' }),
        year: date.getFullYear(),
        totalStake: 0,
        totalPayout: 0,
        profit: 0,
        betsCount: 0,
        winRate: 0,
      };
    }
    
    acc[key].totalStake += bet.stake;
    acc[key].betsCount += 1;
    
    if (bet.status === 'won' && bet.payout) {
      acc[key].totalPayout += bet.payout;
    }
    
    acc[key].profit += calculateProfit(bet);
    
    return acc;
  }, {} as Record<string, MonthlyStats>);
  
  // Calculate win rates
  Object.keys(grouped).forEach(key => {
    const monthBets = bets.filter(bet => {
      const date = new Date(bet.date);
      const betKey = `${date.getFullYear()}-${date.getMonth()}`;
      return betKey === key;
    });
    
    const wonBets = monthBets.filter(bet => bet.status === 'won').length;
    grouped[key].winRate = monthBets.length > 0 ? (wonBets / monthBets.length) * 100 : 0;
  });
  
  return Object.values(grouped).sort((a, b) => b.year - a.year || b.month.localeCompare(a.month));
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};
