
import type {Metadata} from 'next';
import { Suspense } from 'react';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google';
import Loading from './loading';
import { AuthProvider } from '@/context/auth-context';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Painel de Clientes',
  description: 'Gerado pelo Firebase Studio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="antialiased font-sans">
          <AuthProvider>
            <Suspense fallback={<Loading />}>
                {children}
            </Suspense>
            <Toaster />
          </AuthProvider>
      </body>
    </html>
  );
}
