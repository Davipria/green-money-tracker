
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

interface EditBetDialogProps {
  bet: Bet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBetUpdated: () => void;
}

const EditBetDialog = ({ bet, open, onOpenChange, onBetUpdated }: EditBetDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    bookmaker: "",
    tipster: "",
    timing: "prematch" as 'prematch' | 'live',
    stake: "",
    notes: "",
    status: "pending" as 'pending' | 'won' | 'lost' | 'cashout',
    cashoutAmount: "",
    sport: "",
    event: "",
    manifestation: "",
    odds: "",
    selection: "",
  });

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
      });
    }
  }, [bet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bet) return;

    if (!formData.date || !formData.bookmaker || !formData.stake || !formData.event) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
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
      // Calcola payout e profit in base allo stato
      let payout = null;
      let profit = null;
      
      if (formData.status === 'won') {
        payout = parseFloat(formData.odds) * parseFloat(formData.stake);
        profit = payout - parseFloat(formData.stake);
      } else if (formData.status === 'lost') {
        profit = -parseFloat(formData.stake);
      } else if (formData.status === 'cashout' && formData.cashoutAmount) {
        payout = parseFloat(formData.cashoutAmount);
        profit = parseFloat(formData.cashoutAmount) - parseFloat(formData.stake);
      }

      const updateData = {
        date: formData.date,
        sport: formData.sport || null,
        event: formData.event,
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
        selection: formData.selection || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('bets')
        .update(updateData)
        .eq('id', bet.id);

      if (error) {
        console.error('Errore durante l\'aggiornamento:', error);
        toast({
          title: "Errore",
          description: "Errore durante l'aggiornamento della scommessa",
          variant: "destructive"
        });
        return;
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

  if (!bet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifica Scommessa</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <SelectContent>
                  <SelectItem value="bet365">Bet365</SelectItem>
                  <SelectItem value="william-hill">William Hill</SelectItem>
                  <SelectItem value="betfair">Betfair</SelectItem>
                  <SelectItem value="unibet">Unibet</SelectItem>
                  <SelectItem value="bwin">Bwin</SelectItem>
                  <SelectItem value="betway">Betway</SelectItem>
                  <SelectItem value="eurobet">Eurobet</SelectItem>
                  <SelectItem value="sisal">Sisal</SelectItem>
                  <SelectItem value="altro">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="selection">Selezione</Label>
              <Input
                id="selection"
                placeholder="Es. 1, Over 2.5, ecc."
                value={formData.selection}
                onChange={(e) => handleInputChange("selection", e.target.value)}
              />
            </div>

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
              <Select value={formData.status} onValueChange={(value: 'pending' | 'won' | 'lost' | 'cashout') => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">In Attesa</SelectItem>
                  <SelectItem value="won">Vinta</SelectItem>
                  <SelectItem value="lost">Persa</SelectItem>
                  <SelectItem value="cashout">Cashout</SelectItem>
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
