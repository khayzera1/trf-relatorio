
"use client";

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from "@hello-pangea/dnd";
import { KanbanColumn } from './column';
import type { Task, Column as ColumnType } from '@/lib/types';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';

const initialTasks: Record<string, Task> = {
    'task-1': { id: 'task-1', title: 'Configurar ambiente de desenvolvimento', content: 'Instalar todas as dependências necessárias e configurar o Next.js.' },
    'task-2': { id: 'task-2', title: 'Desenvolver layout do board', content: 'Criar os componentes de coluna e cartão com base no design.' },
    'task-3': { id: 'task-3', title: 'Implementar o cabeçalho', content: 'Adicionar navegação e menu do usuário.' },
    'task-4': { id: 'task-4', title: 'Criar fluxo de autenticação', content: 'Configurar a página de login e a lógica de autenticação com Firebase.' },
    'task-5': { id: 'task-5', title: 'Testar responsividade da UI', content: 'Garantir que o layout funcione bem em desktops e dispositivos móveis.' },
    'task-6': { id: 'task-6', title: 'Conectar ao banco de dados', content: 'Criar funções para ler e escrever dados no Firestore.' },
    'task-7': { id: 'task-7', title: 'Adicionar funcionalidade de drag-and-drop', content: 'Implementar a biblioteca de D&D para mover cartões e colunas.' },
};

const initialColumns: Record<string, ColumnType> = {
    'col-1': { id: 'col-1', title: 'Backlog', taskIds: ['task-1', 'task-2'] },
    'col-2': { id: 'col-2', title: 'A Fazer', taskIds: ['task-3'] },
    'col-3': { id: 'col-3', title: 'Em Progresso', taskIds: ['task-4', 'task-5', 'task-7'] },
    'col-4': { id: 'col-4', title: 'Concluído', taskIds: ['task-6'] },
};

const initialColumnOrder = ['col-1', 'col-2', 'col-3', 'col-4'];

interface BoardData {
    tasks: Record<string, Task>;
    columns: Record<string, ColumnType>;
    columnOrder: string[];
}

export function KanbanBoard() {
    const [boardData, setBoardData] = useState<BoardData>({
        tasks: initialTasks,
        columns: initialColumns,
        columnOrder: initialColumnOrder,
    });

    const onDragEnd: OnDragEndResponder = (result) => {
        const { destination, source, draggableId, type } = result;

        if (!destination) return;

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        if (type === 'column') {
            const newColumnOrder = Array.from(boardData.columnOrder);
            newColumnOrder.splice(source.index, 1);
            newColumnOrder.splice(destination.index, 0, draggableId);

            setBoardData(prev => ({ ...prev, columnOrder: newColumnOrder }));
            return;
        }

        const startColumn = boardData.columns[source.droppableId];
        const endColumn = boardData.columns[destination.droppableId];

        if (startColumn === endColumn) {
            const newTaskIds = Array.from(startColumn.taskIds);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);

            const newColumn = { ...startColumn, taskIds: newTaskIds };
            setBoardData(prev => ({
                ...prev,
                columns: {
                    ...prev.columns,
                    [newColumn.id]: newColumn,
                },
            }));
            return;
        }
        
        // Moving from one list to another
        const startTaskIds = Array.from(startColumn.taskIds);
        startTaskIds.splice(source.index, 1);
        const newStartColumn = { ...startColumn, taskIds: startTaskIds };

        const endTaskIds = Array.from(endColumn.taskIds);
        endTaskIds.splice(destination.index, 0, draggableId);
        const newEndColumn = { ...endColumn, taskIds: endTaskIds };
        
        setBoardData(prev => ({
            ...prev,
            columns: {
                ...prev.columns,
                [newStartColumn.id]: newStartColumn,
                [newEndColumn.id]: newEndColumn,
            }
        }));
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-col h-full w-full py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Quadro de Tarefas</h1>
                        <p className="text-muted-foreground">Organize seu projeto com o fluxo de trabalho Kanban.</p>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Tarefa
                    </Button>
                </div>

                <Droppable droppableId="all-columns" direction="horizontal" type="column">
                    {(provided) => (
                        <div 
                            className="flex-grow flex gap-6"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {boardData.columnOrder.map((columnId, index) => {
                                const column = boardData.columns[columnId];
                                const tasks = column.taskIds.map(taskId => boardData.tasks[taskId]);
                                return (
                                    <Draggable key={column.id} draggableId={column.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <KanbanColumn column={column} tasks={tasks} />
                                            </div>
                                        )}
                                    </Draggable>
                                );
                            })}
                            {provided.placeholder}
                             <div className="w-80 flex-shrink-0">
                                <Button variant="outline" className="w-full h-12 bg-white/5 border-dashed hover:bg-white/10">
                                    <Plus className="mr-2 h-4 w-4"/>
                                    Adicionar nova lista
                                </Button>
                            </div>
                        </div>
                    )}
                </Droppable>
            </div>
        </DragDropContext>
    );
}
