import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Bet } from '@/types/bet';
import { calculateROI, formatCurrency } from './betUtils';

// Helper function to generate detailed analysis for bankroll evolution chart
const generateBankrollAnalysis = (bankrollData: Array<{date: string, bankroll: number, dailyProfit: number}>, initialBankroll: number) => {
  if (bankrollData.length === 0) return "Nessun dato disponibile per l'analisi dell'evoluzione del bankroll.";
  
  const finalBankroll = bankrollData[bankrollData.length - 1].bankroll;
  const totalGrowth = finalBankroll - initialBankroll;
  const growthPercentage = ((totalGrowth / initialBankroll) * 100);
  
  const positiveDays = bankrollData.filter(day => day.dailyProfit > 0).length;
  const negativeDays = bankrollData.filter(day => day.dailyProfit < 0).length;
  const neutralDays = bankrollData.filter(day => day.dailyProfit === 0).length;
  
  const bestDay = bankrollData.reduce((max, day) => day.dailyProfit > max.dailyProfit ? day : max);
  const worstDay = bankrollData.reduce((min, day) => day.dailyProfit < min.dailyProfit ? day : min);
  
  const avgDailyProfit = bankrollData.reduce((sum, day) => sum + day.dailyProfit, 0) / bankrollData.length;
  
  let analysis = `ANALISI EVOLUZIONE BANKROLL\n\n`;
  analysis += `• Crescita totale: ${formatCurrency(totalGrowth)} (${growthPercentage.toFixed(1)}%)\n`;
  analysis += `• Bankroll iniziale: ${formatCurrency(initialBankroll)}\n`;
  analysis += `• Bankroll finale: ${formatCurrency(finalBankroll)}\n`;
  analysis += `• Periodo analizzato: ${bankrollData.length} giorni\n\n`;
  
  analysis += `DISTRIBUZIONE GIORNI:\n`;
  analysis += `• Giorni positivi: ${positiveDays} (${((positiveDays / bankrollData.length) * 100).toFixed(1)}%)\n`;
  analysis += `• Giorni negativi: ${negativeDays} (${((negativeDays / bankrollData.length) * 100).toFixed(1)}%)\n`;
  analysis += `• Giorni neutri: ${neutralDays} (${((neutralDays / bankrollData.length) * 100).toFixed(1)}%)\n\n`;
  
  analysis += `PERFORMANCE ESTREME:\n`;
  analysis += `• Miglior giorno: ${bestDay.date} (+${formatCurrency(bestDay.dailyProfit)})\n`;
  analysis += `• Peggior giorno: ${worstDay.date} (${formatCurrency(worstDay.dailyProfit)})\n`;
  analysis += `• Profitto medio giornaliero: ${formatCurrency(avgDailyProfit)}\n\n`;
  
  if (growthPercentage > 0) {
    analysis += `CONCLUSIONE: Il bankroll mostra una crescita positiva del ${growthPercentage.toFixed(1)}%. `;
    if (positiveDays > negativeDays) {
      analysis += `La maggior parte dei giorni sono stati positivi, indicando una strategia vincente.`;
    } else {
      analysis += `Nonostante più giorni negativi, i guadagni nei giorni positivi compensano le perdite.`;
    }
  } else {
    analysis += `CONCLUSIONE: Il bankroll ha subito una diminuzione del ${Math.abs(growthPercentage).toFixed(1)}%. `;
    analysis += `È consigliabile rivedere la strategia di scommesse.`;
  }
  
  return analysis;
};

