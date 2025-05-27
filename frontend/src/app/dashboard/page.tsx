'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useRouter, useSearchParams } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Investimento } from '@/types';
import api from '@/lib/api';

interface DadosGrafico {
  mes: string;
  valor: number;
}

export default function InvestmentPage() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [investimento, setInvestimento] = useState<Investimento | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [dadosGrafico, setDadosGrafico] = useState<DadosGrafico[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const investimentoId = searchParams.get('id');

  useEffect(() => {
    const fetchInvestimento = async () => {
      if (!investimentoId || !user) {
        router.push('/investments');
        return;
      }

      try {
        const response = await api.get<Investimento>(`/investimentos/${investimentoId}`);
        setInvestimento(response.data);

        // Calcula os dados do gráfico baseado no rendimento
        const dataInicio = new Date(response.data.data_inicio);
        const dataVencimento = new Date(response.data.data_vencimento);
        const meses = [];
        let valorAtual = response.data.valor;

        while (dataInicio <= dataVencimento) {
          meses.push({
            mes: dataInicio.toLocaleDateString('pt-BR', { month: 'short' }),
            valor: Number(valorAtual.toFixed(2))
          });
          valorAtual *= (1 + response.data.rendimento / 100);
          dataInicio.setMonth(dataInicio.getMonth() + 1);
        }

        setDadosGrafico(meses);
      } catch (err: any) {
        console.error('Erro ao buscar investimento:', err);
        setErro(err?.response?.data?.message || 'Erro ao carregar investimento.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvestimento();
  }, [investimentoId, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {erro}
        </div>
      </div>
    );
  }

  if (!investimento) {
    return null;
  }

  const valorFinal = dadosGrafico[dadosGrafico.length - 1]?.valor || investimento.valor;
  const impostos = valorFinal * 0.15; // 15% de IR
  const valorLiquido = valorFinal - impostos;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 p-6 z-40 transform transition-transform duration-300 ${menuAberto ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <button onClick={() => setMenuAberto(false)} className="mb-6 text-gray-600 font-bold text-xl">
          <X size={25} />
        </button>
        <ul className="space-y-4 text-lg">
          <li>
            <button onClick={() => router.push('/investments')} className="hover:text-emerald-600">
              Voltar para Investimentos
            </button>
          </li>
        </ul>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 mb-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{investimento.titulo}</h1>
            <button
              onClick={() => setMenuAberto(true)}
              className="md:hidden text-gray-600"
            >
              <Menu size={25} />
            </button>
          </div>
        </header>

        {/* Seção principal */}
        <section className="flex-1 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Rendimento Projetado</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosGrafico} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                    <Line type="monotone" dataKey="valor" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Valor Investido</h3>
                <p className="text-2xl font-bold text-emerald-600">
                  R$ {investimento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Impostos Estimados</h3>
                <p className="text-2xl font-bold text-red-600">
                  R$ {impostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Valor Líquido Estimado</h3>
                <p className="text-2xl font-bold text-emerald-600">
                  R$ {valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Detalhes do Investimento</h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Banco</dt>
                  <dd className="mt-1 text-lg text-gray-900">{investimento.banco}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                  <dd className="mt-1 text-lg text-gray-900">{investimento.tipo}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Data de Início</dt>
                  <dd className="mt-1 text-lg text-gray-900">
                    {new Date(investimento.data_inicio).toLocaleDateString('pt-BR')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Data de Vencimento</dt>
                  <dd className="mt-1 text-lg text-gray-900">
                    {new Date(investimento.data_vencimento).toLocaleDateString('pt-BR')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Rendimento</dt>
                  <dd className="mt-1 text-lg text-gray-900">{investimento.rendimento}% ao mês</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-lg text-gray-900">{investimento.status}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

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
    </div>
  );
}
