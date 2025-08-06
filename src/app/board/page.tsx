
'use client';

import { KanbanBoard } from "@/components/kanban/board";
import ProtectedRoute from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";

function BoardPageContent() {
    return (
        <div className="flex h-screen text-foreground bg-transparent">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
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
