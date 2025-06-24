
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockBets } from "@/data/mockBets";
import { calculateProfit, formatCurrency } from "@/utils/betUtils";
import { TrendingUp, TrendingDown, Target, Trophy } from "lucide-react";

const Dashboard = () => {
  const totalProfit = mockBets.reduce((sum, bet) => sum + calculateProfit(bet), 0);
  const totalStake = mockBets.reduce((sum, bet) => sum + bet.stake, 0);
  const wonBets = mockBets.filter(bet => bet.status === 'won').length;
  const winRate = mockBets.length > 0 ? (wonBets / mockBets.length) * 100 : 0;
  const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Panoramica delle tue scommesse sportive
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profitto Totale</CardTitle>
            {totalProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalProfit >= 0 ? '+' : ''}{roi.toFixed(1)}% ROI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntata Totale</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalStake)}</div>
            <p className="text-xs text-muted-foreground">
              {mockBets.length} scommesse
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Percentuale Vincite</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {wonBets} su {mockBets.length} scommesse
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scommesse Questo Mese</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockBets.filter(bet => {
                const betDate = new Date(bet.date);
                const now = new Date();
                return betDate.getMonth() === now.getMonth() && 
                       betDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Giugno 2024
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ultime Scommesse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockBets.slice(0, 5).map((bet) => (
              <div key={bet.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{bet.event}</div>
                  <div className="text-sm text-muted-foreground">
                    {bet.sport} • {new Date(bet.date).toLocaleDateString('it-IT')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(bet.stake)}</div>
                  <div className={`text-sm ${
                    bet.status === 'won' ? 'text-green-600' : 
                    bet.status === 'lost' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {bet.status === 'won' ? 'Vinta' : bet.status === 'lost' ? 'Persa' : 'In attesa'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
