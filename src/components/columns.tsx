
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ClientData } from "@/lib/types";


export const columns: ColumnDef<ClientData>[] = [
  {
    accessorKey: "clientName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cliente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
        return <div className="font-medium text-primary">{row.getValue("clientName")}</div>;
    }
  },
  {
    accessorKey: "campaign",
    header: "Campanha",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as ClientData['status'];
        const variant = {
            'Ativa': 'default',
            'Pausada': 'secondary',
            'Concluída': 'outline',
        }[status] as "default" | "secondary" | "outline";
        
        return <Badge variant={variant} className="capitalize">{status}</Badge>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="text-right">
            <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                    Ver Relatórios
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
        </div>
      );
    },
  },
];
