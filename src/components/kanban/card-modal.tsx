
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Task, ChecklistItem } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlignLeft, Trash2, CheckSquare, Tag, Calendar as CalendarIcon, Plus, X } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { v4 as uuidv4 } from 'uuid';
import { Progress } from '../ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const availableLabelColors: Record<string, { bg: string, text: string }> = {
    'dev': { bg: 'bg-blue-500/20', text: 'text-blue-300' },
    'ui': { bg: 'bg-purple-500/20', text: 'text-purple-300' },
    'backend': { bg: 'bg-red-500/20', text: 'text-red-300' },
    'qa': { bg: 'bg-green-500/20', text: 'text-green-300' },
    'infra': { bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
};

interface CardModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, newValues: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export function CardModal({ task, isOpen, onClose, onUpdateTask, onDeleteTask }: CardModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const [labels, setLabels] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    
    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setChecklist(task.checklist || []);
            setLabels(task.labels || []);
            setDueDate(task.dueDate ? parseISO(task.dueDate) : undefined);
        }
    }, [task]);

    const handleUpdate = (field: keyof Task, value: any) => {
        onUpdateTask(task.id, { [field]: value });
    };

    const addChecklistItem = () => {
        if (newChecklistItem.trim()) {
            const newItem: ChecklistItem = { id: uuidv4(), text: newChecklistItem.trim(), completed: false };
            const newChecklist = [...checklist, newItem];
            setChecklist(newChecklist);
            handleUpdate('checklist', newChecklist);
            setNewChecklistItem('');
        }
    };
    
    const toggleChecklistItem = (itemId: string) => {
        const newChecklist = checklist.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        setChecklist(newChecklist);
        handleUpdate('checklist', newChecklist);
    };
    
    const deleteChecklistItem = (itemId: string) => {
        const newChecklist = checklist.filter(item => item.id !== itemId);
        setChecklist(newChecklist);
        handleUpdate('checklist', newChecklist);
    };

    const checklistProgress = useMemo(() => {
        if (!checklist || checklist.length === 0) return 0;
        const completed = checklist.filter(item => item.completed).length;
        return (completed / checklist.length) * 100;
    }, [checklist]);

    const toggleLabel = (label: string) => {
        const newLabels = labels.includes(label) ? labels.filter(l => l !== label) : [...labels, label];
        setLabels(newLabels);
        handleUpdate('labels', newLabels);
    };

    const handleDateSelect = (date: Date | undefined) => {
        setDueDate(date);
        handleUpdate('dueDate', date ? date.toISOString().split('T')[0] : undefined);
    };

    if (!task) return null;

    return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="glass-card sm:max-w-2xl grid-rows-[auto,1fr,auto] max-h-[90vh]">
            <DialogHeader>
                 <Input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => handleUpdate('title', title)}
                    className="text-2xl font-semibold leading-none tracking-tight border-transparent focus-visible:border-input focus-visible:ring-1 bg-transparent"
                 />
            </DialogHeader>
            <div className="py-4 space-y-6 overflow-y-auto px-1">
                {/* Labels and Due Date */}
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm text-muted-foreground"><Tag className="h-4 w-4"/> Etiquetas</Label>
                        <div className="flex flex-wrap gap-2">
                            {labels.map(label => (
                                <span key={label} className={`px-2 py-1 rounded-md text-xs font-semibold ${availableLabelColors[label]?.bg || ''} ${availableLabelColors[label]?.text || ''}`}>
                                    {label.toUpperCase()}
                                </span>
                            ))}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarIcon className="h-4 w-4"/> Prazo</Label>
                        {dueDate ? (
                             <Button variant="outline" className="h-auto">
                                 {format(dueDate, "d 'de' MMM, yyyy", { locale: ptBR })}
                                <X className="h-3 w-3 ml-2" onClick={(e) => {e.stopPropagation(); handleDateSelect(undefined)}}/>
                             </Button>
                        ) : <span className="text-sm text-muted-foreground italic">Nenhum</span>}
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <AlignLeft className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="description" className="text-lg font-semibold">Descrição</Label>
                    </div>
                    <TextareaAutosize
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={() => handleUpdate('description', description)}
                        placeholder="Adicione uma descrição mais detalhada..."
                        className="w-full bg-muted/50 p-3 rounded-lg border-transparent focus:border-input"
                        minRows={3}
                    />
                </div>

                {/* Checklist */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <CheckSquare className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="checklist" className="text-lg font-semibold">Checklist</Label>
                    </div>
                    {checklist.length > 0 && (
                        <div className="space-y-1">
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-muted-foreground">{Math.round(checklistProgress)}%</span>
                                <Progress value={checklistProgress} className="h-2 w-full"/>
                            </div>
                            {checklist.map(item => (
                                <div key={item.id} className="flex items-center gap-2 group">
                                    <input type="checkbox" checked={item.completed} onChange={() => toggleChecklistItem(item.id)} className="h-4 w-4 rounded bg-muted/50 border-muted-foreground text-primary focus:ring-primary"/>
                                    <span className={`flex-grow text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>{item.text}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => deleteChecklistItem(item.id)}>
                                        <X className="h-3 w-3"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Input 
                            placeholder="Adicionar um item..."
                            value={newChecklistItem}
                            onChange={(e) => setNewChecklistItem(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                            className="bg-muted/50"
                        />
                        <Button onClick={addChecklistItem}><Plus className="h-4 w-4 mr-1"/> Adicionar</Button>
                    </div>
                </div>

                {/* Actions Section */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <Popover>
                        <PopoverTrigger asChild>
                           <Button variant="secondary" className="w-full justify-start"><Tag className="mr-2"/> Etiquetas</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 glass-card">
                             <div className="p-2 space-y-1">
                                {Object.keys(availableLabelColors).map(label => (
                                    <div key={label} onClick={() => toggleLabel(label)} className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer">
                                        <input type="checkbox" readOnly checked={labels.includes(label)} className="h-4 w-4"/>
                                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${availableLabelColors[label].bg} ${availableLabelColors[label].text}`}>
                                            {label.toUpperCase()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                     </Popover>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="secondary" className="w-full justify-start"><CalendarIcon className="mr-2"/> Prazo</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 glass-card">
                            <Calendar
                                mode="single"
                                selected={dueDate}
                                onSelect={handleDateSelect}
                                initialFocus
                                locale={ptBR}
                            />
                        </PopoverContent>
                     </Popover>
                </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center pt-4 border-t border-border/10">
                <Button 
                    variant="ghost" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-2 sm:mt-0"
                    onClick={() => onDeleteTask(task.id)}
                >
                    <Trash2 className="mr-2" />
                    Excluir Tarefa
                </Button>
                {/* Save button can be removed if updates are on blur */}
            </div>
      </DialogContent>
    </Dialog>
  );
}
