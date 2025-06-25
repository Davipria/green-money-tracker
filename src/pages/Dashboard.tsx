
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/betUtils";
import { TrendingUp, TrendingDown, Target, Trophy, Calendar, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bet } from "@/types/bet";
import { Link } from "react-router-dom";
import AnimatedStatsCard from "@/components/AnimatedStatsCard";

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
            variant: "destructive",
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="text-center">
              <div className="h-16 w-16 bg-gray-200 rounded-2xl mx-auto mb-4 animate-shimmer"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-2 animate-shimmer"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-shimmer"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl animate-shimmer"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-float" 
             style={{ left: '10%', top: '20%', animationDelay: '0s' }} />
        <div className="absolute w-64 h-64 bg-gradient-to-r from-pink-400/10 to-red-400/10 rounded-full blur-3xl animate-float" 
             style={{ right: '10%', bottom: '20%', animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-xl animate-bounce-gentle">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Panoramica delle tue scommesse sportive
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedStatsCard
            title="Profitto Totale"
            value={formatCurrency(totalProfit)}
            subtitle={`${totalProfit >= 0 ? '+' : ''}${roi.toFixed(1)}% ROI`}
            icon={totalProfit >= 0 ? TrendingUp : TrendingDown}
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
            delay={0}
          />
          
          <AnimatedStatsCard
            title="Puntata Totale"
            value={formatCurrency(totalStake)}
            subtitle={`${bets.length} scommesse`}
            icon={Target}
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            delay={100}
          />
          
          <AnimatedStatsCard
            title="Percentuale Vincite"
            value={`${winRate.toFixed(1)}%`}
            subtitle={`${wonBets} su ${bets.length} scommesse`}
            icon={Trophy}
            gradient="bg-gradient-to-br from-purple-500 to-pink-600"
            delay={200}
          />
          
          <AnimatedStatsCard
            title="Questo Mese"
            value={thisMonthBets.length.toString()}
            subtitle={new Date().toLocaleDateString('it-IT', { month: 'long' })}
            icon={Calendar}
            gradient="bg-gradient-to-br from-orange-500 to-red-600"
            delay={300}
          />
        </div>

        {/* Recent Bets */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in-up card-interactive">
          <CardHeader className="pb-6">
            <Link to="/app/archive" className="block hover:opacity-80 transition-opacity group">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-xl gradient-text-hover">Ultime Scommesse</CardTitle>
              </div>
            </Link>
          </CardHeader>
          <CardContent>
            {bets.length === 0 ? (
              <div className="text-center py-12 animate-scale-in">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center animate-bounce-gentle">
                  <Target className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-500 text-lg font-medium mb-2">Non hai ancora aggiunto scommesse</p>
                <p className="text-gray-400">Vai alla sezione "Nuova Scommessa" per iniziare.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bets.slice(0, 5).map((bet, index) => (
                  <div key={bet.id} className="group animate-slide-in-right" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl hover:shadow-lg transition-all duration-300 group-hover:border-blue-200 group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-purple-50 card-interactive">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-blue-700 transition-colors duration-300">{bet.event}</div>
                        <div className="text-sm text-gray-600 flex items-center space-x-4">
                          <span className="flex items-center group-hover:text-blue-600 transition-colors duration-300">
                            <Target className="w-4 h-4 mr-1" />
                            {bet.sport || bet.bet_type}
                          </span>
                          <span className="flex items-center group-hover:text-blue-600 transition-colors duration-300">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(bet.date).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <div className="font-semibold text-gray-900 text-lg mb-1 group-hover:scale-110 transition-transform duration-300">{formatCurrency(bet.stake)}</div>
                        <div className={`text-sm font-medium px-3 py-1 rounded-full text-center transition-all duration-300 group-hover:scale-105 ${
                          bet.status === 'won' 
                            ? 'bg-green-100 text-green-800 group-hover:bg-green-200' 
                            : bet.status === 'lost' 
                            ? 'bg-red-100 text-red-800 group-hover:bg-red-200'
                            : bet.status === 'cashout'
                            ? 'bg-yellow-100 text-yellow-800 group-hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-800 group-hover:bg-gray-200'
                        }`}>
                          {bet.status === 'won' ? 'Vinta' : bet.status === 'lost' ? 'Persa' : bet.status === 'cashout' ? 'Cashout' : 'In attesa'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
