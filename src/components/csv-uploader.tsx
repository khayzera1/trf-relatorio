
"use client";

import { useState, useRef, ChangeEvent, MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, FileCheck, Loader2, Bot } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateReportSummary } from '@/ai/flows/generate-report-summary-flow';
import type { ReportData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface CsvUploaderProps {
    onReportGenerated: (data: ReportData) => void;
    onGenerating: () => void;
    clientName?: string | null;
}

export function CsvUploader({ onReportGenerated, onGenerating, clientName }: CsvUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
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
                description: "Por favor, selecione um arquivo .csv.",
            });
        }
    };

    const handleGeneratePreview = async () => {
        if (!file) {
            toast({
                variant: "destructive",
                title: "Nenhum arquivo selecionado",
                description: "Por favor, selecione um arquivo CSV para gerar o relatório.",
            });
            return;
        }

        setIsLoading(true);
        onGenerating(); 

        const reader = new FileReader();

        reader.onload = async (e) => {
            const csvText = e.target?.result as string;
            if (!csvText) {
                toast({ variant: "destructive", title: "Erro", description: "Não foi possível ler o arquivo." });
                setIsLoading(false);
                return;
            }

            try {
                const summaryResult = await generateReportSummary({ csvData: csvText });
                onReportGenerated(summaryResult);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
                toast({
                    variant: "destructive",
                    title: "Erro ao Gerar Pré-visualização",
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
                description: "Não foi possível processar o arquivo selecionado.",
            });
            setIsLoading(false);
        };

        reader.readAsText(file);
    };

    const triggerFileSelect = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        fileInputRef.current?.click();
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg border-primary/10">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-6 w-6 text-primary flex-shrink-0"/>
                        <CardTitle className="text-2xl">Gerador de Relatório PDF</CardTitle>
                    </div>
                    <CardDescription className="break-words">
                        {clientName ? `Gerando relatório para o cliente: ` : `Envie um arquivo CSV para gerar um relatório de KPIs.`}
                         {clientName && <span className="font-bold text-primary">{clientName}</span>}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <Alert className="bg-accent/50 border-accent">
                            <Bot className="h-4 w-4 text-primary" />
                            <AlertTitle className="font-semibold">Relatórios Inteligentes com IA</AlertTitle>
                            <AlertDescription>
                                Nossa IA irá analisar os dados do seu CSV, extrair os KPIs e formatá-los em um relatório estilo dashboard.
                            </AlertDescription>
                        </Alert>

                        <div 
                            className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 sm:p-8 w-full flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent transition-colors"
                            onClick={triggerFileSelect}
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
                                    <p className="text-sm text-muted-foreground">Selecione um arquivo CSV</p>
                                </>
                            ) : (
                                <>
                                    <FileCheck className="h-12 w-12 text-primary" />
                                    <p className="mt-4 text-lg font-semibold break-all px-2">Arquivo Selecionado</p>
                                    <p className="text-sm text-muted-foreground break-all px-2">{file.name}</p>
                                </>
                            )}
                        </div>

                        <Button onClick={handleGeneratePreview} disabled={!file || isLoading} className="w-full text-base py-6">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analisando e Gerando...
                                </>
                            ) : (
                                'Gerar Pré-visualização com IA'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
