import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, ChevronDown, ChevronRight, Edit2, Trash2 } from "lucide-react";
import { Bet } from "@/types/bet";
import { groupBetsByMonth, formatCurrency } from "@/utils/betUtils";
import BetDetailsDialog from "./BetDetailsDialog";
import EditBetDialog from "./EditBetDialog";

interface FilteredBetsViewProps {
  bets: Bet[];
  filterType: 'sport' | 'tipster';
  filterValue: string;
  onBack: () => void;
}

const FilteredBetsView = ({ bets, filterType, filterValue, onBack }: FilteredBetsViewProps) => {
  const [openMonths, setOpenMonths] = useState<string[]>([]);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [editingBet, setEditingBet] = useState<Bet | null>(null);

  const filteredBets = bets.filter(bet => {
    if (filterType === 'sport') {
      return bet.sport === filterValue || (!bet.sport && filterValue === 'Altro');
    }
    return (bet.tipster || 'Nessun tipster') === filterValue;
  });

  const monthlyStats = groupBetsByMonth(filteredBets);

  const toggleMonth = (monthKey: string) => {
    setOpenMonths(prev => 
      prev.includes(monthKey) 
        ? prev.filter(key => key !== monthKey)
        : [...prev, monthKey]
    );
  };

  const getBetsForMonth = (month: string, year: number) => {
    return filteredBets.filter(bet => {
      const betDate = new Date(bet.date);
      return betDate.getMonth() === new Date(`${month} 1, ${year}`).getMonth() && 
             betDate.getFullYear() === year;
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'won': return 'default';
      case 'lost': return 'destructive';
      case 'pending': return 'secondary';
      case 'void': return 'outline';
      case 'cashout': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'won': return 'Vinta';
      case 'lost': return 'Persa';
      case 'pending': return 'In corso';
      case 'void': return 'Void';
      case 'cashout': return 'Cashout';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Auto-expand the first month on component mount
  useEffect(() => {
    if (monthlyStats.length > 0 && openMonths.length === 0) {
      const firstMonthKey = `${monthlyStats[0].month}-${monthlyStats[0].year}`;
      setOpenMonths([firstMonthKey]);
    }
  }, [monthlyStats.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna all'analisi
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Scommesse {filterType === 'sport' ? 'per Sport' : 'per Tipster'}
            </h1>
            <p className="text-gray-600 text-lg">
              {filterType === 'sport' ? 'Sport' : 'Tipster'}: <span className="font-semibold">{filterValue}</span>
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{filteredBets.length}</div>
              <div className="text-sm text-gray-600">Scommesse totali</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {filteredBets.filter(bet => bet.status === 'won').length}
              </div>
              <div className="text-sm text-gray-600">Vinte</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {filteredBets.filter(bet => bet.status === 'lost').length}
              </div>
              <div className="text-sm text-gray-600">Perse</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${
                filteredBets.reduce((sum, bet) => sum + (bet.profit || 0), 0) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formatCurrency(filteredBets.reduce((sum, bet) => sum + (bet.profit || 0), 0))}
              </div>
              <div className="text-sm text-gray-600">Profitto totale</div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Breakdown */}
        <div className="space-y-4">
          {monthlyStats.map((monthData) => {
            const monthKey = `${monthData.month}-${monthData.year}`;
            const isOpen = openMonths.includes(monthKey);
            const monthBets = getBetsForMonth(monthData.month, monthData.year);

            return (
              <Card key={monthKey} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <Collapsible open={isOpen} onOpenChange={() => toggleMonth(monthKey)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {isOpen ? (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                          )}
                          <div>
                            <CardTitle className="text-xl">
                              {monthData.month} {monthData.year}
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                              {monthData.betsCount} scommesse
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-gray-700">{formatCurrency(monthData.totalStake)}</div>
                            <div className="text-gray-500">Stake</div>
                          </div>
                          <div className="text-center">
                            <div className={`font-semibold ${monthData.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(monthData.profit)}
                            </div>
                            <div className="text-gray-500">Profitto</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">{monthData.winRate.toFixed(1)}%</div>
                            <div className="text-gray-500">Win Rate</div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {monthBets
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((bet) => (
                          <div
                            key={bet.id}
                            className="p-4 border rounded-lg hover:bg-gray-50/50 transition-colors cursor-pointer"
                            onClick={() => setSelectedBet(bet)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge variant={getStatusBadgeVariant(bet.status)}>
                                    {getStatusText(bet.status)}
                                  </Badge>
                                  <span className="text-sm text-gray-500">{formatDate(bet.date)}</span>
                                  {bet.sport && (
                                    <Badge variant="outline" className="text-xs">
                                      {bet.sport}
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="font-semibold text-lg mb-1">{bet.event}</h3>
                                <div className="text-sm text-gray-600 mb-2">
                                  {bet.bet_type} • Quota: {bet.odds} • Stake: {formatCurrency(bet.stake)}
                                </div>
                                {bet.selection && (
                                  <p className="text-sm text-gray-700 mb-1">
                                    Selezione: {bet.selection}
                                  </p>
                                )}
                                {bet.notes && (
                                  <p className="text-sm text-gray-600 italic">
                                    {bet.notes}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  {bet.profit !== undefined && (
                                    <div className={`text-lg font-semibold ${
                                      bet.profit >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {formatCurrency(bet.profit)}
                                    </div>
                                  )}
                                  {bet.payout && (
                                    <div className="text-sm text-gray-500">
                                      Payout: {formatCurrency(bet.payout)}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingBet(bet);
                                    }}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </div>
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

        {filteredBets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Nessuna scommessa trovata per {filterType === 'sport' ? 'questo sport' : 'questo tipster'}.
            </p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {selectedBet && (
        <BetDetailsDialog
          bet={selectedBet}
          open={!!selectedBet}
          onOpenChange={() => setSelectedBet(null)}
          onEdit={() => {
            setEditingBet(selectedBet);
            setSelectedBet(null);
          }}
          onDelete={() => {
            // Handle delete if needed
            setSelectedBet(null);
          }}
        />
      )}

      {editingBet && (
        <EditBetDialog
          bet={editingBet}
          open={!!editingBet}
          onOpenChange={() => setEditingBet(null)}
          onBetUpdated={() => {
            setEditingBet(null);
            // Trigger a refresh of the parent component
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default FilteredBetsView;