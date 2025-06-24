
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface BetData {
  id: string;
  date: string;
  event: string;
  selection: string | null;
  odds: number;
  stake: number;
  status: string;
  profit: number | null;
  sport: string | null;
  bookmaker: string | null;
}

export interface AnalysisData {
  totalBets: number;
  winRate: number;
  totalProfit: number;
  roi: number;
  averageOdds: number;
  totalStake: number;
  period: string;
}

export const exportAnalysisToPDF = (analysisData: AnalysisData, monthlyData: any[]) => {
  const doc = new jsPDF();
  
  // Titolo
  doc.setFontSize(20);
  doc.text('Analisi delle Scommesse', 20, 20);
  
  // Periodo
  doc.setFontSize(12);
  doc.text(`Periodo: ${analysisData.period}`, 20, 35);
  
  // Statistiche principali
  doc.setFontSize(14);
  doc.text('Statistiche Principali:', 20, 50);
  
  const stats = [
    ['Totale Scommesse', analysisData.totalBets.toString()],
    ['Percentuale Vincita', `${analysisData.winRate.toFixed(1)}%`],
    ['Profitto Totale', `€${analysisData.totalProfit.toFixed(2)}`],
    ['ROI', `${analysisData.roi.toFixed(2)}%`],
    ['Quote Medie', analysisData.averageOdds.toFixed(2)],
    ['Stake Totale', `€${analysisData.totalStake.toFixed(2)}`]
  ];
  
  (doc as any).autoTable({
    startY: 60,
    head: [['Metrica', 'Valore']],
    body: stats,
    theme: 'grid'
  });
  
  // Performance mensile se disponibile
  if (monthlyData && monthlyData.length > 0) {
    doc.setFontSize(14);
    doc.text('Performance Mensile (ROI):', 20, (doc as any).lastAutoTable.finalY + 20);
    
    const monthlyStats = monthlyData.map(item => [
      item.month,
      `${item.roi.toFixed(2)}%`,
      `€${item.profit.toFixed(2)}`
    ]);
    
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 30,
      head: [['Mese', 'ROI', 'Profitto']],
      body: monthlyStats,
      theme: 'grid'
    });
  }
  
  // Footer
  doc.setFontSize(10);
  doc.text(`Generato il ${new Date().toLocaleDateString('it-IT')}`, 20, doc.internal.pageSize.height - 20);
  
  return doc;
};

export const exportBetsToExcel = (bets: BetData[]) => {
  const worksheet = XLSX.utils.json_to_sheet(
    bets.map(bet => ({
      'Data': new Date(bet.date).toLocaleDateString('it-IT'),
      'Evento': bet.event,
      'Selezione': bet.selection || '',
      'Quote': bet.odds,
      'Stake': bet.stake,
      'Stato': bet.status,
      'Profitto': bet.profit || 0,
      'Sport': bet.sport || '',
      'Bookmaker': bet.bookmaker || ''
    }))
  );
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Scommesse');
  
  return workbook;
};

export const downloadPDF = (doc: jsPDF, filename: string) => {
  doc.save(filename);
};

export const downloadExcel = (workbook: any, filename: string) => {
  XLSX.writeFile(workbook, filename);
};
