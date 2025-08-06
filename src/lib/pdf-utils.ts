
"use client";

import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Import for table functionality
import type { ReportData, KpiCardData, CategoryReportData } from './types';

// Extend jsPDF with autoTable, if it's not already defined
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

const cleanText = (text: string | undefined | null): string => {
    if (!text) return '';
    // This regex removes a wide range of emojis and non-printable characters
    const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
    return text.replace(emojiRegex, '').trim();
};

const drawKpiCard = (doc: jsPDF, card: KpiCardData, x: number, y: number, width: number, height: number) => {
    const padding = 10;
    let cursorY = y + 18;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(x, y, width, height, 5, 5, 'FD');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    const titleLines = doc.splitTextToSize(cleanText(card.title), width - padding * 2);
    doc.text(titleLines, x + padding, cursorY);
    
    // Calculate Y position for the value dynamically based on the title's height.
    // The '10' is the line height for the title's font size.
    // The '+ 12' adds a consistent margin like the 'my-2' class.
    cursorY += (titleLines.length * 10) + 12;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    const valueLines = doc.splitTextToSize(cleanText(card.value), width - padding * 2);
    doc.text(valueLines, x + padding, cursorY);

    if (card.description) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(29, 78, 216);
        const descriptionLines = doc.splitTextToSize(cleanText(card.description), width - padding * 2);
        doc.text(descriptionLines, x + padding, y + height - 12);
    }
};


const drawCategorySection = (doc: jsPDFWithAutoTable, categoryData: CategoryReportData, startY: number, pageWidth: number, margin: number): number => {
    let cursorY = startY;

    // --- Draw Category Title and Total Investment ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(cleanText(categoryData.categoryName), margin, cursorY);
    
    const investmentText = `Investimento Total: ${cleanText(categoryData.totalInvestment)}`;
    const investmentTextWidth = doc.getTextWidth(investmentText);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);
    doc.text(investmentText, pageWidth - margin - investmentTextWidth, cursorY);

    cursorY += 35; // Space between category title and KPI cards

    // --- Draw KPI Cards ---
    const cardsPerRow = 4;
    const cardGap = 15;
    const cardWidth = (pageWidth - margin * 2 - cardGap * (cardsPerRow - 1)) / cardsPerRow;
    const cardHeight = 70;
    
    categoryData.kpiCards.forEach((card, index) => {
        const rowIndex = Math.floor(index / cardsPerRow);
        const colIndex = index % cardsPerRow;
        
        const cardX = margin + colIndex * (cardWidth + cardGap);
        let cardY = cursorY + rowIndex * (cardHeight + cardGap);

        // Check if card will go off the page, if so, add a new page
        if (cardY + cardHeight > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            // Reset the cursor Y position, subtracting the space already occupied by previous rows
            cursorY = margin - (rowIndex * (cardHeight + cardGap)); 
            cardY = cursorY + rowIndex * (cardHeight + cardGap);
        }
        
        drawKpiCard(doc, card, cardX, cardY, cardWidth, cardHeight);
    });

    const totalRows = Math.ceil(categoryData.kpiCards.length / cardsPerRow);
    return cursorY + totalRows * (cardHeight + cardGap);
};


export function generatePdf(data: ReportData, clientName?: string | null) {
    if (!data || !data.reportTitle || !data.categories) {
        console.error("Invalid data provided to generatePdf");
        alert("Não foi possível gerar o PDF. Dados inválidos ou ausentes.");
        return;
    }

    const doc = new jsPDF({ unit: 'pt' }) as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let cursorY = 0;

    // --- Draw Header ---
    doc.setFillColor(29, 78, 216); // Primary blue color
    doc.rect(0, 0, pageWidth, 120, 'F');
    
    cursorY = 45;

    // Client Name (if provided)
    if (clientName) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        const clientText = `Cliente: ${cleanText(clientName)}`;
        const clientTextLines = doc.splitTextToSize(clientText, pageWidth - margin * 2);
        doc.text(clientTextLines, margin, cursorY);
        cursorY += (clientTextLines.length * 14) + 10;
    }

    // Report Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    const titleLines = doc.splitTextToSize(cleanText(data.reportTitle), pageWidth - margin * 2);
    doc.text(titleLines, margin, cursorY);
    cursorY += (titleLines.length * 22) + 5;

    // Report Period
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(229, 231, 235); // Lighter white
    doc.text(cleanText(data.reportPeriod), margin, cursorY);

    // --- Draw Main Content ---
    let contentCursorY = 150; // Start content below the header
    
    data.categories.forEach((category, index) => {
        // Estimate section height to check for page breaks
        const kpiRows = Math.ceil(category.kpiCards.length / 4);
        const sectionHeightEstimate = 50 + (kpiRows * 85); // Title height + (rows * (card height + gap))

        // If the estimated height will overflow and it's not the first category on the page
        if (contentCursorY + sectionHeightEstimate > pageHeight - margin && contentCursorY > 150) { 
           doc.addPage();
           contentCursorY = margin;
        } else if (index > 0) {
           contentCursorY += 20; // Add space between categories
        }
        
        contentCursorY = drawCategorySection(doc, category, contentCursorY, pageWidth, margin);
    });

    const safeFileName = clientName ? `relatorio_${cleanText(clientName)}` : "relatorio_de_campanha";
    doc.save(`${safeFileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
}
