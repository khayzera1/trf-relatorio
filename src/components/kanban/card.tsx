
"use client";

import type { Task, Label } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO } from 'date-fns';
import { Calendar, CheckSquare, Paperclip, AlignLeft } from "lucide-react";
import { Separator } from "../ui/separator";

interface KanbanCardProps {
    task: Task;
    labels: Record<string, Label>;
    isDragging: boolean;
}

export function KanbanCard({ task, labels, isDragging }: KanbanCardProps) {
    const checklistItems = task.checklist?.length || 0;
    const completedChecklistItems = task.checklist?.filter(item => item.completed).length || 0;
    
    const taskLabels = task.labelIds?.map(id => labels[id]).filter(Boolean) || [];
    const attachmentCount = task.attachments?.length || 0;
    const hasDescription = task.description && task.description.trim().length > 0;

    const allIndicators = [task.dueDate, hasDescription, checklistItems > 0, attachmentCount > 0];
    const hasFooterContent = allIndicators.some(Boolean);


    return (
        <Card className={`glass-card bg-card/80 mb-2 p-3 rounded-lg shadow-sm hover:border-primary/20 transition-all cursor-pointer flex flex-col gap-3 ${isDragging ? 'shadow-2xl scale-105 border-primary/40' : ''}`}>
            <CardContent className="p-0 space-y-2">
                {taskLabels.length > 0 && (
                     <div className="flex flex-wrap gap-1">
                        {taskLabels.map(label => (
                            <span key={label.id} className={`px-2 py-1 rounded text-xs font-semibold text-white ${label.color}`}>
                                {label.name}
                            </span>
                        ))}
                    </div>
                )}
                <p className="font-medium text-sm text-card-foreground break-words">{task.title}</p>
            </CardContent>

            {hasFooterContent && (
                <div className="flex flex-col gap-3">
                     <Separator/>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        {hasDescription && (
                            <div className="flex items-center gap-1.5">
                                <AlignLeft className="h-4 w-4" />
                            </div>
                        )}
                        {task.dueDate && (
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span>{format(parseISO(task.dueDate), "d MMM")}</span>
                            </div>
                        )}
                        {attachmentCount > 0 && (
                             <div className="flex items-center gap-1.5">
                                <Paperclip className="h-4 w-4" />
                                <span>{attachmentCount}</span>
                            </div>
                        )}
                        {checklistItems > 0 && (
                             <div className={`flex items-center gap-1.5 ${completedChecklistItems === checklistItems ? 'text-green-400' : ''}`}>
                                <CheckSquare className="h-4 w-4" />
                                <span>{completedChecklistItems}/{checklistItems}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
}
