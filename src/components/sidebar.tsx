
'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from './ui/button';
import { LogOut, BarChart3, LayoutDashboard, Users, FileText } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from './ui/avatar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

export function Sidebar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const navItems = [
    { href: '/', label: 'Clientes', icon: Users, exact: true },
    { href: '/board', label: 'Quadro Kanban', icon: LayoutDashboard, exact: true },
    { href: '/reports', label: 'Relatórios', icon: FileText, exact: false },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-card/60 glass-card p-4">
        <div className="flex items-center gap-2 text-foreground mb-6 px-2">
            <BarChart3 className="h-6 w-6 text-accent" />
            <span className="text-lg font-bold">Painel</span>
        </div>

        {user && (
            <div className="px-2 mb-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start items-center gap-3 text-left h-auto p-2 hover:bg-accent/10">
                     <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">{getInitials(user.email ?? '')}</AvatarFallback>
                     </Avatar>
                     <div className="flex flex-col items-start overflow-hidden">
                        <span className="text-sm font-semibold text-foreground truncate">{user.email}</span>
                        <span className="text-xs text-muted-foreground">Minha Conta</span>
                     </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="right" className="w-56 mt-1 glass-card">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Minha Conta</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        )}

        <nav className="flex-grow space-y-2">
            {navItems.map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return(
                <Link 
                    key={item.label} 
                    href={item.href}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive 
                            ? "bg-primary text-primary-foreground shadow" 
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </Link>
            )})}
        </nav>
    </aside>
  );
}

    