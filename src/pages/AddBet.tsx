
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const AddBet = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    sport: "",
    event: "",
    betType: "",
    odds: "",
    stake: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione form
    if (!formData.sport || !formData.event || !formData.odds || !formData.stake) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    // Qui normalmente salveresti i dati
    console.log("Nuova scommessa:", formData);
    
    toast({
      title: "Scommessa aggiunta!",
      description: "La tua scommessa è stata salvata con successo"
    });

    // Reset form
    setFormData({
      sport: "",
      event: "",
      betType: "",
      odds: "",
      stake: "",
      notes: ""
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Nuova Scommessa</h1>
        <p className="text-muted-foreground">
          Aggiungi una nuova scommessa al tuo portafoglio
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dettagli Scommessa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sport">Sport *</Label>
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
                <Label htmlFor="betType">Tipo Scommessa</Label>
                <Select value={formData.betType} onValueChange={(value) => handleInputChange("betType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1x2">1X2</SelectItem>
                    <SelectItem value="over-under">Over/Under</SelectItem>
                    <SelectItem value="handicap">Handicap</SelectItem>
                    <SelectItem value="vincente">Vincente</SelectItem>
                    <SelectItem value="doppia-chance">Doppia Chance</SelectItem>
                    <SelectItem value="combo">Combo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

            {formData.odds && formData.stake && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Vincita potenziale:</span>
                  <span className="font-bold text-green-600">
                    €{(parseFloat(formData.odds) * parseFloat(formData.stake)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-muted-foreground">Profitto potenziale:</span>
                  <span className="font-bold text-green-600">
                    €{(parseFloat(formData.odds) * parseFloat(formData.stake) - parseFloat(formData.stake)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full">
              Salva Scommessa
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBet;
