import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/betUtils";
import { TrendingUp, TrendingDown, Target, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bet } from "@/types/bet";

const Dashboard = () => {
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
          .order('created_at', { ascending: false });

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

  const totalProfit = bets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const wonBets = bets.filter(bet => bet.status === 'won').length;
  const winRate = bets.length > 0 ? (wonBets / bets.length) * 100 : 0;
  const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthBets = bets.filter(bet => {
    const betDate = new Date(bet.date);
    return betDate.getMonth() === currentMonth && betDate.getFullYear() === currentYear;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

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
              {bets.length} scommesse
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
              {wonBets} su {bets.length} scommesse
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scommesse Questo Mese</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthBets.length}</div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ultime Scommesse</CardTitle>
        </CardHeader>
        <CardContent>
          {bets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Non hai ancora aggiunto scommesse.</p>
              <p className="text-sm mt-2">Vai alla sezione "Nuova Scommessa" per iniziare.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bets.slice(0, 5).map((bet) => (
                <div key={bet.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{bet.event}</div>
                    <div className="text-sm text-muted-foreground">
                      {bet.sport || bet.bet_type} • {new Date(bet.date).toLocaleDateString('it-IT')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(bet.stake)}</div>
                    <div className={`text-sm ${
                      bet.status === 'won' ? 'text-green-600' : 
                      bet.status === 'lost' ? 'text-red-600' : 
                      bet.status === 'cashout' ? 'text-blue-600' : 'text-yellow-600'
                    }`}>
                      {bet.status === 'won' ? 'Vinta' : 
                       bet.status === 'lost' ? 'Persa' : 
                       bet.status === 'cashout' ? 'Cashout' : 'In attesa'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
