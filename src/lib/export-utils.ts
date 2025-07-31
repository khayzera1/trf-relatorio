
"use client";

import * as XLSX from "xlsx";
import Papa from "papaparse";
import type { ClientData } from "@/lib/types";

// Função para converter dados para CSV formatado e acionar o download
export function exportToCsv(data: ClientData[], filename: string) {
  const styledData = data.map(item => ({
    'ID Cliente': item.id,
    'Cliente': item.clientName,
    'Campanha': item.campaign,
    'Status': item.status
  }));

  const csv = Papa.unparse(styledData);

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

// Função para converter dados para o formato Excel e acionar o download
export function exportToExcel(data: ClientData[], filename: string) {
  const styledData = data.map(item => ({
    'ID Cliente': item.id,
    'Cliente': item.clientName,
    'Campanha': item.campaign,
    'Status': item.status
  }));

  const worksheet = XLSX.utils.json_to_sheet(styledData);

  // Definir larguras das colunas
  worksheet['!cols'] = [
    { wch: 12 }, // ID Cliente
    { wch: 35 }, // Cliente
    { wch: 40 }, // Campanha
    { wch: 15 }, // Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
  XLSX.writeFile(workbook, filename);
}
