import api from '@/lib/api';
import { Investimento, CreateInvestimentoDto } from '@/types';

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

    public async criar(investimento: CreateInvestimentoDto): Promise<Investimento> {
        const response = await api.post<Investimento>(this.baseUrl, investimento);
        return response.data;
    }

    public async atualizar(id: string, investimento: Partial<CreateInvestimentoDto>): Promise<Investimento> {
        const response = await api.patch<Investimento>(`${this.baseUrl}/${id}`, investimento);
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