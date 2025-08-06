
'use client';

import { Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { Sidebar } from "@/components/sidebar";
import { CsvUploader } from "@/components/csv-uploader";
import Loading from "@/app/loading";
import ProtectedRoute from "@/components/protected-route";

function ReportsPageContent() {
    const searchParams = useSearchParams();
    const clientName = searchParams.get('clientName');

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
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
