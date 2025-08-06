
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Loader2, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ClientData } from '@/lib/types';
import { getClients } from '@/lib/firebase/client';
import Link from 'next/link';
import { Button } from './ui/button';
import { getInitials } from '@/lib/utils';

export function RecentClientsWidget() {
    const [recentClients, setRecentClients] = useState<ClientData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadRecentClients = useCallback(async () => {
        setIsLoading(true);
        try {
            const allClients = await getClients();
            // Get the 5 most recent clients based on creation time
            const sortedClients = allClients.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setRecentClients(sortedClients.slice(0, 5));
        } catch (error) {
            console.error("Failed to fetch recent clients:", error);
            setRecentClients([]); // Clear on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRecentClients();
    }, [loadRecentClients]);

    return (
        <Card className="glass-card animate-fade-in h-full" style={{ animationDelay: '200ms' }}>
            <CardHeader>
                <div className="flex items-center justify-between text-muted-foreground">
                    <CardTitle className="text-lg font-semibold">Últimos Clientes</CardTitle>
                    <Users className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : recentClients.length > 0 ? (
                    <div className="space-y-4">
                        {recentClients.map(client => (
                             <div key={client.id} className="flex items-center gap-4 group">
                                <Avatar className="h-10 w-10 text-sm">
                                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">{getInitials(client.clientName)}</AvatarFallback>
                                </Avatar>
                                <p className="flex-1 font-medium text-foreground truncate">{client.clientName}</p>
                                <Link href={`/reports?clientName=${encodeURIComponent(client.clientName)}`}>
                                     <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="h-4 w-4"/>
                                     </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground text-sm">Nenhum cliente foi adicionado ainda.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
