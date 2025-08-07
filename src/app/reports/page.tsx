
'use client';

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from 'next/navigation';
import { Sidebar } from "@/components/sidebar";
import { CsvUploader } from "@/components/csv-uploader";
import Loading from "@/app/loading";
import ProtectedRoute from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, List, Trash2, Download } from "lucide-react";
import { getClientById, getReportsForClient, deleteReport } from "@/lib/firebase/client";
import type { SavedReportData } from "@/lib/types";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { generatePdf } from "@/lib/pdf-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function ReportsPageContent() {
    const searchParams = useSearchParams();
    const clientId = searchParams.get('clientId');
    const { toast } = useToast();

    const [clientName, setClientName] = useState<string | null>(null);
    const [savedReports, setSavedReports] = useState<SavedReportData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showUploader, setShowUploader] = useState(false);

    const loadData = useCallback(async () => {
        if (!clientId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const clientData = await getClientById(clientId);
            setClientName(clientData?.clientName || null);
            
            const reports = await getReportsForClient(clientId);
            setSavedReports(reports);
        } catch (error) {
            console.error("Error loading client data or reports:", error);
            toast({
                variant: "destructive",
                title: "Erro ao Carregar Dados",
                description: "Não foi possível carregar as informações do cliente e seus relatórios."
            });
        } finally {
            setIsLoading(false);
        }
    }, [clientId, toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const handleReportSaved = () => {
        setShowUploader(false);
        loadData(); // Recarrega a lista de relatórios
    }

    const handleDeleteReport = async (reportId: string) => {
        if (!clientId) return;
        try {
            await deleteReport(clientId, reportId);
            toast({
                title: "Relatório Excluído",
                description: "O relatório foi removido com sucesso."
            });
            loadData(); // Recarrega a lista
        } catch (error) {
             console.error("Error deleting report:", error);
             toast({
                variant: "destructive",
                title: "Erro ao Excluir",
                description: "Não foi possível remover o relatório."
            });
        }
    }
    
    if (isLoading) {
        return <Loading />;
    }

    if (!clientId) {
        return (
            <div className="flex min-h-screen bg-transparent text-foreground">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center text-center">
                    <Card className="glass-card max-w-lg">
                        <CardHeader>
                            <CardTitle>Nenhum Cliente Selecionado</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Por favor, volte à página de clientes e selecione um para gerenciar os relatórios.</p>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }
    
    if (showUploader) {
        return (
             <div className="flex min-h-screen bg-transparent text-foreground">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <CsvUploader 
                        clientId={clientId}
                        clientName={clientName}
                        onReportSaved={handleReportSaved}
                        onCancel={() => setShowUploader(false)}
                    />
                </main>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-transparent text-foreground">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                 <div className="max-w-4xl mx-auto">
                    <Card className="glass-card">
                        <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <List className="h-6 w-6 text-primary flex-shrink-0"/>
                                    <CardTitle className="text-2xl">Histórico de Relatórios</CardTitle>
                                </div>
                                <CardDescription className="break-words">
                                    {clientName ? `Relatórios salvos para o cliente: ` : `Selecione um cliente para ver os relatórios.`}
                                    {clientName && <span className="font-bold text-primary">{clientName}</span>}
                                </CardDescription>
                            </div>
                            <Button onClick={() => setShowUploader(true)}>
                                <Plus className="mr-2 h-4 w-4"/>
                                Gerar Novo Relatório
                            </Button>
                        </CardHeader>
                        <CardContent>
                           {savedReports.length > 0 ? (
                            <ul className="space-y-4">
                                {savedReports.map(report => (
                                    <li key={report.id} className="glass-card p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:border-primary/20">
                                        <div className="flex-1">
                                            <p className="font-semibold text-foreground">{report.reportTitle}</p>
                                            <p className="text-sm text-muted-foreground">Período: {report.reportPeriod}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Gerado em: {format(report.createdAt.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 self-end sm:self-center">
                                            <Button variant="outline" size="sm" onClick={() => generatePdf(report, clientName)}>
                                                <Download className="mr-2 h-4 w-4"/>
                                                PDF
                                            </Button>
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon" className="h-9 w-9">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="glass-card">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Excluir Relatório?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tem certeza de que deseja excluir o relatório "{report.reportTitle}"? Esta ação não pode ser desfeita.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteReport(report.id)}>
                                                            Sim, excluir
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                           ) : (
                             <div className="text-center py-12 sm:py-20 border-2 border-dashed rounded-2xl glass-card mt-4 px-4">
                                <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
                                <h3 className="mt-4 text-xl font-medium text-foreground">Nenhum relatório salvo</h3>
                                <p className="mt-2 text-md text-muted-foreground max-w-md mx-auto">
                                   Clique em "Gerar Novo Relatório" para começar a criar e salvar o histórico do seu cliente.
                                </p>
                            </div>
                           )}
                        </CardContent>
                    </Card>
                 </div>
            </main>
        </div>
    );
}

function ReportsPageContainer() {
    return (
        <Suspense fallback={<Loading />}>
            <ReportsPageContent />
        </Suspense>
    );
}

export default function ReportsPage() {
    return (
        <ProtectedRoute>
            <ReportsPageContainer />
        </ProtectedRoute>
    );
}

    