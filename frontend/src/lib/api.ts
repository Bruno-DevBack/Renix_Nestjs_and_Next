import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3333/api', // URL base da API NestJS (com prefixo /api)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
    if (typeof window === 'undefined') return config;

    const token = localStorage.getItem('@RenixApp:token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Se não houver resposta do servidor, propaga o erro
        if (!error.response) {
            return Promise.reject(error);
        }

        const { status } = error.response;

        // Tratamento específico para erro 401 (não autorizado)
        if (status === 401) {
            localStorage.removeItem('@RenixApp:token');
            localStorage.removeItem('@RenixApp:user');

            // Redireciona para login apenas se não estiver em uma rota pública
            const publicRoutes = ['/login', '/registro', '/cadastro', '/'];
            if (typeof window !== 'undefined' &&
                !publicRoutes.some(route => window.location.pathname.startsWith(route))) {
                window.location.href = '/login';
            }
        }

        // Para erros 409 (conflito) e 400 (bad request), não logamos o erro
        if (status === 409 || status === 400) {
            return Promise.reject(error);
        }

        // Para outros erros, logamos apenas em ambiente de desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            console.error('API Error:', error.response.data);
        }

        return Promise.reject(error);
    }
);

export default api; 