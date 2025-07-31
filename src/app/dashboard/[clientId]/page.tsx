
'use client';

import { useParams } from 'next/navigation';
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, Eye, MousePointerClick, TrendingUp, User, Tag, ArrowLeft, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ClientData } from '@/lib/types';

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

// Estrutura de dados de campanha específica por NOME DA CAMPANHA
const campaignDataByCampaignName: { [key: string]: any } = {
    'Google Ads - Pesquisa Local': {
        platform: 'Google Ads',
        kpis: { cost: 'R$1.250,50', clicks: '310', impressions: '8.120', ctr: '3,82%', result: '25 Ligações' },
        chartData: [ { month: 'Jan', clicks: 45, impressions: 1200 }, { month: 'Fev', clicks: 60, impressions: 1500 }, { month: 'Mar', clicks: 55, impressions: 1400 }, { month: 'Abr', clicks: 70, impressions: 1800 }, { month: 'Mai', clicks: 50, impressions: 1300 }, { month: 'Jun', clicks: 30, impressions: 920 } ],
    },
    'Meta Ads - WhatsApp': {
        platform: 'Meta Ads',
        kpis: { cost: 'R$980,00', clicks: '1.500', impressions: '25.000', ctr: '6,00%', result: '80 Conversas no WhatsApp' },
        chartData: [ { month: 'Jan', clicks: 200, impressions: 4000 }, { month: 'Fev', clicks: 250, impressions: 5000 }, { month: 'Mar', clicks: 280, impressions: 5500 }, { month: 'Abr', clicks: 320, impressions: 6000 }, { month: 'Mai', clicks: 210, impressions: 3000 }, { month: 'Jun', clicks: 240, impressions: 1500 } ],
    },
    'Google Ads - Display': {
        platform: 'Google Ads',
        kpis: { cost: 'R$600,00', clicks: '8.000', impressions: '150.000', ctr: '5,33%', result: 'N/A' },
        chartData: [ { month: 'Jan', clicks: 1200, impressions: 25000 }, { month: 'Fev', clicks: 1500, impressions: 30000 }, { month: 'Mar', clicks: 1300, impressions: 28000 }, { month: 'Abr', clicks: 1800, impressions: 35000 }, { month: 'Mai', clicks: 1100, impressions: 20000 }, { month: 'Jun', clicks: 1100, impressions: 12000 } ],
    },
    'Meta Ads - Tráfego Site': {
        platform: 'Meta Ads',
        kpis: { cost: 'R$1.800,70', clicks: '450', impressions: '40.000', ctr: '1,13%', result: '1.2k Visitas ao Site' },
        chartData: [ { month: 'Jan', clicks: 60, impressions: 6000 }, { month: 'Fev', clicks: 80, impressions: 8000 }, { month: 'Mar', clicks: 70, impressions: 7000 }, { month: 'Abr', clicks: 90, impressions: 9000 }, { month: 'Mai', clicks: 75, impressions: 6000 }, { month: 'Jun', clicks: 75, impressions: 4000 } ],
    },
     'Google Ads - Pesquisa': {
        platform: 'Google Ads',
        kpis: { cost: 'R$2.500,00', clicks: '400', impressions: '9.500', ctr: '4,21%', result: '50 Agendamentos' },
        chartData: [ { month: 'Jan', clicks: 50, impressions: 1200 }, { month: 'Fev', clicks: 70, impressions: 1800 }, { month: 'Mar', clicks: 65, impressions: 1600 }, { month: 'Abr', clicks: 85, impressions: 2000 }, { month: 'Mai', clicks: 70, impressions: 1700 }, { month: 'Jun', clicks: 60, impressions: 1200 } ],
    },
    'Meta Ads - Catálogo': {
      platform: 'Meta Ads',
      kpis: { cost: 'R$1.500,00', clicks: '2.200', impressions: '60.000', ctr: '3,67%', result: '300 Vendas' },
      chartData: [ { month: 'Jan', clicks: 300, impressions: 9000 }, { month: 'Fev', clicks: 350, impressions: 10000 }, { month: 'Mar', clicks: 400, impressions: 12000 }, { month: 'Abr', clicks: 420, impressions: 13000 }, { month: 'Mai', clicks: 380, impressions: 11000 }, { month: 'Jun', clicks: 350, impressions: 5000 } ],
    },
    'Google Ads - Maps': {
        platform: 'Google Ads',
        kpis: { cost: 'R$450,00', clicks: '150', impressions: '5.000', ctr: '3,00%', result: '40 Rotas Traçadas' },
        chartData: [ { month: 'Jan', clicks: 20, impressions: 800 }, { month: 'Fev', clicks: 25, impressions: 1000 }, { month: 'Mar', clicks: 30, impressions: 1200 }, { month: 'Abr', clicks: 28, impressions: 1100 }, { month: 'Mai', clicks: 22, impressions: 900 }, { month: 'Jun', clicks: 25, impressions: 1000 } ],
    },
    'Meta Ads - Leads': {
        platform: 'Meta Ads',
        kpis: { cost: 'R$2.100,00', clicks: '600', impressions: '35.000', ctr: '1,71%', result: '120 Leads' },
        chartData: [ { month: 'Jan', clicks: 80, impressions: 5000 }, { month: 'Fev', clicks: 100, impressions: 6000 }, { month: 'Mar', clicks: 110, impressions: 6500 }, { month: 'Abr', clicks: 120, impressions: 7000 }, { month: 'Mai', clicks: 90, impressions: 5500 }, { month: 'Jun', clicks: 100, impressions: 5000 } ],
    },
    'Google Ads - Rede de Pesquisa': {
        platform: 'Google Ads',
        kpis: { cost: 'R$3.500,00', clicks: '800', impressions: '22.000', ctr: '3,64%', result: '95 Contatos via Site' },
        chartData: [ { month: 'Jan', clicks: 120, impressions: 3000 }, { month: 'Fev', clicks: 130, impressions: 3500 }, { month: 'Mar', clicks: 150, impressions: 4000 }, { month: 'Abr', clicks: 140, impressions: 4500 }, { month: 'Mai', clicks: 130, impressions: 4000 }, { month: 'Jun', clicks: 130, impressions: 3000 } ],
    },
    'Meta Ads - Inscrição': {
        platform: 'Meta Ads',
        kpis: { cost: 'R$1.950,00', clicks: '950', impressions: '48.000', ctr: '1,98%', result: '250 Inscrições' },
        chartData: [ { month: 'Jan', clicks: 150, impressions: 7000 }, { month: 'Fev', clicks: 160, impressions: 8000 }, { month: 'Mar', clicks: 180, impressions: 9000 }, { month: 'Abr', clicks: 170, impressions: 8500 }, { month: 'Mai', clicks: 150, impressions: 8000 }, { month: 'Jun', clicks: 140, impressions: 7500 } ],
    },
};

const defaultCampaignData = {
    platform: 'N/A',
    kpis: { cost: 'R$0,00', clicks: '0', impressions: '0', ctr: '0,00%', result: 'Nenhum resultado' },
    chartData: [ { month: 'Jan', clicks: 0, impressions: 0 }, { month: 'Fev', clicks: 0, impressions: 0 }, { month: 'Mar', clicks: 0, impressions: 0 }, { month: 'Abr', clicks: 0, impressions: 0 }, { month: 'Mai', clicks: 0, impressions: 0 }, { month: 'Jun', clicks: 0, impressions: 0 } ],
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

    const data = campaignDataByCampaignName[client.campaign] || defaultCampaignData;
    
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
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
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
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Resultado Principal</CardTitle>
                                <Target className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.kpis.result}</div>
                                <p className="text-xs text-muted-foreground">meta da campanha</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Desempenho Geral - {data.platform}</CardTitle>
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

    