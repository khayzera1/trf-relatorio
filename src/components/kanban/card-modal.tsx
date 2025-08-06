
"use client";

import { useState, useEffect } from 'react';
import type { Task } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlignLeft, Trash2 } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';

interface CardModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, newTitle: string, newDescription: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export function CardModal({ task, isOpen, onClose, onUpdateTask, onDeleteTask }: CardModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
  }, [task]);

  const handleSave = () => {
    onUpdateTask(task.id, title, description);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
             <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-semibold leading-none tracking-tight border-transparent focus-visible:border-input focus-visible:ring-1"
             />
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <AlignLeft className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor="description" className="text-lg font-semibold">Descrição</Label>
                </div>
                <TextareaAutosize
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Adicione uma descrição mais detalhada..."
                    className="w-full bg-muted/50 p-2 rounded-lg"
                    minRows={3}
                />
            </div>
            {/* Future sections for checklist, labels, etc. will go here */}
        </div>
        <DialogFooter className="flex-col sm:flex-row sm:justify-between items-start sm:items-center">
            <Button 
                variant="ghost" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDeleteTask(task.id)}
            >
                <Trash2 className="mr-2" />
                Excluir Tarefa
            </Button>
            <div className="flex flex-col-reverse sm:flex-row gap-2">
                <Button variant="outline" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave}>Salvar Alterações</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    