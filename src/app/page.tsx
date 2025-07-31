
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { type ClientData } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, ArrowRight, Users, Search, Contact } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const getInitialData = (): ClientData[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const savedData = localStorage.getItem('clientData');
  return savedData ? JSON.parse(savedData) : [];
};

export default function Home() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setClients(getInitialData());
  }, []);

  const filteredClients = useMemo(() => {
    return clients.filter(client => 
      client.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header>
        <div className="flex items-center gap-4">
            <Link href="/clients/new">
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Adicionar Cliente
                </Button>
            </Link>
        </div>
      </Header>
      <main className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Contact className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Feed de Clientes</h1>
              <p className="text-muted-foreground">Gerencie seus clientes e gere relatórios.</p>
            </div>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Buscar cliente..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <Card key={client.id} className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border-l-4 border-primary">
                  <CardHeader className="flex flex-row items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                           <Avatar className="h-12 w-12 text-lg">
                              <AvatarFallback className="bg-primary/20 text-primary font-bold">{getInitials(client.clientName)}</AvatarFallback>
                          </Avatar>
                          <p className="text-lg font-semibold text-primary-foreground">{client.clientName}</p>
                      </div>
                  </CardHeader>
                  <CardContent className="p-4 flex justify-end bg-muted/50">
                      <Link href={`/reports?clientName=${encodeURIComponent(client.clientName)}`}>
                          <Button variant="ghost" size="sm">
                              Gerar Relatório
                              <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                      </Link>
                  </CardContent>
              </Card>
            ))}
          </div>
        ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-lg bg-card mt-10">
                <Users className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-medium text-foreground">Nenhum cliente encontrado</h3>
                <p className="mt-2 text-md text-muted-foreground">
                    {clients.length > 0 ? "Tente um termo de busca diferente." : "Comece adicionando um novo cliente."}
                </p>
                {clients.length === 0 && (
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
      </main>
    </div>
  );
}
