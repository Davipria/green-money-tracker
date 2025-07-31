import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, groupBetsByMonth, calculateProfit } from "@/utils/betUtils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Archive as ArchiveIcon, Target, Calendar, TrendingUp, Trash2, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bet, MonthlyStats } from "@/types/bet";
import EditBetDialog from "@/components/EditBetDialog";
import ExportBetsDialog from "@/components/ExportBetsDialog";
import BetDetailsDialog from "@/components/BetDetailsDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Archive = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMonths, setOpenMonths] = useState<string[]>([]);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deletingBetId, setDeletingBetId] = useState<string | null>(null);
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
        // Sort bets: pending first, then by date (newest first)
        const sortedBets = (data || []).sort((a, b) => {
          // First, prioritize pending bets
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          
          // Then sort by date (newest first)
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        
        setBets(sortedBets as Bet[]);
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

  const handleViewBetDetails = (bet: Bet) => {
    setSelectedBet(bet);
    setDetailsDialogOpen(true);
  };

  const handleEditBet = () => {
    setDetailsDialogOpen(false);
    setEditDialogOpen(true);
  };

  const handleDeleteFromDetails = () => {
    if (selectedBet) {
      setDetailsDialogOpen(false);
      handleDeleteBet(selectedBet.id);
    }
  };

  const handleBetUpdated = () => {
    fetchBets();
  };

  const handleDeleteBet = async (betId: string) => {
    try {
      setDeletingBetId(betId);
      
      const { error } = await supabase
        .from('bets')
        .delete()
        .eq('id', betId);

      if (error) {
        console.error('Errore eliminazione scommessa:', error);
        toast({
          title: "Errore",
          description: "Impossibile eliminare la scommessa",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Successo",
          description: "Scommessa eliminata con successo",
        });
        fetchBets(); // Ricarica le scommesse
      }
    } catch (error) {
      console.error('Errore imprevisto:', error);
      toast({
        title: "Errore",
        description: "Errore imprevisto durante l'eliminazione",
        variant: "destructive"
      });
    } finally {
      setDeletingBetId(null);
    }
  };

  const getBetsForMonth = (month: string, year: number) => {
    return bets.filter(bet => {
      const betDate = new Date(bet.date);
      const betMonth = betDate.toLocaleDateString('it-IT', { month: 'long' });
      return betMonth === month && betDate.getFullYear() === year;
    }).sort((a, b) => {
      // Sort within month: pending first, then by date (newest first)
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

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
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const monthlyStats = groupBetsByMonth(bets);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <ArchiveIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Archivio Scommesse
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Storico delle tue scommesse organizzato per mese
          </p>
          
          {/* Export Button */}
          <div className="flex justify-center">
            <ExportBetsDialog 
              trigger={
                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Esporta in Excel</span>
                </Button>
              }
            />
          </div>
        </div>

        {bets.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                <ArchiveIcon className="w-12 h-12 text-gray-500" />
              </div>
              <p className="text-gray-500 text-lg font-medium mb-2">Non hai ancora aggiunto scommesse</p>
              <p className="text-gray-400">Vai alla sezione "Nuova Scommessa" per iniziare.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {monthlyStats.map((month) => {
              const monthKey = `${month.month}-${month.year}`;
              const isOpen = openMonths.includes(monthKey);
              const monthBets = getBetsForMonth(month.month, month.year);

              return (
                <Card key={monthKey} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <Collapsible>
                    <CollapsibleTrigger 
                      onClick={() => toggleMonth(monthKey)}
                      className="w-full"
                    >
                      <CardHeader className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 rounded-t-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                              {isOpen ? (
                                <ChevronDown className="h-5 w-5 text-white" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-white" />
                              )}
                            </div>
                            <CardTitle className="capitalize text-2xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                              {month.month} {month.year}
                            </CardTitle>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${
                                month.profit >= 0 ? 'text-emerald-600' : 'text-red-600'
                              }`}>
                                {formatCurrency(month.profit)}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center space-x-4">
                                <span className="flex items-center">
                                  <Target className="w-4 h-4 mr-1" />
                                  {month.betsCount} scommesse
                                </span>
                                <span className="flex items-center">
                                  <TrendingUp className="w-4 h-4 mr-1" />
                                  {month.winRate.toFixed(1)}% vincite
                                </span>
                              </div>
                            </div>
                            <Badge 
                              variant={month.profit >= 0 ? "default" : "destructive"} 
                              className={`px-4 py-2 text-sm font-medium ${
                                month.profit >= 0 ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : ""
                              }`}
                            >
                              {month.profit >= 0 ? "Positivo" : "Negativo"}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-6">
                        <div className="space-y-4">
                          {monthBets.map((bet) => (
                            <div key={bet.id} className="relative group">
                              <div 
                                className="cursor-pointer"
                                onClick={() => handleViewBetDetails(bet)}
                              >
                                <div className={`flex items-center justify-between p-6 border border-gray-100 rounded-xl hover:shadow-lg transition-all duration-300 group-hover:border-blue-200 group-hover:shadow-xl ${
                                  bet.status === 'pending' 
                                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                                    : 'bg-gradient-to-r from-gray-50 to-white'
                                }`}>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-semibold text-gray-900 text-lg mb-2">{bet.event}</div>
                                        <div className="text-sm text-gray-600 flex items-center space-x-4">
                                          {bet.sport && (
                                            <span className="flex items-center">
                                              <Target className="w-4 h-4 mr-1" />
                                              {bet.sport}
                                            </span>
                                          )}
                                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                            Quote {bet.odds}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-sm text-gray-500 mb-2 flex items-center">
                                          <Calendar className="w-4 h-4 mr-1" />
                                          {new Date(bet.date).toLocaleDateString('it-IT')}
                                        </div>
                                        <div className="font-semibold text-gray-900 text-lg mb-3">
                                          Puntata: {formatCurrency(bet.stake)}
                                        </div>
                                        <Badge 
                                          variant={bet.status === 'won' ? 'default' : bet.status === 'lost' ? 'destructive' : bet.status === 'cashout' ? 'secondary' : bet.status === 'void' ? 'outline' : 'secondary'}
                                          className={`px-3 py-1 font-medium ${
                                            bet.status === 'won' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 
                                            bet.status === 'void' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 
                                            bet.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''
                                          }`}
                                        >
                                          {bet.status === 'won' ? 'Vinta' : 
                                           bet.status === 'lost' ? 'Persa' : 
                                           bet.status === 'cashout' ? 'Cashout' : 
                                           bet.status === 'void' ? 'Annullata' : 'In attesa'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Delete Button */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Elimina Scommessa</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Sei sicuro di voler eliminare questa scommessa? Questa azione non può essere annullata.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteBet(bet.id)}
                                      disabled={deletingBetId === bet.id}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      {deletingBetId === bet.id ? "Eliminazione..." : "Elimina"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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

        <BetDetailsDialog 
          bet={selectedBet}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          onEdit={handleEditBet}
          onDelete={handleDeleteFromDetails}
        />

        <EditBetDialog 
          bet={selectedBet}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onBetUpdated={handleBetUpdated}
        />
      </div>
    </div>
  );
};

export default Archive;
