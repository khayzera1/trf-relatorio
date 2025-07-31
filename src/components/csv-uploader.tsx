
"use client";

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { generatePdf } from '@/lib/pdf-utils';
import { UploadCloud, FileCheck, Loader2 } from 'lucide-react';

export function CsvUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type === 'text/csv') {
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

        Papa.parse<Record<string, string>>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const headers = results.meta.fields;
                    if (!headers) {
                        throw new Error("Não foi possível extrair os cabeçalhos do arquivo CSV.");
                    }
                    generatePdf(headers, results.data);
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
            },
            error: (error) => {
                toast({
                    variant: "destructive",
                    title: "Erro ao ler o arquivo CSV",
                    description: error.message,
                });
                setIsGenerating(false);
            }
        });
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
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
                        Gerando PDF...
                    </>
                ) : (
                    'Gerar Relatório em PDF'
                )}
            </Button>
        </div>
    );
}
