import api from '@/lib/api';
import { Dashboard, DashboardHistorico } from '@/types';

interface ApiResponse<T> {
    data: T;
    timestamp: string;
}

class DashboardService {
    private readonly baseUrl = '/dashboard';

    public async listarTodos(): Promise<ApiResponse<Dashboard[]>> {
        try {
            console.log('Debug - Buscando dashboards do usuário');
            const response = await api.get<ApiResponse<Dashboard[]>>(this.baseUrl);
            console.log('Debug - Dashboards encontrados:', response.data);
            return response.data;
        } catch (error) {
            console.error('Debug - Erro ao buscar dashboards:', error);
            throw error;
        }
    }

    public async excluir(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/${id}`);
    }

    public async buscarPorId(id: string): Promise<Dashboard> {
        try {
            console.log('Debug - Buscando dashboard:', id);
            const response = await api.get<ApiResponse<Dashboard>>(`${this.baseUrl}/${id}`);
            console.log('Debug - Resposta da API:', response.data);

            if (!response.data.data) {
                throw new Error('Dashboard não encontrado');
            }

            // Extrair os dados do dashboard da resposta
            const dashboardData = response.data.data;

            // Garantir que todos os campos numéricos existam
            const dashboard: Dashboard = {
                ...dashboardData,
                valor_investido: dashboardData.valor_investido || 0,
                valor_atual: dashboardData.valor_atual || 0,
                valor_projetado: dashboardData.valor_projetado || 0,
                dias_corridos: dashboardData.dias_corridos || 0,
                rendimento: {
                    valor_bruto: dashboardData.rendimento?.valor_bruto || 0,
                    valor_liquido: dashboardData.rendimento?.valor_liquido || 0,
                    valor_rendido: (dashboardData.rendimento?.valor_liquido || 0) - (dashboardData.valor_investido || 0),
                    rentabilidade_periodo: dashboardData.rendimento?.rentabilidade_periodo || 0,
                    rentabilidade_anualizada: dashboardData.rendimento?.rentabilidade_anualizada || 0,
                    imposto_renda: dashboardData.rendimento?.imposto_renda || 0,
                    iof: dashboardData.rendimento?.iof || 0,
                    outras_taxas: dashboardData.rendimento?.outras_taxas || 0
                },
                indicadores_mercado: {
                    selic: dashboardData.indicadores_mercado?.selic || 0,
                    cdi: dashboardData.indicadores_mercado?.cdi || 0,
                    ipca: dashboardData.indicadores_mercado?.ipca || 0
                },
                investimentos: dashboardData.investimentos || []
            };

            console.log('Debug - Dashboard processado:', dashboard);
            return dashboard;
        } catch (error) {
            console.error('Erro ao buscar dashboard:', error);
            throw error;
        }
    }

    public async gerarPDF(id: string): Promise<Blob> {
        try {
            const response = await api.get(`${this.baseUrl}/${id}/pdf`, {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf'
                }
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

    public async buscarPorUsuario(usuarioId: string): Promise<Dashboard[]> {
        const response = await api.get<Dashboard[]>(`${this.baseUrl}/usuario/${usuarioId}`);
        return response.data;
    }

    public async buscarHistorico(dashboardId: string): Promise<any[]> {
        const response = await api.get<any[]>(`${this.baseUrl}/${dashboardId}/historico`);
        return response.data;
    }

    public async atualizarDados(dashboardId: string): Promise<Dashboard> {
        const response = await api.post<Dashboard>(`${this.baseUrl}/${dashboardId}/atualizar`);
        return response.data;
    }
}

export const dashboardService = new DashboardService(); 