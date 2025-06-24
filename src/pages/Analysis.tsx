import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BarChart, LineChart, PieChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MetricCard } from "@/components/MetricCard";
import ExportButtons from "@/components/ExportButtons";

const Analysis = () => {
  const { user } = useAuth();
  const [bets, setBets] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState<"all" | "year" | "month" | "week" | "custom">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), 0, 1));
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(new Date());
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [bookmakerFilter, setBookmakerFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [oddsRange, setOddsRange] = useState<number[]>([1, 5]);
  const [monthlyPerformanceData, setMonthlyPerformanceData] = useState<any[]>([]);

  useEffect(() => {
    fetchBets();
  }, [user]);

  useEffect(() => {
    calculateMonthlyPerformance();
  }, [bets]);

  const fetchBets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching bets:", error);
      } else {
        setBets(data || []);
      }
    } catch (error) {
      console.error("Error fetching bets:", error);
    }
  };

  const calculateMonthlyPerformance = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const monthlyData = [];

    for (let i = 11; i >= 0; i--) {
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      const month = (currentMonth - i + 12) % 12;
      const monthName = new Date(year, month, 1).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' });

      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);

      const monthlyBets = bets.filter(bet => {
        const betDate = new Date(bet.date);
        return betDate >= monthStart && betDate <= monthEnd;
      });

      const totalStake = monthlyBets.reduce((sum, bet) => sum + bet.stake, 0);
      const totalProfit = monthlyBets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
      const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;

      monthlyData.push({
        month: monthName,
        roi: roi,
        profit: totalProfit
      });
    }

    setMonthlyPerformanceData(monthlyData);
  };

  const filteredBets = useMemo(() => {
    let filtered = [...bets];

    // Time Filter
    if (timeFilter === "year") {
      const currentYear = new Date().getFullYear();
      filtered = filtered.filter(bet => new Date(bet.date).getFullYear() === currentYear);
    } else if (timeFilter === "month") {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      filtered = filtered.filter(bet => new Date(bet.date).getFullYear() === currentYear && new Date(bet.date).getMonth() === currentMonth);
    } else if (timeFilter === "week") {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(now.setDate(now.getDate() + 6));

      filtered = filtered.filter(bet => {
        const betDate = new Date(bet.date);
        return betDate >= startOfWeek && betDate <= endOfWeek;
      });
    } else if (timeFilter === "custom" && customStartDate && customEndDate) {
      filtered = filtered.filter(bet => {
        const betDate = new Date(bet.date);
        return betDate >= customStartDate && betDate <= customEndDate;
      });
    }

    // Sport Filter
    if (sportFilter !== "all") {
      filtered = filtered.filter(bet => bet.sport === sportFilter);
    }

    // Bookmaker Filter
    if (bookmakerFilter !== "all") {
      filtered = filtered.filter(bet => bet.bookmaker === bookmakerFilter);
    }

    // Status Filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(bet => bet.status === statusFilter);
    }

    // Odds Range Filter
    filtered = filtered.filter(bet => bet.odds >= oddsRange[0] && bet.odds <= oddsRange[1]);

    return filtered;
  }, [bets, timeFilter, customStartDate, customEndDate, sportFilter, bookmakerFilter, statusFilter, oddsRange]);

  const totalStake = useMemo(() => {
    return filteredBets.reduce((sum, bet) => sum + bet.stake, 0);
  }, [filteredBets]);

  const totalProfit = useMemo(() => {
    return filteredBets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
  }, [filteredBets]);

  const calculateROI = (profit: number, stake: number) => {
    return stake > 0 ? (profit / stake) * 100 : 0;
  };

  const sports = useMemo(() => {
    return [...new Set(bets.map(bet => bet.sport).filter(Boolean))];
  }, [bets]);

  const bookmakers = useMemo(() => {
    return [...new Set(bets.map(bet => bet.bookmaker).filter(Boolean))];
  }, [bets]);

  const betStatuses = useMemo(() => {
    return [...new Set(bets.map(bet => bet.status).filter(Boolean))];
  }, [bets]);

  const shouldShowPerformanceChart = monthlyPerformanceData.length > 0 && monthlyPerformanceData.some(item => item.roi !== 0);

  // Create analysis data for export
  const analysisData = {
    totalBets: filteredBets.length,
    winRate: filteredBets.length > 0 ? (filteredBets.filter(bet => bet.status === 'won').length / filteredBets.length) * 100 : 0,
    totalProfit: totalProfit,
    roi: calculateROI(totalProfit, totalStake),
    averageOdds: filteredBets.length > 0 ? filteredBets.reduce((sum, bet) => sum + bet.odds, 0) / filteredBets.length : 0,
    totalStake: totalStake,
    period: timeFilter === 'all' ? 'Tutto il periodo' : 
            timeFilter === 'year' ? 'Quest\'anno' :
            timeFilter === 'month' ? 'Questo mese' :
            timeFilter === 'week' ? 'Questa settimana' :
            `Dal ${format(customStartDate, 'dd/MM/yyyy')} al ${format(customEndDate, 'dd/MM/yyyy')}`
  };

  // Convert bets for export
  const exportBets = filteredBets.map(bet => ({
    id: bet.id,
    date: bet.date,
    event: bet.event,
    selection: bet.selection,
    odds: bet.odds,
    stake: bet.stake,
    status: bet.status,
    profit: bet.profit,
    sport: bet.sport,
    bookmaker: bet.bookmaker
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analisi</h1>
          <p className="text-muted-foreground">
            Visualizza le tue statistiche e performance delle scommesse
          </p>
        </div>
        <ExportButtons 
          bets={exportBets}
          analysisData={analysisData}
          monthlyData={monthlyPerformanceData}
          type="analysis"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Time Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Periodo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as "all" | "year" | "month" | "week" | "custom")}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutto</SelectItem>
                <SelectItem value="year">Quest'anno</SelectItem>
                <SelectItem value="month">Questo mese</SelectItem>
                <SelectItem value="week">Questa settimana</SelectItem>
                <SelectItem value="custom">Personalizzato</SelectItem>
              </SelectContent>
            </Select>

            {timeFilter === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    {customStartDate ? format(customStartDate, "dd/MM/yyyy") : <span>Inizio</span>} - {customEndDate ? format(customEndDate, "dd/MM/yyyy") : <span>Fine</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" side="bottom">
                  <Calendar
                    mode="range"
                    defaultMonth={customStartDate}
                    selected={{
                      from: customStartDate,
                      to: customEndDate,
                    }}
                    onSelect={(dateRange) => {
                      setCustomStartDate(dateRange?.from);
                      setCustomEndDate(dateRange?.to);
                    }}
                    numberOfMonths={2}
                    pagedNavigation
                  />
                </PopoverContent>
              </Popover>
            )}
          </CardContent>
        </Card>

        {/* Sport Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Sport</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tutti gli sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli sport</SelectItem>
                {sports.map(sport => (
                  <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Bookmaker Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Bookmaker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Select value={bookmakerFilter} onValueChange={setBookmakerFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tutti i bookmaker" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i bookmaker</SelectItem>
                {bookmakers.map(bookmaker => (
                  <SelectItem key={bookmaker} value={bookmaker}>{bookmaker}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Status Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Stato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tutti gli stati" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                {betStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Odds Range Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Quote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label>Range: {oddsRange[0]} - {oddsRange[1]}</Label>
            <Slider
              defaultValue={oddsRange}
              min={1}
              max={10}
              step={0.1}
              onValueChange={(value) => setOddsRange(value)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Totale Scommesse" value={filteredBets.length.toString()} />
        <MetricCard label="Percentuale Vincita" value={`${filteredBets.length > 0 ? (filteredBets.filter(bet => bet.status === 'won').length / filteredBets.length) * 100 : 0}%`} />
        <MetricCard label="Profitto Totale" value={`€${totalProfit.toFixed(2)}`} />
        <MetricCard label="ROI" value={`${calculateROI(totalProfit, totalStake).toFixed(2)}%`} />
        <MetricCard label="Quote Medie" value={filteredBets.length > 0 ? (filteredBets.reduce((sum, bet) => sum + bet.odds, 0) / filteredBets.length).toFixed(2) : '0.00'} />
        <MetricCard label="Stake Totale" value={`€${totalStake.toFixed(2)}`} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance Chart */}
        {shouldShowPerformanceChart && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Mensile (ROI)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value: any) => [`ROI: ${typeof value === 'number' ? value.toFixed(2) : value}%`]} />
                  <Legend />
                  <Line type="monotone" dataKey="roi" stroke="#82ca9d" name="ROI" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Bet Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuzione degli Stati delle Scommesse</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={(() => {
                    const won = filteredBets.filter(bet => bet.status === 'won').length;
                    const lost = filteredBets.filter(bet => bet.status === 'lost').length;
                    const open = filteredBets.filter(bet => bet.status === 'open').length;
                    const cashedOut = filteredBets.filter(bet => bet.status === 'cashed_out').length;

                    return [
                      { name: 'Vinte', value: won },
                      { name: 'Perse', value: lost },
                      { name: 'Aperte', value: open },
                      { name: 'Cashout', value: cashedOut },
                    ];
                  })()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  <Cell fill="#82ca9d" name="Vinte" />
                  <Cell fill="#e57373" name="Perse" />
                  <Cell fill="#64b5f6" name="Aperte" />
                  <Cell fill="#ffb74d" name="Cashout" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit by Sport Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Profitto per Sport</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(() => {
                const sportsData: { [key: string]: number } = {};
                filteredBets.forEach(bet => {
                  if (bet.sport) {
                    sportsData[bet.sport] = (sportsData[bet.sport] || 0) + (bet.profit || 0);
                  }
                });

                return Object.entries(sportsData).map(([sport, profit]) => ({ sport, profit }));
              })()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sport" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="profit" fill="#8884d8" name="Profitto" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stake by Bookmaker Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Stake per Bookmaker</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(() => {
                const bookmakerData: { [key: string]: number } = {};
                filteredBets.forEach(bet => {
                  if (bet.bookmaker) {
                    bookmakerData[bet.bookmaker] = (bookmakerData[bet.bookmaker] || 0) + bet.stake;
                  }
                });

                return Object.entries(bookmakerData).map(([bookmaker, stake]) => ({ bookmaker, stake }));
              })()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bookmaker" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stake" fill="#82ca9d" name="Stake" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Sections */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Dettagli Scommesse</h2>
        {filteredBets.length === 0 ? (
          <p>Nessuna scommessa trovata con i filtri selezionati.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selezione</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quota</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stake</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profitto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookmaker</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBets.map(bet => (
                  <tr key={bet.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(bet.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bet.event}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bet.selection}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bet.odds}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bet.stake}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bet.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bet.profit}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bet.sport}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bet.bookmaker}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;
