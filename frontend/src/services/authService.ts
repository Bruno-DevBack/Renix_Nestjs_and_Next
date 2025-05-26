import api from '@/lib/api';
import { AuthResponse, CreateUsuarioDto, LoginUsuarioDto, UpdateUsuarioDto, Usuario } from '@/types';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

class AuthService {
    private TOKEN_KEY = '@RenixApp:token';
    private USER_KEY = '@RenixApp:user';

    public async login(email: string, senha: string): Promise<{ token: string; user: Usuario }> {
        try {
            console.log('Tentando login com:', {
                email_usuario: email,
                senha_usuario: senha
            });

            const response = await api.post('/usuarios/login', {
                email_usuario: email,
                senha_usuario: senha
            });

            console.log('Resposta do servidor:', response.data);

            // Verifica se a resposta contém os dados necessários
            if (!response.data || !response.data.data) {
                throw new Error('Resposta vazia do servidor');
            }

            const { usuario, auth } = response.data.data;

            // Verifica se temos tanto o usuário quanto o token
            if (auth?.token && usuario) {
                console.log('Login bem sucedido, salvando token e usuário');

                // Mapeando os campos do usuário conforme retornado pelo backend
                const mappedUser: Usuario = {
                    _id: usuario.id,
                    nome_usuario: usuario.nome_usuario,
                    email_usuario: usuario.email_usuario,
                    telefone_usuario: usuario.telefone_usuario || '',
                    eAdmin: usuario.eAdmin,
                    ePremium: usuario.ePremium,
                    dashboards: usuario.dashboards || [],
                    historico_investimentos: usuario.historico_investimentos || [],
                    historico_dashboards: usuario.historico_dashboards || [],
                    created_at: usuario.created_at || new Date().toISOString(),
                    updated_at: usuario.updated_at || new Date().toISOString()
                };

                // Primeiro configura o token para as próximas requisições
                this.setToken(auth.token);

                // Depois salva o usuário
                this.setUser(mappedUser);

                return {
                    token: auth.token,
                    user: mappedUser
                };
            }

            console.error('Resposta sem token ou usuário:', response.data);
            throw new Error('Dados de login inválidos');

        } catch (error) {
            console.error('Erro completo do login:', error);
            throw error;
        }
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

    public async logout(): Promise<void> {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.setAuthorizationHeader(null);
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
        const response = await api.patch(`/usuarios/${this.getUser()?._id}`, data);
        const updatedUser = response.data.usuario;
        this.setUser(updatedUser);
        return updatedUser;
    }

    public async uploadProfilePhoto(userId: string, file: File): Promise<Usuario> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<Usuario>(
            `/usuarios/${userId}/foto-perfil`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        const updatedUser = response.data;
        this.setUser(updatedUser);
        return updatedUser;
    }

    public async updateProfilePhoto(formData: FormData): Promise<Usuario> {
        const userId = this.getUser()?._id;
        const response = await api.post(`/usuarios/${userId}/foto-perfil`, formData);
        return response.data;
    }

    public async removeProfilePhoto(): Promise<Usuario> {
        const userId = this.getUser()?._id;
        const response = await api.delete(`/usuarios/${userId}/foto-perfil`);
        return response.data;
    }

    public async me(): Promise<Usuario> {
        try {
            const token = this.getToken();
            if (!token || !this.isAuthenticated()) {
                throw new Error('Token inválido ou expirado');
            }

            console.log('Verificando token antes da requisição:', token);
            const response = await api.get('/usuarios/me');
            console.log('Resposta do /me:', response.data);

            if (!response.data || !response.data.usuario) {
                throw new Error('Resposta inválida do servidor');
            }

            const usuario = response.data.usuario;
            this.setUser(usuario);
            return usuario;
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                this.logout();
            }
            throw error;
        }
    }

    public getToken(): string | null {
        if (typeof window === 'undefined') return null;
        const token = localStorage.getItem(this.TOKEN_KEY);
        if (token) {
            this.setAuthorizationHeader(token);
        }
        return token;
    }

    public isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) {
            console.log('Token não encontrado');
            return false;
        }

        try {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            const isValid = (decodedToken.exp || 0) > currentTime;

            if (!isValid) {
                console.log('Token expirado');
                this.logout();
                return false;
            }

            console.log('Token válido até:', new Date((decodedToken.exp || 0) * 1000).toLocaleString());
            return true;
        } catch (error) {
            console.error('Erro ao validar token:', error);
            this.logout();
            return false;
        }
    }

    private setToken(token: string): void {
        if (typeof window === 'undefined') return;
        console.log('Salvando token:', token);
        localStorage.setItem(this.TOKEN_KEY, token);
        this.setAuthorizationHeader(token);
    }

    private setAuthorizationHeader(token: string | null): void {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log('Header de autorização configurado:', api.defaults.headers.common['Authorization']);
        } else {
            delete api.defaults.headers.common['Authorization'];
            console.log('Header de autorização removido');
        }
    }

    private setUser(user: Usuario): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    public getUser(): Usuario | null {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem(this.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    }
}

export const authService = new AuthService(); 