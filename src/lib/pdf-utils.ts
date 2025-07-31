
"use client";

import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}

export function generatePdf(headers: string[], data: Record<string, string>[]) {
    const doc = new jsPDF() as jsPDFWithAutoTable;

    const tableData = data.map(row => headers.map(header => row[header]));

    doc.autoTable({
        head: [headers],
        body: tableData,
        startY: 20,
        styles: {
            fontSize: 8,
            cellPadding: 2,
        },
        headStyles: {
            fillColor: [22, 160, 133], // Cor de preenchimento do cabeçalho
            textColor: [255, 255, 255], // Cor do texto do cabeçalho
            fontStyle: 'bold',
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245], // Cor de fundo para linhas alternadas
        },
        didDrawPage: (data: any) => {
            // Header
            doc.setFontSize(20);
            doc.setTextColor(40);
            doc.text('Relatório de Marketing', data.settings.margin.left, 15);

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(10);
            doc.text(
                `Página ${data.pageNumber} de ${pageCount}`,
                data.settings.margin.left,
                doc.internal.pageSize.height - 10
            );
        },
    });

    doc.save('relatorio-cliente.pdf');
}
