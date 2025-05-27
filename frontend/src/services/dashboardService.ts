import api from '@/lib/api';
import { Dashboard, DashboardHistorico } from '@/types';

interface ApiResponse<T> {
    data: T;
    timestamp: string;
}

class DashboardService {
    private readonly baseUrl = '/dashboard';

    public async listarTodos(): Promise<Dashboard[]> {
        try {
            const response = await api.get<ApiResponse<Dashboard[]>>('/dashboard');
            if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
                return response.data.data;
            }
            console.error('Formato de resposta inválido:', response.data);
            return [];
        } catch (error) {
            console.error('Erro ao buscar dashboards:', error);
            return [];
        }
    }

    public async buscarPorId(id: string): Promise<Dashboard | null> {
        try {
            const response = await api.get<ApiResponse<Dashboard>>(`${this.baseUrl}/${id}`);
            if (response.data && 'data' in response.data) {
                return response.data.data;
            }
            console.error('Formato de resposta inválido:', response.data);
            return null;
        } catch (error) {
            console.error('Erro ao buscar dashboard:', error);
            return null;
        }
    }

    public async gerarPDF(id: string): Promise<Blob> {
        try {
            const response = await api.get(`${this.baseUrl}/${id}/pdf`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            throw error;
        }
    }

    public async salvarHistorico(dashboardHistorico: DashboardHistorico): Promise<void> {
        await api.post(`${this.baseUrl}/historico`, dashboardHistorico);
    }

    public async obterMetricas(id: string): Promise<{
        total_investido: number;
        rendimento_total: number;
        rendimento_medio: number;
        distribuicao_por_banco: Array<{
            banco: string;
            percentual: number;
        }>;
        distribuicao_por_tipo: Array<{
            tipo: string;
            percentual: number;
        }>;
    }> {
        const response = await api.get(`${this.baseUrl}/${id}/metricas`);
        return response.data;
    }

    public async exportarDados(id: string, formato: 'pdf' | 'excel' | 'csv'): Promise<Blob> {
        const response = await api.get(`${this.baseUrl}/${id}/exportar/${formato}`, {
            responseType: 'blob'
        });
        return response.data;
    }

    public async compartilhar(id: string, email: string): Promise<void> {
        await api.post(`${this.baseUrl}/${id}/compartilhar`, { email });
    }

    public async atualizarFiltros(id: string, filtros: {
        bancos?: string[];
        tipos_investimento?: string[];
        periodo?: {
            inicio: string;
            fim: string;
        };
    }): Promise<Dashboard> {
        const response = await api.patch<Dashboard>(`${this.baseUrl}/${id}/filtros`, filtros);
        return response.data;
    }
}

export const dashboardService = new DashboardService(); 