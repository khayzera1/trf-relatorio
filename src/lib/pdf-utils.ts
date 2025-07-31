
"use client";

import jsPDF from 'jspdf';
import type { ReportData, KpiCardData, CampaignReportData } from './types';


const cleanText = (text: string | undefined | null): string => {
    if (!text) return '';
    // Removes emojis and other special characters not supported by standard PDF fonts
    return text.replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
               .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Symbols & Pictographs
               .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport & Map Symbols
               .replace(/[\u{1F700}-\u{1F77F}]/gu, '') // Alchemical Symbols
               .replace(/[\u{1F780}-\u{1F7FF}]/gu, '') // Geometric Shapes Extended
               .replace(/[\u{1F800}-\u{1F8FF}]/gu, '') // Supplemental Arrows-C
               .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
               .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
               .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
               .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Miscellaneous Symbols
               .replace(/[\u{2700}-\u{27BF}]/gu, '');  // Dingbats
};

const drawKpiCard = (doc: jsPDF, card: KpiCardData, x: number, y: number, width: number, height: number) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 231, 235); // border-gray-200
    doc.roundedRect(x, y, width, height, 5, 5, 'FD'); // Fill and Draw for border
    
    // KPI Title (e.g., "Impressões")
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128); // text-muted-foreground (text-gray-500)
    doc.text(cleanText(card.title), x + 10, y + 15);

    // KPI Value (e.g., "35.671")
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39); // text-foreground (text-gray-900)
    doc.text(cleanText(card.value), x + 10, y + 35);
    
    if (card.description) {
        // KPI Description (e.g., "Conversa no WhatsApp")
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(29, 78, 216); // text-primary (blue-700)
        doc.text(cleanText(card.description), x + 10, y + 50);
    }
};

const drawCampaignSection = (doc: jsPDF, campaignData: CampaignReportData, startY: number, pageWidth: number, margin: number): number => {
    let cursorY = startY;

    // --- Campaign Name Header ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39); // text-gray-900
    doc.text(cleanText(campaignData.campaignName), margin, cursorY);
    cursorY += 25;

    // --- Grid de KPIs ---
    const cardsPerRow = 4;
    const cardGap = 15;
    const cardWidth = (pageWidth - margin * 2 - cardGap * (cardsPerRow - 1)) / cardsPerRow;
    const cardHeight = 60;
    
    let rowIndex = 0;

    campaignData.kpiCards.forEach((card, index) => {
        const colIndex = index % cardsPerRow;
        const currentX = margin + colIndex * (cardWidth + cardGap);
        let currentY = cursorY + rowIndex * (cardHeight + cardGap);
        
        // Check if we need to start a new row
        if (colIndex === 0 && index > 0) {
            rowIndex++;
            // recalculate Y after incrementing row
            currentY = cursorY + rowIndex * (cardHeight + cardGap); 
        }

        // Check for page break before drawing the next row
        if (currentY + cardHeight > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            // Reset Y for the new page
            cursorY = margin; 
            // Reset row index for new page, since we are starting from the top
            rowIndex = 0; 
            // Recalculate Y position on new page
            currentY = cursorY + rowIndex * (cardHeight + cardGap);
            drawKpiCard(doc, card, currentX, currentY, cardWidth, cardHeight);
        } else {
             drawKpiCard(doc, card, currentX, currentY, cardWidth, cardHeight);
        }
    });

    const totalRows = Math.ceil(campaignData.kpiCards.length / cardsPerRow);
    // Return the Y position for the next section
    return cursorY + totalRows * (cardHeight + cardGap) - cardGap; 
};

export function generatePdf(data: ReportData) {
    if (!data || !data.reportTitle || !data.campaigns) {
        console.error("Invalid data provided to generatePdf");
        alert("Não foi possível gerar o PDF. Dados inválidos ou ausentes.");
        return;
    }

    const doc = new jsPDF({ unit: 'pt' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;

    // --- Header com fundo azul ---
    doc.setFillColor(29, 78, 216); // bg-blue-700
    doc.rect(0, 0, pageWidth, 110, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    const title = cleanText(data.reportTitle);
    doc.text(title, margin, 55);

    // Report Period
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(229, 231, 235); // primary-foreground/90
    const period = cleanText(data.reportPeriod);
    doc.text(period, margin, 80);


    // --- Área de conteúdo ---
    let cursorY = 140;
    
    data.campaigns.forEach((campaign, index) => {
        // Check for page break before starting a new campaign section
        if (cursorY + 120 > doc.internal.pageSize.getHeight() - margin) { // 120 is an estimate for section height
           doc.addPage();
           cursorY = margin;
        } else if (index > 0) {
           cursorY += 20; // Add some space between campaigns on the same page
        }
        
        cursorY = drawCampaignSection(doc, campaign, cursorY, pageWidth, margin);
    });

    const safeTitle = cleanText(data.reportTitle) || "relatorio";
    doc.save(`${safeTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
}