// Helper function to generate detailed analysis for performance (ROI) chart
const generatePerformanceAnalysis = (monthlyData: Array<{monthKey: string, month: string, profit: number, totalStake: number, roi: number}>) => {
  if (monthlyData.length === 0) return "Nessun dato disponibile per l'analisi delle performance mensili.";
  
  const totalProfit = monthlyData.reduce((sum, month) => sum + month.profit, 0);
  const totalStake = monthlyData.reduce((sum, month) => sum + month.totalStake, 0);
  const avgROI = calculateROI(totalProfit, totalStake);
  
  const positiveMonths = monthlyData.filter(month => month.profit > 0).length;
  const negativeMonths = monthlyData.filter(month => month.profit < 0).length;
  
  const bestMonth = monthlyData.reduce((max, month) => month.roi > max.roi ? month : max);
  const worstMonth = monthlyData.reduce((min, month) => month.roi < min.roi ? month : min);
  
  const avgMonthlyROI = monthlyData.reduce((sum, month) => sum + month.roi, 0) / monthlyData.length;
  
  let analysis = `ANALISI PERFORMANCE MENSILI (ROI)\n\n`;
  analysis += `• Profitto totale: ${formatCurrency(totalProfit)}\n`;
  analysis += `• Stake totale: ${formatCurrency(totalStake)}\n`;
  analysis += `• ROI medio: ${avgROI.toFixed(1)}%\n`;
  analysis += `• Periodo analizzato: ${monthlyData.length} mesi\n\n`;
  
  analysis += `DISTRIBUZIONE MESI:\n`;
  analysis += `• Mesi positivi: ${positiveMonths} (${((positiveMonths / monthlyData.length) * 100).toFixed(1)}%)\n`;
  analysis += `• Mesi negativi: ${negativeMonths} (${((negativeMonths / monthlyData.length) * 100).toFixed(1)}%)\n\n`;
  
  analysis += `PERFORMANCE ESTREME:\n`;
  analysis += `• Miglior mese: ${bestMonth.month} (ROI: ${bestMonth.roi.toFixed(1)}%)\n`;
  analysis += `• Peggior mese: ${worstMonth.month} (ROI: ${worstMonth.roi.toFixed(1)}%)\n`;
  analysis += `• ROI medio mensile: ${avgMonthlyROI.toFixed(1)}%\n\n`;
  
  if (avgROI > 0) {
    analysis += `CONCLUSIONE: Le performance mostrano un ROI positivo del ${avgROI.toFixed(1)}%. `;
    if (positiveMonths > negativeMonths) {
      analysis += `La maggior parte dei mesi sono stati redditizi, indicando consistenza.`;
    } else {
      analysis += `Nonostante più mesi negativi, i guadagni compensano le perdite.`;
    }
  } else {
    analysis += `CONCLUSIONE: Le performance mostrano un ROI negativo del ${Math.abs(avgROI).toFixed(1)}%. `;
    analysis += `È necessario rivedere la strategia di scommesse.`;
  }
  
  return analysis;
};

// Helper function to generate detailed analysis for sports distribution
const generateSportsDistributionAnalysis = (sportData: Array<{sport: string, scommesse: number, profitto: number}>, totalBets: number) => {
  if (sportData.length === 0) return "Nessun dato disponibile per l'analisi della distribuzione per sport.";
  
  const totalProfit = sportData.reduce((sum, sport) => sum + sport.profitto, 0);
  const mostBetsSport = sportData.reduce((max, sport) => sport.scommesse > max.scommesse ? sport : max);
  const mostProfitableSport = sportData.reduce((max, sport) => sport.profitto > max.profitto ? sport : max);
  const leastProfitableSport = sportData.reduce((min, sport) => sport.profitto < min.profitto ? sport : min);
  
  let analysis = `ANALISI DISTRIBUZIONE PER SPORT\n\n`;
  analysis += `• Scommesse totali: ${totalBets}\n`;
  analysis += `• Sport analizzati: ${sportData.length}\n`;
  analysis += `• Profitto totale: ${formatCurrency(totalProfit)}\n\n`;
  
  analysis += `DISTRIBUZIONE SCOMMESSE:\n`;
  analysis += `• Sport più scommesso: ${mostBetsSport.sport} (${mostBetsSport.scommesse} scommesse, ${((mostBetsSport.scommesse / totalBets) * 100).toFixed(1)}%)\n`;
  
  sportData.forEach(sport => {
    const percentage = ((sport.scommesse / totalBets) * 100).toFixed(1);
    analysis += `• ${sport.sport}: ${sport.scommesse} scommesse (${percentage}%)\n`;
  });
  
  analysis += `\nPROFITTO PER SPORT:\n`;
  analysis += `• Sport più redditizio: ${mostProfitableSport.sport} (${formatCurrency(mostProfitableSport.profitto)})\n`;
  analysis += `• Sport meno redditizio: ${leastProfitableSport.sport} (${formatCurrency(leastProfitableSport.profitto)})\n\n`;
  
  const profitableSports = sportData.filter(sport => sport.profitto > 0).length;
  const unprofitableSports = sportData.filter(sport => sport.profitto < 0).length;
  
  analysis += `BILANCIO SPORT:\n`;
  analysis += `• Sport redditizi: ${profitableSports}\n`;
  analysis += `• Sport in perdita: ${unprofitableSports}\n\n`;
  
  if (profitableSports > unprofitableSports) {
    analysis += `CONCLUSIONE: `;
    analysis += `Considera di concentrarti sui sport più performanti come ${mostProfitableSport.sport}.`;
  } else {
    analysis += `CONCLUSIONE: `;
    analysis += `Considera di rivedere la strategia per gli sport meno performanti.`;
  }
  
  return analysis;
};

