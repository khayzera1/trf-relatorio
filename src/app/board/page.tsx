
'use client';

import { Header } from "@/components/header";
import { KanbanBoard } from "@/components/kanban/board";
import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText } from "lucide-react";


function BoardPageContent() {
    return (
        <div className="h-screen text-foreground flex flex-col">
            <Header>
                 <Link href="/">
                    <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Ir para Relatórios</span>
                        <span className="inline sm:hidden">Relatórios</span>
                    </Button>
                </Link>
            </Header>
            <main className="flex-grow">
                <KanbanBoard />
            </main>
        </div>
    );
}


export default function BoardPage() {
    return (
        <ProtectedRoute>
            <BoardPageContent />
        </ProtectedRoute>
    )
}
