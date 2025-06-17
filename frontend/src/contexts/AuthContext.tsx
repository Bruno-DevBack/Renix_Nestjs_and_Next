'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';
import { Usuario, AuthContextData, UpdateUsuarioDto } from '@/types';
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
            const currentTime = Math.floor(Date.now() / 1000);
            console.log('Debug - Validando token no frontend:', {
                exp: decoded.exp,
                currentTime: currentTime,
                isValid: decoded.exp > currentTime
            });
            return decoded.exp > currentTime;
        } catch {
            return false;
        }
    };

    // Função para configurar o token nas requisições
    const setAuthToken = (token: string | null) => {
        if (token && isTokenValid(token)) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('@RenixApp:token', token);
        } else {
            delete api.defaults.headers.common['Authorization'];
            localStorage.removeItem('@RenixApp:token');
            localStorage.removeItem('@RenixApp:user');
            setUsuario(null);
        }
    };

    const isPublicRoute = (path: string): boolean => {
        const publicRoutes = ['/', '/login', '/cadastro', '/esqueci-senha'];
        return publicRoutes.includes(path);
    };

    // Função para atualizar o token nas requisições
    const updateAuthToken = () => {
        const token = localStorage.getItem('@RenixApp:token');
        if (token && isTokenValid(token)) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return true;
        }
        return false;
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

        // Verificar e atualizar o token a cada 30 segundos
        const tokenCheckInterval = setInterval(() => {
            const token = localStorage.getItem('@RenixApp:token');
            if (token) {
                console.log('Debug - Verificando token:', token);
                console.log('Debug - Token válido:', isTokenValid(token));
            }
        }, 30000);

        return () => {
            clearInterval(tokenCheckInterval);
        };
    }, [pathname, router]);

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

            router.replace('/investments');
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

    const updateUserData = async (data: UpdateUsuarioDto) => {
        if (!usuario?.id) throw new Error('Usuário não encontrado');

        try {
            // A chamada ao authService.updateProfile ainda espera Partial<Usuario>
            // Precisamos garantir que apenas os campos permitidos por Partial<Usuario> sejam passados
            const dataToSend: Partial<Usuario> = {};
            if (data.nome_usuario !== undefined) dataToSend.nome_usuario = data.nome_usuario;
            if (data.email_usuario !== undefined) dataToSend.email_usuario = data.email_usuario;
            // Não passamos fotoPerfilBase64 aqui, pois é tratado por updateProfileWithPhoto
            // if (data.fotoPerfilBase64 !== undefined) dataToSend.fotoPerfilBase64 = data.fotoPerfilBase64;

            const updatedUser = await authService.updateProfile(dataToSend);
            return updatedUser; // Retorna os dados atualizados
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                signOut();
            }
            throw error;
        }
    };

    const updateUser = (user: Usuario) => {
        setUsuario(user);
        localStorage.setItem('@RenixApp:user', JSON.stringify(user));
    };

    const updateProfileWithPhoto = async (
        data: UpdateUsuarioDto,
        file: File | null
    ): Promise<Usuario> => {
        if (!usuario?.id) throw new Error('Usuário não encontrado');
        setLoading(true);
        let finalUser = { ...usuario }; // Começa com os dados atuais como fallback

        try {
            // 1. Se houver um arquivo, faz o upload. A resposta já deve conter o usuário atualizado (incluindo foto).
            if (file) {
                // authService.uploadProfilePhoto agora apenas retorna o usuário atualizado do backend
                const photoUpdateResult = await authService.uploadProfilePhoto(usuario.id, file);
                finalUser = photoUpdateResult; // Usa diretamente o resultado do upload
            } else if (data.fotoPerfilBase64 === null && usuario.fotoPerfilBase64) {
                 // Se fotoPerfilBase64 é explicitamente null nos dados E o usuário tinha foto, remove.
                 // authService.removeProfilePhoto() também apenas retorna o usuário atualizado.
                 const removePhotoResult = await authService.removeProfilePhoto();
                 finalUser = removePhotoResult; // Usa diretamente o resultado da remoção
            }

            // 2. Atualiza dados de texto (nome, email) se forem diferentes e não foram atualizados pelo upload/remoção
            // Usamos o objeto finalUser que já pode ter sido atualizado pela foto
            const textDataToUpdate: Partial<Usuario> = {};
            if (data.nome_usuario !== undefined && data.nome_usuario !== finalUser.nome_usuario) {
                textDataToUpdate.nome_usuario = data.nome_usuario;
            }
            if (data.email_usuario !== undefined && data.email_usuario !== finalUser.email_usuario) {
                 textDataToUpdate.email_usuario = data.email_usuario;
            }

            if (Object.keys(textDataToUpdate).length > 0) {
                 const textUpdateResult = await authService.updateProfile(textDataToUpdate);
                 // Mescla o resultado da atualização de texto no objeto finalUser
                 finalUser = { ...finalUser, ...textUpdateResult };
            }

            // 3. Atualiza o estado global do contexto e o localStorage com os dados mais recentes e corretos
            // updateService(finalUser); // Erro de digitação anterior, o correto é updateUser
            updateUser(finalUser); // Chama o método que atualiza o contexto e o localStorage

            return finalUser; // Retorna o usuário final atualizado

        } catch (error) {
            console.error('Erro ao atualizar perfil (AuthContext):', error);
             if (axios.isAxiosError(error) && error.response?.status === 401) {
                 signOut();
             }
            throw error; // Propaga o erro para quem chamou
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                usuario,
                signIn,
                signOut,
                updateUserData,
                updateUser,
                updateProfileWithPhoto: (
                    data: UpdateUsuarioDto,
                    file: File | null
                ) => updateProfileWithPhoto(data, file),
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