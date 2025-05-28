import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api',
    headers: {
        'Accept': 'application/json'
    }
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
    if (typeof window === 'undefined') return config;

    const token = localStorage.getItem('@RenixApp:token');
    
    console.log('Debug - Headers da requisição:', config.headers);
    console.log('Debug - Token encontrado:', token ? 'Sim' : 'Não');
    
    if (token) {
        // Garantir que o token está sendo enviado corretamente
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Debug - Token adicionado às headers:', config.headers.Authorization);
    } else {
        console.warn('Tentando fazer requisição sem token de autenticação');
    }

    // Define o Content-Type apenas se não for FormData
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    } else {
        config.headers['Content-Type'] = 'application/json';
    }
    
    console.log('Debug - Config final da requisição:', {
        url: config.url,
        method: config.method,
        isFormData: config.data instanceof FormData,
        headers: config.headers,
        data: config.data
    });

    return config;
}, (error) => {
    console.error('Erro no interceptor de requisição:', error);
    return Promise.reject(error);
});

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (!error.response) {
            console.error('Erro sem resposta do servidor:', error);
            return Promise.reject(new Error('Erro de conexão com o servidor'));
        }

        const { status, config } = error.response;
        console.error('Debug - Erro na requisição:', {
            status,
            url: config.url,
            method: config.method,
            headers: {
                Authorization: config.headers.Authorization,
                'Content-Type': config.headers['Content-Type']
            },
            data: error.response.data
        });

        // Se o token estiver inválido ou expirado
        if (status === 401) {
            console.error('Debug - Erro de autenticação:', error.response.data);
            console.error('Debug - Headers da requisição:', config.headers);
            console.error('Debug - Dados enviados:', config.data);
        }

        return Promise.reject(error);
    }
);

export default api; 