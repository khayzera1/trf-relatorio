
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Task, ChecklistItem, Label } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label as UiLabel } from '../ui/label';
import { AlignLeft, Trash2, CheckSquare, Tag, Calendar as CalendarIcon, Plus, X, Pencil, ArrowLeft } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { v4 as uuidv4 } from 'uuid';
import { Progress } from '../ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const labelColorOptions = [
    'bg-blue-500', 'bg-purple-500', 'bg-red-500', 'bg-green-500', 
    'bg-yellow-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'
];

interface CardModalProps {
  task: Task;
  allLabels: Record<string, Label>;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, newValues: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateLabel: (label: Label) => void;
  onCreateLabel: (label: Label) => void;
  onDeleteLabel: (labelId: string) => void;
}

export function CardModal({ task, isOpen, onClose, onUpdateTask, onDeleteTask, allLabels, onUpdateLabel, onCreateLabel, onDeleteLabel }: CardModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const [labelIds, setLabelIds] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    
    // State for labels popover
    const [labelPopoverOpen, setLabelPopoverOpen] = useState(false);
    const [editingLabel, setEditingLabel] = useState<Label | null>(null);
    const [isCreatingLabel, setIsCreatingLabel] = useState(false);
    const [currentLabelName, setCurrentLabelName] = useState('');
    const [currentLabelColor, setCurrentLabelColor] = useState(labelColorOptions[0]);


    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setChecklist(task.checklist || []);
            setLabelIds(task.labelIds || []);
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

    const toggleLabel = (labelId: string) => {
        const newLabelIds = labelIds.includes(labelId) ? labelIds.filter(id => id !== labelId) : [...labelIds, labelId];
        setLabelIds(newLabelIds);
        handleUpdate('labelIds', newLabelIds);
    };

    const handleDateSelect = (date: Date | undefined) => {
        setDueDate(date);
        handleUpdate('dueDate', date ? date.toISOString().split('T')[0] : undefined);
    };

    const handleStartCreateLabel = () => {
        setIsCreatingLabel(true);
        setEditingLabel(null);
        setCurrentLabelName('');
        setCurrentLabelColor(labelColorOptions[0]);
    };

    const handleStartEditLabel = (label: Label) => {
        setEditingLabel(label);
        setIsCreatingLabel(false);
        setCurrentLabelName(label.name);
        setCurrentLabelColor(label.color);
    };

    const handleSaveLabel = () => {
        if (currentLabelName.trim() === '') return;
        
        if (isCreatingLabel) {
            onCreateLabel({
                id: `label-${uuidv4()}`,
                name: currentLabelName,
                color: currentLabelColor,
            });
        } else if (editingLabel) {
            onUpdateLabel({
                ...editingLabel,
                name: currentLabelName,
                color: currentLabelColor,
            });
        }
        
        handleBackToLabelList();
    };
    
    const handleBackToLabelList = () => {
        setEditingLabel(null);
        setIsCreatingLabel(false);
    };

    if (!task) return null;

    const renderLabelPopoverContent = () => {
        if (isCreatingLabel || editingLabel) {
            return (
                 <div className="p-4">
                    <div className="flex items-center mb-4">
                        <Button variant="ghost" size="icon" className="mr-2 h-8 w-8" onClick={handleBackToLabelList}><ArrowLeft/></Button>
                        <h4 className="font-semibold text-center flex-grow">{isCreatingLabel ? 'Criar Etiqueta' : 'Editar Etiqueta'}</h4>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <UiLabel htmlFor="label-name">Nome</UiLabel>
                            <Input id="label-name" value={currentLabelName} onChange={(e) => setCurrentLabelName(e.target.value)} />
                        </div>
                        <div>
                             <UiLabel>Cor</UiLabel>
                             <div className="grid grid-cols-4 gap-2 mt-1">
                                {labelColorOptions.map(color => (
                                    <div key={color} onClick={() => setCurrentLabelColor(color)} className={`h-8 rounded cursor-pointer flex items-center justify-center ${color}`}>
                                        {currentLabelColor === color && <Check className="h-4 w-4 text-white"/>}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <Button onClick={handleSaveLabel} className="w-full">{isCreatingLabel ? 'Criar' : 'Salvar'}</Button>
                            {editingLabel && (
                                <Button variant="destructive" size="icon" onClick={() => onDeleteLabel(editingLabel.id)}><Trash2/></Button>
                            )}
                        </div>
                    </div>
                 </div>
            );
        }

        return (
            <div className="p-2 space-y-1">
                <h4 className="font-semibold text-center mb-2 p-2">Etiquetas</h4>
                <div className="px-2 space-y-2">
                    {Object.values(allLabels).map(label => (
                        <div key={label.id} className="flex items-center gap-2 group">
                            <input type="checkbox" readOnly checked={labelIds.includes(label.id)} className="h-4 w-4" onClick={() => toggleLabel(label.id)}/>
                            <div onClick={() => toggleLabel(label.id)} className={`w-full px-2 py-1 rounded text-xs font-semibold text-white ${label.color}`}>
                                {label.name}
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleStartEditLabel(label)}>
                                <Pencil className="h-3 w-3"/>
                            </Button>
                        </div>
                    ))}
                </div>
                <Button variant="secondary" className="w-full mt-2" onClick={handleStartCreateLabel}>Criar nova etiqueta</Button>
            </div>
        );
    };

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
                <div className="flex flex-wrap gap-4 items-center">
                    {labelIds.length > 0 && (
                         <div className="space-y-2">
                            <UiLabel className="flex items-center gap-2 text-sm text-muted-foreground"><Tag className="h-4 w-4"/> Etiquetas</UiLabel>
                            <div className="flex flex-wrap gap-1">
                                {labelIds.map(labelId => (
                                    <span key={labelId} className={`px-2 py-1 rounded text-xs font-semibold text-white ${allLabels[labelId]?.color || ''}`}>
                                        {allLabels[labelId]?.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                     <div className="space-y-2">
                        <UiLabel className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarIcon className="h-4 w-4"/> Prazo</UiLabel>
                        {dueDate ? (
                             <Button variant="outline" className="h-auto">
                                 {format(dueDate, "d 'de' MMM, yyyy", { locale: ptBR })}
                                <X className="h-3 w-3 ml-2" onClick={(e) => {e.stopPropagation(); handleDateSelect(undefined)}}/>
                             </Button>
                        ) : <span className="text-sm text-muted-foreground italic">Nenhum</span>}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <AlignLeft className="h-5 w-5 text-muted-foreground" />
                        <UiLabel htmlFor="description" className="text-lg font-semibold">Descrição</UiLabel>
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

                {checklist.length > 0 && (
                    <div className="space-y-2">
                         <div className="flex items-center gap-3">
                            <CheckSquare className="h-5 w-5 text-muted-foreground" />
                            <UiLabel htmlFor="checklist" className="text-lg font-semibold">Checklist</UiLabel>
                        </div>
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
                    </div>
                )}
                
                <div className="space-y-2">
                     <div className="flex items-center gap-2">
                        <Input 
                            placeholder="Adicionar um item ao checklist..."
                            value={newChecklistItem}
                            onChange={(e) => setNewChecklistItem(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                            className="bg-muted/50"
                        />
                        <Button onClick={addChecklistItem}><Plus className="h-4 w-4 mr-1"/> Adicionar</Button>
                    </div>
                </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <Popover open={labelPopoverOpen} onOpenChange={setLabelPopoverOpen}>
                        <PopoverTrigger asChild>
                           <Button variant="secondary" className="w-full justify-start"><Tag className="mr-2"/> Etiquetas</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 glass-card" align="start">
                            {renderLabelPopoverContent()}
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
            </div>
      </DialogContent>
    </Dialog>
  );
}

    