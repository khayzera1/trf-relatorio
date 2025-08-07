
"use client";

import { useState, useRef, ChangeEvent } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, FileCheck, Loader2, Bot, FileText, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateReportSummary } from '@/ai/flows/generate-report-summary-flow';
import type { ReportData } from '@/lib/types';
import Loading from '@/app/loading';
import { addReport } from '@/lib/firebase/client';

// Dynamically import the ReportPreview component to reduce the initial bundle size.
// It will only be loaded when the report data is available.
const ReportPreview = dynamic(() => import('@/components/report-preview').then(mod => mod.ReportPreview), {
    ssr: false,
    loading: () => <Loading />,
});

interface CsvUploaderProps {
    clientId: string;
    clientName?: string | null;
    onReportSaved: () => void;
    onCancel: () => void;
}

export function CsvUploader({ clientId, clientName, onReportSaved, onCancel }: CsvUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
            setFile(selectedFile);
        } else {
            toast({
                variant: "destructive",
                title: "Formato de arquivo inválido",
                description: "Por favor, selecione um arquivo no formato .csv.",
            });
        }
    };

    const handleGenerateReport = async () => {
        if (!file) {
            toast({
                variant: "destructive",
                title: "Nenhum arquivo selecionado",
                description: "Por favor, selecione um arquivo CSV para gerar o relatório.",
            });
            return;
        }

        setIsLoading(true);
        setReportData(null); 

        const reader = new FileReader();

        reader.onload = async (e) => {
            const csvText = e.target?.result as string;
            if (!csvText) {
                toast({ variant: "destructive", title: "Erro de Leitura", description: "Não foi possível ler o conteúdo do arquivo." });
                setIsLoading(false);
                return;
            }

            try {
                const summaryResult = await generateReportSummary({ csvData: csvText });
                setReportData(summaryResult);
            } catch (error) {
                console.error("Error generating report:", error);
                const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
                toast({
                    variant: "destructive",
                    title: "Erro ao Gerar Relatório",
                    description: `Falha na comunicação com a IA: ${errorMessage}`,
                });
            } finally {
                setIsLoading(false);
            }
        };

        reader.onerror = () => {
            toast({
                variant: "destructive",
                title: "Erro ao ler o arquivo",
                description: "Ocorreu um problema ao processar o arquivo selecionado.",
            });
            setIsLoading(false);
        };

        reader.readAsText(file);
    };
    
    const handleSaveReport = async () => {
        if (!reportData || !clientId) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Não há dados de relatório para salvar ou o cliente não foi encontrado.",
            });
            return;
        }
        setIsLoading(true);
        try {
            await addReport(clientId, reportData);
            toast({
                title: "Sucesso!",
                description: "O relatório foi salvo com sucesso.",
            });
            onReportSaved();
        } catch (error) {
             console.error("Error saving report:", error);
             toast({
                variant: "destructive",
                title: "Erro ao Salvar",
                description: "Não foi possível salvar o relatório no banco de dados.",
            });
        } finally {
            setIsLoading(false);
        }
    }
    
    const handleReset = () => {
        setReportData(null);
        setFile(null);
        setIsLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-10">
                <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
                <h2 className="text-2xl font-semibold text-foreground mb-2">Processando...</h2>
                <p className="text-muted-foreground">Aguarde enquanto a IA analisa os dados.</p>
            </div>
        );
    }
    
    if (reportData) {
        return (
            <ReportPreview 
                data={reportData} 
                onCancel={handleReset}
                onSaveAndGeneratePdf={handleSaveReport}
                clientName={clientName}
            />
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg border-primary/10">
                 <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <FileText className="h-6 w-6 text-primary flex-shrink-0"/>
                                <CardTitle className="text-2xl">Gerador de Relatório PDF</CardTitle>
                            </div>
                            <CardDescription className="break-words">
                                {clientName ? `Gerando relatório para o cliente: ` : `Envie um arquivo CSV com os dados de campanha para gerar um relatório de KPIs.`}
                                {clientName && <span className="font-bold text-primary">{clientName}</span>}
                            </CardDescription>
                        </div>
                         <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Cancelar">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <Alert className="bg-accent/50 border-accent">
                            <Bot className="h-4 w-4 text-primary" />
                            <AlertTitle className="font-semibold">Relatórios Inteligentes com IA</AlertTitle>
                            <AlertDescription>
                                Nossa IA irá analisar os dados, agrupar por categoria e extrair os KPIs para formatar um relatório estilo dashboard.
                            </AlertDescription>
                        </Alert>

                        <div 
                            className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 sm:p-8 w-full flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={(e) => { e.preventDefault(); handleFileChange({ target: { files: e.dataTransfer.files } } as ChangeEvent<HTMLInputElement>); }}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="hidden"
                                id="csv-uploader"
                            />
                            {!file ? (
                                <>
                                    <UploadCloud className="h-12 w-12 text-muted-foreground" />
                                    <p className="mt-4 text-lg font-semibold">Arraste ou clique para enviar</p>
                                    <p className="text-sm text-muted-foreground">Selecione um arquivo no formato CSV</p>
                                </>
                            ) : (
                                <>
                                    <FileCheck className="h-12 w-12 text-primary" />
                                    <p className="mt-4 text-lg font-semibold break-all px-2">Arquivo Selecionado</p>
                                    <p className="text-sm text-muted-foreground break-all px-2">{file.name}</p>
                                </>
                            )}
                        </div>

                        <Button onClick={handleGenerateReport} disabled={!file} className="w-full text-base py-6">
                           Gerar Relatório com IA
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
