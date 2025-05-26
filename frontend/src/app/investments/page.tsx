'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { Investimento } from '@/types';
import { authService } from '@/services/authService';
import api from '@/lib/api';

export default function InvestmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const fetchInvestimentos = async () => {
      if (!user?.id) {
        router.push('/login');
        return;
      }

      try {
        const response = await api.get<Investimento[]>('/investimentos/usuario');
        setInvestimentos(response.data);
      } catch (err: any) {
        console.error('Erro ao buscar investimentos:', err);
        setErro(err?.response?.data?.message || 'Erro ao carregar investimentos.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvestimentos();
  }, [user, router]);

  const handleDeleteInvestimento = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este investimento?')) {
      return;
    }

    try {
      await api.delete(`/investimentos/${id}`);
      setInvestimentos(prev => prev.filter(inv => inv.id !== id));
    } catch (err: any) {
      console.error('Erro ao excluir investimento:', err);
      alert(err?.response?.data?.message || 'Erro ao excluir investimento.');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-800">
      <main className="flex-grow px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Seus Investimentos</h1>
              <p className="text-gray-600 mt-1">
                {investimentos.length === 0
                  ? 'Comece a investir agora!'
                  : `Total de ${investimentos.length} investimento${investimentos.length === 1 ? '' : 's'}`}
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
          ) : investimentos.length === 0 ? (
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
              {investimentos.map((inv) => (
                <div
                  key={inv.id}
                  className="relative bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition group"
                >
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/newinvestment?id=${inv.id}`);
                      }}
                      className="text-gray-400 hover:text-emerald-600 transition"
                      title="Editar"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteInvestimento(inv.id);
                      }}
                      className="text-gray-400 hover:text-red-600 transition"
                      title="Excluir"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>

                  <div
                    onClick={() => router.push(`/investment/${inv.id}`)}
                    className="cursor-pointer"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{inv.titulo}</h3>
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-emerald-600">
                        R$ {Number(inv.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <div className="text-sm text-gray-500">
                        <p>Banco: {inv.banco}</p>
                        <p>Rendimento: {inv.rendimento}%</p>
                        <p>Tipo: {inv.tipo}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

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
  );
}
