
"use client";

import type { Task } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO } from 'date-fns';
import { Calendar, CheckSquare } from "lucide-react";

const availableLabelColors: Record<string, string> = {
    'dev': 'bg-blue-500',
    'ui': 'bg-purple-500',
    'backend': 'bg-red-500',
    'qa': 'bg-green-500',
    'infra': 'bg-yellow-500',
};

export function KanbanCard({ task, isDragging }: KanbanCardProps) {
    const checklistProgress = task.checklist && task.checklist.length > 0 
        ? task.checklist.filter(item => item.completed).length
        : 0;

    return (
        <Card className={`glass-card bg-card/80 mb-2 p-3 rounded-lg shadow-sm hover:border-primary/20 transition-all cursor-pointer ${isDragging ? 'shadow-2xl scale-105 border-primary/40' : ''}`}>
            <CardContent className="p-0 space-y-2">
                {task.labels && task.labels.length > 0 && (
                     <div className="flex flex-wrap gap-1">
                        {task.labels.map(label => (
                            <span key={label} className={`h-2 w-10 rounded-full ${availableLabelColors[label] || 'bg-gray-400'}`}></span>
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

interface KanbanCardProps {
    task: Task;
    isDragging: boolean;
}
