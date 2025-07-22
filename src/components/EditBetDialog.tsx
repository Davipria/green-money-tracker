import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bet } from "@/types/bet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { List, Plus, Trash2 } from "lucide-react";

interface BetSelection {
  id: string;
  sport?: string;
  event: string;
  odds: number;
  selection?: string;
  status?: 'pending' | 'won' | 'lost' | 'void';
  payout?: number;
}

interface EditBetDialogProps {
  bet: Bet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBetUpdated: () => void;
}

const EditBetDialog = ({ bet, open, onOpenChange, onBetUpdated }: EditBetDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [betSelections, setBetSelections] = useState<BetSelection[]>([]);
  const [loadingSelections, setLoadingSelections] = useState(false);
  const [isMultipleBet, setIsMultipleBet] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    bookmaker: "",
    tipster: "",
    timing: "prematch" as 'prematch' | 'live',
    stake: "",
    notes: "",
    status: "pending" as 'pending' | 'won' | 'lost' | 'cashout' | 'void',
    cashoutAmount: "",
    sport: "",
    event: "",
    manifestation: "",
    odds: "",
    selection: "",
    multiple_title: "",
    bonus: "",
  });

  const bookmakers = [
    { value: "begamestar", label: "Begamestar" },
    { value: "bet365", label: "Bet365" },
    { value: "betfair", label: "Betfair" },
    { value: "betflag", label: "Betflag" },
    { value: "betic", label: "Betic" },
    { value: "domusbet", label: "DomusBet" },
    { value: "eurobet", label: "Eurobet" },
    { value: "goldbet", label: "Goldbet" },
    { value: "planetwin365", label: "Planetwin365" },
    { value: "sisal", label: "Sisal" },
    { value: "snai", label: "Snai" },
    { value: "unibet", label: "Unibet" },
    { value: "altro", label: "Altro" }
  ];

  // Fetch bet selections when dialog opens
  useEffect(() => {
    const fetchBetSelections = async () => {
      if (!bet?.id || !open) return;
      
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
          const typedSelections: BetSelection[] = (selections || []).map(selection => ({
            id: selection.id,
            sport: selection.sport || undefined,
            event: selection.event,
            odds: selection.odds,
            selection: selection.selection || undefined,
            status: (selection.status as 'pending' | 'won' | 'lost' | 'void') || 'pending',
            payout: selection.payout || undefined,
          }));
          setBetSelections(typedSelections);
          setIsMultipleBet(typedSelections.length > 1);
        }
      } catch (error) {
        console.error('Error fetching bet selections:', error);
      } finally {
        setLoadingSelections(false);
      }
    };

    fetchBetSelections();
  }, [bet?.id, open]);

  useEffect(() => {
    if (bet) {
      setFormData({
        date: bet.date,
        bookmaker: bet.bookmaker || "",
        tipster: bet.tipster || "",
        timing: (bet.timing as 'prematch' | 'live') || "prematch",
        stake: bet.stake.toString(),
        notes: bet.notes || "",
        status: bet.status,
        cashoutAmount: bet.cashout_amount?.toString() || "",
        sport: bet.sport || "",
        event: bet.event,
        manifestation: bet.manifestation || "",
        odds: bet.odds.toString(),
        selection: bet.selection || "",
        multiple_title: bet.multiple_title || "",
        bonus: bet.bonus?.toString() || "",
      });
    }
  }, [bet]);

  const addSelection = () => {
    const newSelection: BetSelection = {
      id: `temp-${Date.now()}`,
      sport: "",
      event: "",
      odds: 1.5,
      selection: "",
      status: 'pending'
    };
    setBetSelections([...betSelections, newSelection]);
    setIsMultipleBet(true);
  };

  const removeSelection = (index: number) => {
    const newSelections = betSelections.filter((_, i) => i !== index);
    setBetSelections(newSelections);
    setIsMultipleBet(newSelections.length > 1);
  };

  const updateSelection = (index: number, field: keyof BetSelection, value: string | number) => {
    const newSelections = [...betSelections];
    newSelections[index] = { ...newSelections[index], [field]: value };
    setBetSelections(newSelections);
    
    // Update total odds if this is a multiple bet
    if (isMultipleBet) {
      // Calculate odds only for non-void selections (void selections are ignored)
      const activeSelections = newSelections.filter(sel => sel.status !== 'void');
      const totalOdds = activeSelections.reduce((total, sel) => total * sel.odds, 1);
      setFormData(prev => ({ ...prev, odds: totalOdds.toFixed(2) }));
    }
  };

  const updateSelectionStatus = (index: number, status: 'pending' | 'won' | 'lost' | 'void') => {
    const newSelections = [...betSelections];
    newSelections[index] = { ...newSelections[index], status };
    setBetSelections(newSelections);

    // Auto-calculate overall bet status based on individual selections
    if (isMultipleBet) {
      // Filter out void selections (they don't count)
      const activeSelections = newSelections.filter(sel => sel.status !== 'void');
      
      // If all selections are void, the bet is void
      if (activeSelections.length === 0) {
        setFormData(prev => ({ ...prev, status: 'void' }));
        return;
      }
      
      // Check status of active selections only
      const allActiveWon = activeSelections.every(sel => sel.status === 'won');
      const anyActiveLost = activeSelections.some(sel => sel.status === 'lost');
      const allActiveFinished = activeSelections.every(sel => sel.status === 'won' || sel.status === 'lost');

      let overallStatus: 'pending' | 'won' | 'lost' | 'void' = 'pending';
      
      if (anyActiveLost) {
        // If any active selection is lost, the multiple is lost
        overallStatus = 'lost';
      } else if (allActiveWon) {
        // If all active selections are won, the multiple is won
        overallStatus = 'won';
      } else if (allActiveFinished) {
        // This shouldn't happen if logic is correct, but just in case
        overallStatus = 'pending';
      }
      // If not all active selections are finished, keep as pending

      setFormData(prev => ({ ...prev, status: overallStatus }));
      
      // Update odds to reflect only active selections
      const totalOdds = activeSelections.reduce((total, sel) => total * sel.odds, 1);
      setFormData(prev => ({ ...prev, odds: totalOdds.toFixed(2) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bet) return;

    if (!formData.date || !formData.bookmaker || !formData.stake) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    // Validation for multiple bets
    if (isMultipleBet) {
      if (betSelections.length < 2) {
        toast({
          title: "Errore",
          description: "Una scommessa multipla deve avere almeno 2 selezioni",
          variant: "destructive"
        });
        return;
      }

      const invalidSelections = betSelections.some(sel => !sel.event || sel.odds <= 0);
      if (invalidSelections) {
        toast({
          title: "Errore",
          description: "Tutte le selezioni devono avere evento e quote valide",
          variant: "destructive"
        });
        return;
      }
    } else {
      // Single bet validation
      if (!formData.event) {
        toast({
          title: "Errore",
          description: "Inserisci l'evento per la scommessa",
          variant: "destructive"
        });
        return;
      }
    }

    if (formData.status === 'cashout' && !formData.cashoutAmount) {
      toast({
        title: "Errore",
        description: "Inserisci l'importo del cashout",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate payout and profit based on status
      let payout = null;
      let profit = null;
      const bonus = formData.bonus ? parseFloat(formData.bonus) : 0;
      
      if (formData.status === 'won') {
        payout = parseFloat(formData.odds) * parseFloat(formData.stake);
        profit = payout - parseFloat(formData.stake) + bonus;
      } else if (formData.status === 'lost') {
        profit = -parseFloat(formData.stake);
      } else if (formData.status === 'cashout' && formData.cashoutAmount) {
        payout = parseFloat(formData.cashoutAmount);
        profit = parseFloat(formData.cashoutAmount) - parseFloat(formData.stake);
      } else if (formData.status === 'void') {
        payout = parseFloat(formData.stake);
        profit = 0;
      }

      const updateData = {
        date: formData.date,
        sport: isMultipleBet ? null : (formData.sport || null),
        event: isMultipleBet ? (formData.multiple_title || "Scommessa Multipla") : formData.event,
        manifestation: formData.manifestation || null,
        odds: parseFloat(formData.odds),
        stake: parseFloat(formData.stake),
        status: formData.status,
        payout,
        profit,
        cashout_amount: formData.status === 'cashout' ? parseFloat(formData.cashoutAmount) : null,
        notes: formData.notes || null,
        bookmaker: formData.bookmaker,
        tipster: formData.tipster || null,
        timing: formData.timing,
        selection: isMultipleBet ? null : (formData.selection || null),
        multiple_title: isMultipleBet ? (formData.multiple_title || null) : null,
        bonus: bonus > 0 ? bonus : null,
        updated_at: new Date().toISOString()
      };

      const { error: betError } = await supabase
        .from('bets')
        .update(updateData)
        .eq('id', bet.id);

      if (betError) {
        console.error('Errore durante l\'aggiornamento:', betError);
        toast({
          title: "Errore",
          description: "Errore durante l'aggiornamento della scommessa",
          variant: "destructive"
        });
        return;
      }

      // Update bet selections if it's a multiple bet
      if (isMultipleBet) {
        // Delete existing selections
        const { error: deleteError } = await supabase
          .from('bet_selections')
          .delete()
          .eq('bet_id', bet.id);

        if (deleteError) {
          console.error('Error deleting old selections:', deleteError);
        }

        // Insert new selections
        const selectionsToInsert = betSelections.map(selection => ({
          bet_id: bet.id,
          sport: selection.sport || null,
          event: selection.event,
          odds: selection.odds,
          selection: selection.selection || null,
          status: selection.status || 'pending',
          payout: selection.payout || null
        }));

        const { error: insertError } = await supabase
          .from('bet_selections')
          .insert(selectionsToInsert);

        if (insertError) {
          console.error('Error inserting selections:', insertError);
          toast({
            title: "Errore",
            description: "Errore durante l'aggiornamento delle selezioni",
            variant: "destructive"
          });
          return;
        }
      }

      toast({
        title: "Scommessa aggiornata!",
        description: "La scommessa è stata aggiornata con successo"
      });

      onBetUpdated();
      onOpenChange(false);

    } catch (error) {
      console.error('Errore imprevisto:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore imprevisto",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'void': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'won': return 'Vinta';
      case 'lost': return 'Persa';
      case 'void': return 'Annullata';
      default: return 'In Attesa';
    }
  };

  if (!bet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Modifica Scommessa</span>
            {isMultipleBet && (
              <Badge variant="outline" className="px-2 py-1 text-xs">
                <List className="w-3 h-3 mr-1" />
                Multipla
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookmaker">Bookmaker *</Label>
              <Select value={formData.bookmaker} onValueChange={(value) => handleInputChange("bookmaker", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona bookmaker" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {bookmakers.map((bookmaker) => (
                    <SelectItem key={bookmaker.value} value={bookmaker.value}>
                      {bookmaker.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Multiple Bet Selections */}
          {isMultipleBet && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <List className="w-5 h-5 text-blue-600" />
                    <Label className="text-base font-semibold">Selezioni Multipla</Label>
                    <div className="text-sm text-gray-500">
                      (Le selezioni annullate vengono ignorate nel calcolo)
                    </div>
                  </div>
                  <Button type="button" onClick={addSelection} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Aggiungi
                  </Button>
                </div>

                {loadingSelections ? (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-500">Caricamento selezioni...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {betSelections.map((selection, index) => (
                      <div key={selection.id} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                              {index + 1}
                            </span>
                            <Badge className={`px-2 py-1 text-xs ${getStatusColor(selection.status || 'pending')}`}>
                              {getStatusLabel(selection.status || 'pending')}
                            </Badge>
                            {selection.status === 'void' && (
                              <span className="text-xs text-gray-500 italic">
                                (Ignorata nel calcolo)
                              </span>
                            )}
                          </div>
                          {betSelections.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSelection(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                          <div className="space-y-2">
                            <Label>Sport</Label>
                            <Select 
                              value={selection.sport || ""} 
                              onValueChange={(value) => updateSelection(index, "sport", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona sport" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="calcio">Calcio</SelectItem>
                                <SelectItem value="tennis">Tennis</SelectItem>
                                <SelectItem value="basket">Basket</SelectItem>
                                <SelectItem value="formula1">Formula 1</SelectItem>
                                <SelectItem value="pallavolo">Pallavolo</SelectItem>
                                <SelectItem value="rugby">Rugby</SelectItem>
                                <SelectItem value="altro">Altro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Quote *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Es. 2.50"
                              value={selection.odds}
                              onChange={(e) => updateSelection(index, "odds", parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Esito Selezione</Label>
                            <Select 
                              value={selection.status || 'pending'} 
                              onValueChange={(value: 'pending' | 'won' | 'lost' | 'void') => updateSelectionStatus(index, value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">In Attesa</SelectItem>
                                <SelectItem value="won">Vinta</SelectItem>
                                <SelectItem value="lost">Persa</SelectItem>
                                <SelectItem value="void">Annullata</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Evento *</Label>
                            <Input
                              placeholder="Es. Inter vs Milan"
                              value={selection.event}
                              onChange={(e) => updateSelection(index, "event", e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Selezione</Label>
                            <Input
                              placeholder="Es. 1, Over 2.5, ecc."
                              value={selection.selection || ""}
                              onChange={(e) => updateSelection(index, "selection", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  <Label htmlFor="multiple_title">Titolo Multipla</Label>
                  <Input
                    id="multiple_title"
                    placeholder="Es. Tripla del Weekend"
                    value={formData.multiple_title}
                    onChange={(e) => handleInputChange("multiple_title", e.target.value)}
                  />
                </div>

                {/* Campo Bonus per Multiple */}
                <div className="mt-4 space-y-2">
                  <Label htmlFor="bonus">Bonus (€)</Label>
                  <Input
                    id="bonus"
                    type="number"
                    step="0.01"
                    placeholder="Es. 5.00"
                    value={formData.bonus}
                    onChange={(e) => handleInputChange("bonus", e.target.value)}
                  />
                  <div className="text-sm text-gray-500">
                    Importo aggiuntivo che verrà aggiunto al profitto se la scommessa è vinta
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Single Bet Fields */}
          {!isMultipleBet && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sport">Sport</Label>
                  <Select value={formData.sport} onValueChange={(value) => handleInputChange("sport", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona sport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="calcio">Calcio</SelectItem>
                      <SelectItem value="tennis">Tennis</SelectItem>
                      <SelectItem value="basket">Basket</SelectItem>
                      <SelectItem value="formula1">Formula 1</SelectItem>
                      <SelectItem value="pallavolo">Pallavolo</SelectItem>
                      <SelectItem value="rugby">Rugby</SelectItem>
                      <SelectItem value="altro">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="odds">Quote *</Label>
                  <Input
                    id="odds"
                    type="number"
                    step="0.01"
                    placeholder="Es. 2.50"
                    value={formData.odds}
                    onChange={(e) => handleInputChange("odds", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manifestation">Manifestazione</Label>
                <Input
                  id="manifestation"
                  placeholder="Es. Serie A, ATP Roma, Champions League..."
                  value={formData.manifestation}
                  onChange={(e) => handleInputChange("manifestation", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event">Evento *</Label>
                <Input
                  id="event"
                  placeholder="Es. Inter vs Milan"
                  value={formData.event}
                  onChange={(e) => handleInputChange("event", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="selection">Selezione</Label>
                <Input
                  id="selection"
                  placeholder="Es. 1, Over 2.5, ecc."
                  value={formData.selection}
                  onChange={(e) => handleInputChange("selection", e.target.value)}
                />
              </div>
            </>
          )}

          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stake">Puntata (€) *</Label>
              <Input
                id="stake"
                type="number"
                step="0.01"
                placeholder="Es. 50.00"
                value={formData.stake}
                onChange={(e) => handleInputChange("stake", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Quote Totali</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.odds}
                onChange={(e) => handleInputChange("odds", e.target.value)}
                disabled={isMultipleBet}
                className={isMultipleBet ? "bg-gray-100" : ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Timing</Label>
              <RadioGroup value={formData.timing} onValueChange={(value: 'prematch' | 'live') => handleInputChange("timing", value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="prematch" id="prematch" />
                  <Label htmlFor="prematch">Prematch</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="live" id="live" />
                  <Label htmlFor="live">Live</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Stato Scommessa</Label>
              <Select value={formData.status} onValueChange={(value: 'pending' | 'won' | 'lost' | 'cashout' | 'void') => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">In Attesa</SelectItem>
                  <SelectItem value="won">Vinta</SelectItem>
                  <SelectItem value="lost">Persa</SelectItem>
                  <SelectItem value="cashout">Cashout</SelectItem>
                  <SelectItem value="void">Annullata</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.status === 'cashout' && (
            <div className="space-y-2">
              <Label htmlFor="cashoutAmount">Importo Cashout (€) *</Label>
              <Input
                id="cashoutAmount"
                type="number"
                step="0.01"
                placeholder="Es. 75.00"
                value={formData.cashoutAmount}
                onChange={(e) => handleInputChange("cashoutAmount", e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tipster">Tipster</Label>
            <Input
              id="tipster"
              placeholder="Nome tipster (opzionale)"
              value={formData.tipster}
              onChange={(e) => handleInputChange("tipster", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              placeholder="Aggiungi note o strategie per questa scommessa..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Aggiornamento..." : "Aggiorna Scommessa"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBetDialog;
