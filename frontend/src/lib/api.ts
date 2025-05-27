import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3333', // URL base da API NestJS (sem prefixo /api)
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
    if (typeof window === 'undefined') return config;

    const token = localStorage.getItem('@RenixApp:token');
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Garante que o Content-Type está definido corretamente
        if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }
        console.log('Token nas headers:', config.headers.Authorization);
    } else {
        console.log('Nenhum token encontrado no localStorage');
    }

    // Remove Content-Type para FormData
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

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
        console.error('Erro na requisição:', {
            status,
            url: config.url,
            method: config.method,
            headers: config.headers,
            error: error.response.data
        });

        // Se o token estiver inválido ou expirado
        if (status === 401) {
            console.error('Erro de autenticação 401:', error.response.data);
            return Promise.reject(error);
        }

        // Para erros específicos, retorna a mensagem do servidor
        if ([400, 409, 422].includes(status)) {
            return Promise.reject(new Error(error.response.data.message || 'Erro na operação'));
        }

        return Promise.reject(error);
    }
);

export default api; 