// Helper function to generate detailed analysis for bookmaker distribution
const generateBookmakerDistributionAnalysis = (bookmakerData: Array<{bookmaker: string, scommesse: number, profitto: number}>, totalBets: number) => {
  if (bookmakerData.length === 0) return "Nessun dato disponibile per l'analisi della distribuzione per bookmaker.";
  
  const totalProfit = bookmakerData.reduce((sum, bookmaker) => sum + bookmaker.profitto, 0);
  const mostUsedBookmaker = bookmakerData.reduce((max, bookmaker) => bookmaker.scommesse > max.scommesse ? bookmaker : max);
  const mostProfitableBookmaker = bookmakerData.reduce((max, bookmaker) => bookmaker.profitto > max.profitto ? bookmaker : max);
  const leastProfitableBookmaker = bookmakerData.reduce((min, bookmaker) => bookmaker.profitto < min.profitto ? bookmaker : min);
  
  let analysis = `ANALISI DISTRIBUZIONE PER BOOKMAKER\n\n`;
  analysis += `• Scommesse totali: ${totalBets}\n`;
  analysis += `• Bookmaker utilizzati: ${bookmakerData.length}\n`;
  analysis += `• Profitto totale: ${formatCurrency(totalProfit)}\n\n`;
  
  analysis += `DISTRIBUZIONE SCOMMESSE:\n`;
  analysis += `• Bookmaker più utilizzato: ${mostUsedBookmaker.bookmaker} (${mostUsedBookmaker.scommesse} scommesse, ${((mostUsedBookmaker.scommesse / totalBets) * 100).toFixed(1)}%)\n`;
  
  bookmakerData.forEach(bookmaker => {
    const percentage = ((bookmaker.scommesse / totalBets) * 100).toFixed(1);
    analysis += `• ${bookmaker.bookmaker}: ${bookmaker.scommesse} scommesse (${percentage}%)\n`;
  });
  
  analysis += `\nPROFITTO PER BOOKMAKER:\n`;
  analysis += `• Bookmaker più redditizio: ${mostProfitableBookmaker.bookmaker} (${formatCurrency(mostProfitableBookmaker.profitto)})\n`;
  analysis += `• Bookmaker meno redditizio: ${leastProfitableBookmaker.bookmaker} (${formatCurrency(leastProfitableBookmaker.profitto)})\n\n`;
  
  const profitableBookmakers = bookmakerData.filter(bookmaker => bookmaker.profitto > 0).length;
  const unprofitableBookmakers = bookmakerData.filter(bookmaker => bookmaker.profitto < 0).length;
  
  analysis += `BILANCIO BOOKMAKER:\n`;
  analysis += `• Bookmaker redditizi: ${profitableBookmakers}\n`;
  analysis += `• Bookmaker in perdita: ${unprofitableBookmakers}\n\n`;
  
  if (profitableBookmakers > unprofitableBookmakers) {
    analysis += `CONCLUSIONE: `;
    analysis += `${mostProfitableBookmaker.bookmaker} è il bookmaker più performante a livello di quote e puntate.`;
  } else {
    analysis += `CONCLUSIONE: `;
    analysis += `Considera di rivedere la strategia per i bookmaker meno performanti.`;
  }
  
  return analysis;
};

