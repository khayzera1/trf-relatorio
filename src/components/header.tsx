
import type { ReactNode } from 'react';
import { ThemeToggle } from './theme-toggle';

export function Header({ children }: { children?: ReactNode }) {
  return (
    <header className="bg-card border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end h-20">
          <div className="flex items-center gap-4">
            {children}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
