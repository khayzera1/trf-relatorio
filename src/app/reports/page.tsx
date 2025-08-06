
'use client';

import { Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { Header } from "@/components/header";
import { CsvUploader } from "@/components/csv-uploader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Loading from "@/app/loading";
import ProtectedRoute from "@/components/protected-route";

function ReportsPageContent() {
    const searchParams = useSearchParams();
    const clientName = searchParams.get('clientName');

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
                 <CsvUploader 
                    clientName={clientName} 
                />
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

    