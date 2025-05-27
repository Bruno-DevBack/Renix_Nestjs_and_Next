'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/cadastro', '/'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    // Só executa após o carregamento inicial e se houver mudança no estado de autenticação
    if (!loading) {
      if (!isAuthenticated && !isPublicRoute) {
        // Se não está autenticado e tenta acessar rota privada
        router.replace('/login');
      }
    }
  }, [isAuthenticated, loading, isPublicRoute, router]);

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0e7a63]"></div>
      </div>
    );
  }

  // Não renderiza nada se não estiver autenticado em rota privada
  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  // Renderiza o conteúdo em todos os outros casos
  return <>{children}</>;
} 