// Helper function to generate detailed analysis for sports performance table
const generateSportsPerformanceAnalysis = (sportData: Record<string, { count: number; profit: number }>, filteredBets: Bet[]) => {
  if (Object.keys(sportData).length === 0) return "Nessun dato disponibile per l'analisi delle performance per sport.";
  
  const totalBets = Object.values(sportData).reduce((sum, data) => sum + data.count, 0);
  const totalProfit = Object.values(sportData).reduce((sum, data) => sum + data.profit, 0);
  
  // Calculate win rates for each sport
  const sportWinRates = Object.entries(sportData).map(([sport, data]) => {
    const sportBets = filteredBets.filter(bet => (bet.sport || 'Altro') === sport);
    const wonBets = sportBets.filter(bet => bet.status === 'won').length;
    const winRate = sportBets.length > 0 ? (wonBets / sportBets.length) * 100 : 0;
    return { sport, ...data, winRate };
  });
  
  const bestWinRate = sportWinRates.reduce((max, sport) => sport.winRate > max.winRate ? sport : max);
  const worstWinRate = sportWinRates.reduce((min, sport) => sport.winRate < min.winRate ? sport : min);
  const mostProfitableSport = sportWinRates.reduce((max, sport) => sport.profit > max.profit ? sport : max);
  const leastProfitableSport = sportWinRates.reduce((min, sport) => sport.profit < min.profit ? sport : min);
  
  let analysis = `ANALISI PERFORMANCE PER SPORT\n\n`;
  analysis += `• Scommesse totali: ${totalBets}\n`;
  analysis += `• Sport analizzati: ${Object.keys(sportData).length}\n`;
  analysis += `• Profitto totale: ${formatCurrency(totalProfit)}\n\n`;
  
  analysis += `PERFORMANCE WIN RATE:\n`;
  analysis += `• Miglior win rate: ${bestWinRate.sport} (${bestWinRate.winRate.toFixed(1)}%)\n`;
  analysis += `• Peggior win rate: ${worstWinRate.sport} (${worstWinRate.winRate.toFixed(1)}%)\n`;
  
  const avgWinRate = sportWinRates.reduce((sum, sport) => sum + sport.winRate, 0) / sportWinRates.length;
  analysis += `• Win rate medio: ${avgWinRate.toFixed(1)}%\n\n`;
  
  analysis += `PERFORMANCE PROFITTO:\n`;
  analysis += `• Sport più redditizio: ${mostProfitableSport.sport} (${formatCurrency(mostProfitableSport.profit)})\n`;
  analysis += `• Sport meno redditizio: ${leastProfitableSport.sport} (${formatCurrency(leastProfitableSport.profit)})\n\n`;
  
  const profitableSports = sportWinRates.filter(sport => sport.profit > 0).length;
  const unprofitableSports = sportWinRates.filter(sport => sport.profit < 0).length;
  
  analysis += `BILANCIO GENERALE:\n`;
  analysis += `• Sport redditizi: ${profitableSports}\n`;
  analysis += `• Sport in perdita: ${unprofitableSports}\n\n`;
  
  if (profitableSports > unprofitableSports) {
    analysis += `CONCLUSIONE: La maggior parte degli sport sono redditizi. `;
    analysis += `Il miglior performer è ${mostProfitableSport.sport} con ${formatCurrency(mostProfitableSport.profit)} di profitto.`;
  } else {
    analysis += `CONCLUSIONE: La maggior parte degli sport sono in perdita. `;
    analysis += `Considera di rivedere la strategia per gli sport meno performanti.`;
  }
  
  return analysis;
};

