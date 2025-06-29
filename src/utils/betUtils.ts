
import { Bet, MonthlyStats } from "@/types/bet";

export const calculateProfit = (bet: Bet): number => {
  if (bet.status === 'won' && bet.payout) {
    return bet.payout - bet.stake;
  } else if (bet.status === 'lost') {
    return -bet.stake;
  } else if (bet.status === 'cashout' && bet.cashout_amount) {
    return bet.cashout_amount - bet.stake;
  } else if (bet.status === 'void') {
    return 0; // Scommesse annullate hanno profitto 0
  }
  return 0;
};

export const calculateROI = (totalProfit: number, totalStake: number): number => {
  if (totalStake === 0) return 0;
  return (totalProfit / totalStake) * 100;
};

export const calculateAverageOdds = (bets: Bet[]): number => {
  if (bets.length === 0) return 0;
  const totalOdds = bets.reduce((sum, bet) => sum + bet.odds, 0);
  return totalOdds / bets.length;
};

export const calculateAverageStake = (bets: Bet[]): number => {
  if (bets.length === 0) return 0;
  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
  return totalStake / bets.length;
};

export const calculateProfitVolatility = (bets: Bet[]): number => {
  if (bets.length < 2) return 0;
  
  const profits = bets.map(bet => calculateProfit(bet));
  const differences = [];
  
  for (let i = 1; i < profits.length; i++) {
    differences.push(Math.abs(profits[i] - profits[i - 1]));
  }
  
  if (differences.length === 0) return 0;
  
  const totalDifferences = differences.reduce((sum, diff) => sum + diff, 0);
  return totalDifferences / differences.length;
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

export const groupBetsByMonthWithROI = (bets: Bet[]) => {
  const grouped = bets.reduce((acc, bet) => {
    const date = new Date(bet.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const displayName = date.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' });
    
    if (!acc[key]) {
      acc[key] = {
        month: displayName,
        profit: 0,
        totalStake: 0,
        roi: 0,
      };
    }
    
    acc[key].profit += calculateProfit(bet);
    acc[key].totalStake += bet.stake;
    
    return acc;
  }, {} as Record<string, { month: string; profit: number; totalStake: number; roi: number }>);
  
  // Calculate ROI for each month
  Object.keys(grouped).forEach(key => {
    grouped[key].roi = calculateROI(grouped[key].profit, grouped[key].totalStake);
  });
  
  return Object.values(grouped).sort();
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};
