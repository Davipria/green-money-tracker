import { useState } from "react";
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

interface Bet {
  id?: string;
  date: string;
  sport: string;
  competition: string;
  team1: string;
  team2: string;
  betType: string;
  odd: number;
  stake: number;
  bookmaker: string;
  status: string;
  profit?: number | null;
  notes?: string | null;
  userId?: string;
}

const AddBet = () => {
  const [date, setDate] = useState("");
  const [sport, setSport] = useState("");
  const [competition, setCompetition] = useState("");
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [betType, setBetType] = useState("");
  const [odd, setOdd] = useState("");
  const [stake, setStake] = useState("");
  const [bookmaker, setBookmaker] = useState("");
  const [status, setStatus] = useState("pending");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!date || !sport || !competition || !team1 || !team2 || !betType || !odd || !stake || !bookmaker || !status) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi",
        variant: "destructive",
      });
      return;
    }

    const oddValue = parseFloat(odd);
    const stakeValue = parseFloat(stake);

    if (isNaN(oddValue) || isNaN(stakeValue)) {
      toast({
        title: "Errore",
        description: "Quota e Puntata devono essere numeri validi",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        toast({
          title: "Errore",
          description: "Utente non autenticato",
          variant: "destructive",
        });
        return;
      }

      const profit = status === 'won' ? (oddValue * stakeValue) - stakeValue : status === 'lost' ? -stakeValue : 0;

      const newBet: Bet = {
        date,
        sport,
        competition,
        team1,
        team2,
        betType,
        odd: oddValue,
        stake: stakeValue,
        bookmaker,
        status,
        profit,
        notes,
        userId: user.user.id,
      };

      const { error } = await supabase
        .from('bets')
        .insert([newBet]);

      if (error) {
        console.error("Errore nell'inserimento della scommessa:", error);
        toast({
          title: "Errore",
          description: "Impossibile aggiungere la scommessa",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Successo",
          description: "Scommessa aggiunta con successo!",
        });
        navigate('/app/archive');
      }
    } catch (error) {
      console.error("Errore imprevisto:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore imprevisto",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <PlusCircle className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Nuova Scommessa
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Aggiungi una nuova scommessa al tuo portafoglio
        </p>
      </div>

      {/* Form */}
      <Card className="max-w-3xl mx-auto bg-card text-card-foreground shadow-md">
        <CardHeader>
          <CardTitle>Dettagli Scommessa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div>
              <Label htmlFor="date">Data</Label>
              <Input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            {/* Sport */}
            <div>
              <Label htmlFor="sport">Sport</Label>
              <Input type="text" id="sport" value={sport} onChange={(e) => setSport(e.target.value)} />
            </div>

            {/* Competition */}
            <div>
              <Label htmlFor="competition">Competizione</Label>
              <Input type="text" id="competition" value={competition} onChange={(e) => setCompetition(e.target.value)} />
            </div>

            {/* Teams */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="team1">Team 1</Label>
                <Input type="text" id="team1" value={team1} onChange={(e) => setTeam1(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="team2">Team 2</Label>
                <Input type="text" id="team2" value={team2} onChange={(e) => setTeam2(e.target.value)} />
              </div>
            </div>

            {/* Bet Type */}
            <div>
              <Label htmlFor="betType">Tipo di Scommessa</Label>
              <Input type="text" id="betType" value={betType} onChange={(e) => setBetType(e.target.value)} />
            </div>

            {/* Odd and Stake */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="odd">Quota</Label>
                <Input type="number" id="odd" value={odd} onChange={(e) => setOdd(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="stake">Puntata</Label>
                <Input type="number" id="stake" value={stake} onChange={(e) => setStake(e.target.value)} />
              </div>
            </div>

            {/* Bookmaker */}
            <div>
              <Label htmlFor="bookmaker">Bookmaker</Label>
              <Input type="text" id="bookmaker" value={bookmaker} onChange={(e) => setBookmaker(e.target.value)} />
            </div>

            {/* Status */}
            <div>
              <Label>Stato</Label>
              <RadioGroup defaultValue="pending" className="flex space-x-2" onValueChange={setStatus}>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="pending" id="pending" />
                  <Label htmlFor="pending">Pending</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="won" id="won" />
                  <Label htmlFor="won">Won</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="lost" id="lost" />
                  <Label htmlFor="lost">Lost</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="canceled" id="canceled" />
                  <Label htmlFor="canceled">Canceled</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Note</Label>
              <Textarea id="notes" placeholder="Eventuali note sulla scommessa" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            {/* Submit Button */}
            <Button type="submit">Aggiungi Scommessa</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBet;
