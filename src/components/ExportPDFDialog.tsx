
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { exportToPDF } from "@/utils/pdfExport";
import { Bet } from "@/types/bet";

interface AnalysisData {
  bankrollEvolutionData: Array<{date: string, bankroll: number, dailyProfit: number}>;
  monthlyPerformanceData: Array<{monthKey: string, month: string, profit: number, totalStake: number, roi: number}>;
  sportData: Array<{sport: string, scommesse: number, profitto: number}>;
  bookmakerData: Array<{bookmaker: string, scommesse: number, profitto: number}>;
  sportsPerformanceData: Record<string, { count: number; profit: number }>;
  filteredBets: Bet[];
  initialBankroll: number;
  totalBets: number;
}

interface ExportPDFDialogProps {
  trigger?: React.ReactNode;
  analysisData?: AnalysisData;
}

const ExportPDFDialog = ({ trigger, analysisData }: ExportPDFDialogProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isExporting, setIsExporting] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleExportPDF = async () => {
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

      // Format dates and create filename
      const startDateStr = format(startDate, 'dd-MM-yyyy');
      const endDateStr = format(endDate, 'dd-MM-yyyy');
      const filename = `analisi-prestazioni-${startDateStr}_${endDateStr}.pdf`;
      
      // Store the date range in a data attribute for the PDF export function to use
      const analysisContent = document.getElementById('analysis-content');
      if (analysisContent) {
        analysisContent.setAttribute('data-start-date', format(startDate, 'yyyy-MM-dd'));
        analysisContent.setAttribute('data-end-date', format(endDate, 'yyyy-MM-dd'));
      }
      
      await exportToPDF('analysis-content', filename, analysisData);
      
      // Clean up data attributes
      if (analysisContent) {
        analysisContent.removeAttribute('data-start-date');
        analysisContent.removeAttribute('data-end-date');
      }
      
      toast({
        title: "Successo",
        description: "Report PDF esportato con successo!",
        variant: "default",
      });

      setOpen(false);
    } catch (error) {
      console.error('Errore durante l\'esportazione PDF:', error);
      toast({
        title: "Errore",
        description: "Impossibile esportare il PDF. Riprova.",
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
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
            <FileText className="w-4 h-4 mr-2" />
            Esporta PDF
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            Esporta Analisi in PDF
          </DialogTitle>
          <DialogDescription>
            Seleziona il periodo per esportare l'analisi delle prestazioni in formato PDF
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
                <Calendar
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
                <Calendar
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
            onClick={handleExportPDF}
            disabled={isExporting || !startDate || !endDate}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Esportazione...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Esporta PDF</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportPDFDialog;
