
"use client";

import type { Column, Task } from "@/lib/types";
import { KanbanCard } from './card';
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "../ui/button";

interface KanbanColumnProps {
    column: Omit<Column, 'taskIds'>;
    tasks: Task[];
}

export function KanbanColumn({ column, tasks }: KanbanColumnProps) {
    return (
        <div className="w-80 flex-shrink-0 h-full flex flex-col">
            <div className="flex items-center justify-between p-2 mb-4">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-primary"></span>
                    <h2 className="text-lg font-semibold">{column.title}</h2>
                    <span className="text-sm font-medium text-muted-foreground bg-muted h-6 w-6 flex items-center justify-center rounded-full">{tasks.length}</span>
                </div>
                <div className="flex items-center gap-1">
                     <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Plus className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
                {tasks.map(task => (
                    <KanbanCard key={task.id} task={task} />
                ))}
            </div>
        </div>
    );
}
