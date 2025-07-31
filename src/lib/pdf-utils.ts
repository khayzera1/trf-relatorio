
"use client";

import jsPDF from 'jspdf';
import type { ReportData, KpiCardData } from './types';


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
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39); // text-foreground (text-gray-900)
    doc.text(cleanText(card.value), x + 10, y + 40);
    
    // "no período atual" text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128); // text-muted-foreground
    doc.text("no período atual", x + 10, y + 55);
};


export function generatePdf(data: ReportData) {
    if (!data || !data.reportTitle || !data.kpiCards) {
        console.error("Invalid data provided to generatePdf");
        alert("Não foi possível gerar o PDF. Dados inválidos ou ausentes.");
        return;
    }

    const doc = new jsPDF({ unit: 'pt' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;

    // --- Header com fundo azul ---
    doc.setFillColor(29, 78, 216); // bg-blue-700
    doc.rect(0, 0, pageWidth, 90, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    const title = cleanText(data.reportTitle);
    const titleLines = doc.splitTextToSize(title, pageWidth - margin * 2);
    doc.text(titleLines, margin, 45);

    // --- Área de conteúdo ---
    let cursorY = 120;
    
    // Header do Relatório ("Relatório de Desempenho")
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39); // text-gray-900
    doc.text("Relatório de Desempenho", margin, cursorY);
    cursorY += 30;

    // --- Grid de KPIs ---
    const cardsPerRow = 2;
    const cardMargin = 20;
    const cardWidth = (pageWidth - margin * 2 - cardMargin * (cardsPerRow - 1)) / cardsPerRow;
    const cardHeight = 65;
    
    data.kpiCards.forEach((card, index) => {
        const row = Math.floor(index / cardsPerRow);
        const col = index % cardsPerRow;

        const cardX = margin + col * (cardWidth + cardMargin);
        const cardY = cursorY + row * (cardHeight + cardMargin);

        drawKpiCard(doc, card, cardX, cardY, cardWidth, cardHeight);
    });

    const safeTitle = cleanText(data.reportTitle) || "relatorio";
    doc.save(`${safeTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
}
