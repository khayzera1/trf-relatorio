
"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { DataTable, type ClientData } from "@/components/data-table";
import { columns } from "@/components/columns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CsvUploader } from "@/components/csv-uploader";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

const initialData: ClientData[] = [
  { id: 'CLI001', clientName: 'Pizzaria do Bairro', campaign: 'Google Ads - Pesquisa Local', status: 'Ativa' },
  { id: 'CLI002', clientName: 'Salão de Beleza Stilo', campaign: 'Meta Ads - WhatsApp', status: 'Ativa' },
  { id: 'CLI003', clientName: 'Petshop Amigo Fiel', campaign: 'Google Ads - Display', status: 'Pausada' },
  { id: 'CLI004', clientName: 'Oficina Mecânica Veloz', campaign: 'Meta Ads - Tráfego Site', status: 'Ativa' },
  { id: 'CLI005', clientName: 'Consultório Odontológico Sorriso', campaign: 'Google Ads - Pesquisa', status: 'Concluída' },
  { id: 'CLI006', clientName: 'Loja de Roupas Elegância', campaign: 'Meta Ads - Catálogo', status: 'Ativa' },
  { id: 'CLI007', clientName: 'Restaurante Sabor Caseiro', campaign: 'Google Ads - Maps', status: 'Pausada' },
  { id: 'CLI008', clientName: 'Academia Corpo em Forma', campaign: 'Meta Ads - Leads', status: 'Ativa' },
  { id: 'CLI009', clientName: 'Imobiliária Morar Bem', campaign: 'Google Ads - Rede de Pesquisa', status: 'Ativa' },
  { id: 'CLI010', clientName: 'Escola de Idiomas Global', campaign: 'Meta Ads - Inscrição', status: 'Concluída' },
];

export default function Home() {
  const [data, setData] = useState<ClientData[]>(initialData);

  // Esta função simula a adição de um novo cliente.
  // Em uma aplicação real, você faria uma chamada de API para o seu backend.
  const addClient = (newClient: Omit<ClientData, 'id'>) => {
    setData(prevData => [
        { ...newClient, id: `CLI${String(prevData.length + 1).padStart(3, '0')}` }, 
        ...prevData
    ]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Gerador de Relatório PDF</CardTitle>
            <CardDescription>Envie um arquivo CSV para gerar um relatório em PDF no formato A4 para seus clientes.</CardDescription>
          </CardHeader>
          <CardContent>
            <CsvUploader />
          </CardContent>
        </Card>

        <Card className="shadow-lg border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-2xl font-headline">Painel de Clientes</CardTitle>
                <CardDescription>Visualize, gerencie e exporte os dados dos seus clientes.</CardDescription>
            </div>
            <Link href="/clients/new">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Adicionar Novo Cliente
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={data} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
