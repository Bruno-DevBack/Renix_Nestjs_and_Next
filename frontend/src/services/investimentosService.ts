import api from '@/lib/api';
import { Investimento, CreateInvestimentoDto, InvestimentoResponse } from '@/types';

class InvestimentosService {
    private readonly baseUrl = '/investimentos';

    public async listarTodos(): Promise<Investimento[]> {
        const response = await api.get<Investimento[]>(this.baseUrl);
        return response.data;
    }

    public async buscarPorId(id: string): Promise<Investimento> {
        const response = await api.get<Investimento>(`${this.baseUrl}/${id}`);
        return response.data;
    }

    public async criar(investimento: CreateInvestimentoDto): Promise<InvestimentoResponse> {
        console.log('Debug - Enviando dados para criar investimento:', investimento);
        const response = await api.post<InvestimentoResponse>(this.baseUrl, investimento);
        console.log('Debug - Resposta do servidor:', response.data);
        return response.data;
    }

    public async atualizar(id: string, investimento: Partial<CreateInvestimentoDto>): Promise<InvestimentoResponse> {
        const response = await api.patch<InvestimentoResponse>(`${this.baseUrl}/${id}`, investimento);
        return response.data;
    }

    public async excluir(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/${id}`);
    }

    public async calcularRendimento(id: string): Promise<number> {
        const response = await api.get<{ rendimento: number }>(`${this.baseUrl}/${id}/rendimento`);
        return response.data.rendimento;
    }

    public async compararInvestimentos(ids: string[]): Promise<{
        melhorRendimento: string;
        comparativo: Array<{
            id: string;
            rendimento: number;
            risco: string;
        }>;
    }> {
        const response = await api.post<{
            melhorRendimento: string;
            comparativo: Array<{
                id: string;
                rendimento: number;
                risco: string;
            }>;
        }>(`${this.baseUrl}/comparar`, { ids });
        return response.data;
    }
}

export const investimentosService = new InvestimentosService(); 