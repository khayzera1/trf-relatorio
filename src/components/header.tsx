
import type { ReactNode } from 'react';
import { Facebook } from 'lucide-react';
import Link from 'next/link';

export function Header({ children }: { children?: ReactNode }) {
  return (
    <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <div className="bg-primary/20 p-2 rounded-lg">
                <Facebook className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              AgênciaDev
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            {children}
          </div>
        </div>
      </div>
    </header>
  );
}
