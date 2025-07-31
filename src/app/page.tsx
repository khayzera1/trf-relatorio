
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { type ClientData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, ArrowRight, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Armazenamento local
const getInitialData = (): ClientData[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const savedData = localStorage.getItem('clientData');
  return savedData ? JSON.parse(savedData) : [];
};

export default function Home() {
  const [data, setData] = useState<ClientData[]>([]);

  useEffect(() => {
    setData(getInitialData());
  }, []);

  const getBadgeVariant = (status: ClientData['status']) => {
    switch (status) {
      case 'Ativa':
        return 'default';
      case 'Pausada':
        return 'secondary';
      case 'Concluída':
        return 'outline';
      default:
        return 'default';
    }
  };

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
            <Avatar>
                <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
        </div>
      </Header>
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold font-headline tracking-tight">Feed de Clientes</h1>
                <p className="text-muted-foreground mt-2">Acompanhe o status das campanhas dos seus clientes.</p>
            </div>
            {data.length > 0 ? (
              data.map((client) => (
                <Card key={client.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center gap-4 bg-card p-4 border-b">
                         <Avatar>
                            <AvatarImage src={`https://placehold.co/40x40.png?text=${client.clientName.charAt(0)}`} alt={client.clientName} data-ai-hint="logo letter" />
                            <AvatarFallback>{client.clientName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg font-semibold text-primary">{client.clientName}</CardTitle>
                            <CardDescription className="text-sm">{client.campaign}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <p className="text-muted-foreground">
                            A campanha <span className="font-semibold text-foreground">{client.campaign}</span> está com o status:
                        </p>
                        <div className="mt-4">
                            <Badge variant={getBadgeVariant(client.status)} className="text-sm capitalize">
                                {client.status}
                            </Badge>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/50 p-4 flex justify-end">
                         <Link href={`/reports?clientName=${encodeURIComponent(client.clientName)}`}>
                            <Button variant="ghost" size="sm">
                                Gerar Relatório
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
              ))
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium text-foreground">Nenhum cliente cadastrado</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Comece adicionando um novo cliente para ver seus dados aqui.</p>
                    <div className="mt-6">
                         <Link href="/clients/new">
                            <Button>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Adicionar Primeiro Cliente
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
