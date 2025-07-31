
import type { ReactNode } from 'react';
import { Facebook, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

export function Header({ children }: { children?: ReactNode }) {
  return (
    <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <div className="bg-primary/20 p-2 rounded-lg">
                <Facebook className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold font-headline text-foreground tracking-tight">
              AgênciaDev
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/reports">
              <Button variant="ghost">
                <FileText className="mr-2 h-4 w-4" />
                Gerar Relatório
              </Button>
            </Link>
            {children}
          </div>
        </div>
      </div>
    </header>
  );
}
