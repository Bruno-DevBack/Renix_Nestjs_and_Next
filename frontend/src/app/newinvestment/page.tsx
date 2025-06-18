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

    const [showTipoModal, setShowTipoModal] = useState(false);
    const [tipoModalSelecionado, setTipoModalSelecionado] = useState<string | null>(null);

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

            // Definição de risco default por tipo
            const riscoDefaultPorTipo: Record<string, number> = {
                CDB: 2,
                RENDA_FIXA_CDB: 2,
                LCI: 2,
                LCA: 2,
                TESOURO_SELIC: 1,
                TESOURO_IPCA: 1,
                TESOURO_PREFIXADO: 1,
                POUPANCA: 1,
                FUNDOS_RF: 2,
                FUNDOS_MULTI: 3,
                FUNDOS_MULTIMERCADO: 3,
                ACOES: 4,
                FII: 3,
                FUNDOS_IMOBILIARIOS: 3
            };

            const tiposCompletos = tiposBasicos.map(tipo => {
                const investimentoDisponivel = investimentosDisponiveis.find(inv => inv.tipo === tipo.tipo);
                let caracteristicas = investimentoDisponivel?.caracteristicas || {
                    rentabilidade_anual: 0,
                    risco: 0,
                    liquidez: 1,
                    garantia_fgc: false,
                    valor_minimo: 0
                };
                // Se risco for nulo, undefined, 0 ou não numérico, usar default
                if (!caracteristicas.risco || isNaN(Number(caracteristicas.risco)) || caracteristicas.risco < 1) {
                    caracteristicas = {
                        ...caracteristicas,
                        risco: riscoDefaultPorTipo[tipo.tipo] || 2
                    };
                }
                return {
                    ...tipo,
                    caracteristicas
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

    // Conteúdo educacional por tipo (chaves padronizadas conforme enum da API)
    const explicacoesPorTipo: Record<string, { titulo: string; conteudo: React.ReactNode }> = {
        CDB: {
            titulo: 'CDB (Certificado de Depósito Bancário)',
            conteudo: (
                <div className="space-y-3">
                    <p><b>O que é?</b> O CDB é um título de renda fixa emitido por bancos. Ao investir em um CDB, você está emprestando dinheiro ao banco, que em troca paga juros sobre o valor aplicado.</p>
                    <p><b>Como funciona?</b> O banco utiliza o dinheiro captado para financiar suas operações e, ao final do prazo, devolve o valor investido acrescido dos juros acordados. Existem CDBs de taxa prefixada (você sabe exatamente quanto vai receber), pós-fixada (geralmente atrelada ao CDI) e híbrida (mistura de taxa fixa e indexador).</p>
                    <ul className="list-disc ml-6">
                        <li><b>Indicado para:</b> Quem busca segurança, previsibilidade e rendimento superior à poupança.</li>
                        <li><b>Vantagens:</b> Cobertura do FGC até R$ 250 mil por CPF e instituição, variedade de prazos e taxas, fácil de investir.</li>
                        <li><b>Desvantagens:</b> Pode ter carência para resgate, rendimento sujeito ao IR regressivo.</li>
                    </ul>
                    <p><b>Exemplo prático:</b> Investindo R$ 1.000,00 em um CDB a 12% ao ano por 2 anos:<br />Valor Futuro = 1.000 × (1 + 0,12)² = R$ 1.254,40</p>
                    <p className="text-emerald-700 font-medium">Dica: CDBs de bancos menores costumam pagar taxas maiores, mas avalie o risco do emissor!</p>
                </div>
            )
        },
        LCI: {
            titulo: 'LCI (Letra de Crédito Imobiliário)',
            conteudo: (
                <div className="space-y-3">
                    <p><b>O que é?</b> A LCI é um título de renda fixa emitido por bancos para captar recursos destinados ao financiamento do setor imobiliário.</p>
                    <p><b>Como funciona?</b> Você empresta dinheiro ao banco, que utiliza para financiar imóveis. Em troca, recebe juros, geralmente atrelados ao CDI ou prefixados. O grande diferencial é a isenção de Imposto de Renda para pessoas físicas.</p>
                    <ul className="list-disc ml-6">
                        <li><b>Indicado para:</b> Quem busca segurança, rendimento isento de IR e prazos variados.</li>
                        <li><b>Vantagens:</b> Isenção de IR, cobertura do FGC, boa alternativa à poupança.</li>
                        <li><b>Desvantagens:</b> Pode ter carência para resgate, liquidez nem sempre é diária.</li>
                    </ul>
                    <p><b>Exemplo prático:</b> R$ 2.000,00 a 10% ao ano por 1 ano:<br />Valor Futuro = 2.000 × (1 + 0,10) = R$ 2.200,00</p>
                    <p className="text-emerald-700 font-medium">Dica: Compare prazos de carência e taxas entre bancos antes de investir.</p>
                </div>
            )
        },
        LCA: {
            titulo: 'LCA (Letra de Crédito do Agronegócio)',
            conteudo: (
                <div className="space-y-3">
                    <p><b>O que é?</b> A LCA é semelhante à LCI, mas os recursos captados são destinados ao financiamento do agronegócio.</p>
                    <p><b>Como funciona?</b> Você empresta dinheiro ao banco, que financia produtores rurais e empresas do setor. O investidor recebe juros, geralmente atrelados ao CDI ou prefixados, e conta com isenção de IR para pessoa física.</p>
                    <ul className="list-disc ml-6">
                        <li><b>Indicado para:</b> Quem busca diversificação, segurança e isenção de IR.</li>
                        <li><b>Vantagens:</b> Isenção de IR, cobertura do FGC, alternativa para diversificar renda fixa.</li>
                        <li><b>Desvantagens:</b> Pode ter prazos mínimos de carência, liquidez nem sempre é diária.</li>
                    </ul>
                    <p><b>Exemplo prático:</b> R$ 1.500,00 a 9% ao ano por 2 anos:<br />Valor Futuro = 1.500 × (1 + 0,09)² = R$ 1.779,15</p>
                    <p className="text-emerald-700 font-medium">Dica: Ideal para quem já tem CDB/LCI e quer diversificar com isenção de IR.</p>
                </div>
            )
        },
        TESOURO_SELIC: {
            titulo: 'Tesouro Selic',
            conteudo: (
                <div className="space-y-3">
                    <p><b>O que é?</b> Título público federal pós-fixado, considerado o investimento mais seguro do Brasil, pois é garantido pelo Tesouro Nacional.</p>
                    <p><b>Como funciona?</b> O rendimento acompanha a taxa Selic, principal taxa de juros da economia. Tem liquidez diária (D+1), ou seja, pode ser resgatado a qualquer momento com baixo risco de perda.</p>
                    <ul className="list-disc ml-6">
                        <li><b>Indicado para:</b> Reserva de emergência, perfil conservador, quem busca liquidez e segurança.</li>
                        <li><b>Vantagens:</b> Baixíssimo risco, liquidez diária, fácil de investir.</li>
                        <li><b>Desvantagens:</b> Rentabilidade pode ser menor que outros títulos em cenários de juros baixos, há cobrança de IR regressivo.</li>
                    </ul>
                    <p><b>Exemplo prático:</b> R$ 2.000,00 a 13,65% ao ano:<br />Valor Futuro = 2.000 × (1 + 0,1365) = R$ 2.273,00</p>
                    <p className="text-emerald-700 font-medium">Dica: Ideal para quem pode precisar do dinheiro a qualquer momento.</p>
                </div>
            )
        },
        TESOURO_IPCA: {
            titulo: 'Tesouro IPCA+',
            conteudo: (
                <div className="space-y-3">
                    <p><b>O que é?</b> Título público federal híbrido, que paga uma taxa fixa + variação da inflação (IPCA).</p>
                    <p><b>Como funciona?</b> O rendimento é composto por uma parte fixa e outra atrelada ao IPCA, protegendo o poder de compra do investidor. Ideal para objetivos de longo prazo, como aposentadoria.</p>
                    <ul className="list-disc ml-6">
                        <li><b>Indicado para:</b> Quem quer proteger o dinheiro da inflação e investir no longo prazo.</li>
                        <li><b>Vantagens:</b> Proteção contra inflação, previsibilidade de rendimento real.</li>
                        <li><b>Desvantagens:</b> Valor de resgate pode oscilar se vendido antes do vencimento, IR regressivo.</li>
                    </ul>
                    <p><b>Exemplo prático:</b> R$ 1.000,00 investidos, IPCA de 4% ao ano + 6% de taxa fixa:<br />Valor Futuro ≈ 1.000 × (1 + 0,10) = R$ 1.100,00</p>
                    <p className="text-emerald-700 font-medium">Dica: Excelente para aposentadoria ou objetivos de longo prazo.</p>
                </div>
            )
        },
        TESOURO_PREFIXADO: {
            titulo: 'Tesouro Prefixado',
            conteudo: (
                <div className="space-y-3">
                    <p><b>O que é?</b> Título público federal com taxa de juros fixa definida no momento da compra.</p>
                    <p><b>Como funciona?</b> Você sabe exatamente quanto vai receber no vencimento, independentemente das variações da economia. Ideal para quem acredita que os juros vão cair no futuro.</p>
                    <ul className="list-disc ml-6">
                        <li><b>Indicado para:</b> Quem busca previsibilidade e aceita manter o dinheiro até o vencimento.</li>
                        <li><b>Vantagens:</b> Rendimento conhecido, segurança do Tesouro Nacional.</li>
                        <li><b>Desvantagens:</b> Valor de resgate pode oscilar se vendido antes do vencimento, IR regressivo.</li>
                    </ul>
                    <p><b>Exemplo prático:</b> R$ 1.000,00 a 11% ao ano por 2 anos:<br />Valor Futuro = 1.000 × (1 + 0,11)² = R$ 1.232,10</p>
                    <p className="text-emerald-700 font-medium">Dica: Bom para quem acredita que os juros vão cair no futuro.</p>
                </div>
            )
        },
        POUPANCA: {
            titulo: 'Poupança',
            conteudo: (
                <div className="space-y-3">
                    <p><b>O que é?</b> Investimento tradicional, de baixo risco e liquidez diária, muito popular no Brasil.</p>
                    <p><b>Como funciona?</b> O rendimento é definido por regras do governo: 70% da Selic + TR (quando Selic ≤ 8,5%) ou 0,5% ao mês + TR. Isento de IR para pessoa física.</p>
                    <ul className="list-disc ml-6">
                        <li><b>Indicado para:</b> Quem busca simplicidade, liquidez imediata e não quer se preocupar com tributação.</li>
                        <li><b>Vantagens:</b> Liquidez diária, isenção de IR, fácil de movimentar.</li>
                        <li><b>Desvantagens:</b> Rentabilidade geralmente inferior a outros produtos de renda fixa, pode perder para a inflação.</li>
                    </ul>
                    <p><b>Exemplo prático:</b> R$ 1.000,00 por 1 ano (Selic 13,65%):<br />Valor Futuro ≈ 1.000 × (1 + 0,0617) = R$ 1.061,70</p>
                    <p className="text-emerald-700 font-medium">Dica: Só vale a pena para valores pequenos e reserva imediata.</p>
                </div>
            )
        },
        FUNDOS_RF: {
            titulo: 'Fundos de Renda Fixa',
            conteudo: (
                <div className="space-y-3">
                    <p><b>O que é?</b> Fundos que investem majoritariamente em títulos de renda fixa (CDB, Tesouro, LCI, etc).</p>
                    <p><b>Como funciona?</b> O gestor do fundo reúne recursos de vários investidores e aplica em títulos públicos e privados. O rendimento é dividido proporcionalmente entre os cotistas, descontadas as taxas.</p>
                    <ul className="list-disc ml-6">
                        <li><b>Indicado para:</b> Quem busca diversificação, gestão profissional e praticidade.</li>
                        <li><b>Vantagens:</b> Diversificação automática, acesso a títulos exclusivos, gestão profissional.</li>
                        <li><b>Desvantagens:</b> Taxas de administração, pode ter carência para resgate, rendimento pode variar.</li>
                    </ul>
                    <p><b>Exemplo prático:</b> Cota inicial R$ 1,00, final R$ 1,05:<br />Rendimento = (1,05 - 1,00) / 1,00 × 100% = 5%</p>
                    <p className="text-emerald-700 font-medium">Dica: Compare taxas e histórico do fundo antes de investir.</p>
                </div>
            )
        },
        FUNDOS_MULTI: {
            titulo: 'Fundos Multimercado',
            conteudo: (
                <div className="space-y-3">
                    <p><b>O que é?</b> Fundos que podem investir em diferentes classes de ativos (renda fixa, ações, câmbio, etc), buscando maior diversificação e potencial de retorno.</p>
                    <p><b>Como funciona?</b> O gestor tem liberdade para alocar recursos em diferentes mercados, de acordo com a estratégia do fundo. O risco e o retorno podem variar bastante.</p>
                    <ul className="list-disc ml-6">
                        <li><b>Indicado para:</b> Quem busca diversificação, aceita oscilações e quer potencializar ganhos.</li>
                        <li><b>Vantagens:</b> Flexibilidade de estratégia, potencial de retorno maior que renda fixa tradicional.</li>
                        <li><b>Desvantagens:</b> Pode ter volatilidade, taxas de administração e performance.</li>
                    </ul>
                    <p><b>Exemplo prático:</b> Cota inicial R$ 1,00, final R$ 1,12:<br />Rendimento = (1,12 - 1,00) / 1,00 × 100% = 12%</p>
                    <p className="text-emerald-700 font-medium">Dica: Analise o perfil do fundo e o histórico do gestor antes de investir.</p>
                </div>
            )
        },
        ACOES: {
            titulo: 'Ações',
            conteudo: (
                <div className="space-y-3">
                    <p><b>O que é?</b> Ao investir em ações, você se torna sócio de uma empresa e participa dos lucros e prejuízos.</p>
                    <p><b>Como funciona?</b> O valor das ações pode oscilar diariamente conforme o desempenho da empresa e o cenário econômico. O investidor pode ganhar com a valorização das ações e com o recebimento de dividendos.</p>
                    <ul className="list-disc ml-6">
                        <li><b>Indicado para:</b> Quem busca potencial de altos ganhos e aceita riscos maiores.</li>
                        <li><b>Vantagens:</b> Potencial de valorização, participação nos lucros, liquidez na bolsa.</li>
                        <li><b>Desvantagens:</b> Alta volatilidade, risco de perdas, exige acompanhamento do mercado.</li>
                    </ul>
                    <p><b>Exemplo prático:</b> Comprou por R$ 10,00, vendeu por R$ 12,00:<br />Rendimento = (12 - 10) / 10 × 100% = 20%</p>
                    <p className="text-emerald-700 font-medium">Dica: Invista apenas o que pode perder e diversifique sua carteira!</p>
                </div>
            )
        },
        FII: {
            titulo: 'Fundos Imobiliários (FII)',
            conteudo: (
                <div className="space-y-3">
                    <p><b>O que é?</b> Os FIIs reúnem recursos de vários investidores para investir em imóveis físicos (shoppings, prédios comerciais, galpões) ou títulos do setor imobiliário.</p>
                    <p><b>Como funciona?</b> O investidor compra cotas do fundo, recebe rendimentos mensais (aluguéis, juros) e pode ganhar com a valorização das cotas negociadas na bolsa.</p>
                    <ul className="list-disc ml-6">
                        <li><b>Indicado para:</b> Quem busca renda mensal, diversificação e exposição ao mercado imobiliário.</li>
                        <li><b>Vantagens:</b> Renda recorrente, liquidez na bolsa, acesso a grandes empreendimentos.</li>
                        <li><b>Desvantagens:</b> Valor da cota pode oscilar, risco de vacância, taxas de administração.</li>
                    </ul>
                    <p><b>Exemplo prático:</b> Comprou cota por R$ 100, vendeu por R$ 110 e recebeu R$ 5 de rendimentos:<br />Rendimento = (110 - 100 + 5) / 100 × 100% = 15%</p>
                    <p className="text-emerald-700 font-medium">Dica: Analise a qualidade dos imóveis e a gestão do fundo antes de investir.</p>
                </div>
            )
        },
    };

    // Aliases para aceitar ambos os formatos
    explicacoesPorTipo.FUNDOS_MULTIMERCADO = explicacoesPorTipo.FUNDOS_MULTI;
    explicacoesPorTipo.FUNDOS_IMOBILIARIOS = explicacoesPorTipo.FII;
    explicacoesPorTipo.RENDA_FIXA_CDB = explicacoesPorTipo.CDB;

    // Mapeamento de labels amigáveis para os tipos do enum
    const tipoLabels: Record<string, string> = {
        CDB: 'Certificado de Depósito Bancário',
        LCI: 'Letra de Crédito Imobiliário',
        LCA: 'Letra de Crédito do Agronegócio',
        TESOURO_SELIC: 'Tesouro Selic',
        TESOURO_IPCA: 'Tesouro IPCA+',
        TESOURO_PREFIXADO: 'Tesouro Prefixado',
        POUPANCA: 'Poupança',
        FUNDOS_RF: 'Fundos de Renda Fixa',
        FUNDOS_MULTI: 'Fundos Multimercado',
        FII: 'Fundos Imobiliários',
        FUNDOS_IMOBILIARIOS: 'Fundos Imobiliários',
        RENDA_FIXA_CDB: 'Certificado de Depósito Bancário',
    };

    // Opções do select usando os tipos padronizados
    const investmentOptions = tiposInvestimento.map((tipo) => ({
        value: tipo.tipo,
        label: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {tipoLabels[tipo.tipo] || tipo.nome}
                <span style={{ marginLeft: 8 }}>
                    <FaQuestionCircle style={{ color: '#888', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); setTipoModalSelecionado(tipo.tipo); setShowTipoModal(true); }} title="Como funciona este tipo de investimento?" />
                </span>
            </div>
        ),
    }));

    // Componente Modal Educacional
    const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl border border-gray-200" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[60vh]">{children}</div>
                    <div className="flex justify-end p-6 border-t border-gray-200">
                        <button onClick={onClose} className="px-6 py-2 bg-[#028264] text-white rounded-lg hover:bg-[#026d54] transition-colors">Fechar</button>
                    </div>
                </div>
            </div>
        );
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
                                    style={{ fontSize: '1rem', maxWidth: 260, whiteSpace: 'pre-line', border: '1px solid #4ade80' }}
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
            {/* Modal Educacional sobre Tipos de Investimento */}
            <Modal isOpen={showTipoModal} onClose={() => setShowTipoModal(false)} title={tipoModalSelecionado && explicacoesPorTipo[tipoModalSelecionado]?.titulo ? explicacoesPorTipo[tipoModalSelecionado].titulo : 'Tipo de Investimento'}>
                {tipoModalSelecionado && explicacoesPorTipo[tipoModalSelecionado]?.conteudo ? (
                    explicacoesPorTipo[tipoModalSelecionado].conteudo
                ) : (
                    <div className="space-y-3">
                        <p>Este é um tipo de investimento disponível na plataforma. Consulte o banco emissor para mais detalhes ou procure um profissional de investimentos.</p>
                    </div>
                )}
            </Modal>
        </PrivateLayout>
    );
}
