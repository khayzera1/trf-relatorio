
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import type { ClientData } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, ArrowRight, Users, Search, Contact, Pencil, Trash2, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { getClients, updateClient, deleteClient } from "@/lib/firebase/client";
import { useAuth } from "@/context/auth-context";
import ProtectedRoute from "@/components/protected-route";
import { ClockWidget } from "@/components/clock-widget";
import { RecentClientsWidget } from "@/components/recent-clients-widget";

const getInitials = (name: string = '') => {
    const names = name.split(' ').filter(Boolean);
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

function HomePageContent() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientToEdit, setClientToEdit] = useState<ClientData | null>(null);
  const [newClientName, setNewClientName] = useState("");
  const { toast } = useToast();

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const savedData = await getClients();
      setClients(savedData);
    } catch (error) {
      console.error("Failed to fetch clients from Firestore", error);
      toast({
          variant: "destructive",
          title: "Erro ao Carregar Clientes",
          description: "Não foi possível buscar os clientes. Verifique sua conexão e permissões.",
      });
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleEditClient = async () => {
    if (!clientToEdit || !newClientName.trim()) {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "O nome do cliente não pode estar vazio.",
      });
      return;
    }

    try {
        await updateClient(clientToEdit.id, newClientName);
        toast({
          title: "Cliente Atualizado!",
          description: `O nome do cliente foi alterado para ${newClientName}.`,
        });
        loadClients();
    } catch (error) {
        console.error("Failed to update client:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Atualizar",
            description: "Não foi possível atualizar o cliente. Tente novamente.",
        });
    } finally {
        setClientToEdit(null);
        setNewClientName("");
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      await deleteClient(clientId);
      toast({
        title: "Cliente Removido",
        description: "O cliente foi removido com sucesso.",
      });
      loadClients();
    } catch (error) {
        console.error("Failed to delete client:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Remover",
            description: "Não foi possível remover o cliente. Tente novamente.",
        });
    }
  };

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) {
      return clients;
    }
    return clients.filter(client => 
      client.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const hasClients = clients.length > 0;

  if (isLoading) {
      return (
          <div className="flex min-h-screen w-full items-center justify-center bg-transparent">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <div className="min-h-screen text-foreground">
       <Header/>
      <main className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Coluna da Esquerda com Widgets */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            <ClockWidget />
            <RecentClientsWidget />
          </div>

          {/* Coluna da Direita com Painel de Clientes */}
          <div className="lg:col-span-2 w-full">
            <div className="glass-card p-6 mb-8">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <Contact className="h-8 w-8 text-primary" />
                        <div>
                        <h1 className="text-3xl font-bold tracking-tight">Feed de Clientes</h1>
                        <p className="text-muted-foreground">Gerencie seus clientes e gere relatórios.</p>
                        </div>
                    </div>
                    <div className="flex w-full sm:w-auto sm:max-w-sm items-center gap-4">
                        <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar cliente..." 
                            className="pl-10 bg-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        </div>
                        <Link href="/clients/new">
                            <Button className="flex-shrink-0">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Adicionar
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            
            {filteredClients.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredClients.map((client, index) => (
                <Card key={client.id} className="glass-card overflow-hidden flex flex-col animate-fade-in transition-all duration-300 hover:border-white/30 hover:scale-105" style={{ animationDelay: `${index * 100}ms`}}>
                    <CardContent className="p-6 flex flex-col items-center justify-center gap-4 text-center flex-grow">
                        <Avatar className="h-16 w-16 text-xl">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold border-2 border-primary/50">{getInitials(client.clientName)}</AvatarFallback>
                        </Avatar>
                        <p className="text-lg font-semibold text-card-foreground break-all">{client.clientName}</p>
                        <Link href={`/reports?clientName=${encodeURIComponent(client.clientName)}`}>
                            <Button variant="ghost" size="sm">
                                Gerar Relatório
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                    <CardFooter className="bg-black/20 p-2 flex justify-end gap-2">
                        <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                            setClientToEdit(client);
                            setNewClientName(client.clientName);
                        }}
                        >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar Cliente</span>
                        </Button>
                        <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Apagar Cliente</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-card">
                            <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Essa ação não pode ser desfeita. Isso irá apagar permanentemente o cliente <span className="font-bold">{client.clientName}</span> e todos os seus dados associados.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteClient(client.id)}>
                                Sim, apagar cliente
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
                ))}
            </div>
            ) : (
                <div className="text-center py-12 sm:py-20 border-2 border-dashed rounded-2xl glass-card mt-10 px-4">
                    <Users className="mx-auto h-16 w-16 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-medium text-foreground">Nenhum cliente encontrado</h3>
                    <p className="mt-2 text-md text-muted-foreground max-w-md mx-auto">
                        {hasClients ? "Tente um termo de busca diferente." : "Comece adicionando um novo cliente para visualizar aqui."}
                    </p>
                    {!hasClients && (
                    <div className="mt-8">
                        <Link href="/clients/new">
                            <Button size="lg">
                                <UserPlus className="mr-2 h-5 w-5" />
                                Adicionar Primeiro Cliente
                            </Button>
                        </Link>
                    </div>
                    )}
                </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Client Dialog */}
      <Dialog open={!!clientToEdit} onOpenChange={(isOpen) => !isOpen && setClientToEdit(null)}>
        <DialogContent className="sm:max-w-[425px] glass-card">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Altere o nome do cliente aqui. Clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button type="button" onClick={handleEditClient}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


export default function Home() {
  return (
    <ProtectedRoute>
      <HomePageContent />
    </ProtectedRoute>
  );
}
