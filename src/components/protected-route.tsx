
'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Loading from '@/app/loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se não estiver carregando e não houver usuário, redireciona para o login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Se estiver carregando, mostra a tela de loading
  if (loading) {
    return <Loading />;
  }

  // Se houver um usuário, renderiza a página solicitada
  if (user) {
    return <>{children}</>;
  }

  // Se não estiver carregando e não houver usuário,
  // retorna null para não renderizar nada enquanto o redirecionamento ocorre
  return null;
}

    