// Helper function to generate detailed analysis for main statistics
const generateMainStatsAnalysis = (stats: {
  totalProfit: number;
  overallROI: number;
  winRate: number;
  totalBets: number;
  averageOdds: number;
  averageStake: number;
  totalStake: number;
}) => {
  let analysis = `ANALISI STATISTICHE PRINCIPALI\n\n`;
  
  analysis += `PROFITTO E PERFORMANCE:\n`;
  analysis += `• Profitto totale: ${formatCurrency(stats.totalProfit)}\n`;
  analysis += `• ROI complessivo: ${stats.overallROI.toFixed(1)}%\n`;
  analysis += `• Stake totale: ${formatCurrency(stats.totalStake)}\n`;
  analysis += `• Scommesse totali: ${stats.totalBets}\n\n`;
  
  analysis += `WIN RATE E CONSISTENZA:\n`;
  analysis += `• Win rate: ${stats.winRate.toFixed(1)}%\n`;
  analysis += `• Scommesse vincenti: ${Math.round((stats.winRate / 100) * stats.totalBets)}\n`;
  analysis += `• Scommesse perdenti: ${stats.totalBets - Math.round((stats.winRate / 100) * stats.totalBets)}\n\n`;
  
  analysis += `STRATEGIA DI PUNTATA:\n`;
  analysis += `• Puntata media: ${formatCurrency(stats.averageStake)}\n`;
  analysis += `• Quota media: ${stats.averageOdds.toFixed(2)}\n`;
  analysis += `• Rapporto quota/puntata: ${(stats.averageOdds / (stats.averageStake / 100)).toFixed(2)}\n\n`;
  
  // Performance evaluation
  analysis += `VALUTAZIONE PERFORMANCE:\n`;
  
  if (stats.overallROI > 0) {
    if (stats.overallROI > 10) {
      analysis += `• ECCELLENTE: ROI molto alto (${stats.overallROI.toFixed(1)}%) - strategia molto efficace\n`;
    } else if (stats.overallROI > 5) {
      analysis += `• BUONO: ROI positivo (${stats.overallROI.toFixed(1)}%) - strategia efficace\n`;
    } else {
      analysis += `• POSITIVO: ROI leggermente positivo (${stats.overallROI.toFixed(1)}%) - strategia promettente\n`;
    }
  } else {
    analysis += `• NEGATIVO: ROI negativo (${stats.overallROI.toFixed(1)}%) - necessita revisione strategia\n`;
  }
  
  if (stats.winRate > 60) {
    analysis += `• Win rate alto (${stats.winRate.toFixed(1)}%) - buona capacità di selezione\n`;
  } else if (stats.winRate > 50) {
    analysis += `• Win rate nella media (${stats.winRate.toFixed(1)}%) - selezione equilibrata\n`;
  } else {
    analysis += `• Win rate basso (${stats.winRate.toFixed(1)}%) - necessita miglioramento selezione\n`;
  }
  
  if (stats.averageOdds < 1.7) {
    analysis += `• Quote basse (${stats.averageOdds.toFixed(2)}) - strategia a basso rischio\n`;
  } else if (stats.averageOdds >= 1.7 && stats.averageOdds <= 2.3) {
    analysis += `• Quote moderate (${stats.averageOdds.toFixed(2)}) - strategia a medio rischio\n`;
  } else {
    analysis += `• Quote alte (${stats.averageOdds.toFixed(2)}) - strategia ad alto rischio\n`;
  }
  
  return analysis;
};

// Helper function to add text to PDF with proper wrapping
const addWrappedText = (pdf: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number = 5) => {
  const lines = pdf.splitTextToSize(text, maxWidth);
  let currentY = y;
  
  lines.forEach((line: string) => {
    pdf.text(line, x, currentY);
    currentY += lineHeight;
  });
  
  return currentY;
};

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

