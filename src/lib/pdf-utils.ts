
"use client";

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ReportData, KpiCardData } from './types';


const cleanText = (text: string): string => {
    if (!text) return '';
    return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').replace(/[^a-zA-Z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ.,\s-:;()[\]/|%@]/g, '');
};

const drawKpiCard = (doc: jsPDF, card: KpiCardData, x: number, y: number, width: number, height: number) => {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, width, height, 5, 5, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(cleanText(card.title), x + 10, y + 15);

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(cleanText(card.value), x + 10, y + 35);

    const changeText = cleanText(card.change);
    const isPositive = changeText.startsWith('+');
    const changeColor = isPositive ? [40, 167, 69] : [220, 53, 69];
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Draw colored arrow
    doc.setTextColor(changeColor[0], changeColor[1], changeColor[2]);
    doc.text(isPositive ? '▲' : '▼', x + 120, y + 34);
    
    // Draw text for percentage change
    doc.text(changeText, x + 130, y + 35);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(cleanText(card.previousValue), x + 10, y + 50);
};


export function generatePdf(data: ReportData) {
    const doc = new jsPDF({ unit: 'pt' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;

    // --- Header com fundo azul ---
    doc.setFillColor(23, 115, 232); // Azul similar ao da imagem
    doc.rect(0, 0, pageWidth, 90, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    const titleLines = doc.splitTextToSize(cleanText(data.reportTitle), pageWidth - margin * 2);
    doc.text(titleLines, margin, 45);

    // --- Área de conteúdo ---
    let cursorY = 110;
    
    // Header do Relatório (e.g., Google Ads Reporte 2024)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text("Relatório de Desempenho", margin, cursorY);
    cursorY += 25;

    // --- Grid de KPIs ---
    const cardsPerRow = 2;
    const cardWidth = (pageWidth - margin * 2 - 20) / cardsPerRow;
    const cardHeight = 65;
    const cardMargin = 20;
    
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
