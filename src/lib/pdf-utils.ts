
"use client";

import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF with autoTable for TypeScript
interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}

/**
 * Generates a styled PDF report with a title, summary, and a data table.
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
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let cursorY = margin;

    // --- Header ---
    const drawHeader = () => {
        // This could be a logo image as well
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('AgênciaDev - Relatório de Marketing', margin, cursorY);
        cursorY += 8;
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 10;
    };

    drawHeader();

    // --- Report Title ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    const splitTitle = doc.splitTextToSize(title, pageWidth - margin * 2);
    doc.text(splitTitle, pageWidth / 2, cursorY, { align: 'center' });
    cursorY += (splitTitle.length * 10) + 10;

    // --- Executive Summary ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 89, 179); // Primary color
    doc.text('Resumo Executivo', margin, cursorY);
    cursorY += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    const summaryLines = doc.splitTextToSize(summary, pageWidth - margin * 2);
    doc.text(summaryLines, margin, cursorY);
    cursorY += (summaryLines.length * 5) + 15;


    // --- Data Table ---
    const tableData = data.map(row => headers.map(header => row[header] ?? ''));

    doc.autoTable({
        head: [headers],
        body: tableData,
        startY: cursorY,
        theme: 'grid',
        headStyles: {
            fillColor: [214, 89, 52], // Primary color from theme
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
        },
        styles: {
            fontSize: 9,
            cellPadding: 2.5,
            overflow: 'linebreak',
        },
        alternateRowStyles: {
            fillColor: [247, 247, 247],
        },
        columnStyles: {
            // Example of setting a specific width, adjust as needed
            // 0: { cellWidth: 20 },
        },
        didDrawPage: (data) => {
            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(9);
            doc.setTextColor(150);
            doc.text(
                `Página ${data.pageNumber} de ${pageCount}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
        },
    });

    doc.save(`${title.replace(/\s/g, '_').toLowerCase()}.pdf`);
}
