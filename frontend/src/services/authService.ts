import api from '@/lib/api';
import { AuthResponse, CreateUsuarioDto, LoginUsuarioDto, UpdateUsuarioDto, Usuario } from '@/types';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

class AuthService {
    private TOKEN_KEY = '@RenixApp:token';
    private USER_KEY = '@RenixApp:user';
    private readonly baseUrl = '/usuarios';

    public async login(email: string, senha: string): Promise<{ token: string; user: Usuario }> {
        try {
            const response = await api.post(`${this.baseUrl}/login`, {
                email_usuario: email,
                senha_usuario: senha
            });

            const { usuario, auth } = response.data.data;

            if (!auth?.token || !usuario) {
                throw new Error('Dados de login inválidos');
            }

            // Debug dos dados recebidos
            console.log('Debug - Dados do usuário recebidos:', JSON.stringify(usuario, null, 2));

            const userWithId = {
                ...usuario,
                id: usuario._id, // Usa o ID do MongoDB
                _id: usuario._id // Mantém também o _id do MongoDB
            };

            console.log('Debug - Token recebido:', auth.token);
            console.log('Debug - Usuário processado:', JSON.stringify(userWithId, null, 2));

            this.setToken(auth.token);
            this.setUser(userWithId);

            return {
                token: auth.token,
                user: userWithId
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
            const decodedToken = jwtDecode<{ exp: number }>(token);
            const currentTime = Math.floor(Date.now() / 1000);
            const isValid = decodedToken.exp > currentTime;

            console.log('Debug - Verificando autenticação:', {
                exp: decodedToken.exp,
                currentTime: currentTime,
                isValid: isValid
            });

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
            const response = await api.post(`${this.baseUrl}/registro`, data);

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
            const response = await api.get<{ usuario: Usuario }>(`${this.baseUrl}/me`);
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

        try {
            const response = await api.patch<{ data: Usuario }>(
                `${this.baseUrl}/${userId}`,
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
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                console.error('Token inválido, limpando dados...');
                this.logout();
            }
            throw error;
        }
    }

    public async uploadProfilePhoto(userId: string, file: File): Promise<Usuario> {
        const currentUser = this.getUser();
        if (!currentUser?.id) {
            throw new Error('Usuário não encontrado');
        }

        // Verifica se o usuário está tentando modificar seu próprio perfil
        if (currentUser.id !== userId) {
            throw new Error('Você só pode modificar seu próprio perfil');
        }

        const token = this.getToken();
        if (!token) {
            throw new Error('Token de autenticação não encontrado');
        }

        // Verifica se o token é válido
        try {
            const decodedToken = jwtDecode<any>(token);
            const currentTime = Date.now() / 1000;
            
            if ((decodedToken.exp || 0) <= currentTime) {
                this.logout();
                throw new Error('Token expirado');
            }

            // Verifica se o ID no token corresponde ao ID do usuário
            if (decodedToken.sub !== userId) {
                this.logout();
                throw new Error('Token inválido para este usuário');
            }
        } catch (error) {
            this.logout();
            throw new Error('Token inválido');
        }

        console.log('Debug - Iniciando upload:', {
            userId,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            currentUserId: currentUser.id
        });

        // Cria um FormData com o campo file
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Envia o arquivo usando FormData
            const response = await api.post<Usuario>(
                `${this.baseUrl}/${userId}/foto-perfil`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const updatedUser = response.data;
            this.setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error('Erro no upload da foto:', error);
            throw error;
        }
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