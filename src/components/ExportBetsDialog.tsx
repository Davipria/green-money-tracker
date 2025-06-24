
import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Download, CalendarIcon } from "lucide-react";
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bet } from "@/types/bet";
import { formatCurrency } from "@/utils/betUtils";

interface ExportBetsDialogProps {
  trigger?: React.ReactNode;
}

const ExportBetsDialog = ({ trigger }: ExportBetsDialogProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isExporting, setIsExporting] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const exportToExcel = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Errore",
        description: "Seleziona sia la data di inizio che quella di fine",
        variant: "destructive",
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "Errore",
        description: "La data di inizio deve essere precedente alla data di fine",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExporting(true);

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Errore",
          description: "Utente non autenticato",
          variant: "destructive",
        });
        return;
      }

      const { data: bets, error } = await supabase
        .from('bets')
        .select('*')
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))
        .order('date', { ascending: false });

      if (error) {
        console.error('Errore caricamento scommesse:', error);
        toast({
          title: "Errore",
          description: "Impossibile caricare le scommesse",
          variant: "destructive",
        });
        return;
      }

      if (!bets || bets.length === 0) {
        toast({
          title: "Nessuna scommessa",
          description: "Nessuna scommessa trovata per il periodo selezionato",
          variant: "destructive",
        });
        return;
      }

      // Prepara i dati per Excel nell'ordine richiesto
      const excelData = (bets as Bet[]).map(bet => ({
        'Data': new Date(bet.date).toLocaleDateString('it-IT'),
        'Bookmaker': bet.bookmaker || '',
        'Sport': bet.sport || '',
        'Manifestazione': bet.manifestation || '',
        'Evento': bet.event,
        'Selezione': bet.selection || '',
        'Quota': bet.odds,
        'Puntata': `€${bet.stake}`,
        'Stake': `${bet.stake}%`, // Fixed: removed the *10 multiplication
        'Stato Scommessa': bet.status === 'won' ? 'Vinta' : 
                          bet.status === 'lost' ? 'Persa' : 
                          bet.status === 'cashout' ? 'Cashout' : 'In attesa',
        'Guadagno': bet.status === 'won' && bet.payout ? `€${(bet.payout - bet.stake).toFixed(2)}` :
                   bet.status === 'lost' ? `€${(-bet.stake).toFixed(2)}` :
                   bet.status === 'cashout' && bet.cashout_amount ? `€${(bet.cashout_amount - bet.stake).toFixed(2)}` : '',
      }));

      // Crea il workbook
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Scommesse');

      // Imposta larghezza colonne nell'ordine corretto
      const columnWidths = [
        { wch: 12 }, // Data
        { wch: 15 }, // Bookmaker
        { wch: 15 }, // Sport
        { wch: 20 }, // Manifestazione
        { wch: 30 }, // Evento
        { wch: 20 }, // Selezione
        { wch: 8 },  // Quota
        { wch: 10 }, // Puntata
        { wch: 10 }, // Stake
        { wch: 15 }, // Stato Scommessa
        { wch: 12 }, // Guadagno
      ];
      worksheet['!cols'] = columnWidths;

      // Genera e scarica il file
      const fileName = `scommesse_${format(startDate, 'dd-MM-yyyy')}_${format(endDate, 'dd-MM-yyyy')}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Successo",
        description: `File Excel scaricato: ${fileName}`,
      });

      setOpen(false);
    } catch (error) {
      console.error('Errore esportazione:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'esportazione",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Esporta Excel</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Esporta Scommesse in Excel</span>
          </DialogTitle>
          <DialogDescription>
            Seleziona il periodo per esportare le scommesse in formato Excel
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Data Inizio</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : "Seleziona data inizio"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Data Fine</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : "Seleziona data fine"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annulla
          </Button>
          <Button 
            onClick={exportToExcel}
            disabled={isExporting || !startDate || !endDate}
            className="flex items-center space-x-2"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Esportazione...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Esporta</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportBetsDialog;
