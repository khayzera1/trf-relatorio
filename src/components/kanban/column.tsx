
"use client";

import { useState, useRef, useEffect } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import type { Column, Task, Label } from "@/lib/types";
import { KanbanCard } from './card';
import { MoreHorizontal, Plus, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "../ui/textarea";

interface KanbanColumnProps {
    column: Column;
    tasks: Task[];
    labels: Record<string, Label>;
    index: number;
    onUpdateTitle: (columnId: string, newTitle: string) => void;
    onDelete: (columnId: string) => void;
    onAddTask: (columnId: string, title: string) => void;
    onOpenTaskModal: (task: Task) => void;
}

export function KanbanColumn({ column, tasks, labels, index, onUpdateTitle, onDelete, onAddTask, onOpenTaskModal }: KanbanColumnProps) {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(column.title);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const addTaskInputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditingTitle) {
            titleInputRef.current?.focus();
            titleInputRef.current?.select();
        }
    }, [isEditingTitle]);

    useEffect(() => {
        if (isAddingTask) {
            addTaskInputRef.current?.focus();
        }
    }, [isAddingTask]);

    const handleTitleBlur = () => {
        if (title.trim()) {
            onUpdateTitle(column.id, title.trim());
        } else {
            setTitle(column.title); // Reset if empty
        }
        setIsEditingTitle(false);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleTitleBlur();
        } else if (e.key === 'Escape') {
            setTitle(column.title);
            setIsEditingTitle(false);
        }
    };
    
    const handleAddTask = () => {
        if (newTaskTitle.trim()) {
            onAddTask(column.id, newTaskTitle.trim());
            setNewTaskTitle("");
            addTaskInputRef.current?.focus();
        }
    };

    return (
        <Draggable draggableId={column.id} index={index}>
            {(provided) => (
                <div 
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                    className="w-80 flex-shrink-0 h-full flex flex-col"
                >
                    <div className="flex items-center justify-between p-2 mb-2 bg-card/70 rounded-t-xl" {...provided.dragHandleProps}>
                        {isEditingTitle ? (
                             <Input
                                ref={titleInputRef}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={handleTitleBlur}
                                onKeyDown={handleTitleKeyDown}
                                className="h-8 border-primary bg-transparent text-lg font-semibold focus-visible:ring-1 focus-visible:ring-offset-0"
                            />
                        ) : (
                             <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                                <h2 className="text-lg font-semibold px-2 py-1">{column.title}</h2>
                                <span className="text-sm font-medium text-muted-foreground bg-muted h-6 w-6 flex items-center justify-center rounded-full">{tasks.length}</span>
                            </div>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-card">
                                <DropdownMenuItem onClick={() => setIsAddingTask(true)} className="cursor-pointer">
                                    <Plus className="mr-2" /> Adicionar Tarefa
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsEditingTitle(true)} className="cursor-pointer">
                                    Renomear Lista
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDelete(column.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                                    Excluir Lista
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="bg-card/70 rounded-b-xl flex flex-col flex-grow">
                        <Droppable droppableId={column.id} type="task">
                            {(provided, snapshot) => (
                                <div 
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`flex-grow overflow-y-auto overflow-x-hidden p-2 rounded-lg transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-white/5' : 'bg-transparent'}`}
                                >
                                    {tasks.map((task, index) => (
                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{ ...provided.draggableProps.style }}
                                                    onClick={() => onOpenTaskModal(task)}
                                                >
                                                    <KanbanCard task={task} labels={labels} isDragging={snapshot.isDragging} />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    {isAddingTask ? (
                                        <div className="p-1 mt-1 space-y-2">
                                            <Textarea
                                                ref={addTaskInputRef}
                                                placeholder="Digite um título para esta tarefa..."
                                                value={newTaskTitle}
                                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddTask())}
                                                className="min-h-[60px]"
                                            />
                                            <div className="flex items-center gap-2">
                                                <Button onClick={handleAddTask}>Adicionar</Button>
                                                <Button variant="ghost" size="icon" onClick={() => setIsAddingTask(false)}>
                                                    <X className="h-5 w-5"/>
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="pt-2 px-1">
                                            <Button variant="ghost" className="w-full justify-start" onClick={() => setIsAddingTask(true)}>
                                                <Plus className="mr-2" />
                                                Adicionar Tarefa
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    </div>
                </div>
            )}
        </Draggable>
    );
}

    