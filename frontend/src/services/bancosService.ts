import api from '@/lib/api';
import { Banco, HistoricoResponse } from '@/types';

class BancosService {
    private readonly baseUrl = '/bancos';

    public async listarTodos(): Promise<Banco[]> {
        const response = await api.get<Banco[]>(this.baseUrl);
        return response.data;
    }

    public async buscarPorId(id: string): Promise<Banco> {
        const response = await api.get<Banco>(`${this.baseUrl}/${id}`);
        return response.data;
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