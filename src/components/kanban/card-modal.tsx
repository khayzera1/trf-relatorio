
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import type { Task, ChecklistItem, Label, Attachment } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label as UiLabel } from '../ui/label';
import { AlignLeft, Trash2, CheckSquare, Tag, Calendar as CalendarIcon, Plus, X, Pencil, ArrowLeft, Check, Paperclip, Link as LinkIcon, Upload, Loader2, FileText } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { v4 as uuidv4 } from 'uuid';
import { Progress } from '../ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

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
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const [labelIds, setLabelIds] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const { toast } = useToast();
    
    // State for labels popover
    const [labelPopoverOpen, setLabelPopoverOpen] = useState(false);
    const [editingLabel, setEditingLabel] = useState<Label | null>(null);
    const [isCreatingLabel, setIsCreatingLabel] = useState(false);
    const [currentLabelName, setCurrentLabelName] = useState('');
    const [currentLabelColor, setCurrentLabelColor] = useState(labelColorOptions[0]);

    // State for attachments
    const [attachmentPopoverOpen, setAttachmentPopoverOpen] = useState(false);
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const [attachmentName, setAttachmentName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setChecklist(task.checklist || []);
            setLabelIds(task.labelIds || []);
            setDueDate(task.dueDate ? parseISO(task.dueDate) : undefined);
            setAttachments(task.attachments || []);
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

    const handleDeleteLabel = (labelId: string) => {
        onDeleteLabel(labelId);
        handleBackToLabelList();
    };
    
    const handleBackToLabelList = () => {
        setEditingLabel(null);
        setIsCreatingLabel(false);
    };

    const handleAddAttachmentLink = () => {
        if (attachmentUrl.trim() && attachmentName.trim()) {
            const newAttachment: Attachment = {
                id: uuidv4(),
                name: attachmentName.trim(),
                url: attachmentUrl.trim(),
                type: 'link',
                createdAt: new Date().toISOString(),
            };
            const newAttachments = [...attachments, newAttachment];
            handleUpdate('attachments', newAttachments);
            setAttachmentUrl('');
            setAttachmentName('');
            setAttachmentPopoverOpen(false);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 1048576) { // 1MB limit
            toast({
                variant: 'destructive',
                title: 'Arquivo muito grande',
                description: 'Por favor, selecione arquivos com menos de 1MB.',
            });
            return;
        }

        setAttachmentPopoverOpen(false);
        setIsUploading(true);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const newAttachment: Attachment = {
                id: uuidv4(),
                name: file.name,
                url: reader.result as string, // Base64 data URI
                type: 'file',
                createdAt: new Date().toISOString(),
            };
            
            const newAttachments = [...(task.attachments || []), newAttachment];
            handleUpdate('attachments', newAttachments);
            setIsUploading(false);
            toast({ title: 'Sucesso!', description: 'Arquivo anexado com sucesso.' });
        };
        reader.onerror = (error) => {
            console.error("Error converting file to Base64:", error);
            toast({ variant: 'destructive', title: 'Erro de Leitura', description: 'Não foi possível ler o arquivo.' });
            setIsUploading(false);
        };
    };

    const handleDeleteAttachment = (attachmentId: string) => {
        const newAttachments = attachments.filter(att => att.id !== attachmentId);
        handleUpdate('attachments', newAttachments);
        toast({ title: 'Anexo removido' });
    };

    const handleDeleteTask = async () => {
        onDeleteTask(task.id);
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
                        <div className="flex justify-between gap-2">
                            <Button onClick={handleSaveLabel} className="w-full">{isCreatingLabel ? 'Criar' : 'Salvar'}</Button>
                            {editingLabel && (
                                <Button variant="destructive" size="icon" onClick={() => handleDeleteLabel(editingLabel.id)}><Trash2 className="h-4 w-4"/></Button>
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
                <DialogTitle>
                    <Input 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => handleUpdate('title', title)}
                        className="text-2xl font-semibold leading-none tracking-tight border-transparent focus-visible:border-input focus-visible:ring-1 bg-transparent"
                    />
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Edite os detalhes da tarefa. O título acima é editável.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 px-1 relative">
                {isUploading && (
                    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-20 rounded-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="mt-4 font-semibold text-foreground">Processando arquivo...</p>
                    </div>
                )}
                <div className="md:col-span-2 space-y-6 overflow-y-auto">
                    <div className="flex flex-wrap gap-4 items-center">
                        {labelIds.length > 0 && (
                            <div className="space-y-2">
                                <UiLabel className="flex items-center gap-2 text-sm text-muted-foreground"><Tag className="h-4 w-4"/> Etiquetas</UiLabel>
                                <div className="flex flex-wrap gap-1">
                                    {labelIds.map(labelId => (
                                        allLabels[labelId] &&
                                        <span key={labelId} className={`px-2 py-1 rounded text-xs font-semibold text-white ${allLabels[labelId].color}`}>
                                            {allLabels[labelId].name}
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

                    {attachments.length > 0 && (
                         <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <Paperclip className="h-5 w-5 text-muted-foreground" />
                                <UiLabel className="text-lg font-semibold">Anexos</UiLabel>
                            </div>
                            <div className="space-y-3">
                                {attachments.map(att => (
                                    <div key={att.id} className="flex items-center gap-3 group bg-muted/50 p-2 rounded-md">
                                        <div className="bg-muted p-2 rounded">
                                           {att.type === 'link' ? <LinkIcon className="h-5 w-5"/> : <FileText className="h-5 w-5"/>}
                                        </div>
                                        <div className="flex-grow">
                                            <a href={att.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm hover:underline break-all">{att.name}</a>
                                            <p className="text-xs text-muted-foreground">Adicionado em {format(parseISO(att.createdAt), "d MMM, yyyy 'às' HH:mm", {locale: ptBR})}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteAttachment(att.id)}>
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


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
                </div>

                <div className="md:col-span-1 space-y-2 flex flex-col">
                    <h4 className="font-semibold text-sm">Adicionar ao cartão</h4>
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
                     <Popover open={attachmentPopoverOpen} onOpenChange={setAttachmentPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="secondary" className="w-full justify-start"><Paperclip className="mr-2"/> Anexar</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4 glass-card" align="start">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-center mb-2">Anexar</h4>
                                <div className="space-y-2">
                                    <UiLabel htmlFor="attachment-url">Anexar um link</UiLabel>
                                    <Input id="attachment-url" placeholder="Cole qualquer link aqui..." value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} />
                                    <Input id="attachment-name" placeholder="Nome do Link (Obrigatório)" value={attachmentName} onChange={(e) => setAttachmentName(e.target.value)} />
                                    <Button onClick={handleAddAttachmentLink} className="w-full">Anexar Link</Button>
                                </div>
                                <Separator/>
                                <div className="space-y-2">
                                     <UiLabel htmlFor="file-upload">Carregar um arquivo</UiLabel>
                                     <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                                        <Upload className="mr-2"/>
                                        Escolher do computador
                                     </Button>
                                     <Input id="file-upload" type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden"/>
                                </div>
                            </div>
                        </PopoverContent>
                     </Popover>
                    
                     <div className="border-t border-border/10 pt-4 mt-auto">
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={handleDeleteTask}
                        >
                            <Trash2 className="mr-2" />
                            Excluir Tarefa
                        </Button>
                    </div>
                </div>
            </div>
      </DialogContent>
    </Dialog>
  );
}
