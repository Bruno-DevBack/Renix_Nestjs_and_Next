import api from '@/lib/api';
import { Banco, HistoricoResponse } from '@/types';

export interface InvestimentoDisponivel {
    tipo: string;
    caracteristicas: {
        rentabilidade_anual: number;
        indexador?: string;
        percentual_indexador?: number;
        risco: number;
        liquidez: number;
        garantia_fgc: boolean;
        vencimento?: Date;
        taxa_administracao?: number;
        taxa_performance?: number;
        valor_minimo: number;
    };
}

interface ApiResponse<T> {
    data: T;
    timestamp: string;
}

class BancosService {
    private readonly baseUrl = '/bancos';

    public async listarTodos(): Promise<Banco[]> {
        try {
            const response = await api.get<ApiResponse<Banco[]>>(this.baseUrl);
            return response.data.data;
        } catch (error) {
            console.error('Erro ao buscar bancos:', error);
            return [];
        }
    }

    public async buscarPorId(id: string): Promise<Banco | null> {
        try {
            const response = await api.get<ApiResponse<Banco>>(`${this.baseUrl}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Erro ao buscar banco:', error);
            return null;
        }
    }

    public async buscarDadosBanco(id: string): Promise<{
        taxas: {
            IOF_diario: number;
            cdi: number;
            IR_ate_180_dias: number;
            IR_ate_360_dias: number;
            IR_ate_720_dias: number;
            IR_acima_720_dias: number;
        };
        caracteristicas: {
            rendimentoBase: number;
            taxaAdministracao: number;
            investimentoMinimo: number;
            liquidezDiaria: boolean;
        };
    } | null> {
        try {
            const response = await api.get<ApiResponse<Banco>>(`${this.baseUrl}/${id}/dados`);
            const banco = response.data.data;
            return {
                taxas: {
                    IOF_diario: banco.IOF_diario,
                    cdi: banco.cdi,
                    IR_ate_180_dias: banco.IR_ate_180_dias,
                    IR_ate_360_dias: banco.IR_ate_360_dias,
                    IR_ate_720_dias: banco.IR_ate_720_dias,
                    IR_acima_720_dias: banco.IR_acima_720_dias,
                },
                caracteristicas: banco.caracteristicas
            };
        } catch (error) {
            console.error('Erro ao buscar dados do banco:', error);
            return null;
        }
    }

    public async buscarTiposInvestimento(bancoId: string): Promise<{
        tipo: string;
        nome: string;
        descricao: string;
    }[]> {
        try {
            const response = await api.get<ApiResponse<{
                tipo: string;
                nome: string;
                descricao: string;
            }[]>>(`${this.baseUrl}/${bancoId}/tipos-investimento`);
            return response.data.data;
        } catch (error) {
            console.error('Erro ao buscar tipos de investimento:', error);
            return [];
        }
    }

    public async buscarInvestimentosDisponiveis(bancoId: string): Promise<InvestimentoDisponivel[]> {
        try {
            const response = await api.get<ApiResponse<InvestimentoDisponivel[]>>(`${this.baseUrl}/${bancoId}/investimentos`);
            return response.data.data;
        } catch (error) {
            console.error('Erro ao buscar investimentos disponíveis:', error);
            return [];
        }
    }

    public async obterHistorico(id: string): Promise<HistoricoResponse> {
        const response = await api.get<HistoricoResponse>(`${this.baseUrl}/${id}/historico`);
        return response.data;
    }

    public async uploadLogo(id: string, file: File): Promise<Banco> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<Banco>(
            `${this.baseUrl}/${id}/logo`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }

    public async deletarLogo(id: string): Promise<Banco> {
        const response = await api.delete<Banco>(`${this.baseUrl}/${id}/logo`);
        return response.data;
    }

    public async obterTaxas(id: string, tipo?: string): Promise<Array<{
        tipo: string;
        valor: number;
        data_atualizacao: string;
    }>> {
        const params = tipo ? { tipo } : undefined;
        const response = await api.get(`${this.baseUrl}/${id}/taxas`, { params });
        return response.data;
    }

    public async compararTaxas(bancoIds: string[], tipo: string): Promise<Array<{
        banco_id: string;
        nome_banco: string;
        taxa: number;
        posicao_ranking: number;
    }>> {
        const response = await api.post(`${this.baseUrl}/comparar-taxas`, {
            bancos: bancoIds,
            tipo
        });
        return response.data;
    }

    public async obterRanking(tipo: string): Promise<Array<{
        banco_id: string;
        nome_banco: string;
        taxa: number;
        posicao: number;
    }>> {
        const response = await api.get(`${this.baseUrl}/ranking`, {
            params: { tipo }
        });
        return response.data;
    }
}

export const bancosService = new BancosService(); 