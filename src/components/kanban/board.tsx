
"use client";

import { KanbanColumn } from './column';
import type { Task, Column } from '@/lib/types';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';

const initialTasks: Task[] = [
    { id: 'task-1', title: 'Configurar ambiente de desenvolvimento', content: 'Instalar todas as dependências necessárias e configurar o Next.js.' },
    { id: 'task-2', title: 'Desenvolver layout do board', content: 'Criar os componentes de coluna e cartão com base no design.' },
    { id: 'task-3', title: 'Implementar o cabeçalho', content: 'Adicionar navegação e menu do usuário.' },
    { id: 'task-4', title: 'Criar fluxo de autenticação', content: 'Configurar a página de login e a lógica de autenticação com Firebase.' },
    { id: 'task-5', title: 'Testar responsividade da UI', content: 'Garantir que o layout funcione bem em desktops e dispositivos móveis.' },
    { id: 'task-6', title: 'Conectar ao banco de dados', content: 'Criar funções para ler e escrever dados no Firestore.' },
    { id: 'task-7', title: 'Adicionar funcionalidade de drag-and-drop', content: 'Implementar a biblioteca de D&D para mover cartões e colunas.' },
];

const initialColumns: Column[] = [
    { id: 'col-1', title: 'Backlog', taskIds: ['task-1', 'task-2'] },
    { id: 'col-2', title: 'A Fazer', taskIds: ['task-3'] },
    { id: 'col-3', title: 'Em Progresso', taskIds: ['task-4', 'task-5'] },
    { id: 'col-4', title: 'Concluído', taskIds: ['task-6'] },
];


export function KanbanBoard() {

    const columns = initialColumns.map(column => {
        const tasks = column.taskIds.map(taskId => initialTasks.find(task => task.id === taskId)).filter(Boolean) as Task[];
        return { ...column, tasks };
    });

    return (
        <div className="flex flex-col h-full w-full">
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
            <div className="flex-grow overflow-x-auto pb-4">
                <div className="inline-flex gap-6 h-full">
                    {columns.map(column => (
                        <KanbanColumn key={column.id} column={column} tasks={column.tasks} />
                    ))}
                    <div className="w-80 flex-shrink-0">
                        <Button variant="outline" className="w-full h-12 bg-white/5 border-dashed hover:bg-white/10">
                            <Plus className="mr-2 h-4 w-4"/>
                            Adicionar nova lista
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
