
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToPDF = async (elementId: string, filename: string = 'analisi-prestazioni.pdf') => {
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

    // Find main sections to capture separately
    const sections = [
      { selector: '.stats-overview', title: 'Panoramica Statistiche' },
      { selector: '.charts-section', title: 'Grafici Performance' },
      { selector: '.sports-table', title: 'Performance per Sport' }
    ];

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
          
          // Check if we need a new page
          if (currentY + imgHeight > contentHeight) {
            pdf.addPage();
            currentY = margin;
          }
          
          pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 10;
          
        } catch (error) {
          console.error('Error capturing stats row:', error);
        } finally {
          document.body.removeChild(tempContainer);
        }
      }
    }

    // Capture charts section
    const chartsContainer = element.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2.gap-8');
    if (chartsContainer) {
      // Add new page for charts
      pdf.addPage();
      currentY = margin;
      
      pdf.setFontSize(16);
      pdf.text('Grafici e Analisi', margin, currentY);
      currentY += 15;

      const chartCards = chartsContainer.querySelectorAll('.bg-white\\/80');
      
      for (const chartCard of chartCards) {
        try {
          const canvas = await html2canvas(chartCard as HTMLElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: (chartCard as HTMLElement).scrollWidth,
            height: (chartCard as HTMLElement).scrollHeight,
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Check if we need a new page
          if (currentY + imgHeight > contentHeight) {
            pdf.addPage();
            currentY = margin;
          }
          
          pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 15;
          
        } catch (error) {
          console.error('Error capturing chart:', error);
        }
      }
    }

    // Capture sports performance table
    const sportsTable = element.querySelector('.bg-white\\/80.backdrop-blur-sm.border-0.shadow-xl');
    if (sportsTable && sportsTable.textContent?.includes('Performance per Sport')) {
      // Add new page for table
      pdf.addPage();
      currentY = margin;
      
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
        
        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        
      } catch (error) {
        console.error('Error capturing table:', error);
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
