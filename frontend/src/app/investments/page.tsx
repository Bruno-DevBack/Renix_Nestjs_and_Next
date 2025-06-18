'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaEdit, FaFilePdf, FaTrash, FaExclamationTriangle, FaInfoCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateLayout } from '@/components/PrivateLayout';
import { dashboardService } from '@/services/dashboardService';
import { Dashboard } from '@/types';
import { Dialog } from '@headlessui/react';
import { PhoneIcon } from '@heroicons/react/24/outline';

export default function InvestmentsPage() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [dashboardParaExcluir, setDashboardParaExcluir] = useState<Dashboard | null>(null);
  const [showInvestmentInfo, setShowInvestmentInfo] = useState(false);
  const [showSobreModal, setShowSobreModal] = useState(false);
  const [showContatoModal, setShowContatoModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Função auxiliar para formatar valores monetários
  const formatarMoeda = (valor?: number) => {
    if (valor === undefined || valor === null) return 'R$ 0,00';
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Função auxiliar para formatar porcentagens
  const formatarPorcentagem = (valor?: number) => {
    if (valor === undefined || valor === null) return '0,00%';
    return `${valor.toFixed(2)}%`;
  };

  // Função para determinar a cor da borda baseada no risco
  const getBorderColorByRisk = (risco?: number) => {
    if (!risco) return 'border-gray-200';
    switch (risco) {
      case 1:
        return 'border-green-200';
      case 2:
        return 'border-green-600';
      case 3:
        return 'border-yellow-400';
      case 4:
        return 'border-orange-500';
      case 5:
        return 'border-red-600';
      default:
        return 'border-gray-200';
    }
  };

  // Função auxiliar para calcular o valor rendido
  const calcularValorRendido = (dashboard: Dashboard) => {
    if (!dashboard.rendimento?.valor_liquido || !dashboard.valor_investido) return 0;
    return dashboard.rendimento.valor_liquido - dashboard.valor_investido;
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText('renixcorporate@gmail.com');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar email:', err);
    }
  };

  // Componente do Modal
  const Modal = ({ isOpen, onClose, title, children }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }) => {
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header do Modal */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Conteúdo do Modal */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {children}
          </div>
          {/* Footer do Modal */}
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#028264] text-white rounded-lg hover:bg-[#026d54] transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const fetchDashboards = async () => {
    try {
      setLoading(true);
      console.log('Debug - Buscando dashboards');
      const response = await dashboardService.listarTodos();
      console.log('Debug - Dashboards encontrados:', response);

      setDashboards(response.data);
    } catch (err: any) {
      console.error('Erro ao buscar dashboards:', err);
      setErro(err?.message || 'Erro ao carregar dashboards.');
      setDashboards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboards();
  }, []);

  // Expande automaticamente as informações se não há investimentos
  useEffect(() => {
    if (!loading && dashboards.length === 0) {
      setShowInvestmentInfo(true);
    }
  }, [loading, dashboards.length]);

  const handleGerarPdf = async (id: string) => {
    try {
      const blob = await dashboardService.gerarPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Erro ao gerar PDF:', err);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const handleExcluir = async (dashboard: Dashboard) => {
    setDashboardParaExcluir(dashboard);
  };

  const confirmarExclusao = async () => {
    if (!dashboardParaExcluir) return;

    try {
      await dashboardService.excluir(dashboardParaExcluir._id);
      await fetchDashboards();
      setDashboardParaExcluir(null);
    } catch (err: any) {
      console.error('Erro ao excluir dashboard:', err);
      alert('Erro ao excluir dashboard. Tente novamente.');
    }
  };

  return (
    <PrivateLayout>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Histórico de Investimentos</h1>
              <p className="text-gray-600 mt-1">
                {dashboards.length === 0
                  ? 'Comece a investir agora!'
                  : `Total de ${dashboards.length} investimento${dashboards.length === 1 ? '' : 's'}`}
              </p>
            </div>
            <button
              onClick={() => router.push('/newinvestment')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition flex items-center gap-2"
            >
              <span>Novo Investimento</span>
            </button>
          </div>

          {/* Componente de Informações sobre Investimentos */}
          <div className="mb-6">
            <button
              onClick={() => setShowInvestmentInfo(!showInvestmentInfo)}
              className="w-full bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaInfoCircle className="text-emerald-600 text-xl" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Dicas sobre Investimentos</h3>
                    <p className="text-sm text-gray-600">Aprenda conceitos básicos para investir com segurança</p>
                  </div>
                </div>
                {showInvestmentInfo ? (
                  <FaChevronUp className="text-emerald-600" />
                ) : (
                  <FaChevronDown className="text-emerald-600" />
                )}
              </div>
            </button>

            {showInvestmentInfo && (
              <div className="mt-4 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Conceitos Básicos */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      Conceitos Básicos
                    </h4>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div>
                        <strong>Rentabilidade:</strong> Percentual de retorno sobre o valor investido.
                      </div>
                      <div>
                        <strong>Liquidez:</strong> Facilidade de converter o investimento em dinheiro.
                      </div>
                      <div>
                        <strong>Risco:</strong> Possibilidade de perda do capital investido.
                      </div>
                      <div>
                        <strong>Diversificação:</strong> Distribuir investimentos para reduzir riscos.
                      </div>
                    </div>
                  </div>

                  {/* Tipos de Investimento */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Tipos de Investimento
                    </h4>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div>
                        <strong>Renda Fixa:</strong> Retorno previsível, menor risco (CDB, LCI, LCA).
                      </div>
                      <div>
                        <strong>Renda Variável:</strong> Retorno variável, maior risco (ações, FIIs).
                      </div>
                      <div>
                        <strong>Fundos:</strong> Investimento coletivo gerenciado por especialistas.
                      </div>
                      <div>
                        <strong>Previdência:</strong> Planejamento para aposentadoria.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dicas de Segurança */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Dicas de Segurança
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <strong className="text-orange-700">💰 Invista o que pode perder</strong>
                      <p className="mt-1">Nunca invista dinheiro essencial para suas necessidades básicas.</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <strong className="text-blue-700">📊 Diversifique</strong>
                      <p className="mt-1">Não coloque todos os ovos na mesma cesta. Espalhe seus investimentos.</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <strong className="text-green-700">⏰ Pense no longo prazo</strong>
                      <p className="mt-1">Investimentos de qualidade geram resultados ao longo do tempo.</p>
                    </div>
                  </div>
                </div>

                {/* Aviso Legal */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 text-center">
                    <strong>⚠️ Aviso:</strong> Esta plataforma é educacional. Consulte um profissional de investimentos
                    antes de tomar decisões financeiras. Rentabilidades passadas não garantem resultados futuros.
                  </p>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : erro ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
              {erro}
            </div>
          ) : dashboards.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum investimento encontrado</h3>
              <p className="text-gray-600 mb-4">
                Comece sua jornada de investimentos criando seu primeiro investimento.
              </p>
              <button
                onClick={() => router.push('/newinvestment')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Criar Primeiro Investimento
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dashboards.map((dashboard) => {
                const risco = dashboard.investimentos?.find(
                  (inv: { tipo: string; risco: number }) => inv.tipo === dashboard.tipo_investimento
                )?.risco || 0;
                const borderColor = getBorderColorByRisk(risco);
                return (
                  <div
                    key={dashboard._id}
                    className={`relative p-6 rounded-xl shadow-sm hover:shadow-md transition group bg-white border-2 ${borderColor}`}
                  >
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/${dashboard._id}`);
                        }}
                        className="text-gray-400 hover:text-emerald-600 transition"
                        title="Ver detalhes"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGerarPdf(dashboard._id);
                        }}
                        className="text-gray-400 hover:text-emerald-600 transition"
                        title="Gerar PDF"
                      >
                        <FaFilePdf size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExcluir(dashboard);
                        }}
                        className="text-gray-400 hover:text-red-600 transition"
                        title="Excluir"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>

                    <div
                      onClick={() => router.push(`/dashboard/${dashboard._id}`)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        {dashboard.logoBase64 ? (
                          <img
                            src={dashboard.logoBase64}
                            alt={`Logo ${dashboard.nome_banco}`}
                            className="w-8 h-8 rounded-full object-contain"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-500">
                              {dashboard.nome_banco?.charAt(0)?.toUpperCase() || 'B'}
                            </span>
                          </div>
                        )}
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-1">
                          {dashboard.nome_banco || 'Banco não informado'}
                          {risco >= 4 && (
                            <FaExclamationTriangle className="text-red-500" title="Risco elevado! Este investimento pode apresentar grande variação de valor." />
                          )}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full">
                          {dashboard.tipo_investimento || 'Tipo não informado'}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Valor Investido</p>
                          <p className="text-2xl font-bold text-emerald-600">
                            {formatarMoeda(dashboard.valor_investido)}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-gray-500">Rendimento</p>
                            <p className="text-lg font-semibold text-emerald-600">
                              {formatarPorcentagem(dashboard.rendimento?.rentabilidade_anualizada)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Valor Rendido</p>
                            <p className="text-lg font-semibold text-emerald-600">
                              {formatarMoeda(calcularValorRendido(dashboard))}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Dialog
          open={!!dashboardParaExcluir}
          onClose={() => setDashboardParaExcluir(null)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                Confirmar Exclusão
              </Dialog.Title>

              <p className="text-gray-600 mb-6">
                Tem certeza que deseja excluir o investimento em {dashboardParaExcluir?.nome_banco || 'banco não informado'}?
                Esta ação não pode ser desfeita.
              </p>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDashboardParaExcluir(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarExclusao}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>

      {/* Notificação de email copiado */}
      {showNotification && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 notification-slide">
          Email copiado com sucesso!
        </div>
      )}
    </PrivateLayout>
  );
}
