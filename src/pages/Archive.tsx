import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/betUtils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bet, MonthlyStats } from "@/types/bet";
import EditBetDialog from "@/components/EditBetDialog";

const Archive = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMonths, setOpenMonths] = useState<string[]>([]);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

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
        .order('date', { ascending: false });

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

  useEffect(() => {
    fetchBets();
  }, [toast]);

  const handleEditBet = (bet: Bet) => {
    setSelectedBet(bet);
    setEditDialogOpen(true);
  };

  const handleBetUpdated = () => {
    fetchBets();
  };

  const groupBetsByMonth = (bets: Bet[]): MonthlyStats[] => {
    const grouped = bets.reduce((acc, bet) => {
      const date = new Date(bet.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!acc[key]) {
        acc[key] = {
          month: date.toLocaleDateString('it-IT', { month: 'long' }),
          year: date.getFullYear(),
          totalStake: 0,
          totalPayout: 0,
          profit: 0,
          betsCount: 0,
          winRate: 0,
        };
      }
      
      acc[key].totalStake += bet.stake;
      acc[key].betsCount += 1;
      
      if (bet.status === 'won' && bet.payout) {
        acc[key].totalPayout += bet.payout;
      }
      
      acc[key].profit += bet.profit || 0;
      
      return acc;
    }, {} as Record<string, MonthlyStats>);
    
    // Calculate win rates
    Object.keys(grouped).forEach(key => {
      const monthBets = bets.filter(bet => {
        const date = new Date(bet.date);
        const betKey = `${date.getFullYear()}-${date.getMonth()}`;
        return betKey === key;
      });
      
      const wonBets = monthBets.filter(bet => bet.status === 'won').length;
      grouped[key].winRate = monthBets.length > 0 ? (wonBets / monthBets.length) * 100 : 0;
    });
    
    return Object.values(grouped).sort((a, b) => b.year - a.year || b.month.localeCompare(a.month));
  };

  const toggleMonth = (monthKey: string) => {
    setOpenMonths(prev => 
      prev.includes(monthKey) 
        ? prev.filter(key => key !== monthKey)
        : [...prev, monthKey]
    );
  };

  const getBetsForMonth = (month: string, year: number) => {
    return bets.filter(bet => {
      const betDate = new Date(bet.date);
      const betMonth = betDate.toLocaleDateString('it-IT', { month: 'long' });
      return betMonth === month && betDate.getFullYear() === year;
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Archivio Scommesse</h1>
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  const monthlyStats = groupBetsByMonth(bets);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Archivio Scommesse</h1>
        <p className="text-muted-foreground">
          Storico delle tue scommesse organizzato per mese
        </p>
      </div>

      {bets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Non hai ancora aggiunto scommesse.</p>
            <p className="text-sm mt-2 text-muted-foreground">Vai alla sezione "Nuova Scommessa" per iniziare.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {monthlyStats.map((month) => {
            const monthKey = `${month.month}-${month.year}`;
            const isOpen = openMonths.includes(monthKey);
            const monthBets = getBetsForMonth(month.month, month.year);

            return (
              <Card key={monthKey}>
                <Collapsible>
                  <CollapsibleTrigger 
                    onClick={() => toggleMonth(monthKey)}
                    className="w-full"
                  >
                    <CardHeader className="hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <CardTitle className="capitalize">
                            {month.month} {month.year}
                          </CardTitle>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className={`text-xl font-bold ${
                              month.profit >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(month.profit)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {month.betsCount} scommesse • {month.winRate.toFixed(1)}% vincite
                            </div>
                          </div>
                          <Badge variant={month.profit >= 0 ? "default" : "destructive"} className={
                            month.profit >= 0 ? "bg-green-100 text-green-800" : ""
                          }>
                            {month.profit >= 0 ? "Positivo" : "Negativo"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {monthBets.map((bet) => (
                          <div 
                            key={bet.id} 
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => handleEditBet(bet)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div>
                                  {bet.manifestation && (
                                    <div className="text-xs text-muted-foreground font-medium mb-1">
                                      {bet.manifestation}
                                    </div>
                                  )}
                                  <div className="font-medium">{bet.event}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {bet.sport || bet.bet_type} • Quote {bet.odds}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(bet.date).toLocaleDateString('it-IT')}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="font-medium">
                                Puntata: {formatCurrency(bet.stake)}
                              </div>
                              {bet.payout && (
                                <div className="text-sm text-muted-foreground">
                                  Vincita: {formatCurrency(bet.payout)}
                                </div>
                              )}
                              {bet.status === 'cashout' && bet.cashout_amount && (
                                <div className="text-sm text-muted-foreground">
                                  Cashout: {formatCurrency(bet.cashout_amount)}
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={bet.status === 'won' ? 'default' : bet.status === 'lost' ? 'destructive' : bet.status === 'cashout' ? 'secondary' : 'secondary'}
                                  className={bet.status === 'won' ? 'bg-green-100 text-green-800' : ''}
                                >
                                  {bet.status === 'won' ? 'Vinta' : 
                                   bet.status === 'lost' ? 'Persa' : 
                                   bet.status === 'cashout' ? 'Cashout' : 'In attesa'}
                                </Badge>
                                <span className={`font-bold ${
                                  bet.profit && bet.profit > 0 ? 'text-green-600' : 
                                  bet.profit && bet.profit < 0 ? 'text-red-600' : 'text-muted-foreground'
                                }`}>
                                  {bet.profit ? formatCurrency(bet.profit) : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      <EditBetDialog 
        bet={selectedBet}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onBetUpdated={handleBetUpdated}
      />
    </div>
  );
};

export default Archive;
