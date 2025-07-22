import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, TrendingUp, Calculator, DollarSign, Target, Calendar, Building2, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const [betType, setBetType] = useState<'single' | 'multiple' | 'system' | 'exchange'>('single');
  const [exchangeType, setExchangeType] = useState<'back' | 'lay'>('back');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bankroll, setBankroll] = useState<string>("1000");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
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
    bonus: "",
    
    // Exchange
    liability: "",
    commission: ""
  });

  const [multipleBets, setMultipleBets] = useState<SingleBet[]>([
    { id: '1', sport: '', event: '', odds: '', selection: '' }
  ]);

  // Load user profile bankroll on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      setIsLoadingProfile(true);
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('bankroll')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading user profile:', error);
          toast({
            title: "Avviso",
            description: "Non è stato possibile caricare il bankroll dal profilo. Utilizzando valore predefinito.",
            variant: "default"
          });
        } else if (profile?.bankroll) {
          setBankroll(profile.bankroll.toString());
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, [user, toast]);

  // Calcola le quote totali per multiple/sistema
  const calculateTotalOdds = () => {
    if (betType === 'multiple' || betType === 'system') {
      const validBets = multipleBets.filter(bet => bet.odds && parseFloat(bet.odds) > 0);
      if (validBets.length === 0) return 1;
      
      return validBets.reduce((total, bet) => {
        return total * parseFloat(bet.odds);
      }, 1);
    }
    return parseFloat(formData.odds) || 1;
  };

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

    // Validazione per multiple/sistema: almeno una scommessa valida
    if ((betType === 'multiple' || betType === 'system')) {
      const validBets = multipleBets.filter(bet => bet.sport && bet.event && bet.odds);
      if (validBets.length === 0) {
        toast({
          title: "Errore",
          description: "Inserisci almeno una scommessa valida per la multipla/sistema",
          variant: "destructive"
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Calcola le quote totali per multiple/sistema
      const totalOdds = calculateTotalOdds();
      
      // Calcola payout e profit in base allo stato
      let payout = null;
      let profit = null;
      const bonus = formData.bonus ? parseFloat(formData.bonus) : 0;
      
      if (formData.status === 'won') {
        payout = totalOdds * parseFloat(formData.stake);
        profit = payout - parseFloat(formData.stake) + bonus;
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
        odds: totalOdds, // Usa sempre le quote totali calcolate
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
        exchange_type: betType === 'exchange' ? exchangeType : null,
        bonus: bonus > 0 ? bonus : null
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
        bonus: "",
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
      const totalOdds = calculateTotalOdds();
      const baseWin = totalOdds * parseFloat(formData.stake);
      const bonus = formData.bonus ? parseFloat(formData.bonus) : 0;
      return baseWin + bonus;
    }
    return 0;
  };

  const betTypeOptions = [
    { value: 'single', label: 'Singola', icon: Target, description: 'Una scommessa su un singolo evento', color: 'text-blue-600' },
    { value: 'multiple', label: 'Multipla', icon: TrendingUp, description: 'Combina più selezioni in una scommessa', color: 'text-green-600' },
    { value: 'system', label: 'Sistema', icon: Calculator, description: 'Sistema di scommesse con garanzie', color: 'text-purple-600' },
    { value: 'exchange', label: 'Exchange', icon: DollarSign, description: 'Punta o banca su betting exchange', color: 'text-orange-600' }
  ];

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

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <PlusCircle className="h-8 w-8 text-blue-600" />
            Nuova Scommessa
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Aggiungi una nuova scommessa al tuo portafoglio
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bet Type Selection */}
        <Card className="border-2 hover:border-blue-200 transition-colors">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Target className="h-5 w-5 text-blue-600" />
              Tipo di Scommessa
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {betTypeOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg transform hover:scale-105 ${
                      betType === option.value
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-border hover:border-blue-300'
                    }`}
                    onClick={() => setBetType(option.value as any)}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`p-3 rounded-full ${
                        betType === option.value 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className={`font-medium ${betType === option.value ? 'text-blue-900' : ''}`}>
                          {option.label}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Exchange Type */}
            {betType === 'exchange' && (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <Label className="text-sm font-medium mb-2 block text-orange-900">Tipo Exchange</Label>
                <RadioGroup value={exchangeType} onValueChange={(value: 'back' | 'lay') => setExchangeType(value)}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="back" id="back" className="border-orange-400 text-orange-600" />
                      <Label htmlFor="back" className="text-orange-800">Punta (Back)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lay" id="lay" className="border-orange-400 text-orange-600" />
                      <Label htmlFor="lay" className="text-orange-800">Banca (Lay)</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="border-2 hover:border-green-200 transition-colors">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Building2 className="h-5 w-5 text-green-600" />
              Informazioni Base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {/* Bankroll */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <Label htmlFor="bankroll" className="text-sm font-medium flex items-center gap-2 mb-2 text-green-900">
                <DollarSign className="h-4 w-4 text-green-600" />
                Bankroll (€)
              </Label>
              {isLoadingProfile ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  <span className="text-sm text-green-700">Caricamento dal profilo...</span>
                </div>
              ) : (
                <Input
                  id="bankroll"
                  type="number"
                  step="0.01"
                  placeholder="Es. 1000.00"
                  value={bankroll}
                  onChange={(e) => setBankroll(e.target.value)}
                  className="border-green-300 focus:border-green-500"
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2 text-blue-900">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Data *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="border-blue-300 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookmaker" className="text-sm font-medium text-blue-900">Bookmaker *</Label>
                <Select value={formData.bookmaker} onValueChange={(value) => handleInputChange("bookmaker", value)}>
                  <SelectTrigger className="border-blue-300 focus:border-blue-500">
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

              <div className="space-y-2">
                <Label htmlFor="tipster" className="text-sm font-medium text-blue-900">Tipster</Label>
                <Input
                  id="tipster"
                  placeholder="Nome tipster (opzionale)"
                  value={formData.tipster}
                  onChange={(e) => handleInputChange("tipster", e.target.value)}
                  className="border-blue-300 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-900">Timing</Label>
                <RadioGroup value={formData.timing} onValueChange={(value: 'prematch' | 'live') => handleInputChange("timing", value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prematch" id="prematch" className="border-blue-400 text-blue-600" />
                    <Label htmlFor="prematch" className="text-blue-800">Prematch</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="live" id="live" className="border-blue-400 text-blue-600" />
                    <Label htmlFor="live" className="text-blue-800">Live</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stake" className="text-sm font-medium text-blue-900">Puntata (€) *</Label>
                <Input
                  id="stake"
                  type="number"
                  step="0.01"
                  placeholder="Es. 50.00"
                  value={formData.stake}
                  onChange={(e) => handleStakeChange(e.target.value)}
                  className="border-blue-300 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stakePercentage" className="text-sm font-medium text-blue-900">Stake (%) *</Label>
                <Input
                  id="stakePercentage"
                  type="number"
                  step="0.01"
                  placeholder="Es. 5.00"
                  value={formData.stakePercentage}
                  onChange={(e) => handleStakePercentageChange(e.target.value)}
                  className="border-blue-300 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-900">Stato Scommessa</Label>
                <Select value={formData.status} onValueChange={(value: 'pending' | 'won' | 'lost' | 'cashout') => handleInputChange("status", value)}>
                  <SelectTrigger className="border-blue-300 focus:border-blue-500">
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
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                <Label htmlFor="cashoutAmount" className="text-sm font-medium text-yellow-900">Importo Cashout (€) *</Label>
                <Input
                  id="cashoutAmount"
                  type="number"
                  step="0.01"
                  placeholder="Es. 75.00"
                  value={formData.cashoutAmount}
                  onChange={(e) => handleInputChange("cashoutAmount", e.target.value)}
                  className="mt-2 border-yellow-300 focus:border-yellow-500"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scommessa Singola */}
        {betType === 'single' && (
          <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="text-blue-900">Dettagli Scommessa Singola</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sport" className="text-sm font-medium text-blue-900">Sport *</Label>
                  <Select value={formData.sport} onValueChange={(value) => handleInputChange("sport", value)}>
                    <SelectTrigger className="border-blue-300 focus:border-blue-500">
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
                  <Label htmlFor="odds" className="text-sm font-medium text-blue-900">Quote *</Label>
                  <Input
                    id="odds"
                    type="number"
                    step="0.01"
                    placeholder="Es. 2.50"
                    value={formData.odds}
                    onChange={(e) => handleInputChange("odds", e.target.value)}
                    className="border-blue-300 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manifestation" className="text-sm font-medium text-blue-900">Manifestazione</Label>
                <Input
                  id="manifestation"
                  placeholder="Es. Serie A, ATP Roma, Champions League..."
                  value={formData.manifestation}
                  onChange={(e) => handleInputChange("manifestation", e.target.value)}
                  className="border-blue-300 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event" className="text-sm font-medium text-blue-900">Evento *</Label>
                <Input
                  id="event"
                  placeholder="Es. Inter vs Milan"
                  value={formData.event}
                  onChange={(e) => handleInputChange("event", e.target.value)}
                  className="border-blue-300 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="selection" className="text-sm font-medium text-blue-900">Selezione</Label>
                <Input
                  id="selection"
                  placeholder="Es. 1, Over 2.5, ecc."
                  value={formData.selection}
                  onChange={(e) => handleInputChange("selection", e.target.value)}
                  className="border-blue-300 focus:border-blue-500"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Multipla/Sistema */}
        {(betType === 'multiple' || betType === 'system') && (
          <Card className="border-2 border-green-200 hover:border-green-300 transition-colors">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <div className="flex justify-between items-center">
                <CardTitle className="text-green-900">
                  {betType === 'multiple' ? 'Dettagli Multipla' : 'Dettagli Sistema'}
                </CardTitle>
                <Button 
                  type="button" 
                  onClick={addBetToMultiple} 
                  variant="outline" 
                  size="sm"
                  className="border-green-400 text-green-700 hover:bg-green-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Aggiungi Scommessa
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="multipleTitle" className="text-sm font-medium text-green-900">Titolo Scommessa *</Label>
                <Input
                  id="multipleTitle"
                  placeholder="Es. Combo Serie A del weekend"
                  value={formData.multipleTitle}
                  onChange={(e) => handleInputChange("multipleTitle", e.target.value)}
                  className="border-green-300 focus:border-green-500"
                />
              </div>

              {betType === 'system' && (
                <div className="space-y-2">
                  <Label htmlFor="systemType" className="text-sm font-medium text-green-900">Tipo Sistema</Label>
                  <Select value={formData.systemType} onValueChange={(value) => handleInputChange("systemType", value)}>
                    <SelectTrigger className="border-green-300 focus:border-green-500">
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

              {/* Campo Bonus */}
              <div className="space-y-2">
                <Label htmlFor="bonus" className="text-sm font-medium text-green-900">Bonus (€)</Label>
                <Input
                  id="bonus"
                  type="number"
                  step="0.01"
                  placeholder="Es. 5.00"
                  value={formData.bonus}
                  onChange={(e) => handleInputChange("bonus", e.target.value)}
                  className="border-green-300 focus:border-green-500"
                />
                <div className="text-sm text-gray-500">
                  Importo aggiuntivo che verrà aggiunto al profitto se la scommessa è vinta
                </div>
              </div>

              {/* Lista Scommesse */}
              <div className="space-y-4">
                {multipleBets.map((bet, index) => (
                  <Card key={bet.id} className="border-2 border-green-100 hover:border-green-200 transition-colors">
                    <CardHeader className="pb-3 bg-green-25">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base text-green-800">Scommessa #{index + 1}</CardTitle>
                        {multipleBets.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBetFromMultiple(bet.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-green-900">Sport</Label>
                          <Select value={bet.sport} onValueChange={(value) => updateMultipleBet(bet.id, "sport", value)}>
                            <SelectTrigger className="border-green-300 focus:border-green-500">
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
                          <Label className="text-sm font-medium text-green-900">Quote</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Es. 2.50"
                            value={bet.odds}
                            onChange={(e) => updateMultipleBet(bet.id, "odds", e.target.value)}
                            className="border-green-300 focus:border-green-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-green-900">Evento</Label>
                        <Input
                          placeholder="Es. Inter vs Milan"
                          value={bet.event}
                          onChange={(e) => updateMultipleBet(bet.id, "event", e.target.value)}
                          className="border-green-300 focus:border-green-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-green-900">Selezione</Label>
                        <Input
                          placeholder="Es. 1, Over 2.5"
                          value={bet.selection}
                          onChange={(e) => updateMultipleBet(bet.id, "selection", e.target.value)}
                          className="border-green-300 focus:border-green-500"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Mostra le quote totali calcolate */}
              {multipleBets.some(bet => bet.odds) && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="text-sm text-green-700 mb-1">Quote Totali Calcolate</div>
                  <div className="text-2xl font-bold text-green-600">
                    {calculateTotalOdds().toFixed(2)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Exchange Fields */}
        {betType === 'exchange' && (
          <Card className="border-2 border-orange-200 hover:border-orange-300 transition-colors">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
              <CardTitle className="text-orange-900">Dettagli Exchange</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exchangeType === 'lay' && (
                  <div className="space-y-2">
                    <Label htmlFor="liability" className="text-sm font-medium text-orange-900">Responsabilità (€)</Label>
                    <Input
                      id="liability"
                      type="number"
                      step="0.01"
                      placeholder="Es. 250.00"
                      value={formData.liability}
                      onChange={(e) => handleInputChange("liability", e.target.value)}
                      className="border-orange-300 focus:border-orange-500"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="commission" className="text-sm font-medium text-orange-900">Commissione (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.1"
                    placeholder="Es. 5.0"
                    value={formData.commission}
                    onChange={(e) => handleInputChange("commission", e.target.value)}
                    className="border-orange-300 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event" className="text-sm font-medium text-orange-900">Evento *</Label>
                <Input
                  id="event"
                  placeholder="Es. Inter vs Milan"
                  value={formData.event}
                  onChange={(e) => handleInputChange("event", e.target.value)}
                  className="border-orange-300 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="selection" className="text-sm font-medium text-orange-900">Selezione</Label>
                  <Input
                    id="selection"
                    placeholder="Es. Inter vittoria"
                    value={formData.selection}
                    onChange={(e) => handleInputChange("selection", e.target.value)}
                    className="border-orange-300 focus:border-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="odds" className="text-sm font-medium text-orange-900">Quote *</Label>
                  <Input
                    id="odds"
                    type="number"
                    step="0.01"
                    placeholder="Es. 2.50"
                    value={formData.odds}
                    onChange={(e) => handleInputChange("odds", e.target.value)}
                    className="border-orange-300 focus:border-orange-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Note */}
        <Card className="border-2 hover:border-purple-200 transition-colors">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
            <CardTitle className="text-purple-900">Note</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Textarea
              id="notes"
              placeholder="Aggiungi note o strategie per questa scommessa..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={4}
              className="resize-none border-purple-300 focus:border-purple-500"
            />
          </CardContent>
        </Card>

        {/* Calcolo Vincita Potenziale */}
        {formData.stake && calculatePotentialWin() > 0 && (
          <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-900">
                <Calculator className="h-5 w-5 text-green-600" />
                Riepilogo Finanziario
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border-2 border-green-200 bg-white shadow-sm">
                  <div className="text-sm text-green-700 mb-1">Vincita potenziale</div>
                  <div className="text-2xl font-bold text-green-600">
                    €{calculatePotentialWin().toFixed(2)}
                  </div>
                </div>
                <div className="p-4 rounded-lg border-2 border-blue-200 bg-white shadow-sm">
                  <div className="text-sm text-blue-700 mb-1">Profitto potenziale</div>
                  <div className="text-2xl font-bold text-blue-600">
                    €{(calculatePotentialWin() - parseFloat(formData.stake || '0')).toFixed(2)}
                  </div>
                </div>
                {formData.status === 'cashout' && formData.cashoutAmount && (
                  <div className="p-4 rounded-lg border-2 border-yellow-200 bg-white shadow-sm">
                    <div className="text-sm text-yellow-700 mb-1">Importo cashout</div>
                    <div className="text-2xl font-bold text-yellow-600">
                      €{formData.cashoutAmount}
                    </div>
                  </div>
                )}
                {betType === 'exchange' && exchangeType === 'lay' && formData.liability && (
                  <div className="p-4 rounded-lg border-2 border-red-200 bg-white shadow-sm">
                    <div className="text-sm text-red-700 mb-1">Responsabilità</div>
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
        <div className="flex justify-center pt-4">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            size="lg"
            className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transform hover:scale-105 transition-all"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Salvataggio...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Salva Scommessa
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddBet;
