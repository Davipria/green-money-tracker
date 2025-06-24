
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { exportAnalysisToPDF, exportBetsToExcel, downloadPDF, downloadExcel, BetData, AnalysisData } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonsProps {
  bets: BetData[];
  analysisData?: AnalysisData;
  monthlyData?: any[];
  type: 'analysis' | 'archive';
}

const ExportButtons = ({ bets, analysisData, monthlyData, type }: ExportButtonsProps) => {
  const { toast } = useToast();

  const handleExportPDF = () => {
    if (!analysisData) return;
    
    try {
      const doc = exportAnalysisToPDF(analysisData, monthlyData || []);
      const filename = `analisi-${new Date().toISOString().slice(0, 7)}.pdf`;
      downloadPDF(doc, filename);
      
      toast({
        title: "PDF esportato!",
        description: "Il file PDF è stato scaricato con successo"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile esportare il PDF",
        variant: "destructive"
      });
    }
  };

  const handleExportExcel = () => {
    try {
      const workbook = exportBetsToExcel(bets);
      const filename = `scommesse-${new Date().toISOString().slice(0, 7)}.xlsx`;
      downloadExcel(workbook, filename);
      
      toast({
        title: "Excel esportato!",
        description: "Il file Excel è stato scaricato con successo"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile esportare l'Excel",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-2">
      {type === 'analysis' && analysisData && (
        <Button onClick={handleExportPDF} variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Esporta PDF
        </Button>
      )}
      <Button onClick={handleExportExcel} variant="outline" size="sm">
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Esporta Excel
      </Button>
    </div>
  );
};

export default ExportButtons;
