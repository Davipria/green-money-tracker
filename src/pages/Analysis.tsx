import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatCurrency, calculateROI, groupBetsByMonthWithROI, calculateAverageOdds, calculateAverageStake } from "@/utils/betUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bet } from "@/types/bet";
import { TrendingUp, DollarSign, Percent, Target, Activity, BarChart3, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Analysis = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: undefined,
    to: undefined
  });
  const [initialBankroll, setInitialBankroll] = useState(1000);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBetsAndBankroll = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          setLoading(false);
          return;
        }

        // Fetch user bankroll
        const { data: profileData } = await supabase
          .from('profiles')
          .select('bankroll')
          .eq('id', user.user.id)
          .single();

        if (profileData?.bankroll) {
          setInitialBankroll(profileData.bankroll);
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

    fetchBetsAndBankroll();
  }, [toast]);

  const now = new Date();
  const filteredBets = bets.filter(bet => {
    const betDate = new Date(bet.date);
    
    // Custom date range filter
    if (timeFilter === "custom") {
      if (customDateRange.from && betDate < customDateRange.from) return false;
      if (customDateRange.to && betDate > new Date(customDateRange.to.getTime() + 24 * 60 * 60 * 1000 - 1)) return false;
      return true;
    }
    
    // Time filter
    switch (timeFilter) {
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return betDate >= weekAgo;
      case "month":
        return betDate.getMonth() === now.getMonth() && betDate.getFullYear() === now.getFullYear();
      case "year":
        return betDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  });

  const totalProfit = filteredBets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
  const totalStake = filteredBets.reduce((sum, bet) => sum + bet.stake, 0);
  const wonBets = filteredBets.filter(bet => bet.status === 'won').length;
  const winRate = filteredBets.length > 0 ? (wonBets / filteredBets.length) * 100 : 0;
  const overallROI = calculateROI(totalProfit, totalStake);
  const averageOdds = calculateAverageOdds(filteredBets);
  const averageStake = calculateAverageStake(filteredBets);

  // Create bankroll evolution data
  const bankrollEvolutionData = filteredBets
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc, bet, index) => {
      const previousBankroll = index > 0 ? acc[index - 1].bankroll : initialBankroll;
      const currentProfit = bet.profit || 0;
      const newBankroll = previousBankroll + currentProfit;
      
      acc.push({
        date: new Date(bet.date).toLocaleDateString('it-IT', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        profit: currentProfit,
        bankroll: newBankroll,
        betNumber: index + 1
      });
      return acc;
    }, [] as Array<{date: string, profit: number, bankroll: number, betNumber: number}>);

  if (bets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-500 text-lg font-medium mb-2">Non hai ancora scommesse da analizzare</p>
            <p className="text-gray-400">Aggiungi alcune scommesse per vedere le statistiche.</p>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const monthlyData = groupBetsByMonthWithROI(filteredBets);
  
  const sportData = filteredBets.reduce((acc, bet) => {
    const sport = bet.sport || 'Altro';
    if (!acc[sport]) {
      acc[sport] = { count: 0, profit: 0 };
    }
    acc[sport].count += 1;
    acc[sport].profit += bet.profit || 0;
    return acc;
  }, {} as Record<string, { count: number; profit: number }>);

  const chartData = Object.entries(sportData).map(([sport, data]) => ({
    sport,
    scommesse: data.count,
    profitto: data.profit
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Analisi Prestazioni
          </h1>
          <p className="text-gray-600 text-lg">
            Analizza le tue performance e identifica tendenze
          </p>
        </div>

        {/* Filters Section */}
        <div className="space-y-6">
          {/* Time Filter */}
          <div className="flex justify-center">
            <ToggleGroup 
              type="single" 
              value={timeFilter} 
              onValueChange={(value) => value && setTimeFilter(value)}
              className="bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-lg"
            >
              <ToggleGroupItem value="all" className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-purple-500 data-[state=on]:to-pink-600 data-[state=on]:text-white">
                Tutto
              </ToggleGroupItem>
              <ToggleGroupItem value="year" className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-purple-500 data-[state=on]:to-pink-600 data-[state=on]:text-white">
                Quest'anno
              </ToggleGroupItem>
              <ToggleGroupItem value="month" className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-purple-500 data-[state=on]:to-pink-600 data-[state=on]:text-white">
                Questo mese
              </ToggleGroupItem>
              <ToggleGroupItem value="week" className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-purple-500 data-[state=on]:to-pink-600 data-[state=on]:text-white">
                Questa settimana
              </ToggleGroupItem>
              <ToggleGroupItem value="custom" className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-purple-500 data-[state=on]:to-pink-600 data-[state=on]:text-white">
                Scegli
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Custom Date Range Picker */}
          {timeFilter === "custom" && (
            <div className="flex justify-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <label className="text-sm font-medium text-gray-600">Data Inizio</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-48 justify-start text-left font-normal bg-white/80 backdrop-blur-sm",
                        !customDateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateRange.from ? format(customDateRange.from, "dd/MM/yyyy") : "Seleziona data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customDateRange.from}
                      onSelect={(date) => setCustomDateRange(prev => ({ ...prev, from: date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col items-center gap-2">
                <label className="text-sm font-medium text-gray-600">Data Fine</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-48 justify-start text-left font-normal bg-white/80 backdrop-blur-sm",
                        !customDateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateRange.to ? format(customDateRange.to, "dd/MM/yyyy") : "Seleziona data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customDateRange.to}
                      onSelect={(date) => setCustomDateRange(prev => ({ ...prev, to: date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Profitto Totale</p>
                  <p className="text-3xl font-bold">{formatCurrency(totalProfit)}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">ROI</p>
                  <p className="text-3xl font-bold">{overallROI.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Percent className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Win Rate</p>
                  <p className="text-3xl font-bold">{winRate.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 border-0 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Scommesse Totali</p>
                  <p className="text-3xl font-bold">{filteredBets.length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 border-0 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm font-medium">Quota Media</p>
                  <p className="text-3xl font-bold">{averageOdds.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-yellow-600 border-0 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Puntata Media</p>
                  <p className="text-3xl font-bold">{formatCurrency(averageStake)}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Performance Chart */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">Performance Mensile</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'roi' ? `${value.toFixed(1)}%` : formatCurrency(value),
                      name === 'roi' ? 'ROI' : 'Profitto'
                    ]}
                  />
                  <Bar dataKey="profit" fill="#8884d8" name="profit" />
                  <Line type="monotone" dataKey="roi" stroke="#82ca9d" name="roi" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bankroll Evolution Chart */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">Evoluzione Bankroll</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bankrollEvolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === 'bankroll' ? 'Bankroll' : 'Profitto'
                    ]}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bankroll" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="bankroll"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Second Row of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sports Distribution Chart */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">Distribuzione per Sport</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ sport, percent }: any) => `${sport} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="scommesse"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Placeholder for future chart */}
          <div></div>
        </div>

        {/* Sports Performance Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Performance per Sport</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Sport</th>
                    <th className="text-left p-4">Scommesse</th>
                    <th className="text-left p-4">Profitto</th>
                    <th className="text-left p-4">Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(sportData).map(([sport, data]) => {
                    const sportBets = filteredBets.filter(bet => (bet.sport || 'Altro') === sport);
                    const sportWinRate = sportBets.length > 0 ? 
                      (sportBets.filter(bet => bet.status === 'won').length / sportBets.length) * 100 : 0;
                    
                    return (
                      <tr key={sport} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{sport}</td>
                        <td className="p-4">{data.count}</td>
                        <td className="p-4">
                          <span className={data.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(data.profit)}
                          </span>
                        </td>
                        <td className="p-4">{sportWinRate.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analysis;
