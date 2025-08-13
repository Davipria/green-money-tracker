
import { useState, useMemo, useCallback } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Bet } from "@/types/bet";
import BetDetailsDialog from "@/components/BetDetailsDialog";
import EditBetDialog from "@/components/EditBetDialog";
import DashboardStats from "@/components/DashboardStats";
import RecentBets from "@/components/RecentBets";

const Dashboard = () => {
  const { bets, profile, loading, deleteBet, refreshBets } = useDashboardData();
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [betDetailsOpen, setBetDetailsOpen] = useState(false);
  const [editBetOpen, setEditBetOpen] = useState(false);

  const getDisplayName = useCallback(() => {
    if (profile?.username) {
      return profile.username;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    return "Utente";
  }, [profile?.username, profile?.first_name]);

  const stats = useMemo(() => {
    const totalProfit = bets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
    const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
    const wonBets = bets.filter(bet => bet.status === 'won').length;
    const winRate = bets.length > 0 ? (wonBets / bets.length) * 100 : 0;
    const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
    const currentBalance = (profile?.bankroll || 0) + totalProfit;

    return {
      totalProfit,
      totalStake,
      wonBets,
      winRate,
      roi,
      currentBalance
    };
  }, [bets, profile?.bankroll]);

  const handleBetClick = useCallback((bet: Bet) => {
    setSelectedBet(bet);
    setBetDetailsOpen(true);
  }, []);

  const handleEditBet = useCallback(() => {
    setBetDetailsOpen(false);
    setEditBetOpen(true);
  }, []);

  const handleDeleteBet = useCallback(async () => {
    if (!selectedBet) return;

    const success = await deleteBet(selectedBet.id);
    if (success) {
      setBetDetailsOpen(false);
      setSelectedBet(null);
    }
  }, [selectedBet, deleteBet]);

  const handleBetUpdate = useCallback(async () => {
    await refreshBets();
    setEditBetOpen(false);
    setSelectedBet(null);
  }, [refreshBets]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="text-center">
              <div className="h-16 w-16 bg-gray-200 rounded-2xl mx-auto mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Bentornato {getDisplayName()}
          </h1>
        </div>

        <DashboardStats
          currentBalance={stats.currentBalance}
          totalProfit={stats.totalProfit}
          roi={stats.roi}
          totalStake={stats.totalStake}
          betsCount={bets.length}
          winRate={stats.winRate}
          wonBets={stats.wonBets}
        />

        <RecentBets bets={bets} onBetClick={handleBetClick} />
      </div>

      <BetDetailsDialog
        bet={selectedBet}
        open={betDetailsOpen}
        onOpenChange={setBetDetailsOpen}
        onEdit={handleEditBet}
        onDelete={handleDeleteBet}
      />

      <EditBetDialog
        bet={selectedBet}
        open={editBetOpen}
        onOpenChange={setEditBetOpen}
        onBetUpdated={handleBetUpdate}
      />
    </div>
  );
};

export default Dashboard;
