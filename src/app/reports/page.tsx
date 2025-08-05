
'use client';

import { useState, Suspense } from "react";
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Header } from "@/components/header";
import { CsvUploader } from "@/components/csv-uploader";
import type { ReportData } from "@/lib/types";
import { generatePdf } from "@/lib/pdf-utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";


const ReportPreview = dynamic(() => import('@/components/report-preview').then(mod => mod.ReportPreview), {
    ssr: false,
    loading: () => <ReportPreviewSkeleton />,
});

function ReportPreviewSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-8 w-1/3" />
            <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        </div>
    );
}

function ReportsPageContent() {
    const searchParams = useSearchParams();
    const clientName = searchParams.get('clientName') || null;

    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handlePdfGeneration = () => {
        if (reportData) {
            generatePdf(reportData, clientName);
        }
    };

    const handleReset = () => {
        setReportData(null);
        setIsGenerating(false);
    };

    const handleReportGenerated = (data: ReportData) => {
        setReportData(data);
        setIsGenerating(false);
    };
    
    const handleGenerating = () => {
        setIsGenerating(true);
    };

    if (isGenerating && !reportData) {
        return (
             <div className="min-h-screen bg-background text-foreground">
                <Header>
                    <Link href="/">
                        <Button variant="outline" disabled>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Voltar para Clientes</span>
                            <span className="inline sm:hidden">Voltar</span>
                        </Button>
                    </Link>
                </Header>
                <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
                    <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
                    <h2 className="text-2xl font-semibold text-foreground mb-2">Analisando e gerando seu relatório...</h2>
                    <p className="text-muted-foreground">Isso pode levar alguns instantes. Por favor, aguarde.</p>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header>
                <Link href="/">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Voltar para Clientes</span>
                        <span className="inline sm:hidden">Voltar</span>
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
                        onReportGenerated={handleReportGenerated}
                        onGenerating={handleGenerating}
                        clientName={clientName} 
                    />
                )}
            </main>
        </div>
    );
}

export default function ReportsPage() {
    return (
        <Suspense>
            <ReportsPageContent />
        </Suspense>
    );
}
