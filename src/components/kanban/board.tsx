
"use client";

import { useState } from 'react';
import { DragDropContext, Droppable, OnDragEndResponder } from "@hello-pangea/dnd";
import { KanbanColumn } from './column';
import type { Task, Column as ColumnType } from '@/lib/types';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { v4 as uuidv4 } from 'uuid';
import { CardModal } from './card-modal';

const initialTasks: Record<string, Task> = {
    'task-1': { id: 'task-1', title: 'Configurar ambiente de desenvolvimento', description: 'Instalar todas as dependências necessárias e configurar o Next.js.' },
    'task-2': { id: 'task-2', title: 'Desenvolver layout do board', description: 'Criar os componentes de coluna e cartão com base no design.' },
    'task-3': { id: 'task-3', title: 'Implementar o cabeçalho', description: 'Adicionar navegação e menu do usuário.' },
    'task-4': { id: 'task-4', title: 'Criar fluxo de autenticação', description: 'Configurar a página de login e a lógica de autenticação com Firebase.' },
    'task-5': { id: 'task-5', title: 'Testar responsividade da UI', description: 'Garantir que o layout funcione bem em desktops e dispositivos móveis.' },
    'task-6': { id: 'task-6', title: 'Conectar ao banco de dados', description: 'Criar funções para ler e escrever dados no Firestore.' },
    'task-7': { id: 'task-7', title: 'Adicionar funcionalidade de drag-and-drop', description: 'Implementar a biblioteca de D&D para mover cartões e colunas.' },
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
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const onDragEnd: OnDragEndResponder = (result) => {
        const { destination, source, draggableId, type } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

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
                columns: { ...prev.columns, [newColumn.id]: newColumn },
            }));
            return;
        }
        
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
    
    const addColumn = () => {
        const newColumnId = `col-${uuidv4()}`;
        const newColumn: ColumnType = {
            id: newColumnId,
            title: 'Nova Lista',
            taskIds: [],
        };
        setBoardData(prev => ({
            ...prev,
            columns: { ...prev.columns, [newColumnId]: newColumn },
            columnOrder: [...prev.columnOrder, newColumnId],
        }));
    };

    const updateColumnTitle = (columnId: string, newTitle: string) => {
        const newColumns = { ...boardData.columns };
        newColumns[columnId].title = newTitle;
        setBoardData(prev => ({ ...prev, columns: newColumns }));
    };

    const deleteColumn = (columnId: string) => {
        const columnToDelete = boardData.columns[columnId];
        const taskIdsToDelete = new Set(columnToDelete.taskIds);

        const newTasks = { ...boardData.tasks };
        taskIdsToDelete.forEach(taskId => delete newTasks[taskId]);

        const newColumns = { ...boardData.columns };
        delete newColumns[columnId];
        
        const newColumnOrder = boardData.columnOrder.filter(id => id !== columnId);

        setBoardData({
            tasks: newTasks,
            columns: newColumns,
            columnOrder: newColumnOrder,
        });
    };

    const addTask = (columnId: string, title: string) => {
        const newTaskId = `task-${uuidv4()}`;
        const newTask: Task = { id: newTaskId, title, description: '' };
        
        const column = boardData.columns[columnId];
        const newTaskIds = [...column.taskIds, newTaskId];

        setBoardData(prev => ({
            ...prev,
            tasks: { ...prev.tasks, [newTaskId]: newTask },
            columns: {
                ...prev.columns,
                [columnId]: { ...column, taskIds: newTaskIds },
            },
        }));
    };

    const updateTask = (taskId: string, newTitle: string, newDescription: string) => {
        const newTasks = { ...boardData.tasks };
        newTasks[taskId].title = newTitle;
        newTasks[taskId].description = newDescription;
        setBoardData(prev => ({ ...prev, tasks: newTasks }));
    };

    const deleteTask = (taskId: string) => {
        const newTasks = { ...boardData.tasks };
        delete newTasks[taskId];

        const newColumns = { ...boardData.columns };
        Object.keys(newColumns).forEach(colId => {
            newColumns[colId].taskIds = newColumns[colId].taskIds.filter(id => id !== taskId);
        });

        setBoardData(prev => ({
            ...prev,
            tasks: newTasks,
            columns: newColumns,
        }));
        setSelectedTask(null); // Close modal on delete
    };


    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-col h-full w-full py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Quadro de Tarefas</h1>
                        <p className="text-muted-foreground">Organize seu projeto com o fluxo de trabalho Kanban.</p>
                    </div>
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
                                    <KanbanColumn 
                                        key={column.id} 
                                        column={column} 
                                        tasks={tasks} 
                                        index={index}
                                        onUpdateTitle={updateColumnTitle}
                                        onDelete={deleteColumn}
                                        onAddTask={addTask}
                                        onOpenTaskModal={(task) => setSelectedTask(task)}
                                    />
                                );
                            })}
                            {provided.placeholder}
                             <div className="w-80 flex-shrink-0">
                                <Button variant="outline" className="w-full h-12 bg-white/5 border-dashed hover:bg-white/10" onClick={addColumn}>
                                    <Plus className="mr-2 h-4 w-4"/>
                                    Adicionar nova lista
                                </Button>
                            </div>
                        </div>
                    )}
                </Droppable>
            </div>
            {selectedTask && (
                <CardModal 
                    task={selectedTask}
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdateTask={updateTask}
                    onDeleteTask={deleteTask}
                />
            )}
        </DragDropContext>
    );
}

    