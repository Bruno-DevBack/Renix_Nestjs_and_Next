'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateLayout } from '@/components/PrivateLayout';
import { investimentosService } from '@/services/investimentosService';
import { bancosService } from '@/services/bancosService';
import { CreateInvestimentoDto, Banco } from '@/types';
import { format } from 'date-fns';
import Select from 'react-select';
import { FaQuestion, FaQuestionCircle, FaExclamationTriangle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

export default function NewInvestmentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { usuario } = useAuth();
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    const investimentoId = searchParams.get('id');
    const [bancos, setBancos] = useState<Banco[]>([]);
    const [tiposInvestimento, setTiposInvestimento] = useState<Array<{
        tipo: string;
        nome: string;
        descricao: string;
        caracteristicas: {
            rentabilidade_anual: number;
            risco: number;
            liquidez: number;
            garantia_fgc: boolean;
            valor_minimo: number;
            taxa_administracao?: number;
        };
    }>>([]);
    
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
            valor_minimo: 0,
            rentabilidade_anual: 0
        }
    });

    // Carrega a lista de bancos ao montar o componente
    useEffect(() => {
        const carregarBancos = async () => {
            try {
                const data = await bancosService.listarTodos();
                setBancos(data);
            } catch (error) {
                console.error('Erro ao carregar bancos:', error);
                setErro('Não foi possível carregar a lista de bancos.');
            }
        };

        carregarBancos();
    }, []);

    // Carrega os dados do investimento se estiver editando
    useEffect(() => {
        const carregarInvestimento = async () => {
            if (!investimentoId) return;

            try {
                setLoading(true);
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

                    // Carrega os tipos de investimento do banco selecionado
                    await carregarTiposInvestimento(data.banco_id);
                }
            } catch (error) {
                console.error('Erro ao carregar investimento:', error);
                setErro('Erro ao carregar dados do investimento.');
            } finally {
                setLoading(false);
            }
        };

        carregarInvestimento();
    }, [investimentoId]);

    const carregarTiposInvestimento = async (bancoId: string) => {
        try {
            setLoading(true);
            const [tiposBasicos, investimentosDisponiveis] = await Promise.all([
                bancosService.buscarTiposInvestimento(bancoId),
                bancosService.buscarInvestimentosDisponiveis(bancoId)
            ]);

            const tiposCompletos = tiposBasicos.map(tipo => {
                const investimentoDisponivel = investimentosDisponiveis.find(inv => inv.tipo === tipo.tipo);
                return {
                    ...tipo,
                    caracteristicas: investimentoDisponivel?.caracteristicas || {
                        rentabilidade_anual: 0,
                        risco: 1,
                        liquidez: 1,
                        garantia_fgc: false,
                        valor_minimo: 0
                    }
                };
            });

            setTiposInvestimento(tiposCompletos);
        } catch (error) {
            console.error('Erro ao carregar tipos de investimento:', error);
            setErro('Erro ao carregar tipos de investimento disponíveis.');
        } finally {
            setLoading(false);
        }
    };

    const handleBancoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const bancoId = e.target.value;
        
        setInvestimento(prev => ({
            ...prev,
            banco_id: bancoId,
            tipo_investimento: '',
            caracteristicas: {
                tipo: '',
                risco: 1,
                liquidez: 1,
                garantia_fgc: false,
                valor_minimo: 0,
                rentabilidade_anual: 0
            }
        }));

        if (bancoId) {
            await carregarTiposInvestimento(bancoId);
        } else {
            setTiposInvestimento([]);
        }
    };

    const handleTipoChange = (option: any) => {
        const tipoSelecionado = option?.value;
        const tipoInvestimento = tiposInvestimento.find(t => t.tipo === tipoSelecionado);
        
        if (tipoInvestimento) {
            const bancoSelecionado = bancos.find(b => b._id === investimento.banco_id);
            setInvestimento(prev => ({
                ...prev,
                tipo_investimento: tipoSelecionado,
                titulo: `${tipoInvestimento.nome} - ${bancoSelecionado?.nome_banco || ''}`,
                caracteristicas: {
                    ...tipoInvestimento.caracteristicas,
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

        try {
            // Validações
            if (!investimento.banco_id) {
                throw new Error('Selecione um banco.');
            }

            if (!investimento.tipo_investimento) {
                throw new Error('Selecione um tipo de investimento.');
            }

            if (!investimento.valor_investimento || investimento.valor_investimento <= 0) {
                throw new Error('Informe um valor de investimento válido.');
            }

            if (investimento.caracteristicas.valor_minimo > 0 && 
                investimento.valor_investimento < investimento.caracteristicas.valor_minimo) {
                throw new Error(`O valor mínimo para este investimento é R$ ${investimento.caracteristicas.valor_minimo.toLocaleString('pt-BR')}`);
            }

            const dadosInvestimento = {
                ...investimento,
                usuario_id: usuario?.id
            };

            let response;
            if (investimentoId) {
                response = await investimentosService.atualizar(investimentoId, dadosInvestimento);
                setMensagem('Investimento atualizado com sucesso!');
            } else {
                response = await investimentosService.criar(dadosInvestimento);
                console.log('Debug - Resposta após criar investimento:', response);
                setMensagem('Investimento criado com sucesso!');
            }

            // Redireciona para o dashboard do investimento criado/atualizado
            setTimeout(() => {
                const dashboardId = response?.data?.dashboard?._id;
                if (!dashboardId) {
                    console.error('Debug - ID do dashboard não encontrado na resposta:', response);
                    setErro('Erro ao redirecionar para o dashboard. Tente novamente.');
                    return;
                }
                router.push(`/dashboard/${dashboardId}`);
            }, 1500);
        } catch (error: any) {
            console.error('Erro ao salvar investimento:', error);
            setErro(error?.message || error?.response?.data?.message || 'Erro ao salvar investimento.');
        } finally {
            setLoading(false);
        }
    };

    const investmentOptions = tiposInvestimento.map((tipo) => ({
        value: tipo.tipo,
        label: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {tipo.nome}
                <span data-tooltip-id="tipo-tooltip" data-tooltip-content={tipo.descricao} style={{ marginLeft: 8 }}>
                    <FaQuestionCircle style={{ color: '#888', cursor: 'pointer' }} />
                </span>
            </div>
        ),
    }));

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
                        {/* Seleção do Banco */}
                        <div>
                            <label htmlFor="banco" className="block text-sm font-medium text-gray-700 mb-1">
                                Banco
                            </label>
                            <select
                                id="banco"
                                name="banco"
                                value={investimento.banco_id}
                                onChange={handleBancoChange}
                                disabled={loading}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                            >
                                <option value="">Selecione um banco</option>
                                {bancos.map((banco) => (
                                    <option key={banco._id} value={banco._id}>
                                        {banco.nome_banco}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tipo de Investimento com react-select */}
                        {investimento.banco_id && (
                            <div>
                                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Investimento
                                </label>
                                <Select
                                    id="tipo"
                                    name="tipo"
                                    options={investmentOptions}
                                    value={investmentOptions.find(opt => opt.value === investimento.tipo_investimento) || null}
                                    onChange={handleTipoChange}
                                    isDisabled={loading || !investimento.banco_id}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Selecione o tipo"
                                />
                                <Tooltip
                                    id="tipo-tooltip"
                                    place="right"
                                    className="!z-[9999] !rounded-lg !bg-gray-900 !text-white !px-4 !py-2 !shadow-lg"
                                    style={{
                                        fontSize: '1rem',
                                        maxWidth: 260,
                                        whiteSpace: 'pre-line',
                                        border: '1px solid #4ade80',
                                    }}
                                />
                            </div>
                        )}

                        {/* Valor do Investimento */}
                        {investimento.tipo_investimento && (
                            <div>
                                <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
                                    Valor do Investimento
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                        R$
                                    </span>
                                    <input
                                        id="valor"
                                        type="number"
                                        min={investimento.caracteristicas.valor_minimo}
                                        step="0.01"
                                        value={investimento.valor_investimento || ''}
                                        onChange={(e) => setInvestimento(prev => ({
                                            ...prev,
                                            valor_investimento: parseFloat(e.target.value) || 0
                                        }))}
                                        disabled={loading}
                                        className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                                        placeholder="0,00"
                                    />
                                </div>
                                {investimento.caracteristicas.valor_minimo > 0 && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Valor mínimo: R$ {investimento.caracteristicas.valor_minimo.toLocaleString('pt-BR')}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Datas */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="data_inicio" className="block text-sm font-medium text-gray-700 mb-1">
                                    Data de Início
                                </label>
                                <input
                                    id="data_inicio"
                                    type="date"
                                    value={investimento.data_inicio}
                                    onChange={(e) => setInvestimento(prev => ({
                                        ...prev,
                                        data_inicio: e.target.value
                                    }))}
                                    disabled={loading}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label htmlFor="data_fim" className="block text-sm font-medium text-gray-700 mb-1">
                                    Data de Vencimento
                                </label>
                                <input
                                    id="data_fim"
                                    type="date"
                                    value={investimento.data_fim}
                                    onChange={(e) => setInvestimento(prev => ({
                                        ...prev,
                                        data_fim: e.target.value
                                    }))}
                                    disabled={loading}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                                />
                            </div>
                        </div>

                        {/* Informações do Investimento Selecionado */}
                        {investimento.tipo_investimento && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">
                                    Características do Investimento
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Rentabilidade Anual</p>
                                        <p className="font-medium">{investimento.caracteristicas.rentabilidade_anual}%</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Nível de Risco</p>
                                        <p className="font-medium flex items-center gap-2">
                                            {investimento.caracteristicas.risco}/5
                                            {investimento.caracteristicas.risco >= 4 && (
                                                <FaExclamationTriangle className="text-red-500" title="Risco elevado!" />
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Liquidez</p>
                                        <p className="font-medium">
                                            {investimento.caracteristicas.liquidez === 1 ? 'Diária' :
                                             investimento.caracteristicas.liquidez === 2 ? 'Semanal' :
                                             investimento.caracteristicas.liquidez === 3 ? 'Mensal' :
                                             investimento.caracteristicas.liquidez === 4 ? 'Anual' : 'No vencimento'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Garantia FGC</p>
                                        <p className="font-medium">{investimento.caracteristicas.garantia_fgc ? 'Sim' : 'Não'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botão de Submit */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading || !investimento.banco_id || !investimento.tipo_investimento || !investimento.valor_investimento}
                                className="w-full py-3 px-4 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Salvando...' : investimentoId ? 'Atualizar Investimento' : 'Criar Investimento'}
                            </button>
                        </div>
                    </form>
                </div>
        
            </main>
        </PrivateLayout>
        
    );
}
