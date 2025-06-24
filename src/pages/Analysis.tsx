
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockBets } from "@/data/mockBets";
import { formatCurrency, groupBetsByMonth } from "@/utils/betUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const Analysis = () => {
  const monthlyData = groupBetsByMonth(mockBets);
  
  // Analisi per sport
  const sportStats = mockBets.reduce((acc, bet) => {
    if (!acc[bet.sport]) {
      acc[bet.sport] = { total: 0, won: 0, profit: 0 };
    }
    acc[bet.sport].total += 1;
    if (bet.status === 'won') acc[bet.sport].won += 1;
    if (bet.profit) acc[bet.sport].profit += bet.profit;
    return acc;
  }, {} as Record<string, { total: number; won: number; profit: number }>);

  const sportData = Object.entries(sportStats).map(([sport, stats]) => ({
    sport,
    winRate: ((stats.won / stats.total) * 100).toFixed(1),
    profit: stats.profit,
    total: stats.total
  }));

  // Dati per il grafico delle quote
  const oddsData = mockBets.map(bet => ({
    odds: bet.odds,
    profit: bet.profit || 0,
    status: bet.status
  }));

  const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analisi</h1>
        <p className="text-muted-foreground">
          Statistiche dettagliate delle tue scommesse
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profitti Mensili</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), "Profitto"]}
                />
                <Bar 
                  dataKey="profit" 
                  fill={(entry) => entry >= 0 ? '#22c55e' : '#ef4444'}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuzione per Sport</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sportData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ sport, total }) => `${sport} (${total})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {sportData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Andamento Profitti nel Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => [formatCurrency(value), "Profitto"]} />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistiche per Sport</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sportData.map((sport) => (
              <div key={sport.sport} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium capitalize">{sport.sport}</div>
                  <div className="text-sm text-muted-foreground">
                    {sport.total} scommesse • {sport.winRate}% vincite
                  </div>
                </div>
                <div className={`text-lg font-bold ${
                  sport.profit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(sport.profit)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analysis;
