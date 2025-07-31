
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
    doc.text(cleanText(card.title), x + 10, y + 18);

    // KPI Value (e.g., "35.671")
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39); // text-foreground (text-gray-900)
    doc.text(cleanText(card.value), x + 10, y + 38);
    
    if (card.description) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(29, 78, 216); // text-primary (blue-700)
        const descriptionLines = doc.splitTextToSize(cleanText(card.description), width - 20);
        doc.text(descriptionLines, x + 10, y + 55);
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
    const cardHeight = 70;
    
    let rowIndex = 0;

    campaignData.kpiCards.forEach((card, index) => {
        const colIndex = index % cardsPerRow;
        const currentX = margin + colIndex * (cardWidth + cardGap);
        let currentY = cursorY + rowIndex * (cardHeight + cardGap);
        
        if (colIndex === 0 && index > 0) {
            rowIndex++;
            currentY = cursorY + rowIndex * (cardHeight + cardGap); 
        }

        if (currentY + cardHeight > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            cursorY = margin; 
            rowIndex = 0; 
            currentY = cursorY; // Start at the top for the new row
            drawKpiCard(doc, card, currentX, currentY, cardWidth, cardHeight);
        } else {
             drawKpiCard(doc, card, currentX, currentY, cardWidth, cardHeight);
        }
    });

    const totalRows = Math.ceil(campaignData.kpiCards.length / cardsPerRow);
    return cursorY + totalRows * (cardHeight + cardGap) - cardGap; 
};

export function generatePdf(data: ReportData, clientName?: string | null) {
    if (!data || !data.reportTitle || !data.campaigns) {
        console.error("Invalid data provided to generatePdf");
        alert("Não foi possível gerar o PDF. Dados inválidos ou ausentes.");
        return;
    }

    const doc = new jsPDF({ unit: 'pt' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let headerCursorY = 45;

    // --- Header com fundo azul ---
    doc.setFillColor(29, 78, 216); // bg-blue-700
    doc.rect(0, 0, pageWidth, 120, 'F');
    
    // Client Name
    if (clientName) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text(`Cliente: ${cleanText(clientName)}`, margin, headerCursorY);
        headerCursorY += 25;
    }

    // Report Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    const title = cleanText(data.reportTitle);
    doc.text(title, margin, headerCursorY);
    headerCursorY += 25;


    // Report Period
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(229, 231, 235); // primary-foreground/90
    const period = cleanText(data.reportPeriod);
    doc.text(period, margin, headerCursorY);


    // --- Área de conteúdo ---
    let contentCursorY = 150;
    
    data.campaigns.forEach((campaign, index) => {
        if (contentCursorY + 120 > doc.internal.pageSize.getHeight() - margin) { 
           doc.addPage();
           contentCursorY = margin;
        } else if (index > 0) {
           contentCursorY += 20;
        }
        
        contentCursorY = drawCampaignSection(doc, campaign, contentCursorY, pageWidth, margin);
    });

    const safeFileName = clientName ? `relatorio_${cleanText(clientName)}` : "relatorio";
    doc.save(`${safeFileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
}
