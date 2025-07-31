
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Header } from "@/components/header";
import Link from "next/link";
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

const formSchema = z.object({
  clientName: z.string().min(2, {
    message: "O nome do cliente deve ter pelo menos 2 caracteres.",
  }),
  campaign: z.string().min(5, {
    message: "O nome da campanha deve ter pelo menos 5 caracteres.",
  }),
  status: z.enum(["Ativa", "Pausada", "Concluída"], {
    required_error: "Você precisa selecionar um status para a campanha.",
  }),
});

export type NewClientFormData = z.infer<typeof formSchema>;

export default function NewClientPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<NewClientFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            clientName: "",
            campaign: "",
        },
    });

    async function onSubmit(values: NewClientFormData) {
        setIsSubmitting(true);

        // Simula uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log("Dados do formulário:", values);

        toast({
            title: "Cliente Cadastrado com Sucesso!",
            description: `O cliente ${values.clientName} foi adicionado.`,
        });

        // Como não temos um backend real, não podemos adicionar o cliente à lista
        // da página principal diretamente. Em uma aplicação real, você invalidaria
        // o cache de dados ou usaria uma biblioteca de gerenciamento de estado.
        // Por enquanto, apenas redirecionamos o usuário de volta.
        router.push("/");

        setIsSubmitting(false);
    }

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
                <div className="max-w-2xl mx-auto">
                    <Card className="shadow-lg border-primary/10">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <UserPlus className="h-6 w-6 text-primary"/>
                                <CardTitle className="text-2xl font-headline">Cadastrar Novo Cliente</CardTitle>
                            </div>
                            <CardDescription>Preencha as informações abaixo para adicionar um novo cliente e sua campanha.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <FormField
                                        control={form.control}
                                        name="clientName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nome do Cliente</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: Pizzaria do Bairro" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    O nome fantasia ou razão social do cliente.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="campaign"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Campanha</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: Google Ads - Pesquisa Local" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Descreva a campanha principal para este cliente.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione o status da campanha" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Ativa">Ativa</SelectItem>
                                                            <SelectItem value="Pausada">Pausada</SelectItem>
                                                            <SelectItem value="Concluída">Concluída</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                <FormDescription>
                                                    O status atual da campanha principal.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex justify-end gap-4">
                                        <Button type="button" variant="outline" onClick={() => router.push('/')} disabled={isSubmitting}>
                                            Cancelar
                                        </Button>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Salvar Cliente
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
