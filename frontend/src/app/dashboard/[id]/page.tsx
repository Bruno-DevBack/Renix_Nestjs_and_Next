'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateLayout } from '@/components/PrivateLayout';
import { dashboardService } from '@/services/dashboardService';
import { Dashboard } from '@/types';
import { PhoneIcon } from '@heroicons/react/24/outline';

export default function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const resolvedParams = React.use(params);
  const [showSobreModal, setShowSobreModal] = useState(false);
  const [showContatoModal, setShowContatoModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

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

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (authLoading) {
          return;
        }

        if (!usuario?.id) {
          setErro('Usuário não autenticado');
          setLoading(false);
          router.push('/login');
          return;
        }

        if (!resolvedParams.id) {
          setErro('ID do dashboard não fornecido');
          setLoading(false);
          return;
        }

        const dashboardEncontrado = await dashboardService.buscarPorId(resolvedParams.id);
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
  }, [usuario, resolvedParams.id, authLoading, router]);

  const handleGerarPdf = async () => {
    if (!dashboard) return;

    try {
      const blob = await dashboardService.gerarPDF(resolvedParams.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${resolvedParams.id}.pdf`;
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
    { nome: 'Valor Investido', valor: dashboard?.valor_investido || 0 },
    { nome: 'Rendimento Bruto', valor: dashboard?.rendimento?.valor_bruto || 0 },
    {
      nome: 'Impostos e Taxas', valor: (dashboard?.rendimento?.imposto_renda || 0) +
        (dashboard?.rendimento?.iof || 0) +
        (dashboard?.rendimento?.outras_taxas || 0)
    },
    { nome: 'Valor Líquido', valor: dashboard?.rendimento?.valor_liquido || 0 }
  ];

  const formatarMoeda = (valor: number = 0) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatarPorcentagem = (valor: number = 0) => {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + '%';
  };

  const obterNivelRisco = (risco: number) => {
    switch (risco) {
      case 1: return 'Muito Baixo';
      case 2: return 'Baixo';
      case 3: return 'Médio';
      case 4: return 'Alto';
      case 5: return 'Muito Alto';
      default: return 'Não definido';
    }
  };

  const obterNivelLiquidez = (liquidez: number) => {
    switch (liquidez) {
      case 1: return 'Diária';
      case 2: return 'Semanal';
      case 3: return 'Mensal';
      case 4: return 'Anual';
      case 5: return 'No vencimento';
      default: return 'Não definido';
    }
  };

  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50">
        {/* Cabeçalho */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Investimento</h1>
              <p className="text-lg text-gray-600 flex items-center gap-2">
                <span className="font-medium">{dashboard?.nome_banco}</span>
                <span className="text-gray-400">•</span>
                <span>{dashboard?.tipo_investimento}</span>
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleGerarPdf}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                Gerar PDF
              </button>
              <button
                onClick={() => router.push('/investments')}
                className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg shadow-sm border border-gray-200 transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>

        {/* Cards Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Valor Investido</h3>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatarMoeda(dashboard?.valor_investido)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Rendimento Anual</h3>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatarPorcentagem(dashboard?.rendimento?.rentabilidade_anualizada)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Valor Rendido</h3>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatarMoeda(dashboard?.rendimento?.valor_rendido)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Valor Atual</h3>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatarMoeda(dashboard?.valor_atual)}
            </p>
          </div>
        </div>

        {/* Gráfico e Detalhes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Composição do Investimento</h3>
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
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {dadosGrafico.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatarMoeda(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detalhes do Investimento */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Detalhes do Investimento</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Data de Início</p>
                  <p className="text-base font-medium text-gray-900">
                    {new Date(dashboard?.data_inicio).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Data de Vencimento</p>
                  <p className="text-base font-medium text-gray-900">
                    {new Date(dashboard?.data_fim).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Dias Corridos</p>
                  <p className="text-base font-medium text-gray-900">{dashboard?.dias_corridos} dias</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Taxa SELIC</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatarPorcentagem(dashboard?.indicadores_mercado?.selic)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Taxa CDI</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatarPorcentagem(dashboard?.indicadores_mercado?.cdi)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">IPCA</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatarPorcentagem(dashboard?.indicadores_mercado?.ipca)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rendimentos */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Detalhamento dos Rendimentos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Valor Bruto</p>
              <p className="text-base font-medium text-gray-900">
                {formatarMoeda(dashboard?.rendimento?.valor_bruto)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Imposto de Renda</p>
              <p className="text-base font-medium text-gray-900">
                {formatarMoeda(dashboard?.rendimento?.imposto_renda)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">IOF</p>
              <p className="text-base font-medium text-gray-900">
                {formatarMoeda(dashboard?.rendimento?.iof)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Outras Taxas</p>
              <p className="text-base font-medium text-gray-900">
                {formatarMoeda(dashboard?.rendimento?.outras_taxas)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Valor Líquido</p>
              <p className="text-base font-medium text-gray-900">
                {formatarMoeda(dashboard?.rendimento?.valor_liquido)}
              </p>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {dashboard?.alertas && dashboard.alertas.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Alertas
            </h3>
            <ul className="space-y-2">
              {dashboard.alertas.map((alerta, index) => (
                <li key={index} className="text-yellow-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  {alerta}
                </li>
              ))}
            </ul>
          </div>
        )}
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