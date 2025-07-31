
"use client";

import jsPDF from 'jspdf';

/**
 * Generates a styled PDF report with a title, summary, and a data table.
 * This version uses manual table drawing for precise control over layout.
 * @param title The main title of the report.
 * @param summary An executive summary or introductory text.
 * @param headers An array of strings for the table headers.
 * @param data An array of objects, where each object represents a row.
 */
export async function generatePdf(
    title: string,
    summary: string,
    headers: string[],
    data: Record<string, string>[]
) {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt' });
    doc.setLanguage('pt-BR');

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let cursorY = 40;

    // --- Header ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('AgênciaDev - Relatório de Marketing', margin, cursorY);
    cursorY += 15;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 25;

    // --- Report Title ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(40, 40, 40);
    const splitTitle = doc.splitTextToSize(title, pageWidth - margin * 2);
    doc.text(splitTitle, pageWidth / 2, cursorY, { align: 'center' });
    cursorY += (splitTitle.length * 20) + 20;

    // --- Executive Summary ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Resumo Executivo', margin, cursorY);
    cursorY += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const summaryLines = doc.splitTextToSize(summary, pageWidth - margin * 2);
    doc.text(summaryLines, margin, cursorY);
    cursorY += (summaryLines.length * 12) + 30;

    // --- Manual Table Drawing ---
    const tableHeaders = headers;
    const tableData = data.map(row => tableHeaders.map(header => row[header] ?? ''));
    
    // Define column widths - these are percentages of the available width
    const availableWidth = pageWidth - margin * 2;
    const columnWidths = [14, 5, 5, 6, 6, 6, 6, 5, 5, 5, 10, 8, 6, 7, 6, 6].map(w => (w / 100) * availableWidth);

    const headStyles = {
        fillColor: [214, 89, 52],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
    };
    const bodyStyles = {
        fontSize: 7,
        cellPadding: 5,
    };
    const alternateRowStyles = {
        fillColor: [247, 247, 247],
    };

    // Draw table headers
    doc.setFontSize(headStyles.fontSize);
    doc.setFont('helvetica', headStyles.fontStyle);
    doc.setTextColor(headStyles.textColor[0], headStyles.textColor[1], headStyles.textColor[2]);
    doc.setFillColor(headStyles.fillColor[0], headStyles.fillColor[1], headStyles.fillColor[2]);
    
    let currentX = margin;
    let tableHeaderCursorY = cursorY;
    
    const headerRowHeight = 30; // Fixed height for header row
    doc.rect(margin, tableHeaderCursorY, availableWidth, headerRowHeight, 'F');
    
    tableHeaders.forEach((header, i) => {
        const headerLines = doc.splitTextToSize(header, columnWidths[i] - bodyStyles.cellPadding * 2);
        doc.text(headerLines, currentX + (columnWidths[i] / 2), tableHeaderCursorY + (headerRowHeight / 2), { align: 'center', baseline: 'middle' });
        currentX += columnWidths[i];
    });

    cursorY += headerRowHeight;

    // Draw table body
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    tableData.forEach((row, rowIndex) => {
        const rowHeight = 30; // Fixed height for data rows
        
        // Alternate row color
        if (rowIndex % 2 !== 0) {
            doc.setFillColor(alternateRowStyles.fillColor[0], alternateRowStyles.fillColor[1], alternateRowStyles.fillColor[2]);
            doc.rect(margin, cursorY, availableWidth, rowHeight, 'F');
        }

        currentX = margin;
        row.forEach((cell, colIndex) => {
            const cellLines = doc.splitTextToSize(String(cell), columnWidths[colIndex] - bodyStyles.cellPadding * 2);
            doc.text(cellLines, currentX + (columnWidths[colIndex] / 2), cursorY + (rowHeight / 2), { align: 'center', baseline: 'middle' });
            currentX += columnWidths[colIndex];
        });
        
        cursorY += rowHeight;
    });

    // Draw page numbers (if needed, this is a basic example)
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(
        `Página 1 de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 20,
        { align: 'center' }
    );

    doc.save(`${title.replace(/\s/g, '_').toLowerCase()}.pdf`);
}
