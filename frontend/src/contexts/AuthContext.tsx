'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';
import { Usuario, AuthContextData, AuthResponse } from '@/types';
import api from '@/lib/api';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Função para verificar se o token é válido
    const isTokenValid = (token: string): boolean => {
        try {
            const decoded = jwtDecode<{ exp: number }>(token);
            return decoded.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    };

    // Função para configurar o token nas requisições
    const setAuthToken = (token: string | null) => {
        if (token && isTokenValid(token)) {
            api.defaults.headers.Authorization = `Bearer ${token}`;
            localStorage.setItem('@RenixApp:token', token);
        } else {
            delete api.defaults.headers.Authorization;
            localStorage.removeItem('@RenixApp:token');
            localStorage.removeItem('@RenixApp:user');
            setUsuario(null);
        }
    };

    useEffect(() => {
        const loadStoredData = () => {
            try {
                const token = localStorage.getItem('@RenixApp:token');
                const storedUserStr = localStorage.getItem('@RenixApp:user');
                
                console.log('Verificando autenticação...');
                
                if (token && storedUserStr && isTokenValid(token)) {
                    console.log('Token válido encontrado');
                    const storedUser = JSON.parse(storedUserStr);
                    setUsuario(storedUser);
                    setAuthToken(token);

                    if (isPublicRoute(pathname)) {
                        router.replace('/profile');
                    }
                } else {
                    console.log('Token inválido ou expirado');
                    setAuthToken(null);
                    
                    if (!isPublicRoute(pathname)) {
                        router.replace('/login');
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
                setAuthToken(null);
                if (!isPublicRoute(pathname)) {
                    router.replace('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        loadStoredData();

        // Verificar o token periodicamente
        const tokenCheckInterval = setInterval(() => {
            const token = localStorage.getItem('@RenixApp:token');
            if (token && !isTokenValid(token)) {
                console.log('Token expirado durante a verificação periódica');
                setAuthToken(null);
                if (!isPublicRoute(pathname)) {
                    router.replace('/login');
                }
            }
        }, 60000); // Verifica a cada minuto

        return () => clearInterval(tokenCheckInterval);
    }, [pathname]);

    const isPublicRoute = (path: string): boolean => {
        const publicRoutes = ['/', '/login', '/register'];
        return publicRoutes.includes(path);
    };

    const signIn = async (email: string, senha: string) => {
        try {
            const response = await api.post('/usuarios/login', {
                email_usuario: email,
                senha_usuario: senha
            });

            const { data } = response.data;
            const { usuario, auth } = data;

            if (!usuario || !auth?.token) {
                throw new Error('Resposta inválida do servidor');
            }

            if (!isTokenValid(auth.token)) {
                throw new Error('Token inválido recebido do servidor');
            }

            setAuthToken(auth.token);
            setUsuario(usuario);
            localStorage.setItem('@RenixApp:user', JSON.stringify(usuario));

            router.replace('/profile');
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    };

    const signOut = () => {
        setAuthToken(null);
        if (pathname !== '/login') {
            router.replace('/login');
        }
    };

    const updateUserData = async (data: Partial<Usuario>) => {
        if (!usuario?.id) throw new Error('Usuário não encontrado');

        try {
            const updatedUser = await authService.updateProfile(data);
            setUsuario(updatedUser);
            localStorage.setItem('@RenixApp:user', JSON.stringify(updatedUser));
            return updatedUser;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                signOut();
            }
            throw error;
        }
    };

    const updateProfilePhoto = async (file: File) => {
        if (!usuario?.id) throw new Error('Usuário não encontrado');

        try {
            const updatedUser = await authService.uploadProfilePhoto(usuario.id, file);
            setUsuario(updatedUser);
            localStorage.setItem('@RenixApp:user', JSON.stringify(updatedUser));
            return updatedUser;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                signOut();
            }
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                usuario,
                signIn,
                signOut,
                updateUserData,
                updateProfilePhoto,
                isAuthenticated: !!usuario,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}; 