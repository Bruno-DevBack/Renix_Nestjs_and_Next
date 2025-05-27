'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateLayout } from '@/components/PrivateLayout';
import { dashboardService } from '@/services/dashboardService';
import { Dashboard } from '@/types';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { usuario } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!usuario?.id || !params.id) {
        setErro('Usuário não autenticado ou ID do dashboard não fornecido');
        setLoading(false);
        return;
      }

      try {
        const dashboardEncontrado = await dashboardService.buscarPorId(params.id);
        if (!dashboardEncontrado) {
          setErro('Dashboard não encontrado');
          return;
        }
        setDashboard(dashboardEncontrado);
      } catch (err: any) {
        console.error('Erro ao buscar dashboard:', err);
        setErro(err?.message || 'Erro ao carregar dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [usuario, params.id]);

  const handleGerarPdf = async () => {
    if (!dashboard) return;

    try {
      const blob = await dashboardService.gerarPDF(dashboard.investimento_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${dashboard.investimento_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Erro ao gerar PDF:', err);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <PrivateLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </PrivateLayout>
    );
  }

  if (erro || !dashboard) {
    return (
      <PrivateLayout>
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {erro || 'Dashboard não encontrado'}
        </div>
      </PrivateLayout>
    );
  }

  const CORES = ['#047857', '#059669', '#10B981', '#34D399'];

  const dadosGrafico = [
    { nome: 'Valor Investido', valor: dashboard.valor_investido },
    { nome: 'Rendimento Bruto', valor: dashboard.rendimento.valor_bruto },
    { nome: 'Impostos', valor: dashboard.rendimento.imposto_renda + dashboard.rendimento.iof },
    { nome: 'Valor Líquido', valor: dashboard.rendimento.valor_liquido }
  ];

  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{dashboard.nome_banco}</h1>
            <p className="text-gray-600">{dashboard.tipo_investimento}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleGerarPdf}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md shadow-sm"
            >
              Gerar PDF
            </button>
            <button
              onClick={() => router.push('/investments')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
            >
              Voltar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Valor Investido</h3>
            <p className="text-2xl font-bold text-emerald-600">
              R$ {dashboard.valor_investido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Rendimento Anual</h3>
            <p className="text-2xl font-bold text-emerald-600">
              {dashboard.rendimento.rentabilidade_anualizada.toFixed(2)}%
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Valor Rendido</h3>
            <p className="text-2xl font-bold text-emerald-600">
              R$ {dashboard.rendimento.valor_rendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Valor Atual</h3>
            <p className="text-2xl font-bold text-emerald-600">
              R$ {dashboard.valor_atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Composição do Investimento</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosGrafico}
                    dataKey="valor"
                    nameKey="nome"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {dadosGrafico.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Indicadores de Mercado</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-500">CDI</span>
                  <span className="text-sm font-medium text-emerald-600">
                    {dashboard.indicadores_mercado.cdi.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, (dashboard.rendimento.rentabilidade_anualizada / dashboard.indicadores_mercado.cdi) * 100)}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-500">SELIC</span>
                  <span className="text-sm font-medium text-emerald-600">
                    {dashboard.indicadores_mercado.selic.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, (dashboard.rendimento.rentabilidade_anualizada / dashboard.indicadores_mercado.selic) * 100)}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-500">IPCA</span>
                  <span className="text-sm font-medium text-emerald-600">
                    {dashboard.indicadores_mercado.ipca.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, (dashboard.rendimento.rentabilidade_anualizada / dashboard.indicadores_mercado.ipca) * 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhes do Investimento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Data de Início</h4>
              <p className="text-lg text-gray-900">
                {new Date(dashboard.data_inicio).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Data de Vencimento</h4>
              <p className="text-lg text-gray-900">
                {new Date(dashboard.data_fim).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Dias Corridos</h4>
              <p className="text-lg text-gray-900">{dashboard.dias_corridos} dias</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Imposto de Renda</h4>
              <p className="text-lg text-gray-900">
                R$ {dashboard.rendimento.imposto_renda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">IOF</h4>
              <p className="text-lg text-gray-900">
                R$ {dashboard.rendimento.iof.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Outras Taxas</h4>
              <p className="text-lg text-gray-900">
                R$ {dashboard.rendimento.outras_taxas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
} 