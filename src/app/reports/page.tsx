
'use client';

import { useState, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { Header } from "@/components/header";
import { CsvUploader } from "@/components/csv-uploader";
import { ReportPreview } from "@/components/report-preview";
import type { ReportData } from "@/lib/types";
import { generatePdf } from "@/lib/pdf-utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function ReportsPageContent() {
    const searchParams = useSearchParams();
    const clientName = searchParams.get('clientName') || null;

    const [reportData, setReportData] = useState<ReportData | null>(null);

    const handlePdfGeneration = () => {
        if (reportData) {
            generatePdf(reportData, clientName);
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
                        clientName={clientName}
                    />
                ) : (
                    <CsvUploader 
                        onReportGenerated={setReportData}
                        clientName={clientName} 
                    />
                )}
            </main>
        </div>
    );
}

export default function ReportsPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <ReportsPageContent />
        </Suspense>
    );
}
