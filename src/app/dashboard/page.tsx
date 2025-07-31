
'use client';

import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, Eye, MousePointerClick, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";


const googleAdsData = [
    { month: 'Jan', clicks: 186, impressions: 80, ctr: 23.25 },
    { month: 'Feb', clicks: 305, impressions: 200, ctr: 15.25 },
    { month: 'Mar', clicks: 237, impressions: 120, ctr: 19.75 },
    { month: 'Apr', clicks: 273, impressions: 190, ctr: 14.37 },
    { month: 'May', clicks: 209, impressions: 130, ctr: 16.08 },
    { month: 'Jun', clicks: 214, impressions: 140, ctr: 15.28 },
];

const metaAdsData = [
    { month: 'Jan', clicks: 220, impressions: 120, ctr: 18.33 },
    { month: 'Feb', clicks: 280, impressions: 180, ctr: 15.55 },
    { month: 'Mar', clicks: 200, impressions: 100, ctr: 20.00 },
    { month: 'Apr', clicks: 310, impressions: 210, ctr: 14.76 },
    { month: 'May', clicks: 190, impressions: 110, ctr: 17.27 },
    { month: 'Jun', clicks: 250, impressions: 160, ctr: 15.63 },
];

const chartConfig = {
    clicks: { label: 'Cliques', color: 'hsl(var(--chart-1))' },
    impressions: { label: 'Impressões', color: 'hsl(var(--chart-2))' },
};


export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header>
                <Link href="/">
                    <Button variant="outline" className="bg-white hover:bg-gray-100">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para Clientes
                    </Button>
                </Link>
            </Header>
            <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight">Painel de Anúncios</h1>
                    <p className="text-muted-foreground">
                        Selecione a plataforma para visualizar os relatórios de desempenho.
                    </p>
                </div>
                <Tabs defaultValue="google-ads" className="mt-6">
                    <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                        <TabsTrigger value="google-ads">Google Ads</TabsTrigger>
                        <TabsTrigger value="meta-ads">Meta Ads</TabsTrigger>
                    </TabsList>
                    <TabsContent value="google-ads" className="mt-6">
                        <div className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">R$45.231,89</div>
                                        <p className="text-xs text-muted-foreground">+20,1% do último mês</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Cliques</CardTitle>
                                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">+2350</div>
                                        <p className="text-xs text-muted-foreground">+180,1% do último mês</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Impressões</CardTitle>
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">+12.234</div>
                                        <p className="text-xs text-muted-foreground">+19% do último mês</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">CTR</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">19,35%</div>
                                        <p className="text-xs text-muted-foreground">+2,1% do último mês</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Desempenho Geral - Google Ads</CardTitle>
                                    <CardDescription>Janeiro - Junho</CardDescription>
                                </CardHeader>
                                <CardContent className="pl-2">
                                    <ChartContainer config={chartConfig} className="h-[350px] w-full">
                                        <ResponsiveContainer>
                                            <BarChart data={googleAdsData}>
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
                    </TabsContent>
                    <TabsContent value="meta-ads" className="mt-6">
                        <div className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">R$31.542,50</div>
                                        <p className="text-xs text-muted-foreground">+15,5% do último mês</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Cliques</CardTitle>
                                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">+1890</div>
                                        <p className="text-xs text-muted-foreground">+120,3% do último mês</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Impressões</CardTitle>
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">+9.876</div>
                                        <p className="text-xs text-muted-foreground">+12% do último mês</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">CTR</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">19,14%</div>
                                        <p className="text-xs text-muted-foreground">+1,8% do último mês</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Desempenho Geral - Meta Ads</CardTitle>
                                    <CardDescription>Janeiro - Junho</CardDescription>
                                </CardHeader>
                                <CardContent className="pl-2">
                                    <ChartContainer config={chartConfig} className="h-[350px] w-full">
                                        <ResponsiveContainer>
                                            <BarChart data={metaAdsData}>
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
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
