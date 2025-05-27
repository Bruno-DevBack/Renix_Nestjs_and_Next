'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateLayout } from '@/components/PrivateLayout';
import { investimentosService } from '@/services/investimentosService';
import { bancosService, InvestimentoDisponivel } from '@/services/bancosService';
import { CreateInvestimentoDto, Banco } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function NewInvestmentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { usuario } = useAuth();
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    const investimentoId = searchParams.get('id');
    const [bancos, setBancos] = useState<Banco[]>([]);
    const [investimentosDisponiveis, setInvestimentosDisponiveis] = useState<InvestimentoDisponivel[]>([]);
    
    const [investimento, setInvestimento] = useState<CreateInvestimentoDto>({
        titulo: '',
        valor_investimento: 0,
        banco_id: '',
        data_inicio: format(new Date(), 'yyyy-MM-dd'),
        data_fim: format(new Date().setFullYear(new Date().getFullYear() + 1), 'yyyy-MM-dd'),
        tipo_investimento: '',
        caracteristicas: {
            tipo: '',
            risco: 1,
            liquidez: 1,
            garantia_fgc: false,
            valor_minimo: 0
        }
    });

    useEffect(() => {
        const carregarBancos = async () => {
            const data = await bancosService.listarTodos();
            setBancos(data);
        };

        carregarBancos();
    }, []);

    useEffect(() => {
        const carregarInvestimento = async () => {
            if (!investimentoId) return;

            try {
                const data = await investimentosService.buscarPorId(investimentoId);
                if (data) {
                    setInvestimento({
                        titulo: data.titulo,
                        valor_investimento: data.valor_investimento,
                        banco_id: data.banco_id,
                        data_inicio: data.data_inicio,
                        data_fim: data.data_fim,
                        tipo_investimento: data.tipo_investimento,
                        caracteristicas: data.caracteristicas
                    });
                }
            } catch (err: any) {
                console.error('Erro ao carregar investimento:', err);
                setErro('Erro ao carregar dados do investimento.');
            }
        };

        carregarInvestimento();
    }, [investimentoId]);

    useEffect(() => {
        const carregarInvestimentosDisponiveis = async () => {
            if (!investimento.banco_id) return;
            
            const data = await bancosService.buscarInvestimentosDisponiveis(investimento.banco_id);
            setInvestimentosDisponiveis(data);
        };

        carregarInvestimentosDisponiveis();
    }, [investimento.banco_id]);

    const handleBancoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const bancoId = e.target.value;
        const bancoSelecionado = bancos.find(b => b._id === bancoId);
        
        // Busca dados específicos do banco
        const dadosBanco = await bancosService.buscarDadosBanco(bancoId);
        
        setInvestimento(prev => ({
            ...prev,
            banco_id: bancoId,
            tipo_investimento: '', // Reseta o tipo quando muda o banco
            caracteristicas: {
                tipo: '',
                risco: dadosBanco?.caracteristicas.rendimentoBase || 1,
                liquidez: dadosBanco?.caracteristicas.liquidezDiaria ? 1 : 3,
                garantia_fgc: false,
                valor_minimo: dadosBanco?.caracteristicas.investimentoMinimo || 0,
                taxa_administracao: dadosBanco?.caracteristicas.taxaAdministracao
            }
        }));

        // Carrega os tipos de investimento disponíveis
        const tiposInvestimento = await bancosService.buscarTiposInvestimento(bancoId);
        setInvestimentosDisponiveis(tiposInvestimento.map(tipo => ({
            tipo: tipo.tipo,
            caracteristicas: {
                rentabilidade_anual: 0,
                risco: 1,
                liquidez: 1,
                garantia_fgc: false,
                valor_minimo: dadosBanco?.caracteristicas.investimentoMinimo || 0
            }
        })));
    };

    const handleTipoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const tipoSelecionado = e.target.value;
        const investimentoDisponivel = investimentosDisponiveis.find(i => i.tipo === tipoSelecionado);
        
        if (investimentoDisponivel) {
            // Busca características específicas do tipo de investimento
            const dadosInvestimento = await bancosService.buscarInvestimentosDisponiveis(investimento.banco_id);
            const caracteristicasInvestimento = dadosInvestimento.find(i => i.tipo === tipoSelecionado);
            
            setInvestimento(prev => ({
                ...prev,
                tipo_investimento: tipoSelecionado,
                titulo: `${tipoSelecionado} - ${bancos.find(b => b._id === prev.banco_id)?.nome_banco || ''}`,
                caracteristicas: {
                    ...caracteristicasInvestimento?.caracteristicas || investimentoDisponivel.caracteristicas,
                    tipo: tipoSelecionado
                }
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErro('');
        setMensagem('');

        if (!investimento.banco_id || !investimento.tipo_investimento || !investimento.valor_investimento) {
            setErro('Por favor, preencha todos os campos obrigatórios.');
            setLoading(false);
            return;
        }

        if (investimento.caracteristicas && investimento.valor_investimento < investimento.caracteristicas.valor_minimo) {
            setErro(`O valor mínimo para este investimento é R$ ${investimento.caracteristicas.valor_minimo.toLocaleString('pt-BR')}`);
            setLoading(false);
            return;
        }

        try {
            const dadosInvestimento = {
                ...investimento,
                usuario_id: usuario?.id
            };

            if (investimentoId) {
                await investimentosService.atualizar(investimentoId, dadosInvestimento);
                setMensagem('Investimento atualizado com sucesso!');
            } else {
                await investimentosService.criar(dadosInvestimento);
                setMensagem('Investimento criado com sucesso!');
            }

            setTimeout(() => {
                router.push('/investments');
            }, 1500);
        } catch (err: any) {
            console.error('Erro ao salvar investimento:', err);
            setErro(err?.response?.data?.message || 'Erro ao salvar investimento.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PrivateLayout>
            <main className="flex-grow px-6 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {investimentoId ? 'Editar Investimento' : 'Novo Investimento'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Preencha os dados do seu investimento
                        </p>
                    </div>

                    {erro && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                            {erro}
                        </div>
                    )}

                    {mensagem && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
                            {mensagem}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-6">
                        <div>
                            <label htmlFor="banco" className="block text-sm font-medium text-gray-700 mb-1">
                                Banco
                            </label>
                            <select
                                id="banco"
                                name="banco"
                                value={investimento.banco_id || ''}
                                onChange={handleBancoChange}
                                required
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="">Selecione um banco</option>
                                {bancos.map((banco) => (
                                    <option key={banco._id} value={banco._id}>
                                        {banco.nome_banco}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {investimento.banco_id && (
                            <div>
                                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Investimento
                                </label>
                                <select
                                    id="tipo"
                                    name="tipo"
                                    value={investimento.tipo_investimento}
                                    onChange={handleTipoChange}
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option key="empty" value="">Selecione o tipo</option>
                                    {investimentosDisponiveis.map((inv) => (
                                        <option key={inv.tipo} value={inv.tipo}>
                                            {inv.tipo}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {investimento.tipo_investimento && (
                            <>
                                <div>
                                    <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                                        Título do Investimento
                                    </label>
                                    <input
                                        type="text"
                                        id="titulo"
                                        name="titulo"
                                        value={investimento.titulo}
                                        onChange={(e) => setInvestimento(prev => ({ ...prev, titulo: e.target.value }))}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Ex: CDB Banco X"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
                                        Valor do Investimento (R$)
                                    </label>
                                    <input
                                        type="number"
                                        id="valor"
                                        name="valor"
                                        value={investimento.valor_investimento}
                                        onChange={(e) => setInvestimento(prev => ({ ...prev, valor_investimento: Number(e.target.value) }))}
                                        required
                                        min={investimento.caracteristicas?.valor_minimo || 0}
                                        step="0.01"
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                    {investimento.caracteristicas && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            Valor mínimo: R$ {investimento.caracteristicas.valor_minimo.toLocaleString('pt-BR')}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="data_inicio" className="block text-sm font-medium text-gray-700 mb-1">
                                            Data de Início
                                        </label>
                                        <input
                                            type="date"
                                            id="data_inicio"
                                            name="data_inicio"
                                            value={investimento.data_inicio || format(new Date(), 'yyyy-MM-dd')}
                                            onChange={(e) => setInvestimento(prev => ({ ...prev, data_inicio: e.target.value }))}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="data_fim" className="block text-sm font-medium text-gray-700 mb-1">
                                            Data de Vencimento
                                        </label>
                                        <input
                                            type="date"
                                            id="data_fim"
                                            name="data_fim"
                                            value={investimento.data_fim || format(new Date().setFullYear(new Date().getFullYear() + 1), 'yyyy-MM-dd')}
                                            onChange={(e) => setInvestimento(prev => ({ ...prev, data_fim: e.target.value }))}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                {investimento.caracteristicas && (
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                        <h3 className="font-medium text-gray-900">Características do Investimento</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Rentabilidade Anual</p>
                                                <p className="font-medium">{investimento.caracteristicas.rentabilidade_anual}% a.a.</p>
                                            </div>
                                            {investimento.caracteristicas.indexador && (
                                                <div>
                                                    <p className="text-sm text-gray-500">Indexador</p>
                                                    <p className="font-medium">
                                                        {investimento.caracteristicas.percentual_indexador}% do {investimento.caracteristicas.indexador}
                                                    </p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm text-gray-500">Nível de Risco</p>
                                                <p className="font-medium">{investimento.caracteristicas.risco}/5</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Liquidez</p>
                                                <p className="font-medium">{investimento.caracteristicas.liquidez}/5</p>
                                            </div>
                                            {investimento.caracteristicas.taxa_administracao && (
                                                <div>
                                                    <p className="text-sm text-gray-500">Taxa de Administração</p>
                                                    <p className="font-medium">{investimento.caracteristicas.taxa_administracao}% a.a.</p>
                                                </div>
                                            )}
                                            {investimento.caracteristicas.taxa_performance && (
                                                <div>
                                                    <p className="text-sm text-gray-500">Taxa de Performance</p>
                                                    <p className="font-medium">{investimento.caracteristicas.taxa_performance}%</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm text-gray-500">Garantia FGC</p>
                                                <p className="font-medium">{investimento.caracteristicas.garantia_fgc ? 'Sim' : 'Não'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex justify-end space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.push('/investments')}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Salvando...' : investimentoId ? 'Atualizar' : 'Criar Investimento'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </PrivateLayout>
    );
}
