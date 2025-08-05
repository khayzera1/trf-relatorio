
"use client";

import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Import for table functionality
import type { ReportData, KpiCardData, CampaignReportData } from './types';

// Extend jsPDF with autoTable, if it's not already defined
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

const cleanText = (text: string | undefined | null): string => {
    if (!text) return '';
    // A more robust regex to remove unsupported characters, keeping common text and symbols
    return text.replace(/[^\p{L}\p{N}\p{P}\p{Z}\p{S}]/gu, '').trim();
};

const drawKpiCard = (doc: jsPDF, card: KpiCardData, x: number, y: number, width: number, height: number) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 231, 235); // border-gray-200
    doc.roundedRect(x, y, width, height, 5, 5, 'FD');
    
    // KPI Title
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128); // text-gray-500
    doc.text(cleanText(card.title), x + 10, y + 18);

    // KPI Value
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39); // text-gray-900
    doc.text(cleanText(card.value), x + 10, y + 38);
    
    if (card.description) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(29, 78, 216); // text-primary (blue-700)
        const descriptionLines = doc.splitTextToSize(cleanText(card.description), width - 20);
        doc.text(descriptionLines, x + 10, y + 55);
    }
};

const drawCampaignSection = (doc: jsPDFWithAutoTable, campaignData: CampaignReportData, startY: number, pageWidth: number, margin: number): number => {
    let cursorY = startY;

    // --- Campaign Name Header ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39); // text-gray-900
    doc.text(cleanText(campaignData.campaignName), margin, cursorY);
    cursorY += 25;

    // --- KPIs Grid ---
    const cardsPerRow = 4;
    const cardGap = 15;
    const cardWidth = (pageWidth - margin * 2 - cardGap * (cardsPerRow - 1)) / cardsPerRow;
    const cardHeight = 70;
    
    campaignData.kpiCards.forEach((card, index) => {
        const rowIndex = Math.floor(index / cardsPerRow);
        const colIndex = index % cardsPerRow;
        
        const currentX = margin + colIndex * (cardWidth + cardGap);
        const currentY = cursorY + rowIndex * (cardHeight + cardGap);

        // Check if a new page is needed BEFORE drawing the card
        if (currentY + cardHeight > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            cursorY = margin - (rowIndex * (cardHeight + cardGap)); // Adjust cursorY for the new page
        }
        
        drawKpiCard(doc, card, currentX, cursorY + rowIndex * (cardHeight + cardGap), cardWidth, cardHeight);
    });

    const totalRows = Math.ceil(campaignData.kpiCards.length / cardsPerRow);
    return cursorY + totalRows * (cardHeight + cardGap); 
};

export function generatePdf(data: ReportData, clientName?: string | null) {
    if (!data || !data.reportTitle || !data.campaigns) {
        console.error("Invalid data provided to generatePdf");
        alert("Não foi possível gerar o PDF. Dados inválidos ou ausentes.");
        return;
    }

    const doc = new jsPDF({ unit: 'pt' }) as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let cursorY = 0;

    // --- Header with blue background ---
    doc.setFillColor(29, 78, 216); // bg-blue-700
    doc.rect(0, 0, pageWidth, 120, 'F');
    
    cursorY = 45;

    if (clientName) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text(`Cliente: ${cleanText(clientName)}`, margin, cursorY);
        cursorY += 25;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(cleanText(data.reportTitle), margin, cursorY);
    cursorY += 25;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(229, 231, 235); // primary-foreground/90
    doc.text(cleanText(data.reportPeriod), margin, cursorY);

    // --- Content Area ---
    let contentCursorY = 150;
    
    data.campaigns.forEach((campaign, index) => {
        const sectionHeightEstimate = 120 + Math.ceil(campaign.kpiCards.length / 4) * 85;

        if (contentCursorY + sectionHeightEstimate > pageHeight - margin) { 
           doc.addPage();
           contentCursorY = margin;
        } else if (index > 0) {
           contentCursorY += 40; // Space between campaigns
        }
        
        contentCursorY = drawCampaignSection(doc, campaign, contentCursorY, pageWidth, margin);
    });

    const safeFileName = clientName ? `relatorio_${cleanText(clientName)}` : "relatorio";
    doc.save(`${safeFileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
}
