import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface SingleBet {
  id: string;
  sport: string;
  event: string;
  odds: string;
  selection: string;
}

const AddBet = () => {
  const { toast } = useToast();
  const [betType, setBetType] = useState<'single' | 'multiple' | 'system' | 'exchange'>('single');
  const [exchangeType, setExchangeType] = useState<'back' | 'lay'>('back');
  
  const [formData, setFormData] = useState({
    // Campi comuni
    date: new Date().toISOString().split('T')[0],
    bookmaker: "",
    tipster: "",
    timing: "prematch" as 'prematch' | 'live',
    stake: "",
    notes: "",
    status: "pending" as 'pending' | 'won' | 'lost' | 'cashout',
    cashoutAmount: "",
    
    // Scommessa singola
    sport: "",
    event: "",
    odds: "",
    selection: "",
    
    // Multipla/Sistema
    multipleTitle: "",
    systemType: "",
    
    // Exchange
    liability: "",
    commission: ""
  });

  const [multipleBets, setMultipleBets] = useState<SingleBet[]>([
    { id: '1', sport: '', event: '', odds: '', selection: '' }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione base
    if (!formData.date || !formData.bookmaker || !formData.stake) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    // Validazione cashout
    if (formData.status === 'cashout' && !formData.cashoutAmount) {
      toast({
        title: "Errore",
        description: "Inserisci l'importo del cashout",
        variant: "destructive"
      });
      return;
    }

    // Validazione specifica per tipo
    if (betType === 'single' && (!formData.sport || !formData.event || !formData.odds)) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi della scommessa singola",
        variant: "destructive"
      });
      return;
    }

    if ((betType === 'multiple' || betType === 'system') && !formData.multipleTitle) {
      toast({
        title: "Errore",
        description: "Inserisci il titolo della scommessa",
        variant: "destructive"
      });
      return;
    }

    const betData = {
      ...formData,
      betType,
      exchangeType: betType === 'exchange' ? exchangeType : undefined,
      bets: betType === 'multiple' || betType === 'system' ? multipleBets : undefined
    };

    console.log("Nuova scommessa:", betData);
    
    toast({
      title: "Scommessa aggiunta!",
      description: "La tua scommessa è stata salvata con successo"
    });

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      bookmaker: "",
      tipster: "",
      timing: "prematch",
      stake: "",
      notes: "",
      status: "pending",
      cashoutAmount: "",
      sport: "",
      event: "",
      odds: "",
      selection: "",
      multipleTitle: "",
      systemType: "",
      liability: "",
      commission: ""
    });
    setMultipleBets([{ id: '1', sport: '', event: '', odds: '', selection: '' }]);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addBetToMultiple = () => {
    const newId = (multipleBets.length + 1).toString();
    setMultipleBets([...multipleBets, { id: newId, sport: '', event: '', odds: '', selection: '' }]);
  };

  const removeBetFromMultiple = (id: string) => {
    if (multipleBets.length > 1) {
      setMultipleBets(multipleBets.filter(bet => bet.id !== id));
    }
  };

  const updateMultipleBet = (id: string, field: string, value: string) => {
    setMultipleBets(multipleBets.map(bet => 
      bet.id === id ? { ...bet, [field]: value } : bet
    ));
  };

  const calculatePotentialWin = () => {
    if (betType === 'single' && formData.odds && formData.stake) {
      return parseFloat(formData.odds) * parseFloat(formData.stake);
    }
    if ((betType === 'multiple' || betType === 'system') && formData.stake) {
      const totalOdds = multipleBets.reduce((acc, bet) => {
        return bet.odds ? acc * parseFloat(bet.odds) : acc;
      }, 1);
      return totalOdds * parseFloat(formData.stake);
    }
    return 0;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
            {/* Tipo di Scommessa */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Tipo di Scommessa *</Label>
              <RadioGroup value={betType} onValueChange={(value: 'single' | 'multiple' | 'system' | 'exchange') => setBetType(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single">Singola</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="multiple" id="multiple" />
                  <Label htmlFor="multiple">Multipla</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system">Sistema</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="exchange" id="exchange" />
                  <Label htmlFor="exchange">Exchange</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Exchange Type */}
            {betType === 'exchange' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Tipo Exchange</Label>
                <RadioGroup value={exchangeType} onValueChange={(value: 'back' | 'lay') => setExchangeType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="back" id="back" />
                    <Label htmlFor="back">Punta (Back)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lay" id="lay" />
                    <Label htmlFor="lay">Banca (Lay)</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Campi Comuni */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="tipster">Tipster</Label>
                <Input
                  id="tipster"
                  placeholder="Nome tipster (opzionale)"
                  value={formData.tipster}
                  onChange={(e) => handleInputChange("tipster", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Campo Importo Cashout */}
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

            {/* Scommessa Singola */}
            {betType === 'single' && (
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Dettagli Scommessa Singola</h3>
                
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
              </div>
            )}

            {/* Multipla/Sistema */}
            {(betType === 'multiple' || betType === 'system') && (
              <div className="space-y-4 border-t pt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    {betType === 'multiple' ? 'Dettagli Multipla' : 'Dettagli Sistema'}
                  </h3>
                  <Button type="button" onClick={addBetToMultiple} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Aggiungi Scommessa
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="multipleTitle">Titolo Scommessa *</Label>
                  <Input
                    id="multipleTitle"
                    placeholder="Es. Combo Serie A del weekend"
                    value={formData.multipleTitle}
                    onChange={(e) => handleInputChange("multipleTitle", e.target.value)}
                  />
                </div>

                {betType === 'system' && (
                  <div className="space-y-2">
                    <Label htmlFor="systemType">Tipo Sistema</Label>
                    <Select value={formData.systemType} onValueChange={(value) => handleInputChange("systemType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona tipo sistema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2-3">Sistema 2/3</SelectItem>
                        <SelectItem value="2-4">Sistema 2/4</SelectItem>
                        <SelectItem value="3-4">Sistema 3/4</SelectItem>
                        <SelectItem value="2-5">Sistema 2/5</SelectItem>
                        <SelectItem value="3-5">Sistema 3/5</SelectItem>
                        <SelectItem value="4-5">Sistema 4/5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Lista Scommesse */}
                <div className="space-y-4">
                  {multipleBets.map((bet, index) => (
                    <Card key={bet.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">Scommessa #{index + 1}</CardTitle>
                          {multipleBets.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBetFromMultiple(bet.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Sport</Label>
                            <Select value={bet.sport} onValueChange={(value) => updateMultipleBet(bet.id, "sport", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona sport" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="calcio">Calcio</SelectItem>
                                <SelectItem value="tennis">Tennis</SelectItem>
                                <SelectItem value="basket">Basket</SelectItem>
                                <SelectItem value="formula1">Formula 1</SelectItem>
                                <SelectItem value="altro">Altro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Quote</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Es. 2.50"
                              value={bet.odds}
                              onChange={(e) => updateMultipleBet(bet.id, "odds", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Evento</Label>
                          <Input
                            placeholder="Es. Inter vs Milan"
                            value={bet.event}
                            onChange={(e) => updateMultipleBet(bet.id, "event", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Selezione</Label>
                          <Input
                            placeholder="Es. 1, Over 2.5"
                            value={bet.selection}
                            onChange={(e) => updateMultipleBet(bet.id, "selection", e.target.value)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Exchange Fields */}
            {betType === 'exchange' && (
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Dettagli Exchange</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exchangeType === 'lay' && (
                    <div className="space-y-2">
                      <Label htmlFor="liability">Responsabilità (€)</Label>
                      <Input
                        id="liability"
                        type="number"
                        step="0.01"
                        placeholder="Es. 250.00"
                        value={formData.liability}
                        onChange={(e) => handleInputChange("liability", e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="commission">Commissione (%)</Label>
                    <Input
                      id="commission"
                      type="number"
                      step="0.1"
                      placeholder="Es. 5.0"
                      value={formData.commission}
                      onChange={(e) => handleInputChange("commission", e.target.value)}
                    />
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
                    <Label htmlFor="selection">Selezione</Label>
                    <Input
                      id="selection"
                      placeholder="Es. Inter vittoria"
                      value={formData.selection}
                      onChange={(e) => handleInputChange("selection", e.target.value)}
                    />
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
              </div>
            )}

            {/* Note */}
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

            {/* Calcolo Vincita Potenziale */}
            {formData.stake && calculatePotentialWin() > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Vincita potenziale:</span>
                  <span className="font-bold text-green-600">
                    €{calculatePotentialWin().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-muted-foreground">Profitto potenziale:</span>
                  <span className="font-bold text-green-600">
                    €{(calculatePotentialWin() - parseFloat(formData.stake || '0')).toFixed(2)}
                  </span>
                </div>
                {formData.status === 'cashout' && formData.cashoutAmount && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-muted-foreground">Importo cashout:</span>
                    <span className="font-bold text-blue-600">
                      €{formData.cashoutAmount}
                    </span>
                  </div>
                )}
                {betType === 'exchange' && exchangeType === 'lay' && formData.liability && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-muted-foreground">Responsabilità:</span>
                    <span className="font-bold text-red-600">
                      €{formData.liability}
                    </span>
                  </div>
                )}
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
