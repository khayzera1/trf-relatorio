
"use client";

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { generatePdf } from '@/lib/pdf-utils';
import { UploadCloud, FileCheck, Loader2, Bot } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateReportSummary } from '@/ai/flows/generate-report-summary-flow';

export function CsvUploader() {
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

    const handleGeneratePdf = () => {
        if (!file) {
            toast({
                variant: "destructive",
                title: "Nenhum arquivo selecionado",
                description: "Por favor, selecione um arquivo CSV para gerar o PDF.",
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
                // 1. Get summary from AI
                const summary = await generateReportSummary({ csvData: csvText });
                
                // 2. Parse CSV for tabling
                const parseResult = Papa.parse<Record<string, string>>(csvText, {
                    header: true,
                    skipEmptyLines: true,
                });

                if (parseResult.errors.length > 0) {
                    throw new Error("Erro ao fazer o parse do CSV: " + parseResult.errors[0].message);
                }

                const headers = parseResult.meta.fields;
                if (!headers) {
                    throw new Error("Não foi possível extrair os cabeçalhos do arquivo CSV.");
                }

                // 3. Generate PDF with summary
                await generatePdf(summary.reportTitle, summary.executiveSummary, headers, parseResult.data);

                toast({
                    title: "PDF Gerado com Sucesso!",
                    description: `O relatório ${file.name.replace('.csv', '.pdf')} foi baixado.`,
                });

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu";
                toast({
                    variant: "destructive",
                    title: "Erro ao gerar PDF",
                    description: errorMessage,
                });
            } finally {
                setIsGenerating(false);
                setFile(null);
                setFileName('');
                if(fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
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
        <div className="space-y-6">
            <Alert className="bg-accent/50 border-accent">
                <Bot className="h-4 w-4 text-primary" />
                <AlertTitle className="font-semibold">Relatórios Inteligentes com IA</AlertTitle>
                <AlertDescription>
                   Nossa IA irá analisar os dados do seu CSV, gerar um resumo executivo e formatar tudo em um relatório PDF profissional para seu cliente.
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

            <Button onClick={handleGeneratePdf} disabled={!file || isGenerating} className="w-full">
                {isGenerating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analisando e Gerando PDF...
                    </>
                ) : (
                    'Gerar Relatório em PDF com IA'
                )}
            </Button>
        </div>
    );
}
