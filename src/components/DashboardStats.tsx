import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/betUtils";
import { TrendingUp, TrendingDown, Target, Trophy, Banknote } from "lucide-react";

interface DashboardStatsProps {
  currentBalance: number;
  totalProfit: number;
  roi: number;
  totalStake: number;
  betsCount: number;
  winRate: number;
  wonBets: number;
}

const DashboardStats = memo(({
  currentBalance,
  totalProfit,
  roi,
  totalStake,
  betsCount,
  winRate,
  wonBets
}: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-orange-500 to-red-600 border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">Saldo Attuale</p>
              <p className="text-3xl font-bold">{formatCurrency(currentBalance)}</p>
              <p className="text-orange-100 text-xs mt-1">
                Bankroll + Profitto
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Banknote className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Profitto Totale</p>
              <p className="text-3xl font-bold">{formatCurrency(totalProfit)}</p>
              <p className="text-green-100 text-xs mt-1">
                {totalProfit >= 0 ? '+' : ''}{roi.toFixed(1)}% ROI
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              {totalProfit >= 0 ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Puntata Totale</p>
              <p className="text-3xl font-bold">{formatCurrency(totalStake)}</p>
              <p className="text-blue-100 text-xs mt-1">
                {betsCount} scommesse
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Percentuale Vincite</p>
              <p className="text-3xl font-bold">{winRate.toFixed(1)}%</p>
              <p className="text-purple-100 text-xs mt-1">
                {wonBets} su {betsCount} scommesse
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

DashboardStats.displayName = "DashboardStats";

export default DashboardStats;