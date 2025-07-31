
"use client";

import * as XLSX from "xlsx";
import type { ClientData } from "@/components/columns";

// Function to convert data to CSV format and trigger download
export function exportToCsv(data: ClientData[], filename: string) {
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
export function exportToExcel(data: ClientData[], filename: string) {
  const styledData = data.map(item => ({
    'ID Cliente': item.id,
    'Cliente': item.clientName,
    'Campanha': item.campaign,
    'Status': item.status
  }));

  const worksheet = XLSX.utils.json_to_sheet(styledData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 10 }, // ID Cliente
    { wch: 30 }, // Cliente
    { wch: 30 }, // Campanha
    { wch: 15 }, // Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
  XLSX.writeFile(workbook, filename);
}
