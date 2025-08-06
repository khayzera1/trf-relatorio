
"use client";

import { Draggable, Droppable } from "@hello-pangea/dnd";
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
             <Droppable droppableId={column.id} type="task">
                {(provided, snapshot) => (
                    <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-grow overflow-y-auto pr-2 rounded-lg transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-white/5' : 'bg-transparent'}`}
                    >
                        {tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                            ...provided.draggableProps.style,
                                            boxShadow: snapshot.isDragging ? '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)' : 'none',
                                        }}
                                    >
                                        <KanbanCard task={task} />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
}
