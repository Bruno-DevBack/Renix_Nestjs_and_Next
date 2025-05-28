'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaEdit, FaFilePdf } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateLayout } from '@/components/PrivateLayout';
import { dashboardService } from '@/services/dashboardService';
import { Dashboard } from '@/types';

export default function InvestmentsPage() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const fetchDashboards = async () => {
      if (!usuario?.id) {
        return;
      }

      try {
        setLoading(true);
        const data = await dashboardService.listarTodos();
        // Garante que data é um array
        setDashboards(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('Erro ao buscar dashboards:', err);
        setErro(err?.message || 'Erro ao carregar dashboards.');
        setDashboards([]); // Garante que dashboards é um array vazio em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchDashboards();
  }, [usuario]);

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
              {dashboards.map((dashboard) => (
                <div
                  key={dashboard.investimento_id}
                  className="relative bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition group"
                >
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/newinvestment?id=${dashboard.investimento_id}`);
                      }}
                      className="text-gray-400 hover:text-emerald-600 transition"
                      title="Editar"
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
                  </div>

                  <div
                    onClick={() => router.push(`/dashboard/${dashboard.investimento_id}`)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{dashboard.nome_banco}</h3>
                      <span className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full">
                        {dashboard.tipo_investimento}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Valor Investido</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          R$ {dashboard.valor_investido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-500">Rendimento</p>
                          <p className="text-lg font-semibold text-emerald-600">
                            {dashboard.rendimento.rentabilidade_anualizada.toFixed(2)}% a.a.
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Valor Rendido</p>
                          <p className="text-lg font-semibold text-emerald-600">
                            R$ {dashboard.rendimento.valor_rendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Início</span>
                          <span className="text-gray-900">{new Date(dashboard.data_inicio).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-500">Vencimento</span>
                          <span className="text-gray-900">{new Date(dashboard.data_fim).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="bg-white shadow-sm mt-auto">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
            <span>© 2025 <a href="/" className="hover:underline">Renix™</a>. Todos os direitos reservados.</span>
            <div className="flex gap-4 mt-2 md:mt-0">
              <a href="/sobre" className="hover:underline">Sobre</a>
              <a href="/contato" className="hover:underline">Contato</a>
            </div>
          </div>
        </footer>
      </div>
    </PrivateLayout>
  );
}
