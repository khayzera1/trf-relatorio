
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ClockWidget() {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const formattedTime = format(date, 'HH:mm:ss');
    const formattedDate = format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
    
    // Capitalize the first letter of the day of the week
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    return (
        <Card className="glass-card animate-fade-in h-full">
            <CardContent className="p-6 flex flex-col justify-center h-full">
                <div className="flex items-center justify-between text-muted-foreground mb-4">
                    <h3 className="text-lg font-semibold">Horário Local</h3>
                    <Clock className="h-5 w-5" />
                </div>
                <div className="text-center">
                    <p className="text-4xl font-bold text-foreground tracking-wider">
                        {formattedTime}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-2 text-muted-foreground">
                        <Calendar className="h-4 w-4"/>
                        <p className="text-sm font-medium">{capitalizedDate}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
