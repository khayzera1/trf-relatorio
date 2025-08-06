
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, CheckCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

const chartData = [
  { month: "Jan", reports: 186 },
  { month: "Fev", reports: 305 },
  { month: "Mar", reports: 237 },
  { month: "Abr", reports: 273 },
  { month: "Mai", reports: 209 },
  { month: "Jun", reports: 214 },
];

const chartConfig = {
  reports: {
    label: "Relatórios Gerados",
    color: "hsl(var(--primary))",
  },
} as const;


export function StatusWidget() {
    // NOTA: Os dados neste widget são de demonstração.
    // No futuro, eles podem ser conectados a fontes de dados reais.
    const apiUsage = 75; // Exemplo: poderia vir de uma API de monitoramento.
    const servicesOnline = true; // Exemplo: poderia ser o resultado de um health check.

    return (
        <Card className="glass-card animate-fade-in" style={{ animationDelay: '200ms' }}>
            <CardHeader>
                <div className="flex items-center justify-between text-muted-foreground">
                    <CardTitle className="text-lg font-semibold">Status do Sistema</CardTitle>
                    <Server className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                        {servicesOnline ? (
                            <CheckCircle className="h-5 w-5 text-emerald-400" />
                        ) : (
                            <CheckCircle className="h-5 w-5 text-destructive" />
                        )}
                        <span className="font-semibold text-foreground">
                            {servicesOnline ? "Serviços Online" : "Serviços Offline"}
                        </span>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2 text-muted-foreground">Uso da API (Últimos 30 dias)</p>
                      <Progress value={apiUsage} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1.5 text-right">{apiUsage}% da cota utilizada</p>
                    </div>
                </div>
                
                <div className="space-y-2">
                   <p className="text-sm font-medium text-muted-foreground">Relatórios Gerados (Últimos 6 meses)</p>
                   <div className="h-[100px] w-full">
                       <ChartContainer config={chartConfig}>
                          <BarChart accessibilityLayer data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                            <XAxis
                              dataKey="month"
                              tickLine={false}
                              tickMargin={10}
                              axisLine={false}
                              tickFormatter={(value) => value.slice(0, 3)}
                              className="text-xs"
                            />
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent 
                                hideLabel 
                                className="glass-card" 
                                formatter={(value) => `${value} relatórios`}
                              />} 
                            />
                            <Bar dataKey="reports" fill="hsl(var(--primary))" radius={4} />
                          </BarChart>
                        </ChartContainer>
                   </div>
                </div>

            </CardContent>
        </Card>
    );
}
