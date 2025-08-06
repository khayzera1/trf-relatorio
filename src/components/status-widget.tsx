
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Globe, CheckCircle } from 'lucide-react';
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
    return (
        <Card className="glass-card animate-fade-in" style={{ animationDelay: '200ms' }}>
            <CardHeader>
                <div className="flex items-center justify-between text-muted-foreground">
                    <CardTitle className="text-lg font-semibold">Status do Sistema</CardTitle>
                    <Server className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">Serviços Online</span>
                    </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Uso da API (Últimos 30 dias)</p>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1 text-right">75% da cota utilizada</p>
                </div>
                
                <div>
                   <p className="text-sm font-medium mb-2">Relatórios Gerados (Últimos 6 meses)</p>
                   <ChartContainer config={chartConfig} className="h-[100px] w-full">
                      <BarChart accessibilityLayer data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="reports" fill="var(--color-reports)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                </div>

            </CardContent>
        </Card>
    );
}
