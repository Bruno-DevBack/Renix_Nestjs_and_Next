import api from '@/lib/api';
import { Dashboard, DashboardHistorico } from '@/types';

class DashboardService {
    private readonly baseUrl = '/dashboard';

    public async listarTodos(): Promise<Dashboard[]> {
        const response = await api.get<Dashboard[]>(this.baseUrl);
        return response.data;
    }

    public async buscarPorId(id: string): Promise<Dashboard> {
        const response = await api.get<Dashboard>(`${this.baseUrl}/${id}`);
        return response.data;
    }

    public async gerarPDF(id: string): Promise<Blob> {
        const response = await api.get(`${this.baseUrl}/${id}/pdf`, {
            responseType: 'blob'
        });
        return response.data;
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