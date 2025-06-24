import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, TrendingUp, Calculator, DollarSign, Target, Calendar, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface SingleBet {
  id: string;
  sport: string;
  event: string;
  odds: string;
  selection: string;
}

const AddBet = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [betType, setBetType] = useState<'single' | 'multiple' | 'system' | 'exchange'>('single');
  const [exchangeType, setExchangeType] = useState<'back' | 'lay'>('back');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bankroll, setBankroll] = useState<string>("1000");
  
  const [formData, setFormData] = useState({
    // Campi comuni
    date: new Date().toISOString().split('T')[0],
    bookmaker: "",
    tipster: "",
    timing: "prematch" as 'prematch' | 'live',
    stake: "",
    stakePercentage: "",
    notes: "",
    status: "pending" as 'pending' | 'won' | 'lost' | 'cashout',
    cashoutAmount: "",
    
    // Scommessa singola
    sport: "",
    manifestation: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
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
        profit = payout - parseFloat(formData.stake);
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Errore",
          description: "Devi essere autenticato per salvare una scommessa",
          variant: "destructive"
        });
        return;
      }

      // Prepara i dati per il database
      const betData = {
        user_id: user.user.id,
        date: formData.date,
        sport: betType === 'single' ? formData.sport : null,
        manifestation: betType === 'single' ? formData.manifestation : null,
        event: betType === 'single' ? formData.event : formData.multipleTitle,
        bet_type: betType,
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
        selection: betType === 'single' ? formData.selection : null,
        multiple_title: (betType === 'multiple' || betType === 'system') ? formData.multipleTitle : null,
        system_type: betType === 'system' ? formData.systemType : null,
        liability: betType === 'exchange' && exchangeType === 'lay' ? parseFloat(formData.liability) : null,
        commission: betType === 'exchange' ? parseFloat(formData.commission) : null,
        exchange_type: betType === 'exchange' ? exchangeType : null
      };

      // Inserisci la scommessa principale
      const { data: bet, error } = await supabase
        .from('bets')
        .insert(betData)
        .select()
        .single();

      if (error) {
        console.error('Errore durante il salvataggio:', error);
        toast({
          title: "Errore",
          description: "Errore durante il salvataggio della scommessa",
          variant: "destructive"
        });
        return;
      }

      // Se è una multipla o sistema, salva le selezioni
      if ((betType === 'multiple' || betType === 'system') && bet) {
        const selections = multipleBets
          .filter(b => b.sport && b.event && b.odds)
          .map(b => ({
            bet_id: bet.id,
            sport: b.sport,
            event: b.event,
            odds: parseFloat(b.odds),
            selection: b.selection || null
          }));

        if (selections.length > 0) {
          const { error: selectionsError } = await supabase
            .from('bet_selections')
            .insert(selections);

          if (selectionsError) {
            console.error('Errore durante il salvataggio delle selezioni:', selectionsError);
          }
        }
      }

      toast({
        title: "Scommessa salvata!",
        description: "La tua scommessa è stata salvata con successo"
      });

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        bookmaker: "",
        tipster: "",
        timing: "prematch",
        stake: "",
        stakePercentage: "",
        notes: "",
        status: "pending",
        cashoutAmount: "",
        sport: "",
        manifestation: "",
        event: "",
        odds: "",
        selection: "",
        multipleTitle: "",
        systemType: "",
        liability: "",
        commission: ""
      });
      setMultipleBets([{ id: '1', sport: '', event: '', odds: '', selection: '' }]);

      // Reindirizza all'archivio corretto
      navigate('/app/archive');

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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStakeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      stake: value,
      stakePercentage: bankroll && value ? ((parseFloat(value) / parseFloat(bankroll)) * 100).toFixed(2) : ""
    }));
  };

  const handleStakePercentageChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      stakePercentage: value,
      stake: bankroll && value ? ((parseFloat(value) * parseFloat(bankroll)) / 100).toFixed(2) : ""
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

  const betTypeOptions = [
    { value: 'single', label: 'Singola', icon: Target, description: 'Una scommessa su un singolo evento' },
    { value: 'multiple', label: 'Multipla', icon: TrendingUp, description: 'Combina più selezioni in una scommessa' },
    { value: 'system', label: 'Sistema', icon: Calculator, description: 'Sistema di scommesse con garanzie' },
    { value: 'exchange', label: 'Exchange', icon: DollarSign, description: 'Punta o banca su betting exchange' }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-6">
            <Plus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Nuova Scommessa
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aggiungi una nuova scommessa al tuo portafoglio e monitora le tue performance
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Bet Type Selection */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tipo di Scommessa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {betTypeOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <div
                      key={option.value}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        betType === option.value
                          ? 'border-primary shadow-md'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                      onClick={() => setBetType(option.value as any)}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className={`p-3 rounded-full ${
                          betType === option.value ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{option.label}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="betType"
                        value={option.value}
                        checked={betType === option.value}
                        onChange={() => setBetType(option.value as any)}
                        className="absolute top-3 right-3"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Exchange Type */}
              {betType === 'exchange' && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <Label className="text-base font-semibold mb-3 block">Tipo Exchange</Label>
                  <RadioGroup value={exchangeType} onValueChange={(value: 'back' | 'lay') => setExchangeType(value)}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-3 rounded-lg border-2 ${exchangeType === 'back' ? 'border-green-500' : 'border-border'}`}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="back" id="back" />
                          <Label htmlFor="back" className="font-medium">Punta (Back)</Label>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg border-2 ${exchangeType === 'lay' ? 'border-red-500' : 'border-border'}`}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="lay" id="lay" />
                          <Label htmlFor="lay" className="font-medium">Banca (Lay)</Label>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informazioni Base
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Bankroll */}
              <div className="p-4 bg-muted rounded-lg border">
                <Label htmlFor="bankroll" className="text-base font-semibold flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4" />
                  Bankroll (€)
                </Label>
                <Input
                  id="bankroll"
                  type="number"
                  step="0.01"
                  placeholder="Es. 1000.00"
                  value={bankroll}
                  onChange={(e) => setBankroll(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-base font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bookmaker" className="text-base font-medium">Bookmaker *</Label>
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
                  <Label htmlFor="tipster" className="text-base font-medium">Tipster</Label>
                  <Input
                    id="tipster"
                    placeholder="Nome tipster (opzionale)"
                    value={formData.tipster}
                    onChange={(e) => handleInputChange("tipster", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Timing</Label>
                  <RadioGroup value={formData.timing} onValueChange={(value: 'prematch' | 'live') => handleInputChange("timing", value)}>
                    <div className="grid grid-cols-1 gap-2">
                      <div className={`p-3 rounded-lg border-2 ${formData.timing === 'prematch' ? 'border-primary' : 'border-border'}`}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="prematch" id="prematch" />
                          <Label htmlFor="prematch" className="font-medium">Prematch</Label>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg border-2 ${formData.timing === 'live' ? 'border-red-500' : 'border-border'}`}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="live" id="live" />
                          <Label htmlFor="live" className="font-medium">Live</Label>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stake" className="text-base font-medium">Puntata (€) *</Label>
                  <Input
                    id="stake"
                    type="number"
                    step="0.01"
                    placeholder="Es. 50.00"
                    value={formData.stake}
                    onChange={(e) => handleStakeChange(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stakePercentage" className="text-base font-medium">Stake (%) *</Label>
                  <Input
                    id="stakePercentage"
                    type="number"
                    step="0.01"
                    placeholder="Es. 5.00"
                    value={formData.stakePercentage}
                    onChange={(e) => handleStakePercentageChange(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Stato Scommessa</Label>
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
                <div className="p-4 bg-muted rounded-lg border">
                  <Label htmlFor="cashoutAmount" className="text-base font-medium">Importo Cashout (€) *</Label>
                  <Input
                    id="cashoutAmount"
                    type="number"
                    step="0.01"
                    placeholder="Es. 75.00"
                    value={formData.cashoutAmount}
                    onChange={(e) => handleInputChange("cashoutAmount", e.target.value)}
                    className="mt-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scommessa Singola */}
          {betType === 'single' && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Dettagli Scommessa Singola</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sport" className="text-base font-medium">Sport *</Label>
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
                    <Label htmlFor="odds" className="text-base font-medium">Quote *</Label>
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
                  <Label htmlFor="manifestation" className="text-base font-medium">Manifestazione</Label>
                  <Input
                    id="manifestation"
                    placeholder="Es. Serie A, ATP Roma, Champions League..."
                    value={formData.manifestation}
                    onChange={(e) => handleInputChange("manifestation", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event" className="text-base font-medium">Evento *</Label>
                  <Input
                    id="event"
                    placeholder="Es. Inter vs Milan"
                    value={formData.event}
                    onChange={(e) => handleInputChange("event", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="selection" className="text-base font-medium">Selezione</Label>
                  <Input
                    id="selection"
                    placeholder="Es. 1, Over 2.5, ecc."
                    value={formData.selection}
                    onChange={(e) => handleInputChange("selection", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Multipla/Sistema */}
          {(betType === 'multiple' || betType === 'system') && (
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold">
                    {betType === 'multiple' ? 'Dettagli Multipla' : 'Dettagli Sistema'}
                  </CardTitle>
                  <Button type="button" onClick={addBetToMultiple} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Aggiungi Scommessa
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="multipleTitle" className="text-base font-medium">Titolo Scommessa *</Label>
                  <Input
                    id="multipleTitle"
                    placeholder="Es. Combo Serie A del weekend"
                    value={formData.multipleTitle}
                    onChange={(e) => handleInputChange("multipleTitle", e.target.value)}
                  />
                </div>

                {betType === 'system' && (
                  <div className="space-y-2">
                    <Label htmlFor="systemType" className="text-base font-medium">Tipo Sistema</Label>
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
                    <Card key={bet.id} className="border-2 hover:border-muted-foreground transition-colors">
                      <CardHeader className="pb-3 bg-muted rounded-t-lg">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">Scommessa #{index + 1}</CardTitle>
                          {multipleBets.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBetFromMultiple(bet.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Sport</Label>
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
                            <Label className="text-sm font-medium">Quote</Label>
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
                          <Label className="text-sm font-medium">Evento</Label>
                          <Input
                            placeholder="Es. Inter vs Milan"
                            value={bet.event}
                            onChange={(e) => updateMultipleBet(bet.id, "event", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Selezione</Label>
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
              </CardContent>
            </Card>
          )}

          {/* Exchange Fields */}
          {betType === 'exchange' && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Dettagli Exchange</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {exchangeType === 'lay' && (
                    <div className="space-y-2">
                      <Label htmlFor="liability" className="text-base font-medium">Responsabilità (€)</Label>
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
                    <Label htmlFor="commission" className="text-base font-medium">Commissione (%)</Label>
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
                  <Label htmlFor="event" className="text-base font-medium">Evento *</Label>
                  <Input
                    id="event"
                    placeholder="Es. Inter vs Milan"
                    value={formData.event}
                    onChange={(e) => handleInputChange("event", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="selection" className="text-base font-medium">Selezione</Label>
                    <Input
                      id="selection"
                      placeholder="Es. Inter vittoria"
                      value={formData.selection}
                      onChange={(e) => handleInputChange("selection", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="odds" className="text-base font-medium">Quote *</Label>
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
              </CardContent>
            </Card>
          )}

          {/* Note */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Note</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea
                id="notes"
                placeholder="Aggiungi note o strategie per questa scommessa..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* Calcolo Vincita Potenziale */}
          {formData.stake && calculatePotentialWin() > 0 && (
            <Card className="shadow-lg border-2 border-green-500">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Riepilogo Finanziario
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border border-green-200">
                    <div className="text-sm text-muted-foreground">Vincita potenziale</div>
                    <div className="text-2xl font-bold text-green-600">
                      €{calculatePotentialWin().toFixed(2)}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-green-200">
                    <div className="text-sm text-muted-foreground">Profitto potenziale</div>
                    <div className="text-2xl font-bold text-green-600">
                      €{(calculatePotentialWin() - parseFloat(formData.stake || '0')).toFixed(2)}
                    </div>
                  </div>
                  {formData.status === 'cashout' && formData.cashoutAmount && (
                    <div className="p-4 rounded-lg border border-blue-200">
                      <div className="text-sm text-muted-foreground">Importo cashout</div>
                      <div className="text-2xl font-bold text-blue-600">
                        €{formData.cashoutAmount}
                      </div>
                    </div>
                  )}
                  {betType === 'exchange' && exchangeType === 'lay' && formData.liability && (
                    <div className="p-4 rounded-lg border border-red-200">
                      <div className="text-sm text-muted-foreground">Responsabilità</div>
                      <div className="text-2xl font-bold text-red-600">
                        €{formData.liability}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Salvataggio...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Salva Scommessa
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBet;
