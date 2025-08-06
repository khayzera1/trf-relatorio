
'use client';

import type { ReactNode } from 'react';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from '@/context/auth-context';
import { Button } from './ui/button';
import { LogOut, User } from 'lucide-react';
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
    <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {/* Logo or App Name can go here */}
          </div>
          <div className="flex items-center gap-4">
            {children}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                     <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">{getInitials(user.email ?? '')}</AvatarFallback>
                     </Avatar>
                     <span className="hidden sm:inline">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Minha Conta</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
