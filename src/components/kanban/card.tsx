
"use client";

import type { Task } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

interface KanbanCardProps {
    task: Task;
    isDragging: boolean;
}

export function KanbanCard({ task, isDragging }: KanbanCardProps) {
    return (
        <Card className={`glass-card bg-card/80 mb-2 p-3 rounded-lg shadow-sm hover:border-primary/20 transition-all cursor-pointer ${isDragging ? 'shadow-2xl scale-105 border-primary/40' : ''}`}>
            <CardContent className="p-0">
                <p className="font-medium text-sm text-card-foreground break-words">{task.title}</p>
            </CardContent>
        </Card>
    );
}

    