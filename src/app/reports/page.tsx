
import { Header } from "@/components/header";
import { CsvUploader } from "@/components/csv-uploader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ReportsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <Card className="shadow-lg border-primary/10">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <FileText className="h-6 w-6 text-primary"/>
                                <CardTitle className="text-2xl font-headline">Gerador de Relatório PDF</CardTitle>
                            </div>
                            <CardDescription>
                                Envie um arquivo CSV para gerar um relatório em PDF para seus clientes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CsvUploader />
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
