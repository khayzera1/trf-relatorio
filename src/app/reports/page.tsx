
'use client';

import { useState } from "react";
import { Header } from "@/components/header";
import { CsvUploader } from "@/components/csv-uploader";
import { ReportPreview } from "@/components/report-preview";
import type { ReportData } from "@/lib/types";
import { generatePdf } from "@/lib/pdf-utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ReportsPage() {
    const [reportData, setReportData] = useState<ReportData | null>(null);

    const handlePdfGeneration = () => {
        if (reportData) {
            generatePdf(reportData);
        }
    };

    const handleReset = () => {
        setReportData(null);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header>
                <Link href="/">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para Clientes
                    </Button>
                </Link>
            </Header>
            <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {reportData ? (
                    <ReportPreview 
                        data={reportData} 
                        onGeneratePdf={handlePdfGeneration}
                        onCancel={handleReset}
                    />
                ) : (
                    <CsvUploader onReportGenerated={setReportData} />
                )}
            </main>
        </div>
    );
}
