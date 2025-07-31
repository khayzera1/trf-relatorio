
"use client";

import jsPDF from 'jspdf';
import type { UserOptions } from 'jspdf-autotable';

// Augment jsPDF with the autoTable plugin
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDFWithAutoTable;
}

// Function to remove unsupported characters and emojis
const cleanText = (text: string): string => {
  if (!text) return '';
  // Removes most emojis and non-standard characters.
  return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').replace(/[^a-zA-Z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ.,\s-:;()[\]/|%@]/g, '');
};

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
    // Ensure we are working with a valid instance, and cast it to our augmented type
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt' }) as jsPDFWithAutoTable;
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

    // --- Report Title (Validated) ---
    const safeTitle = cleanText(title) || 'Relatório de Campanha';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(40, 40, 40);
    const splitTitle = doc.splitTextToSize(safeTitle, pageWidth - margin * 2);
    doc.text(splitTitle, pageWidth / 2, cursorY, { align: 'center' });
    cursorY += (splitTitle.length * 20) + 20;

    // --- Executive Summary (Validated) ---
    const safeSummary = cleanText(summary) || 'Não foi possível gerar um resumo para este relatório.';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Resumo Executivo', margin, cursorY);
    cursorY += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const summaryLines = doc.splitTextToSize(safeSummary, pageWidth - margin * 2);
    doc.text(summaryLines, margin, cursorY, { align: 'justify' });
    cursorY += (summaryLines.length * 12) + 30;

    // --- Data Table (Validated) ---
    const tableHeaders = headers.map(h => cleanText(h));
    // Ensure every cell in the body is a string, providing a fallback.
    const tableBody = data.map(row => 
        tableHeaders.map(header => cleanText(String(row[header] ?? 'N/D')))
    );

    if (tableHeaders.length > 0 && tableBody.length > 0) {
        doc.autoTable({
            startY: cursorY,
            head: [tableHeaders],
            body: tableBody,
            theme: 'striped',
            headStyles: {
                fillColor: [41, 128, 185], // A more professional blue
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 8,
                halign: 'center',
            },
            styles: {
                fontSize: 7,
                cellPadding: 4,
                overflow: 'linebreak',
                lineWidth: 0.5,
                lineColor: [220, 220, 220],
            },
            columnStyles: {
                // Adjusting column widths for better layout
                0: { cellWidth: 100 }, // Nome da campanha
                1: { cellWidth: 50 }, // Status
                2: { cellWidth: 50 }, // Nível
                3: { cellWidth: 'auto' }, // Valor
                4: { cellWidth: 'auto' }, // Impressões
                5: { cellWidth: 'auto' }, // CPM
                6: { cellWidth: 'auto' }, // Alcance
                7: { cellWidth: 'auto' }, // Frequência
                8: { cellWidth: 'auto' }, // CTR
                9: { cellWidth: 'auto' }, // Cliques
                10: { cellWidth: 'auto' }, // CPC
                11: { cellWidth: 100 }, // Configuração de atribuição
                12: { cellWidth: 'auto' }, // Tipo de resultado
                13: { cellWidth: 'auto' }, // Resultados
                14: { cellWidth: 'auto' }, // Custo por resultado
                15: { cellWidth: 50 }, // Início
                16: { cellWidth: 50 }, // Término
            },
            didDrawPage: (data) => {
                // Footer with page number
                const pageCount = doc.internal.getNumberOfPages();
                doc.setFontSize(9);
                doc.setTextColor(150);
                doc.text(
                    `Página ${data.pageNumber} de ${pageCount}`,
                    pageWidth / 2,
                    doc.internal.pageSize.getHeight() - 20,
                    { align: 'center' }
                );
            }
        });
    } else {
        doc.text("Não há dados na tabela para exibir.", margin, cursorY);
    }
    
    doc.save(`${safeTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
}
