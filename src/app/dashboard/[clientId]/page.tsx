
'use client';

import { useParams } from 'next/navigation';
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, Eye, MousePointerClick, TrendingUp, User, Tag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ClientData } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data fetching - em uma aplicação real, isso viria de um backend
const clients: ClientData[] = [
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

const getClientById = (id: string): ClientData | undefined => {
    return clients.find(client => client.id === id);
}

const campaignData = {
    'Google Ads': {
        kpis: {
            cost: 'R$4.523,18',
            clicks: '+2.350',
            impressions: '+12.234',
            ctr: '19,35%',
        },
        chartData: [
            { month: 'Jan', clicks: 186, impressions: 800 },
            { month: 'Fev', clicks: 305, impressions: 1200 },
            { month: 'Mar', clicks: 237, impressions: 900 },
            { month: 'Abr', clicks: 273, impressions: 1100 },
            { month: 'Mai', clicks: 209, impressions: 750 },
            { month: 'Jun', clicks: 214, impressions: 850 },
        ],
    },
    'Meta Ads': {
        kpis: {
            cost: 'R$3.154,25',
            clicks: '+1.890',
            impressions: '+9.876',
            ctr: '19,14%',
        },
        chartData: [
            { month: 'Jan', clicks: 220, impressions: 1200 },
            { month: 'Fev', clicks: 280, impressions: 1800 },
            { month: 'Mar', clicks: 200, impressions: 1000 },
            { month: 'Abr', clicks: 310, impressions: 2100 },
            { month: 'Mai', clicks: 190, impressions: 1100 },
            { month: 'Jun', clicks: 250, impressions: 1600 },
        ],
    },
};

const chartConfig = {
    clicks: { label: 'Cliques', color: 'hsl(var(--chart-1))' },
    impressions: { label: 'Impressões', color: 'hsl(var(--chart-2))' },
};

export default function DashboardPage() {
    const params = useParams();
    const clientId = params.clientId as string;
    const client = getClientById(clientId);

    if (!client) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Header>
                    <Link href="/">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                    </Link>
                </Header>
                <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">Cliente não encontrado</h1>
                        <p className="text-muted-foreground mt-2">O cliente que você está procurando não existe ou foi removido.</p>
                    </div>
                </main>
            </div>
        )
    }

    const platform = client.campaign.includes('Google') ? 'Google Ads' : 'Meta Ads';
    const data = campaignData[platform];
    
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header>
                <Link href="/">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para Clientes
                    </Button>
                </Link>
            </Header>
            <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="space-y-2 mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Painel de Desempenho</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
                       <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{client.clientName}</span>
                       </div>
                       <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            <span>{client.campaign}</span>
                       </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.kpis.cost}</div>
                                <p className="text-xs text-muted-foreground">no último semestre</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Cliques</CardTitle>
                                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.kpis.clicks}</div>
                                <p className="text-xs text-muted-foreground">no último semestre</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Impressões</CardTitle>
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.kpis.impressions}</div>
                                <p className="text-xs text-muted-foreground">no último semestre</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">CTR</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.kpis.ctr}</div>
                                <p className="text-xs text-muted-foreground">médio do período</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Desempenho Geral - {platform}</CardTitle>
                            <CardDescription>Últimos 6 meses</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ChartContainer config={chartConfig} className="h-[350px] w-full">
                                <ResponsiveContainer>
                                    <BarChart data={data.chartData}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Legend />
                                        <Bar dataKey="clicks" fill="var(--color-clicks)" radius={4} />
                                        <Bar dataKey="impressions" fill="var(--color-impressions)" radius={4} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

