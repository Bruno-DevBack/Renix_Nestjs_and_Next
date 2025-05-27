import api from '@/lib/api';
import { AuthResponse, CreateUsuarioDto, LoginUsuarioDto, UpdateUsuarioDto, Usuario } from '@/types';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

class AuthService {
    private TOKEN_KEY = '@RenixApp:token';
    private USER_KEY = '@RenixApp:user';

    public async login(email: string, senha: string): Promise<{ token: string; user: Usuario }> {
        try {
            const response = await api.post('/usuarios/login', {
                email_usuario: email,
                senha_usuario: senha
            });

            const { usuario, auth } = response.data.data;

            if (!auth?.token || !usuario) {
                throw new Error('Dados de login inválidos');
            }

            this.setToken(auth.token);
            this.setUser(usuario);

            return {
                token: auth.token,
                user: usuario
            };
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }

    public getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(this.TOKEN_KEY);
    }

    public setToken(token: string): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    public getUser(): Usuario | null {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem(this.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    }

    public setUser(user: Usuario): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        sessionStorage.setItem('usuario', JSON.stringify(user));
        const event = new Event('usuarioAtualizado');
        window.dispatchEvent(event);
    }

    public isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            const isValid = (decodedToken.exp || 0) > currentTime;

            if (!isValid) {
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Erro ao validar token:', error);
            this.logout();
            return false;
        }
    }

    public logout(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        sessionStorage.removeItem('usuario');
        const event = new Event('usuarioAtualizado');
        window.dispatchEvent(event);
    }

    public async register(data: CreateUsuarioDto): Promise<Usuario> {
        try {
            console.log('Enviando dados para registro:', data);
            const response = await api.post('/usuarios/registro', data);

            console.log('Resposta do servidor:', response.data);

            if (!response.data) {
                console.error('Resposta vazia do servidor');
                throw new Error('Resposta vazia do servidor');
            }

            if (response.data.data?.message === 'Usuário criado com sucesso') {
                return {
                    email_usuario: data.email_usuario,
                    nome_usuario: data.nome_usuario,
                    telefone_usuario: data.telefone_usuario
                } as Usuario;
            }

            console.error('Resposta inesperada do servidor:', response.data);
            throw new Error('Erro ao processar resposta do servidor');

        } catch (error) {
            console.error('Erro completo:', error);

            if (axios.isAxiosError(error) && error.response) {
                console.error('Erro do Axios:', {
                    status: error.response.status,
                    data: error.response.data
                });

                if (error.response.status === 409 || error.response.status === 400) {
                    throw error;
                }
            }

            throw new Error('Erro ao cadastrar usuário. Tente novamente.');
        }
    }

    public async getCurrentUser(): Promise<Usuario | null> {
        try {
            const response = await api.get<{ usuario: Usuario }>('/usuarios/me');
            const user = response.data.usuario;
            this.setUser(user);
            return user;
        } catch (error) {
            this.logout();
            return null;
        }
    }

    public async updateProfile(data: UpdateUsuarioDto): Promise<Usuario> {
        const userId = this.getUser()?.id;
        if (!userId) {
            throw new Error('Usuário não encontrado');
        }

        const token = this.getToken();
        if (!token) {
            throw new Error('Usuário não autenticado');
        }

        console.log('Token atual:', token);
        console.log('User ID:', userId);
        console.log('Dados a serem atualizados:', data);

        try {
            const response = await api.patch<{ data: Usuario }>(
                `/usuarios/${userId}`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const updatedUser = response.data.data;
            this.setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            // Se o token estiver inválido, limpa os dados e força um novo login
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                console.error('Token inválido, limpando dados...');
                this.logout();
            }
            throw error;
        }
    }

    public async uploadProfilePhoto(userId: string, file: File): Promise<Usuario> {
        const formData = new FormData();
        formData.append('file', file);

        const token = this.getToken();
        if (!token) {
            throw new Error('Usuário não autenticado');
        }

        const response = await api.post<{ data: Usuario }>(
            `/usuarios/${userId}/foto-perfil`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            }
        );

        const updatedUser = response.data.data;
        this.setUser(updatedUser);
        return updatedUser;
    }

    public async updateProfilePhoto(formData: FormData): Promise<Usuario> {
        const userId = this.getUser()?.id;
        const response = await api.post<{ data: Usuario }>(`/usuarios/${userId}/foto-perfil`, formData);
        const updatedUser = response.data.data;
        this.setUser(updatedUser);
        return updatedUser;
    }

    public async removeProfilePhoto(): Promise<Usuario> {
        const userId = this.getUser()?.id;
        if (!userId) {
            throw new Error('Usuário não encontrado');
        }

        const token = this.getToken();
        if (!token) {
            throw new Error('Usuário não autenticado');
        }

        const response = await api.delete<{ data: Usuario }>(
            `/usuarios/${userId}/foto-perfil`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const updatedUser = response.data.data;
        this.setUser(updatedUser);
        return updatedUser;
    }
}

export const authService = new AuthService(); 