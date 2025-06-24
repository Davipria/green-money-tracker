import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ExportButtons from "@/components/ExportButtons";

interface Bet {
  id: string;
  date: string;
  event: string;
  selection: string | null;
  odds: number;
  stake: number;
  status: string;
  profit: number | null;
  sport: string | null;
  bookmaker: string | null;
}

const Archive = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [filteredBets, setFilteredBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    if (user) {
      fetchBets();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [bets, statusFilter, searchTerm, dateRange]);

  const fetchBets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (error) throw error;
      if (data) {
        setBets(data);
      }
    } catch (error) {
      console.error('Error fetching bets:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le scommesse",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...bets];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(bet => bet.status === statusFilter);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(bet =>
        bet.event.toLowerCase().includes(lowerSearchTerm) ||
        (bet.selection && bet.selection.toLowerCase().includes(lowerSearchTerm)) ||
        bet.status.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter(bet => {
        const betDate = new Date(bet.date);
        const fromDate = dateRange.from!;
        const toDate = dateRange.to!;
        return betDate >= fromDate && betDate <= toDate;
      });
    }

    setFilteredBets(filtered);
  }, [bets, statusFilter, searchTerm, dateRange]);

  const handleDeleteBet = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBets(prevBets => prevBets.filter(bet => bet.id !== id));
      toast({
        title: "Scommessa eliminata!",
        description: "La scommessa è stata eliminata con successo"
      });
    } catch (error) {
      console.error('Error deleting bet:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare la scommessa",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold mb-2">Archivio</h1>
          <p className="text-muted-foreground">
            Visualizza e gestisci tutte le tue scommesse
          </p>
        </div>
        <ExportButtons 
          bets={exportBets}
          type="archive"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="searchTerm">Cerca</Label>
              <Input
                id="searchTerm"
                placeholder="Cerca evento, selezione, stato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Stato</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Tutti gli stati" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  <SelectItem value="won">Vinte</SelectItem>
                  <SelectItem value="lost">Perse</SelectItem>
                  <SelectItem value="open">Aperte</SelectItem>
                  <SelectItem value="void">Annullate</SelectItem>
                  <SelectItem value="cashout">Cashout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      <span>Seleziona un intervallo</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    pagedNavigation
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <Table>
        <TableCaption>Elenco delle scommesse archiviate.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Evento</TableHead>
            <TableHead>Selezione</TableHead>
            <TableHead>Quota</TableHead>
            <TableHead>Stake</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Profitto</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBets.map((bet) => (
            <TableRow key={bet.id}>
              <TableCell>{new Date(bet.date).toLocaleDateString()}</TableCell>
              <TableCell>{bet.event}</TableCell>
              <TableCell>{bet.selection}</TableCell>
              <TableCell>{bet.odds}</TableCell>
              <TableCell>{bet.stake}</TableCell>
              <TableCell>{bet.status}</TableCell>
              <TableCell>{bet.profit}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleDeleteBet(bet.id)}>
                  Elimina
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {filteredBets.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center">Nessuna scommessa trovata.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Archive;
