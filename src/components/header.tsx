
'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from './ui/button';
import { LogOut, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
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


export function Header({ children }: { children?: ReactNode }) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const getInitials = (email: string = '') => {
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="glass-header sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Painel de Relatórios</span>
          </Link>
          <div className="flex items-center gap-4">
            {children}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                     <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm border-2 border-primary/50">{getInitials(user.email ?? '')}</AvatarFallback>
                     </Avatar>
                     <span className="hidden sm:inline">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-card">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Minha Conta</p>
                      <p className="text-xs leading-none text-muted-foreground">
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
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
