
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

    // Draw card background and border
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 231, 235); // Light grey border
    doc.roundedRect(x, y, width, height, 5, 5, 'FD');

    const contentWidth = width - padding * 2;
    const internalSpacing = 8; // Spacing between text elements

    // --- Dynamic Font Size for Value ---
    let valueFontSize = 20;
    const cleanValue = cleanText(card.value);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(valueFontSize);
    let valueWidth = doc.getTextWidth(cleanValue);

    while (valueWidth > contentWidth && valueFontSize > 8) {
        valueFontSize -= 1;
        doc.setFontSize(valueFontSize);
        valueWidth = doc.getTextWidth(cleanValue);
    }
    
    // --- Content Height Calculation (with final font sizes) ---
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const titleLines = doc.splitTextToSize(cleanText(card.title), contentWidth);
    const titleHeight = doc.getTextDimensions(titleLines).h;

    doc.setFontSize(valueFontSize);
    doc.setFont('helvetica', 'bold');
    const valueLines = doc.splitTextToSize(cleanValue, contentWidth);
    const valueHeight = doc.getTextDimensions(valueLines).h;

    let descriptionHeight = 0;
    let descriptionLines: string[] = [];
    if (card.description) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        descriptionLines = doc.splitTextToSize(cleanText(card.description), contentWidth);
        descriptionHeight = doc.getTextDimensions(descriptionLines).h;
    }

    let totalContentHeight = titleHeight + internalSpacing + valueHeight;
    if (descriptionHeight > 0) {
        totalContentHeight += internalSpacing + descriptionHeight;
    }

    // --- Drawing Logic ---
    let cursorY = y + (height - totalContentHeight) / 2;

    // 1. Draw Title
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128); // Muted foreground color
    doc.text(titleLines, x + padding, cursorY, { baseline: 'top' });
    cursorY += titleHeight + internalSpacing;

    // 2. Draw Value
    doc.setFontSize(valueFontSize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39); // Default foreground color
    doc.text(valueLines, x + padding, cursorY, { baseline: 'top' });
    cursorY += valueHeight + internalSpacing;

    // 3. Draw Description (if it exists)
    if (card.description) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(29, 78, 216); // Primary color
        doc.text(descriptionLines, x + padding, cursorY, { baseline: 'top' });
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
    const cardsPerRow = 3;
    const cardGap = 15;
    const cardWidth = (pageWidth - margin * 2 - cardGap * (cardsPerRow - 1)) / cardsPerRow;
    const cardHeight = 85; 
    
    categoryData.kpiCards.forEach((card, index) => {
        const rowIndex = Math.floor(index / cardsPerRow);
        const colIndex = index % cardsPerRow;
        
        let cardX = margin + colIndex * (cardWidth + cardGap);
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
    const headerHeight = 120;

    // --- Draw Header ---
    doc.setFillColor(29, 78, 216); // Primary blue color
    doc.rect(0, 0, pageWidth, headerHeight, 'F');
    
    // --- Calculate total height of header content ---
    let totalContentHeight = 0;
    let clientTextLines: string[] = [];
    if (clientName) {
        doc.setFontSize(14);
        clientTextLines = doc.splitTextToSize(`Cliente: ${cleanText(clientName)}`, pageWidth - margin * 2);
        totalContentHeight += doc.getTextDimensions(clientTextLines).h + 10;
    }
    
    doc.setFontSize(22);
    const titleLines = doc.splitTextToSize(cleanText(data.reportTitle), pageWidth - margin * 2);
    totalContentHeight += doc.getTextDimensions(titleLines).h + 5;

    doc.setFontSize(11);
    const periodLines = doc.splitTextToSize(cleanText(data.reportPeriod), pageWidth - margin * 2);
    totalContentHeight += doc.getTextDimensions(periodLines).h;

    // --- Vertically center the content ---
    let cursorY = (headerHeight - totalContentHeight) / 2;
    
    // Client Name (if provided)
    if (clientName) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text(clientTextLines, margin, cursorY, { baseline: 'top' });
        cursorY += doc.getTextDimensions(clientTextLines).h + 10;
    }

    // Report Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(titleLines, margin, cursorY, { baseline: 'top' });
    cursorY += doc.getTextDimensions(titleLines).h + 5;

    // Report Period
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(229, 231, 235); // Lighter white
    doc.text(periodLines, margin, cursorY, { baseline: 'top' });

    // --- Draw Main Content ---
    let contentCursorY = headerHeight + 30; // Start content below the header
    
    data.categories.forEach((category, index) => {
        // Estimate section height to check for page breaks
        const kpiRows = Math.ceil(category.kpiCards.length / 3); 
        const sectionHeightEstimate = 50 + (kpiRows * 100); // Title height + (rows * (card height + gap))

        // If the estimated height will overflow and it's not the first category on the page
        if (contentCursorY + sectionHeightEstimate > pageHeight - margin && contentCursorY > (headerHeight + 30)) { 
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
