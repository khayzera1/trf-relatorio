"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { DataTable, type SalesData } from "@/components/data-table";
import { columns } from "@/components/columns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExportDialog } from "@/components/export-dialog";

const initialData: SalesData[] = [
  { id: 'SALE001', product: 'Widget A', quantity: 150, amount: 1575.00, date: '2023-10-01' },
  { id: 'SALE002', product: 'Widget B', quantity: 200, amount: 1750.00, date: '2023-10-01' },
  { id: 'SALE003', product: 'Widget C', quantity: 75, amount: 937.50, date: '2023-10-02' },
  { id: 'SALE004', product: 'Widget A', quantity: 120, amount: 1260.00, date: '2023-10-03' },
  { id: 'SALE005', product: 'Gadget Pro', quantity: 50, amount: 4999.50, date: '2023-10-04' },
  { id: 'SALE006', product: 'Widget B', quantity: 180, amount: 1575.00, date: '2023-10-04' },
  { id: 'SALE007', product: 'Super Thing', quantity: 30, amount: 299.70, date: '2023-10-05' },
  { id: 'SALE008', product: 'Gadget Pro', quantity: 60, amount: 5999.40, date: '2023-10-06' },
  { id: 'SALE009', product: 'Widget A', quantity: 250, amount: 2625.00, date: '2023-10-07' },
  { id: 'SALE010', product: 'Widget C', quantity: 90, amount: 1125.00, date: '2023-10-08' },
];

export default function Home() {
  const [data] = useState<SalesData[]>(initialData);
  const [exportCount, setExportCount] = useState({ excel: 0, csv: 0 });

  const totalExports = useMemo(() => exportCount.excel + exportCount.csv, [exportCount]);

  const handleExport = (format: 'excel' | 'csv') => {
    setExportCount(prev => ({ ...prev, [format]: prev[format] + 1 }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header>
        <ExportDialog
          data={data}
          onExport={handleExport}
          exportCount={totalExports}
          usageStatistics={JSON.stringify(exportCount)}
        />
      </Header>
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Relatório de Vendas</CardTitle>
            <CardDescription>Visualize e exporte os dados de vendas mais recentes.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={data} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
