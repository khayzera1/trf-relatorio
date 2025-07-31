"use client";

import * as XLSX from "xlsx";
import type { SalesData } from "@/components/columns";

// Function to convert data to CSV format and trigger download
export function exportToCsv(data: SalesData[], filename: string) {
  const header = Object.keys(data[0]);
  const csvRows = data.map((row) =>
    header
      .map((fieldName) => JSON.stringify((row as any)[fieldName], (key, value) => value === null ? '' : value))
      .join(",")
  );
  
  const csv = [header.join(","), ...csvRows].join("\r\n");

  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Function to convert data to Excel format and trigger download
export function exportToExcel(data: SalesData[], filename: string) {
  const styledData = data.map(item => ({
    'ID Venda': item.id,
    'Produto': item.product,
    'Quantidade': item.quantity,
    'Valor (R$)': item.amount,
    'Data': new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
  }));

  const worksheet = XLSX.utils.json_to_sheet(styledData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 10 }, // ID Venda
    { wch: 20 }, // Produto
    { wch: 12 }, // Quantidade
    { wch: 15 }, // Valor (R$)
    { wch: 12 }, // Data
  ];

  // Format amount column as currency
  data.forEach((_, index) => {
    const cellRef = XLSX.utils.encode_cell({c: 3, r: index + 1});
    if (worksheet[cellRef]) {
        worksheet[cellRef].t = 'n';
        worksheet[cellRef].z = 'R$ #,##0.00';
    }
  });


  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Vendas");
  XLSX.writeFile(workbook, filename);
}
