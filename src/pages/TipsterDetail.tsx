import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  CalendarDays, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  Instagram, 
  MessageCircle, 
  BarChart3, 
  Calendar as CalendarIcon,
  Trophy,
  Send as Telegram
} from "lucide-react";
import { useTipsters, TipsterProfile } from "@/hooks/useTipsters";
import { Bet } from "@/types/bet";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Select } from "@/components/ui/select";
import { addDays, subDays, subMonths, subYears, isAfter, isBefore, isWithinInterval } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { formatCurrency } from "@/utils/betUtils";
import FilteredBetsView from "@/components/FilteredBetsView";

// --- RankingsSection Component ---
import React from "react";

function RankingsSection() {
  const navigate = useNavigate();
  const { tipsters, loading } = useTipsters();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

  // Calcola l'intervallo di date per il periodo selezionato
  const now = new Date();
  let from: Date;
  if (period === 'week') {
    const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
    from = new Date(now);
    from.setDate(now.getDate() - day);
  } else if (period === 'month') {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    from = new Date(now.getFullYear(), 0, 1);
  }

  // Per ogni tipster, calcola le stats solo sulle scommesse del periodo
  const rankedTipsters = useMemo(() => {
    if (loading) return [];
    return tipsters.map(t => {
      if (!t.stats || !t.id) return null;
      // Filtro le scommesse del periodo
      const bets = (t.bets || []).filter(bet => {
        const d = new Date(bet.date);
        return d >= from && d <= now;
      });
      // Se non ci sono bets, stats a 0
      if (!bets.length) return { ...t, stats: { ...t.stats, totalProfit: 0, roi: 0, winRate: 0 } };
      // Calcola stats periodo
      const totalProfit = bets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
      const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
      const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
      const wonBets = bets.filter(bet => bet.status === 'won').length;
      const winRate = bets.length > 0 ? (wonBets / bets.length) * 100 : 0;
      return {
        ...t,
        stats: {
          ...t.stats,
          totalProfit,
          roi,
          winRate,
        },
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b!.stats!.totalProfit - a!.stats!.totalProfit))
    .slice(0, 20);
  }, [tipsters, period, loading]);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded ${period === 'week' ? 'bg-primary text-white' : 'bg-muted'}`}
          onClick={() => setPeriod('week')}
        >
          Settimanale
        </button>
        <button
          className={`px-3 py-1 rounded ${period === 'month' ? 'bg-primary text-white' : 'bg-muted'}`}
          onClick={() => setPeriod('month')}
        >
          Mensile
        </button>
        <button
          className={`px-3 py-1 rounded ${period === 'year' ? 'bg-primary text-white' : 'bg-muted'}`}
          onClick={() => setPeriod('year')}
        >
          Annuale
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Username</th>
              <th className="px-3 py-2 text-right">Profitto (€)</th>
              <th className="px-3 py-2 text-right">ROI %</th>
              <th className="px-3 py-2 text-right">Winrate %</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-4">Caricamento...</td></tr>
            ) : rankedTipsters.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4">Nessun tipster trovato</td></tr>
            ) : rankedTipsters.map((t, idx) => (
              <tr
                key={t!.id}
                className={`cursor-pointer ${idx % 2 === 0 ? '' : 'bg-muted/40'} hover:bg-primary/10`}
                onClick={() => navigate(`/app/tipsters/${t!.id}`)}
              >
                <td className="px-3 py-2 font-bold">{idx + 1}</td>
                <td className="px-3 py-2">{t!.username || "Tipster"}</td>
                <td className={`px-3 py-2 text-right font-semibold ${t!.stats!.totalProfit > 0 ? 'text-green-600' : t!.stats!.totalProfit < 0 ? 'text-red-600' : ''}`}>{t!.stats!.totalProfit > 0 ? '+' : ''}{t!.stats!.totalProfit.toFixed(2)}</td>
                <td className={`px-3 py-2 text-right ${t!.stats!.roi > 0 ? 'text-green-600' : t!.stats!.roi < 0 ? 'text-red-600' : ''}`}>{t!.stats!.roi > 0 ? '+' : ''}{t!.stats!.roi.toFixed(2)}%</td>
                <td className="px-3 py-2 text-right">{t!.stats!.winRate.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TipsterDetail() {
  const { tipsterId } = useParams<{ tipsterId: string }>();
  const navigate = useNavigate();
  const { getTipsterById, getTipsterBets } = useTipsters();
  const [tipster, setTipster] = useState<TipsterProfile | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [period, setPeriod] = useState<'all' | 'year' | 'month' | 'week' | 'custom'>('all');
  const [customRange, setCustomRange] = useState<{from: Date|null, to: Date|null}>({from: null, to: null});
  const [showFilteredView, setShowFilteredView] = useState(false);

  useEffect(() => {
    if (tipsterId) {
      fetchTipsterData();
    }
  }, [tipsterId]);

  const fetchTipsterData = async () => {
    try {
      setLoading(true);
      
      if (!tipsterId) return;

      const tipsterData = await getTipsterById(tipsterId);
      const tipsterBets = await getTipsterBets(tipsterId);

      setTipster(tipsterData);
      setBets(tipsterBets);
    } catch (error) {
      console.error("Errore nel recupero dei dati del tipster:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "won":
        return "bg-green-100 text-green-800";
      case "lost":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cashout":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "won":
        return "Vinta";
      case "lost":
        return "Persa";
      case "pending":
        return "In corso";
      case "cashout":
        return "Cashout";
      default:
        return status;
    }
  };

  // Calcolo gli anni disponibili tra le scommesse
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    bets.forEach(bet => {
      const y = new Date(bet.date).getFullYear();
      years.add(y.toString());
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [bets]);

  // Filtra le scommesse in base al periodo selezionato
  const filteredBets = useMemo(() => {
    if (!bets.length) return [];
    if (period === 'all') return bets;
    const now = new Date();
    let from: Date;
    let to: Date = now;
    if (period === 'week') {
      // Inizio settimana corrente (lunedì)
      const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
      from = new Date(now);
      from.setDate(now.getDate() - day);
    } else if (period === 'month') {
      // Primo giorno del mese corrente
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
      // Primo giorno dell'anno corrente
      from = new Date(now.getFullYear(), 0, 1);
    } else if (period === 'custom' && customRange.from && customRange.to) {
      from = customRange.from;
      to = customRange.to;
    } else {
      from = new Date(0);
    }
    return bets.filter(bet => {
      const d = new Date(bet.date);
      return isAfter(d, from) && isBefore(d, addDays(to, 1));
    });
  }, [bets, period, customRange]);

  // Calcola le stats sulle filteredBets
  const filteredStats = useMemo(() => {
    const totalBets = filteredBets.length;
    const wonBets = filteredBets.filter(bet => bet.status === "won").length;
    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
    const totalProfit = filteredBets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
    const totalStake = filteredBets.reduce((sum, bet) => sum + bet.stake, 0);
    const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
    const avgOdds = filteredBets.length > 0 ? filteredBets.reduce((sum, bet) => sum + bet.odds, 0) / filteredBets.length : 0;
    return { totalBets, winRate, totalProfit, totalStake, roi, avgOdds };
  }, [filteredBets]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!tipster) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Tipster non trovato</h2>
          <p className="text-muted-foreground mb-6">
            Il tipster che stai cercando non esiste o non è più disponibile.
          </p>
          <Button onClick={() => navigate("/app/tipsters")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna ai Tipster
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/app/tipsters")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna ai Tipster
        </Button>
        <h1 className="text-3xl font-bold mb-2">
          {tipster.username || `${tipster.first_name} ${tipster.last_name}`}
        </h1>
        <p className="text-muted-foreground">
          Profilo del tipster e statistiche dettagliate
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={tipster.avatar_url || ""} />
                  <AvatarFallback className="text-lg">
                    {tipster.username?.charAt(0).toUpperCase() || 
                     tipster.first_name?.charAt(0).toUpperCase() || 
                     "T"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    {tipster.username || `${tipster.first_name} ${tipster.last_name}`}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {tipster.favorite_sport || "Sport preferito non specificato"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tipster.bio && (
                <div>
                  <h4 className="font-semibold mb-2">Bio</h4>
                  <p className="text-sm text-muted-foreground">{tipster.bio}</p>
                </div>
              )}

              <div className="flex space-x-2">
                {tipster.instagram_url && (
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <a href={tipster.instagram_url} target="_blank" rel="noopener noreferrer">
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram
                    </a>
                  </Button>
                )}
                {tipster.telegram_url && (
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <a href={tipster.telegram_url} target="_blank" rel="noopener noreferrer">
                      <Telegram className="w-4 h-4 mr-2" />
                      Telegram
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 order-1 lg:order-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Panoramica</TabsTrigger>
              <TabsTrigger value="archive">Archivio</TabsTrigger>
              <TabsTrigger value="bets">Scommesse</TabsTrigger>
              <TabsTrigger value="stats">Statistiche</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Panoramica Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 flex flex-wrap gap-2 items-center">
                    <label className="font-medium text-sm">Periodo:</label>
                    <button className={`px-3 py-1 rounded ${period==='all' ? 'bg-primary text-white' : 'bg-muted'}`} onClick={()=>setPeriod('all')}>Tutto</button>
                    <button className={`px-3 py-1 rounded ${period==='year' ? 'bg-primary text-white' : 'bg-muted'}`} onClick={()=>setPeriod('year')}>Quest'anno</button>
                    <button className={`px-3 py-1 rounded ${period==='month' ? 'bg-primary text-white' : 'bg-muted'}`} onClick={()=>setPeriod('month')}>Questo mese</button>
                    <button className={`px-3 py-1 rounded ${period==='week' ? 'bg-primary text-white' : 'bg-muted'}`} onClick={()=>setPeriod('week')}>Questa settimana</button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={`px-3 py-1 rounded flex items-center gap-1 ${period==='custom' ? 'bg-primary text-white' : 'bg-muted'}`}
                          onClick={()=>setPeriod('custom')}
                        >
                          <CalendarIcon className="w-4 h-4" />
                          Scegli
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-0">
                        <Calendar
                          mode="range"
                          selected={customRange}
                          onSelect={(range) => setCustomRange({ from: range?.from ?? null, to: range?.to ?? null })}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Scommesse totali</h4>
                      <p className="text-3xl font-bold text-blue-700">
                        {filteredStats.totalBets}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Odds Media</h4>
                      <p className="text-3xl font-bold text-purple-600">
                        {filteredStats.avgOdds?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Guadagno %</h4>
                      <p className="text-3xl font-bold text-orange-600">
                        {tipster.bankroll ? `${((filteredStats.totalProfit / tipster.bankroll) * 100 > 0 ? '+' : '') + ((filteredStats.totalProfit / tipster.bankroll) * 100).toFixed(2)}%` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">ROI %</h4>
                      <p className="text-3xl font-bold text-pink-600">
                        {filteredStats.totalStake > 0 ? `${filteredStats.roi > 0 ? '+' : ''}${filteredStats.roi.toFixed(2)}%` : '0%'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="archive" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Archivio Scommesse</CardTitle>
                  <div className="mt-2 flex items-center gap-2">
                    <label htmlFor="year-select" className="text-sm font-medium">Scegli l'anno:</label>
                    <select
                      id="year-select"
                      className="border rounded px-2 py-1 text-sm"
                      value={selectedYear}
                      onChange={e => setSelectedYear(e.target.value)}
                    >
                      <option value="all">Tutti gli anni</option>
                      {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  {bets.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Nessuna scommessa trovata</p>
                    </div>
                  ) : (
                    <Accordion type="multiple" className="w-full">
                      {Object.entries(
                        bets.reduce((acc, bet) => {
                          const date = new Date(bet.date);
                          const year = date.getFullYear();
                          const month = date.toLocaleString('it-IT', { month: 'long' });
                          const key = `${year}-${date.getMonth() + 1}`;
                          if (!acc[key]) acc[key] = { label: `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`, bets: [], year };
                          acc[key].bets.push(bet);
                          return acc;
                        }, {} as Record<string, { label: string; bets: Bet[]; year: number }>))
                        .filter(([_, group]) => selectedYear === 'all' || group.year.toString() === selectedYear)
                        .sort((a, b) => b[0].localeCompare(a[0]))
                        .map(([key, group]) => {
                          const monthlyProfit = group.bets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
                          const bankroll = tipster.bankroll ?? null;
                          const monthlyPerc = bankroll ? (monthlyProfit / bankroll) * 100 : null;
                          return (
                            <AccordionItem key={key} value={key}>
                              <AccordionTrigger className="mb-2 px-4 py-3 rounded-lg bg-muted/60 hover:bg-muted transition flex items-center gap-3">
                                <CalendarIcon className="w-5 h-5 text-blue-500" />
                                <span className="font-bold text-base flex-1">{group.label}</span>
                                <span className={`text-sm font-semibold px-2 py-1 rounded-full ${monthlyPerc !== null && monthlyPerc > 0 ? 'bg-green-100 text-green-700' : monthlyPerc !== null && monthlyPerc < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{monthlyPerc !== null ? `${monthlyPerc > 0 ? '+' : ''}${monthlyPerc.toFixed(2)}%` : 'N/A'}</span>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 mt-2">
                                  {group.bets.map((bet) => {
                                    const bankroll = tipster.bankroll ?? null;
                                    const stakePerc = bankroll ? (bet.stake / bankroll) * 100 : null;
                                    const profitPerc = bankroll && bet.profit !== null ? (bet.profit / bankroll) * 100 : null;
                                    return (
                                      <div key={bet.id} className="flex items-center justify-between p-4 bg-white dark:bg-muted rounded-lg shadow-sm border hover:shadow-md transition">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-3 mb-1">
                                            {bet.status === 'won' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                            {bet.status === 'lost' && <XCircle className="w-4 h-4 text-red-500" />}
                                            {bet.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                                            {bet.status === 'cashout' && <DollarSign className="w-4 h-4 text-blue-500" />}
                                            <Badge className={getStatusColor(bet.status)}>
                                              {getStatusText(bet.status)}
                                            </Badge>
                                            <span className="font-medium">{bet.sport}</span>
                                          </div>
                                          <p className="text-sm text-muted-foreground line-clamp-2">{bet.event}</p>
                                          <p className="text-xs text-muted-foreground">{new Date(bet.date).toLocaleDateString('it-IT')}</p>
                                        </div>
                                        <div className="text-right min-w-[90px]">
                                          <p className="font-medium">
                                            {stakePerc !== null ? `${stakePerc.toFixed(1)}%` : 'N/A'}
                                          </p>
                                          <p className="text-sm text-muted-foreground">Stake</p>
                                          <p className="font-medium mt-1">@{bet.odds}</p>
                                          <p className="text-sm text-muted-foreground">Quota</p>
                                          {bet.profit !== null && (
                                            <p className={`text-sm font-bold ${profitPerc !== null && profitPerc > 0 ? 'text-green-600' : profitPerc !== null && profitPerc < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                                              {profitPerc !== null ? `${profitPerc > 0 ? '+' : ''}${profitPerc.toFixed(2)}%` : 'N/A'}
                                            </p>
                                          )}
                                          <p className="text-xs text-muted-foreground">Vincita</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bets" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Scommesse per Mese
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Visualizza tutte le scommesse di questo tipster organizzate per mese.
                  </p>
                  <Button 
                    onClick={() => setShowFilteredView(true)}
                    className="w-full"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Visualizza Scommesse per Mese
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Statistiche dettagliate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-2 flex flex-wrap gap-2 items-center">
                    <label className="font-medium text-sm">Periodo:</label>
                    <button className={`px-3 py-1 rounded ${period==='all' ? 'bg-primary text-white' : 'bg-muted'}`} onClick={()=>setPeriod('all')}>Tutto</button>
                    <button className={`px-3 py-1 rounded ${period==='year' ? 'bg-primary text-white' : 'bg-muted'}`} onClick={()=>setPeriod('year')}>Quest'anno</button>
                    <button className={`px-3 py-1 rounded ${period==='month' ? 'bg-primary text-white' : 'bg-muted'}`} onClick={()=>setPeriod('month')}>Questo mese</button>
                    <button className={`px-3 py-1 rounded ${period==='week' ? 'bg-primary text-white' : 'bg-muted'}`} onClick={()=>setPeriod('week')}>Questa settimana</button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={`px-3 py-1 rounded flex items-center gap-1 ${period==='custom' ? 'bg-primary text-white' : 'bg-muted'}`}
                          onClick={()=>setPeriod('custom')}
                        >
                          <CalendarIcon className="w-4 h-4" />
                          Scegli
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-0">
                        <Calendar
                          mode="range"
                          selected={customRange}
                          onSelect={(range) => setCustomRange({ from: range?.from ?? null, to: range?.to ?? null })}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                    <div>
                      <h4 className="font-semibold mb-3">Scommesse totali</h4>
                      <p className="text-3xl font-bold text-blue-700">
                        {filteredBets.length}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Scommesse vinte</h4>
                      <p className="text-3xl font-bold text-green-600">
                        {filteredBets.filter(bet => bet.status === 'won').length}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Scommesse perse</h4>
                      <p className="text-3xl font-bold text-red-600">
                        {filteredBets.filter(bet => bet.status === 'lost').length}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Scommesse in corso</h4>
                      <p className="text-3xl font-bold text-yellow-600">
                        {filteredBets.filter(bet => bet.status === 'pending').length}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Scommesse cashout</h4>
                      <p className="text-3xl font-bold text-blue-600">
                        {filteredBets.filter(bet => bet.status === 'cashout').length}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Win Rate %</h4>
                      <p className="text-3xl font-bold text-purple-600">
                        {filteredStats.winRate.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">ROI %</h4>
                      <p className="text-3xl font-bold text-pink-600">
                        {filteredStats.totalStake > 0 ? `${filteredStats.roi > 0 ? '+' : ''}${filteredStats.roi.toFixed(2)}%` : '0%'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Quota media</h4>
                      <p className="text-3xl font-bold text-indigo-600">
                        {filteredStats.avgOdds?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Evoluzione Bankroll (%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={(() => {
                      // Calcolo i dati per l'evoluzione percentuale del bankroll
                      const initialBankroll = tipster.bankroll || 0;
                      if (!initialBankroll) return [];
                      const betsByDate = filteredBets
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .reduce((acc, bet) => {
                          const dateKey = bet.date;
                          if (!acc[dateKey]) acc[dateKey] = [];
                          acc[dateKey].push(bet);
                          return acc;
                        }, {} as Record<string, Bet[]>);
                      let runningBankroll = initialBankroll;
                      const dailyData: Array<{date: string, bankrollPerc: number, dailyProfit: number}> = [];
                      Object.entries(betsByDate).forEach(([dateKey, dayBets]) => {
                        const dailyProfit = dayBets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
                        runningBankroll += dailyProfit;
                        const perc = (runningBankroll / initialBankroll) * 100;
                        dailyData.push({
                          date: new Date(dateKey).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
                          bankrollPerc: perc,
                          dailyProfit: dailyProfit
                        });
                      });
                      return dailyData;
                    })()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={(() => {
                        // Rende il dominio simile a quello della sezione Analisi
                        const data = (() => {
                          const initialBankroll = tipster.bankroll || 0;
                          if (!initialBankroll) return [];
                          const betsByDate = filteredBets
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .reduce((acc, bet) => {
                              const dateKey = bet.date;
                              if (!acc[dateKey]) acc[dateKey] = [];
                              acc[dateKey].push(bet);
                              return acc;
                            }, {} as Record<string, Bet[]>);
                          let runningBankroll = initialBankroll;
                          const dailyData: Array<{date: string, bankrollPerc: number, dailyProfit: number}> = [];
                          Object.entries(betsByDate).forEach(([dateKey, dayBets]) => {
                            const dailyProfit = dayBets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
                            runningBankroll += dailyProfit;
                            const perc = (runningBankroll / initialBankroll) * 100;
                            dailyData.push({
                              date: new Date(dateKey).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
                              bankrollPerc: perc,
                              dailyProfit: dailyProfit
                            });
                          });
                          return dailyData;
                        })();
                        if (!data.length) return [80, 120];
                        const values = data.map(d => d.bankrollPerc);
                        const min = Math.min(...values);
                        const max = Math.max(...values);
                        return [min - 5, max + 5];
                      })()} tickFormatter={v => `${v.toFixed(0)}%`} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `${value.toFixed(2)}%`,
                          name === 'bankrollPerc' ? 'Bankroll %' : 'Profitto Giornaliero'
                        ]}
                        labelFormatter={(label) => `Data: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="bankrollPerc" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        name="bankrollPerc"
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Filtered Bets View */}
      {showFilteredView && (
        <div className="fixed inset-0 z-50 bg-background">
          <FilteredBetsView
            bets={bets}
            filterType="tipster"
            filterValue={tipster.username || `${tipster.first_name} ${tipster.last_name}` || "Tipster"}
            onBack={() => setShowFilteredView(false)}
          />
        </div>
      )}
    </div>
  );
}
