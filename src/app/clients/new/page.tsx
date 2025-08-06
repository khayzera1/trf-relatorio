
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { addClient } from "@/lib/firebase/client";
import ProtectedRoute from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";

const formSchema = z.object({
  clientName: z.string().min(2, {
    message: "O nome do cliente deve ter pelo menos 2 caracteres.",
  }),
});

export type NewClientFormData = z.infer<typeof formSchema>;

function NewClientPageContent() {
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<NewClientFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            clientName: "",
        },
    });

    const { formState: { isSubmitting } } = form;

    async function onSubmit(values: NewClientFormData) {
        try {
            await addClient({ clientName: values.clientName });
            
            toast({
                title: "Cliente Cadastrado com Sucesso!",
                description: `O cliente ${values.clientName} foi adicionado.`,
            });

            router.push("/");
        } catch (error) {
            console.error("Failed to save client:", error);
            toast({
                variant: "destructive",
                title: "Erro ao Salvar",
                description: "Não foi possível cadastrar o cliente. Tente novamente.",
            });
        }
    }

    return (
        <div className="flex min-h-screen text-foreground bg-background">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-2xl mx-auto">
                    <Card className="glass-card">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <UserPlus className="h-6 w-6 text-primary"/>
                                <CardTitle className="text-2xl">Cadastrar Novo Cliente</CardTitle>
                            </div>
                            <CardDescription>Preencha as informações abaixo para adicionar um novo cliente.</CardDescription>
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
                                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-4">
                                        <Button type="button" variant="ghost" onClick={() => router.push('/')} disabled={isSubmitting} className="w-full sm:w-auto">
                                            Cancelar
                                        </Button>
                                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
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

export default function NewClientPage() {
    return (
        <ProtectedRoute>
            <NewClientPageContent />
        </ProtectedRoute>
    )
}
