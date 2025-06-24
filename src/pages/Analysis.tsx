
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatCurrency, calculateROI, groupBetsByMonthWithROI } from "@/utils/betUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bet } from "@/types/bet";
import { TrendingUp, Calendar, Target, BarChart3, PieChart as PieChartIcon, TrendingDown, Percent } from "lucide-react";

type TimeFilter = 'all' | 'year' | 'month';

const Analysis = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
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

  const filterBetsByTime = (bets: Bet[]): Bet[] => {
    if (timeFilter === 'all') return bets;
    
    return bets.filter(bet => {
      const betDate = new Date(bet.date);
      
      if (timeFilter === 'year') {
        return betDate.getFullYear() === selectedYear;
      }
      
      if (timeFilter === 'month') {
        return betDate.getFullYear() === selectedYear && betDate.getMonth() === selectedMonth;
      }
      
      return true;
    });
  };

  const groupBetsByMonth = (bets: Bet[]) => {
    const filtered = filterBetsByTime(bets);
    
    const grouped = filtered.reduce((acc, bet) => {
      const date = new Date(bet.date);
      let key: string;
      let displayName: string;
      
      if (timeFilter === 'month') {
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        displayName = date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
      } else {
        key = `${date.getFullYear()}-${date.getMonth()}`;
        displayName = date.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' });
      }
      
      if (!acc[key]) {
        acc[key] = {
          month: displayName,
          profit: 0,
        };
      }
      
      acc[key].profit += calculateProfit(bet);
      
      return acc;
    }, {} as Record<string, { month: string; profit: number }>);
    
    return Object.values(grouped).sort();
  };

  const getAvailableYears = (): number[] => {
    const years = bets.map(bet => new Date(bet.date).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  };

  const getAvailableMonths = (): { value: number; label: string }[] => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(2024, i, 1);
      months.push({
        value: i,
        label: date.toLocaleDateString('it-IT', { month: 'long' })
      });
    }
    return months;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredBets = filterBetsByTime(bets);
  const monthlyData = groupBetsByMonth(bets);
  const roiData = groupBetsByMonthWithROI(filteredBets);
  
  const sportStats = filteredBets.reduce((acc, bet) => {
    const sport = bet.sport || bet.bet_type || 'Altro';
    if (!acc[sport]) {
      acc[sport] = { total: 0, won: 0, profit: 0 };
    }
    acc[sport].total += 1;
    if (bet.status === 'won') acc[sport].won += 1;
    acc[sport].profit += calculateProfit(bet);
    return acc;
  }, {} as Record<string, { total: number; won: number; profit: number }>);

  const sportData = Object.entries(sportStats).map(([sport, stats]) => ({
    sport,
    winRate: ((stats.won / stats.total) * 100).toFixed(1),
    profit: stats.profit,
    total: stats.total
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'month':
        const monthName = new Date(selectedYear, selectedMonth, 1).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
        return `Analisi per ${monthName}`;
      case 'year':
        return `Analisi per ${selectedYear}`;
      case 'all':
        return 'Analisi dall\'inizio';
      default:
        return 'Analisi';
    }
  };

  const totalProfit = filteredBets.reduce((sum, bet) => sum + calculateProfit(bet), 0);
  const totalStake = filteredBets.reduce((sum, bet) => sum + bet.stake, 0);
  const totalBets = filteredBets.length;
  const winRate = totalBets > 0 ? ((filteredBets.filter(bet => bet.status === 'won').length / totalBets) * 100).toFixed(1) : '0';
  const overallROI = calculateROI(totalProfit, totalStake);

  if (bets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Inizia la Tua Analisi
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Non hai ancora dati sufficienti per l'analisi. Aggiungi alcune scommesse per vedere le statistiche dettagliate.
            </p>
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <p className="text-gray-500">Le tue statistiche appariranno qui una volta aggiunte le prime scommesse.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {getTimeFilterLabel()}
          </h1>
          <p className="text-gray-600 text-lg">
            Statistiche dettagliate delle tue scommesse
          </p>
        </div>

        {/* Time Filter Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <CardTitle className="text-xl">Periodo di Analisi</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ToggleGroup 
              type="single" 
              value={timeFilter} 
              onValueChange={(value) => value && setTimeFilter(value as TimeFilter)}
              className="justify-start"
            >
              <ToggleGroupItem value="all" className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-blue-500 data-[state=on]:to-purple-600 data-[state=on]:text-white">
                Dall'inizio
              </ToggleGroupItem>
              <ToggleGroupItem value="year" className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-blue-500 data-[state=on]:to-purple-600 data-[state=on]:text-white">
                Anno
              </ToggleGroupItem>
              <ToggleGroupItem value="month" className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-blue-500 data-[state=on]:to-purple-600 data-[state=on]:text-white">
                Mese
              </ToggleGroupItem>
            </ToggleGroup>

            {(timeFilter === 'year' || timeFilter === 'month') && (
              <div className="flex gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Anno:</label>
                  <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-4 py-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {getAvailableYears().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {timeFilter === 'month' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Mese:</label>
                    <select 
                      value={selectedMonth} 
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="px-4 py-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {getAvailableMonths().map(month => (
                        <option key={month.value} value={month.value}>{month.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Profitto Totale</p>
                  <p className="text-3xl font-bold">{formatCurrency(totalProfit)}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {totalProfit >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Scommesse Totali</p>
                  <p className="text-3xl font-bold">{totalBets}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Tasso di Vincita</p>
                  <p className="text-3xl font-bold">{winRate}%</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 border-0 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">ROI</p>
                  <p className="text-3xl font-bold">{overallROI.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Percent className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {monthlyData.length > 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <CardTitle className="text-xl">
                    {timeFilter === 'month' ? 'Profitti Giornalieri' : 'Profitti Mensili'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), "Profitto"]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="url(#colorGradient)" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 3, r: 5 }}
                      activeDot={{ r: 7, fill: '#1d4ed8' }}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {roiData.length > 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Percent className="w-4 h-4 text-white" />
                  </div>
                  <CardTitle className="text-xl">ROI Mensile</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={roiData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}%`, "ROI"]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="roi" 
                      fill="url(#roiGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {sportData.length > 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <PieChartIcon className="w-4 h-4 text-white" />
                  </div>
                  <CardTitle className="text-xl">Distribuzione per Sport</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={sportData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ sport, total }) => `${sport} (${total})`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {sportData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Full Width Chart for All Time */}
        {monthlyData.length > 1 && timeFilter === 'all' && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-xl">Andamento Profitti nel Tempo</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={360}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), "Profitto"]} 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="url(#colorGradient)" 
                    strokeWidth={4}
                    dot={{ fill: '#3b82f6', strokeWidth: 3, r: 6 }}
                    activeDot={{ r: 8, fill: '#1d4ed8' }}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Sports Statistics */}
        {sportData.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-xl">Statistiche per Sport</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sportData.map((sport, index) => (
                  <div key={sport.sport} className="relative group">
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl hover:shadow-lg transition-all duration-300 group-hover:border-blue-200">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <div>
                          <div className="font-semibold text-gray-900 capitalize text-lg">{sport.sport}</div>
                          <div className="text-sm text-gray-600 flex items-center space-x-4">
                            <span className="flex items-center">
                              <Target className="w-4 h-4 mr-1" />
                              {sport.total} scommesse
                            </span>
                            <span className="flex items-center">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              {sport.winRate}% vincite
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-xl font-bold px-4 py-2 rounded-lg ${
                        sport.profit >= 0 
                          ? 'text-emerald-700 bg-emerald-50' 
                          : 'text-red-700 bg-red-50'
                      }`}>
                        {formatCurrency(sport.profit)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Analysis;
