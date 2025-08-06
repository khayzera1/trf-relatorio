
"use client";

import type { Task } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";

interface KanbanCardProps {
    task: Task;
}

export function KanbanCard({ task }: KanbanCardProps) {
    return (
        <Card className="glass-card bg-card/70 mb-4 p-4 rounded-xl shadow-md hover:border-primary/20 transition-all">
            <CardContent className="p-0">
                <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-base text-card-foreground break-words">{task.title}</p>
                     <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 -mr-2 -mt-1">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
                {task.content && (
                    <p className="text-sm text-muted-foreground break-words">{task.content}</p>
                )}
            </CardContent>
        </Card>
    );
}
