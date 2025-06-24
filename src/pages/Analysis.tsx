import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/betUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bet } from "@/types/bet";

const Analysis = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('bets')
          .select('*')
          .order('date', { ascending: true });

        if (error) {
          console.error('Errore caricamento scommesse:', error);
          toast({
            title: "Errore",
            description: "Impossibile caricare le scommesse",
            variant: "destructive"
          });
        } else {
          setBets((data || []) as Bet[]);
        }
      } catch (error) {
        console.error('Errore imprevisto:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, [toast]);

  const calculateProfit = (bet: Bet): number => {
    if (bet.status === 'won' && bet.payout) {
      return bet.payout - bet.stake;
    } else if (bet.status === 'lost') {
      return -bet.stake;
    } else if (bet.status === 'cashout' && bet.cashout_amount) {
      return bet.cashout_amount - bet.stake;
    }
    return 0;
  };

  const groupBetsByMonth = (bets: Bet[]) => {
    const grouped = bets.reduce((acc, bet) => {
      const date = new Date(bet.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!acc[key]) {
        acc[key] = {
          month: date.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' }),
          profit: 0,
        };
      }
      
      acc[key].profit += calculateProfit(bet);
      
      return acc;
    }, {} as Record<string, { month: string; profit: number }>);
    
    return Object.values(grouped).sort();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analisi</h1>
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  const monthlyData = groupBetsByMonth(bets);
  
  // Analisi per sport
  const sportStats = bets.reduce((acc, bet) => {
    const sport = bet.sport || bet.bet_type || 'Altro';
    if (!acc[sport]) {
      acc[sport] = { total: 0, won: 0, profit: 0 };
    }
    acc[sport].total += 1;
    if (bet.status === 'won') acc[sport].won += 1;
    if (bet.profit) acc[sport].profit += bet.profit;
    return acc;
  }, {} as Record<string, { total: number; won: number; profit: number }>);

  const sportData = Object.entries(sportStats).map(([sport, stats]) => ({
    sport,
    winRate: ((stats.won / stats.total) * 100).toFixed(1),
    profit: stats.profit,
    total: stats.total
  }));

  const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

  if (bets.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analisi</h1>
          <p className="text-muted-foreground">
            Statistiche dettagliate delle tue scommesse
          </p>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Non hai ancora dati sufficienti per l'analisi.</p>
            <p className="text-sm mt-2 text-muted-foreground">Aggiungi alcune scommesse per vedere le statistiche.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analisi</h1>
        <p className="text-muted-foreground">
          Statistiche dettagliate delle tue scommesse
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {monthlyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Profitti Mensili</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), "Profitto"]}
                  />
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
        )}

        {sportData.length > 0 && (
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
        )}
      </div>

      {monthlyData.length > 1 && (
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
      )}

      {sportData.length > 0 && (
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
      )}
    </div>
  );
};

export default Analysis;
