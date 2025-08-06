
"use client";

import type { Task, Label } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO } from 'date-fns';
import { Calendar, CheckSquare } from "lucide-react";

interface KanbanCardProps {
    task: Task;
    labels: Record<string, Label>;
    isDragging: boolean;
}

export function KanbanCard({ task, labels, isDragging }: KanbanCardProps) {
    const checklistProgress = task.checklist && task.checklist.length > 0 
        ? task.checklist.filter(item => item.completed).length
        : 0;
    
    const taskLabels = task.labelIds?.map(id => labels[id]).filter(Boolean) || [];

    return (
        <Card className={`glass-card bg-card/80 mb-2 p-3 rounded-lg shadow-sm hover:border-primary/20 transition-all cursor-pointer ${isDragging ? 'shadow-2xl scale-105 border-primary/40' : ''}`}>
            <CardContent className="p-0 space-y-2">
                {taskLabels.length > 0 && (
                     <div className="flex flex-wrap gap-1">
                        {taskLabels.map(label => (
                            <span key={label.id} className={`h-2 w-10 rounded-full ${label.color}`}></span>
                        ))}
                    </div>
                )}
                <p className="font-medium text-sm text-card-foreground break-words">{task.title}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {task.dueDate && (
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(parseISO(task.dueDate), "d MMM")}</span>
                        </div>
                    )}
                    {task.checklist && task.checklist.length > 0 && (
                         <div className="flex items-center gap-1">
                            <CheckSquare className="h-3 w-3" />
                            <span>{checklistProgress}/{task.checklist.length}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

    