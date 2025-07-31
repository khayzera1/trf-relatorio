
"use client";

import { useState, useRef } from 'react';
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
}

export function CsvUploader({ onReportGenerated }: CsvUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
                setFile(selectedFile);
                setFileName(selectedFile.name);
            } else {
                toast({
                    variant: "destructive",
                    title: "Formato de arquivo inválido",
                    description: "Por favor, selecione um arquivo .csv.",
                });
            }
        }
    };

    const handleGeneratePreview = () => {
        if (!file) {
            toast({
                variant: "destructive",
                title: "Nenhum arquivo selecionado",
                description: "Por favor, selecione um arquivo CSV para gerar o relatório.",
            });
            return;
        }

        setIsGenerating(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            const csvText = e.target?.result as string;
            if (!csvText) {
                toast({ variant: "destructive", title: "Erro", description: "Não foi possível ler o arquivo."});
                setIsGenerating(false);
                return;
            }

            try {
                // Get structured data from AI
                const summaryResult = await generateReportSummary({ csvData: csvText });
                
                if (!summaryResult || !summaryResult.kpiCards || summaryResult.kpiCards.length === 0) {
                    throw new Error("A IA não conseguiu extrair dados do CSV. Verifique o formato do arquivo ou tente novamente.");
                }

                onReportGenerated(summaryResult);

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu";
                toast({
                    variant: "destructive",
                    title: "Erro ao gerar pré-visualização",
                    description: errorMessage,
                });
            } finally {
                setIsGenerating(false);
            }
        };

        reader.onerror = () => {
             toast({
                variant: "destructive",
                title: "Erro ao ler o arquivo",
                description: "Não foi possível processar o arquivo selecionado.",
            });
            setIsGenerating(false);
        }

        reader.readAsText(file);
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg border-primary/10">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-6 w-6 text-primary"/>
                        <CardTitle className="text-2xl font-headline">Gerador de Relatório PDF</CardTitle>
                    </div>
                    <CardDescription>
                        Envie um arquivo CSV para gerar um relatório de KPIs para seus clientes.
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
                            className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 w-full flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent transition-colors"
                            onClick={triggerFileSelect}
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
                                    <p className="mt-4 text-lg font-semibold">Arraste e solte ou clique para enviar</p>
                                    <p className="text-sm text-muted-foreground">Selecione um arquivo CSV para começar</p>
                                </>
                            ) : (
                                <>
                                    <FileCheck className="h-12 w-12 text-primary" />
                                    <p className="mt-4 text-lg font-semibold">Arquivo Selecionado</p>
                                    <p className="text-sm text-muted-foreground">{fileName}</p>
                                </>

                            )}
                        </div>

                        <Button onClick={handleGeneratePreview} disabled={!file || isGenerating} className="w-full">
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analisando e Gerando Pré-visualização...
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
