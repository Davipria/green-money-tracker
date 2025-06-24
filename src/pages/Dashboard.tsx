import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/betUtils";
import { TrendingUp, TrendingDown, Target, Trophy, Calendar, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bet } from "@/types/bet";
const Dashboard = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    const fetchBets = async () => {
      try {
        const {
          data: user
        } = await supabase.auth.getUser();
        if (!user.user) {
          setLoading(false);
          return;
        }
        const {
          data,
          error
        } = await supabase.from('bets').select('*').order('created_at', {
          ascending: false
        });
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
  const winRate = bets.length > 0 ? wonBets / bets.length * 100 : 0;
  const roi = totalStake > 0 ? totalProfit / totalStake * 100 : 0;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthBets = bets.filter(bet => {
    const betDate = new Date(bet.date);
    return betDate.getMonth() === currentMonth && betDate.getFullYear() === currentYear;
  });
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="text-center">
              <div className="h-16 w-16 bg-gray-200 rounded-2xl mx-auto mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Panoramica delle tue scommesse sportive
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  {totalProfit >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
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
                    {bets.length} scommesse
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
                    {wonBets} su {bets.length} scommesse
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">Questo Mese</p>
                  <p className="text-3xl font-bold">{thisMonthBets.length}</p>
                  <p className="text-orange-100 text-xs mt-1">
                    {new Date().toLocaleDateString('it-IT', {
                    month: 'long'
                  })}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bets */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <CardTitle className="text-xl">Ultime Scommesse</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {bets.length === 0 ? <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                  <Target className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-500 text-lg font-medium mb-2">Non hai ancora aggiunto scommesse</p>
                <p className="text-gray-400">Vai alla sezione "Nuova Scommessa" per iniziare.</p>
              </div> : <div className="space-y-4">
                {bets.slice(0, 5).map(bet => <div key={bet.id} className="group">
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl hover:shadow-lg transition-all duration-300 group-hover:border-blue-200">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-lg mb-1">{bet.event}</div>
                        <div className="text-sm text-gray-600 flex items-center space-x-4">
                          <span className="flex items-center">
                            <Target className="w-4 h-4 mr-1" />
                            {bet.sport || bet.bet_type}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(bet.date).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 text-lg mb-1">{formatCurrency(bet.stake)}</div>
                        <div className="">
                          {bet.status === 'won' ? 'Vinta' : bet.status === 'lost' ? 'Persa' : bet.status === 'cashout' ? 'Cashout' : 'In attesa'}
                        </div>
                      </div>
                    </div>
                  </div>)}
              </div>}
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Dashboard;