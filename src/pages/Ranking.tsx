import { useState, useEffect } from "react";
import { getTipstersWithStatsByPeriod } from "@/hooks/useTipsters";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

function getLastWeekRange() {
  const now = new Date();
  const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const end = new Date(now);
  end.setDate(now.getDate() - day);
  end.setHours(23,59,59,999);
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  start.setHours(0,0,0,0);
  return { start, end };
}

function getLastMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  return { start, end };
}

const periodLabels = {
  week: "Settimana Scorsa",
  month: "Mese Scorso"
};

const medalColors = [
  "from-yellow-400 to-yellow-200 border-yellow-400",
  "from-gray-400 to-gray-200 border-gray-400",
  "from-orange-400 to-orange-200 border-orange-400"
];

export default function Ranking() {
  const [tab, setTab] = useState<'roi'|'winrate'>('roi');
  const [period, setPeriod] = useState<'week'|'month'>('week');
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [showSlow, setShowSlow] = useState(false);
  const navigate = useNavigate();

  const { start, end } = period === 'week' ? getLastWeekRange() : getLastMonthRange();

  useEffect(() => {
    setLoading(true);
    setError(null);
    setShowSlow(false);
    const timer = setTimeout(() => setShowSlow(true), 2000);
    getTipstersWithStatsByPeriod(start, end)
      .then(tipsters => {
        const sorted = tipsters
          .filter(t => t.periodBets > 0)
          .sort((a, b) => tab === 'roi' ? b.stats.roi - a.stats.roi : b.stats.winRate - a.stats.winRate)
          .slice(0, 10);
        setRanking(sorted);
      })
      .catch(e => setError("Errore nel caricamento classifica"))
      .finally(() => {
        setLoading(false);
        clearTimeout(timer);
      });
  }, [tab, period, start, end]);

  const podium = ranking.slice(0, 3);
  const others = ranking.slice(3);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-10 h-10 text-yellow-400 drop-shadow-lg" />
          <span className="inline-block bg-gradient-to-r from-primary to-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
            {periodLabels[period]}
          </span>
        </div>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent mb-2">Classifica Tipster</h1>
        <p className="text-muted-foreground text-center max-w-xl">Scopri i migliori tipster per ROI % e Win Rate. La classifica si aggiorna ogni lunedì (settimanale) e ogni primo del mese (mensile).</p>
      </div>

      {/* Tabs e Periodo */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <Tabs value={tab} onValueChange={v => setTab(v as any)} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="roi">ROI %</TabsTrigger>
            <TabsTrigger value="winrate">Win Rate</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2 justify-center">
          <button className={`px-3 py-1 rounded font-semibold transition ${period==='week'?'bg-primary text-white shadow':'bg-muted text-muted-foreground hover:bg-primary/10'}`} onClick={()=>setPeriod('week')}>Settimanale</button>
          <button className={`px-3 py-1 rounded font-semibold transition ${period==='month'?'bg-primary text-white shadow':'bg-muted text-muted-foreground hover:bg-primary/10'}`} onClick={()=>setPeriod('month')}>Mensile</button>
        </div>
      </div>

      {error && <div className="text-red-600 text-center mb-4">{error}</div>}
      {loading ? (
        <>
          {/* Skeleton Podio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[0,1,2].map(idx => (
              <div key={idx} className="relative bg-gradient-to-br from-gray-100 to-gray-200 border-2 rounded-2xl shadow-lg p-5 flex flex-col items-center">
                <span className={`absolute -top-4 left-1/2 -translate-x-1/2 text-3xl font-black drop-shadow-lg text-gray-300`}>{idx+1}</span>
                <Skeleton className="w-16 h-16 mb-2 rounded-full" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
          {/* Skeleton Tabella */}
          <div className="bg-white/80 rounded-xl shadow-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Tipster</TableHead>
                  <TableHead className="text-right">ROI %</TableHead>
                  <TableHead className="text-right">Win Rate</TableHead>
                  <TableHead className="text-right">Scommesse</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                    <TableCell className="flex items-center gap-2"><Skeleton className="w-8 h-8 rounded-full" /><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {showSlow && <div className="text-center text-sm text-muted-foreground mt-4">Ci vuole più del solito, attendi...</div>}
        </>
      ) : (
        <>
          {/* Podio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {podium.map((t, idx) => (
              <div
                key={t.id}
                className={`relative bg-gradient-to-br ${medalColors[idx]} border-2 rounded-2xl shadow-lg p-5 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-200`}
                onClick={() => navigate(`/app/tipsters/${t.id}`)}
              >
                <span className={`absolute -top-4 left-1/2 -translate-x-1/2 text-3xl font-black drop-shadow-lg ${idx===0?'text-yellow-400':idx===1?'text-gray-400':'text-orange-400'}`}>{idx+1}</span>
                <Avatar className="w-16 h-16 mb-2 ring-4 ring-white">
                  <AvatarImage src={t.avatar_url || ''} />
                  <AvatarFallback>{t.username?.charAt(0).toUpperCase() || t.first_name?.charAt(0).toUpperCase() || 'T'}</AvatarFallback>
                </Avatar>
                <div className="text-lg font-bold text-center mb-1">{t.username || `${t.first_name} ${t.last_name}`}</div>
                <div className="flex gap-2 text-xs text-muted-foreground mb-2">
                  <span>{t.periodBets} scommesse</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className={`font-bold text-lg ${t.stats.roi > 0 ? 'text-green-600' : t.stats.roi < 0 ? 'text-red-600' : 'text-gray-700'}`}>{t.stats.roi.toFixed(2)}% <span className="text-xs font-normal text-muted-foreground">ROI</span></span>
                  <span className={`font-bold text-lg ${t.stats.winRate > 0 ? 'text-green-600' : t.stats.winRate < 0 ? 'text-red-600' : 'text-gray-700'}`}>{t.stats.winRate.toFixed(2)}% <span className="text-xs font-normal text-muted-foreground">Win Rate</span></span>
                </div>
              </div>
            ))}
          </div>
          {/* Tabella altri tipster */}
          <div className="bg-white/80 rounded-xl shadow-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Tipster</TableHead>
                  <TableHead className="text-right">ROI %</TableHead>
                  <TableHead className="text-right">Win Rate</TableHead>
                  <TableHead className="text-right">Scommesse</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {others.length === 0 ? (
                  <TableRow><TableCell colSpan={5}>Nessun tipster trovato</TableCell></TableRow>
                ) : others.map((t, idx) => (
                  <TableRow key={t.id} className="cursor-pointer hover:bg-primary/10 transition" onClick={()=>navigate(`/app/tipsters/${t.id}`)}>
                    <TableCell className="font-bold">{idx+4}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={t.avatar_url || ''} />
                        <AvatarFallback>{t.username?.charAt(0).toUpperCase() || t.first_name?.charAt(0).toUpperCase() || 'T'}</AvatarFallback>
                      </Avatar>
                      <span>{t.username || `${t.first_name} ${t.last_name}`}</span>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${t.stats.roi > 0 ? 'text-green-600' : t.stats.roi < 0 ? 'text-red-600' : ''}`}>{t.stats.roi.toFixed(2)}%</TableCell>
                    <TableCell className={`text-right font-semibold ${t.stats.winRate > 0 ? 'text-green-600' : t.stats.winRate < 0 ? 'text-red-600' : ''}`}>{t.stats.winRate.toFixed(2)}%</TableCell>
                    <TableCell className="text-right">{t.periodBets}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
} 