export const exportToPDF = async (elementId: string, filename: string = 'analisi-prestazioni.pdf', analysisData?: AnalysisData) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Create PDF with better margins
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 15; // Margin in mm
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);

    // Add title page
    pdf.setFontSize(24);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Analisi Prestazioni', pageWidth / 2, 50, { align: 'center' });
    
    pdf.setFontSize(12);
    const currentDate = new Date().toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    pdf.text(`Generato il ${currentDate}`, pageWidth / 2, 70, { align: 'center' });

    let currentY = 90; // Start position after title

    // Hide export button during capture
    const exportButton = document.querySelector('button[onclick*="exportToPDF"]') as HTMLElement;
    if (exportButton) {
      exportButton.style.display = 'none';
    }

    // Hide all buttons during capture
    const buttons = element.querySelectorAll('button');
    const originalButtonStyles: string[] = [];
    buttons.forEach((btn, index) => {
      originalButtonStyles[index] = (btn as HTMLElement).style.display;
      (btn as HTMLElement).style.display = 'none';
    });

    // Capture stats cards
    const statsCards = element.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 > div');
    if (statsCards.length > 0) {
      pdf.setFontSize(16);
      pdf.text('Statistiche Principali', margin, currentY);
      currentY += 15;

      // Prepare analysis data for main stats (for height estimation)
      let mainStatsAnalysis = '';
      if (analysisData) {
        // Calculate main stats from analysis data
        const totalProfit = analysisData.filteredBets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
        const totalStake = analysisData.filteredBets.reduce((sum, bet) => sum + bet.stake, 0);
        const wonBets = analysisData.filteredBets.filter(bet => bet.status === 'won').length;
        const winRate = analysisData.filteredBets.length > 0 ? (wonBets / analysisData.filteredBets.length) * 100 : 0;
        const overallROI = calculateROI(totalProfit, totalStake);
        const averageOdds = analysisData.filteredBets.reduce((sum, bet) => sum + bet.odds, 0) / analysisData.filteredBets.length;
        const averageStake = totalStake / analysisData.filteredBets.length;
        const mainStats = {
          totalProfit,
          overallROI,
          winRate,
          totalBets: analysisData.filteredBets.length,
          averageOdds,
          averageStake,
          totalStake
        };
        mainStatsAnalysis = generateMainStatsAnalysis(mainStats);
      }

      // Capture stats in groups of 3 (one row)
      for (let i = 0; i < statsCards.length; i += 3) {
        const rowCards = Array.from(statsCards).slice(i, i + 3);
        
        // Create a temporary container for this row
        const tempContainer = document.createElement('div');
        tempContainer.style.display = 'flex';
        tempContainer.style.gap = '1.5rem';
        tempContainer.style.width = '100%';
        tempContainer.style.backgroundColor = 'white';
        tempContainer.style.padding = '1rem';
        
        rowCards.forEach(card => {
          const clonedCard = card.cloneNode(true) as HTMLElement;
          clonedCard.style.flex = '1';
          tempContainer.appendChild(clonedCard);
        });
        
        document.body.appendChild(tempContainer);
        
        try {
          const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: tempContainer.scrollWidth,
            height: tempContainer.scrollHeight,
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Estimate comment height
          let commentHeight = 0;
          if (mainStatsAnalysis) {
            pdf.setFontSize(10);
            const commentLines = pdf.splitTextToSize(mainStatsAnalysis, contentWidth);
            commentHeight = commentLines.length * 4 + 10; // 4 is lineHeight, 10 margin
          }

          // If this is the first row, check if both stats and comment fit together
          if (i === 0) {
            if (currentY + imgHeight + commentHeight > contentHeight) {
              pdf.addPage();
              currentY = margin;
            }
          } else {
            // For subsequent rows, just check for the image
            if (currentY + imgHeight > contentHeight) {
              pdf.addPage();
              currentY = margin;
            }
          }
          
          pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 10;
          
        } catch (error) {
          console.error('Error capturing stats row:', error);
        } finally {
          document.body.removeChild(tempContainer);
        }
      }
      
      // Add detailed analysis for main statistics immediately after stats
      if (mainStatsAnalysis) {
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        currentY = addWrappedText(pdf, mainStatsAnalysis, margin, currentY, contentWidth, 4);
        currentY += 10;
      }
    }

    // Add new page for charts only if we don't have enough space
    if (currentY + 200 > contentHeight) { // Estimate space needed for charts section
      pdf.addPage();
      currentY = margin;
    }
    
    pdf.setFontSize(16);
    pdf.text('Grafici e Analisi', margin, currentY);
    currentY += 15;

    // Capture bankroll evolution chart (first chart)
    const bankrollChart = element.querySelector('.charts-section .bg-white\\/80');
    if (bankrollChart) {
      try {
        const canvas = await html2canvas(bankrollChart as HTMLElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: (bankrollChart as HTMLElement).scrollWidth,
          height: (bankrollChart as HTMLElement).scrollHeight,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Prepare analysis for bankroll evolution (for height estimation)
        let bankrollAnalysis = '';
        let commentHeight = 0;
        if (analysisData) {
          pdf.setFontSize(10);
          bankrollAnalysis = generateBankrollAnalysis(analysisData.bankrollEvolutionData, analysisData.initialBankroll);
          const commentLines = pdf.splitTextToSize(bankrollAnalysis, contentWidth);
          commentHeight = commentLines.length * 4 + 10; // 4 is lineHeight, 10 margin
        }

        // Check if both chart and comment fit together
        if (currentY + imgHeight + commentHeight > contentHeight) {
          pdf.addPage();
          currentY = margin;
        }
        
        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 15;
        
        // Add detailed analysis for bankroll evolution on the same page if possible
        if (analysisData && bankrollAnalysis) {
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
          currentY = addWrappedText(pdf, bankrollAnalysis, margin, currentY, contentWidth, 4);
          currentY += 10;
        }
        
      } catch (error) {
        console.error('Error capturing bankroll chart:', error);
      }
    }

    // Capture performance chart if it exists (conditional chart)
    const performanceChart = element.querySelector('.charts-section .bg-white\\/80:nth-child(2)');
    if (performanceChart && performanceChart.textContent?.includes('Performance (ROI)')) {
      try {
        const canvas = await html2canvas(performanceChart as HTMLElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: (performanceChart as HTMLElement).scrollWidth,
          height: (performanceChart as HTMLElement).scrollHeight,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Check if we need a new page for the chart
        if (currentY + imgHeight > contentHeight - 50) { // Leave space for analysis
          pdf.addPage();
          currentY = margin;
        }
        
        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 15;
        
        // Add detailed analysis for performance chart on the same page if possible
        if (analysisData) {
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
          
          const performanceAnalysis = generatePerformanceAnalysis(analysisData.monthlyPerformanceData);
          
          // Check if we need a new page for the analysis
          if (currentY + 100 > contentHeight) {
            pdf.addPage();
            currentY = margin;
          }
          
          currentY = addWrappedText(pdf, performanceAnalysis, margin, currentY, contentWidth, 4);
          currentY += 10;
        }
        
      } catch (error) {
        console.error('Error capturing performance chart:', error);
      }
    }

    // Add new page for pie charts only if we don't have enough space
    if (currentY + 200 > contentHeight) { // Estimate space needed for pie charts
      pdf.addPage();
      currentY = margin;
    }
    
    pdf.setFontSize(16);
    pdf.text('Distribuzione Dati', margin, currentY);
    currentY += 15;

    // Find all charts sections and capture pie charts specifically
    const allChartSections = element.querySelectorAll('.charts-section');
    
    // The pie charts are in the second charts-section
    if (allChartSections.length > 1) {
      const pieChartsSection = allChartSections[1]; // Second charts section contains pie charts
      const pieCharts = pieChartsSection.querySelectorAll('.bg-white\\/80');
      
      for (const pieChart of pieCharts) {
        // Check if this card contains a pie chart by looking for specific text
        if (pieChart.textContent?.includes('Distribuzione per Sport') || 
            pieChart.textContent?.includes('Distribuzione per Bookmaker')) {
          
          try {
            const canvas = await html2canvas(pieChart as HTMLElement, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              width: (pieChart as HTMLElement).scrollWidth,
              height: (pieChart as HTMLElement).scrollHeight,
            });
            
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = contentWidth / 2 - 5; // Half width for side by side
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Position charts side by side
            const isFirstChart = pieChart.textContent?.includes('Distribuzione per Sport');
            const xPosition = isFirstChart ? margin : margin + imgWidth + 10;
            
            // Check if we need a new page (only for the first chart of the pair)
            if (isFirstChart && currentY + imgHeight > contentHeight - 100) { // Leave space for analysis
              pdf.addPage();
              currentY = margin;
            }
            
            pdf.addImage(imgData, 'PNG', xPosition, currentY, imgWidth, imgHeight);
            
            // Move Y position only after both charts are placed
            if (!isFirstChart && analysisData) {
              currentY += imgHeight + 15;
              
              // Add detailed analysis for both pie charts on the same page if possible
              pdf.setFontSize(10);
              pdf.setTextColor(0, 0, 0);
              
              const sportsAnalysis = generateSportsDistributionAnalysis(analysisData.sportData, analysisData.totalBets);
              const bookmakerAnalysis = generateBookmakerDistributionAnalysis(analysisData.bookmakerData, analysisData.totalBets);
              
              // Check if we need a new page for the analysis
              if (currentY + 150 > contentHeight) {
                pdf.addPage();
                currentY = margin;
              }
              
              currentY = addWrappedText(pdf, sportsAnalysis, margin, currentY, contentWidth, 4);
              currentY += 10;
              currentY = addWrappedText(pdf, bookmakerAnalysis, margin, currentY, contentWidth, 4);
              currentY += 10;
            }
            
          } catch (error) {
            console.error('Error capturing pie chart:', error);
          }
        }
      }
    }

    // Add new page for sports performance table only if we don't have enough space
    if (currentY + 200 > contentHeight) { // Estimate space needed for table
      pdf.addPage();
      currentY = margin;
    }
    
    pdf.setFontSize(16);
    pdf.text('Performance per Sport', margin, currentY);
    currentY += 15;

    // Find and capture the sports performance table
    const sportsTableSection = element.querySelector('.sports-table');
    if (sportsTableSection) {
      const sportsTable = sportsTableSection.querySelector('.bg-white\\/80');
      if (sportsTable) {
        try {
          const canvas = await html2canvas(sportsTable as HTMLElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: (sportsTable as HTMLElement).scrollWidth,
            height: (sportsTable as HTMLElement).scrollHeight,
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Check if we need a new page for the table
          if (currentY + imgHeight > contentHeight - 50) { // Leave space for analysis
            pdf.addPage();
            currentY = margin;
          }
          
          pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 15;
          
          // Add detailed analysis for sports performance table on the same page if possible
          if (analysisData) {
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            
            const sportsPerformanceAnalysis = generateSportsPerformanceAnalysis(analysisData.sportsPerformanceData, analysisData.filteredBets);
            
            // Check if we need a new page for the analysis
            if (currentY + 100 > contentHeight) {
              pdf.addPage();
              currentY = margin;
            }
            
            currentY = addWrappedText(pdf, sportsPerformanceAnalysis, margin, currentY, contentWidth, 4);
            currentY += 10;
          }
          
        } catch (error) {
          console.error('Error capturing sports table:', error);
        }
      }
    }

    // Restore button visibility
    buttons.forEach((btn, index) => {
      (btn as HTMLElement).style.display = originalButtonStyles[index] || '';
    });

    if (exportButton) {
      exportButton.style.display = '';
    }

    // Add page numbers
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text(`Pagina ${i} di ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    // Save the PDF
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};
