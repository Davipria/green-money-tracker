
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/betUtils";
import { Edit, Trash2, Calendar, Target, TrendingUp, User, Clock, BookOpen, FileText, DollarSign, Percent, List, Gift } from "lucide-react";
import { Bet } from "@/types/bet";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BetSelection {
  id: string;
  sport?: string;
  event: string;
  odds: number;
  selection?: string;
}

interface BetDetailsDialogProps {
  bet: Bet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const BetDetailsDialog = ({ bet, open, onOpenChange, onEdit, onDelete }: BetDetailsDialogProps) => {
  const [bankroll, setBankroll] = useState<number>(1000);
  const [betSelections, setBetSelections] = useState<BetSelection[]>([]);
  const [loadingSelections, setLoadingSelections] = useState(false);

  useEffect(() => {
    const fetchBankroll = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('bankroll')
          .eq('id', user.user.id)
          .single();

        if (profile?.bankroll) {
          setBankroll(profile.bankroll);
        }
      } catch (error) {
        console.error('Error fetching bankroll:', error);
      }
    };

    const fetchBetSelections = async () => {
      if (!bet?.id) return;
      
      try {
        setLoadingSelections(true);
        const { data: selections, error } = await supabase
          .from('bet_selections')
          .select('*')
          .eq('bet_id', bet.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching bet selections:', error);
        } else {
          setBetSelections(selections || []);
        }
      } catch (error) {
        console.error('Error fetching bet selections:', error);
      } finally {
        setLoadingSelections(false);
      }
    };

    if (open && bet) {
      fetchBankroll();
      fetchBetSelections();
    }
  }, [open, bet]);

  if (!bet) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      won: { label: "Vinta", variant: "default" as const, className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" },
      lost: { label: "Persa", variant: "destructive" as const, className: "" },
      pending: { label: "In Attesa", variant: "secondary" as const, className: "" },
      cashout: { label: "Cashout", variant: "secondary" as const, className: "" },
      void: { label: "Annullata", variant: "outline" as const, className: "bg-gray-100 text-gray-700 hover:bg-gray-200" }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const statusConfig = getStatusBadge(bet.status);

  const calculateProfit = (): number => {
    if (bet.status === 'won' && bet.payout) {
      const baseProfit = bet.payout - bet.stake;
      const bonus = bet.bonus || 0;
      return baseProfit + bonus;
    } else if (bet.status === 'lost') {
      return -bet.stake;
    } else if (bet.status === 'cashout' && bet.cashout_amount) {
      return bet.cashout_amount - bet.stake;
    } else if (bet.status === 'void') {
      return 0; // Scommesse annullate hanno profitto 0
    }
    return 0;
  };

  const calculateStakePercentage = (): number => {
    return (bet.stake / bankroll) * 100;
  };

  const isMultipleBet = betSelections.length > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dettagli Scommessa
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status and Main Info */}
          <Card className="bg-gradient-to-r from-gray-50 to-white border-gray-100">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{bet.event}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={statusConfig.variant}
                      className={`px-3 py-1 font-medium ${statusConfig.className}`}
                    >
                      {statusConfig.label}
                    </Badge>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(bet.date).toLocaleDateString('it-IT')}
                    </span>
                    {isMultipleBet && (
                      <Badge variant="outline" className="px-2 py-1 text-xs">
                        <List className="w-3 h-3 mr-1" />
                        Multipla
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${calculateProfit() >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(calculateProfit())}
                  </div>
                  <div className="text-sm text-gray-500">Profitto</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Multiple Bet Selections */}
          {isMultipleBet && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <List className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-700">Selezioni Multipla</span>
                </div>
                {loadingSelections ? (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-500">Caricamento selezioni...</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {betSelections.map((selection, index) => (
                      <div key={selection.id} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                {index + 1}
                              </span>
                              {selection.sport && (
                                <Badge variant="outline" className="text-xs">
                                  {selection.sport}
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">{selection.event}</h4>
                            {selection.selection && (
                              <p className="text-sm text-gray-600">{selection.selection}</p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <span className="text-lg font-semibold text-gray-900">@{selection.odds}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Bet Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sport & Competition */}
            {bet.sport && !isMultipleBet && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Sport</span>
                  </div>
                  <p className="text-gray-900 capitalize">{bet.sport}</p>
                </CardContent>
              </Card>
            )}

            {bet.manifestation && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Manifestazione</span>
                  </div>
                  <p className="text-gray-900">{bet.manifestation}</p>
                </CardContent>
              </Card>
            )}

            {/* Selection & Odds - Only show for single bets */}
            {bet.selection && !isMultipleBet && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Selezione</span>
                  </div>
                  <p className="text-gray-900">{bet.selection}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-700">
                    {isMultipleBet ? 'Quota Totale' : 'Quote'}
                  </span>
                </div>
                <p className="text-gray-900 text-lg font-semibold">{bet.odds}</p>
              </CardContent>
            </Card>

            {/* Stake & Stake Percentage */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Percent className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-700">Puntata</span>
                </div>
                <p className="text-gray-900 text-lg font-semibold">{formatCurrency(bet.stake)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Percent className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-700">Stake</span>
                </div>
                <p className="text-gray-900 text-lg font-semibold">{calculateStakePercentage().toFixed(2)}%</p>
              </CardContent>
            </Card>

            {bet.payout && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-700">Vincita Potenziale</span>
                  </div>
                  <p className="text-gray-900 text-lg font-semibold">{formatCurrency(bet.payout)}</p>
                </CardContent>
              </Card>
            )}

            {/* Bonus - Show only if present */}
            {bet.bonus && bet.bonus > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Gift className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-700">Bonus</span>
                  </div>
                  <p className="text-gray-900 text-lg font-semibold">{formatCurrency(bet.bonus)}</p>
                </CardContent>
              </Card>
            )}

            {/* Bookmaker & Tipster */}
            {bet.bookmaker && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Bookmaker</span>
                  </div>
                  <p className="text-gray-900 capitalize">{bet.bookmaker}</p>
                </CardContent>
              </Card>
            )}

            {bet.tipster && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Tipster</span>
                  </div>
                  <p className="text-gray-900">{bet.tipster}</p>
                </CardContent>
              </Card>
            )}

            {/* Timing */}
            {bet.timing && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Timing</span>
                  </div>
                  <p className="text-gray-900 capitalize">
                    {bet.timing === 'prematch' ? 'Prematch' : 'Live'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Multiple Title */}
            {bet.multiple_title && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <List className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Titolo Multipla</span>
                  </div>
                  <p className="text-gray-900">{bet.multiple_title}</p>
                </CardContent>
              </Card>
            )}

            {/* Cashout Amount */}
            {bet.status === 'cashout' && bet.cashout_amount && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-gray-700">Importo Cashout</span>
                  </div>
                  <p className="text-gray-900 text-lg font-semibold">{formatCurrency(bet.cashout_amount)}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Notes */}
          {bet.notes && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-700">Note</span>
                </div>
                <p className="text-gray-900 whitespace-pre-wrap">{bet.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={onEdit}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Edit className="w-5 h-5" />
              <span>Modifica Scommessa</span>
            </Button>
            <Button 
              onClick={onDelete}
              variant="destructive"
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-5 h-5" />
              <span>Elimina Scommessa</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BetDetailsDialog;
