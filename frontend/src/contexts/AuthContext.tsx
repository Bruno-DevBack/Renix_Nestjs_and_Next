'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';
import { Usuario, AuthContextData, AuthResponse } from '@/types';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const loadStoredData = async () => {
            try {
                console.log('Verificando autenticação...');
                const token = authService.getToken();
                console.log('Token atual:', token);

                // Carrega o usuário do localStorage primeiro
                const storedUser = authService.getUser();
                if (storedUser) {
                    console.log('Usuário encontrado no localStorage');
                    setUser(storedUser);
                }

                // Se tiver token, verifica se é válido
                if (token && authService.isAuthenticated()) {
                    console.log('Token válido encontrado, atualizando dados do usuário...');
                    try {
                        const userData = await authService.me();
                        console.log('Dados do usuário atualizados com sucesso');
                        setUser(userData);
                    } catch (error) {
                        console.error('Erro ao atualizar dados do usuário:', error);
                        // Se houver erro na atualização mas tivermos um usuário no localStorage,
                        // mantemos o usuário atual
                        if (!storedUser) {
                            console.log('Nenhum usuário no localStorage, fazendo logout');
                            authService.logout();
                            if (!isPublicRoute(pathname)) {
                                router.push('/login');
                            }
                        }
                    }
                } else if (!isPublicRoute(pathname)) {
                    console.log('Token inválido ou não encontrado em rota protegida');
                    router.push('/login');
                }
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStoredData();
    }, [pathname]);

    const isPublicRoute = (path: string): boolean => {
        const publicRoutes = ['/', '/login', '/cadastro'];
        return publicRoutes.includes(path);
    };

    const signIn = async (email: string, senha: string): Promise<AuthResponse> => {
        try {
            console.log('Iniciando processo de login...');
            const response = await authService.login(email, senha);
            console.log('Login bem sucedido:', response);
            setUser(response.user);
            router.push('/profile');
            return response;
        } catch (error) {
            console.error('Erro no processo de login:', error);
            throw error;
        }
    };

    const signOut = () => {
        authService.logout();
        setUser(null);
        router.push('/login');
    };

    if (loading) {
        return null; // ou um componente de loading
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                signIn,
                signOut,
                isAuthenticated: !!user
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 