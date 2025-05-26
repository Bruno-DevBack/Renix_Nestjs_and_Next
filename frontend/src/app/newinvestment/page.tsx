'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CreateInvestimentoDto, Investimento } from '@/types';
import api from '@/lib/api';

export default function NewInvestmentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const investimentoId = searchParams.get('id');

    const [menuAberto, setMenuAberto] = useState(false);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [bancos, setBancos] = useState<string[]>([]);
    const [formData, setFormData] = useState<CreateInvestimentoDto>({
        titulo: '',
        valor: 0,
        tipo: 'CDB',
        banco: '',
        data_inicio: new Date().toISOString().split('T')[0],
        data_vencimento: ''
    });

    useEffect(() => {
        const fetchBancos = async () => {
            try {
                const response = await api.get<{ nome: string }[]>('/bancos');
                setBancos(response.data.map(banco => banco.nome));
            } catch (err) {
                console.error('Erro ao buscar bancos:', err);
                setErro('Erro ao carregar lista de bancos.');
            }
        };

        const fetchInvestimento = async () => {
            if (!investimentoId) return;

            try {
                setLoading(true);
                const response = await api.get<Investimento>(`/investimentos/${investimentoId}`);
                const investimento = response.data;
                setFormData({
                    titulo: investimento.titulo,
                    valor: investimento.valor,
                    tipo: investimento.tipo,
                    banco: investimento.banco,
                    data_inicio: investimento.data_inicio.split('T')[0],
                    data_vencimento: investimento.data_vencimento.split('T')[0]
                });
            } catch (err: any) {
                console.error('Erro ao buscar investimento:', err);
                setErro(err?.response?.data?.message || 'Erro ao carregar investimento.');
            } finally {
                setLoading(false);
            }
        };

        fetchBancos();
        fetchInvestimento();
    }, [investimentoId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');
        setLoading(true);

        try {
            if (investimentoId) {
                await api.patch(`/investimentos/${investimentoId}`, formData);
            } else {
                await api.post('/investimentos', formData);
            }
            router.push('/investments');
        } catch (err: any) {
            console.error('Erro ao salvar investimento:', err);
            setErro(err?.response?.data?.message || 'Erro ao salvar investimento.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'valor' ? Number(value) : value
        }));
    };

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 p-6 z-40 transform transition-transform duration-300 ${menuAberto ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <button onClick={() => setMenuAberto(false)} className="mb-6 text-gray-600">
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
                        <h1 className="text-2xl font-bold text-gray-900">
                            {investimentoId ? 'Editar Investimento' : 'Novo Investimento'}
                        </h1>
                        <button
                            onClick={() => setMenuAberto(true)}
                            className="md:hidden text-gray-600"
                        >
                            <Menu size={25} />
                        </button>
                    </div>
                </header>

                {/* Conteúdo */}
                <main className="flex-1 px-4">
                    <div className="max-w-2xl mx-auto">
                        {erro && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                                {erro}
                            </div>
                        )}

                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Título do Investimento
                                    </label>
                                    <input
                                        type="text"
                                        name="titulo"
                                        value={formData.titulo}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                        placeholder="Ex: CDB Banco X"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Banco
                                    </label>
                                    <select
                                        name="banco"
                                        value={formData.banco}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                        disabled={loading}
                                    >
                                        <option value="">Selecione um banco</option>
                                        {bancos.map(banco => (
                                            <option key={banco} value={banco}>
                                                {banco}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de Investimento
                                    </label>
                                    <select
                                        name="tipo"
                                        value={formData.tipo}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                        disabled={loading}
                                    >
                                        <option value="CDB">CDB</option>
                                        <option value="LCI">LCI</option>
                                        <option value="LCA">LCA</option>
                                        <option value="TESOURO">Tesouro Direto</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valor do Investimento
                                    </label>
                                    <div className="relative mt-1 rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-gray-500 sm:text-sm">R$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="valor"
                                            value={formData.valor}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            className="block w-full rounded-md border-gray-300 pl-10 focus:border-emerald-500 focus:ring-emerald-500"
                                            placeholder="0,00"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Data de Início
                                        </label>
                                        <input
                                            type="date"
                                            name="data_inicio"
                                            value={formData.data_inicio}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Data de Vencimento
                                        </label>
                                        <input
                                            type="date"
                                            name="data_vencimento"
                                            value={formData.data_vencimento}
                                            onChange={handleInputChange}
                                            required
                                            min={formData.data_inicio}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => router.push('/investments')}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={loading}
                                    >
                                        {loading ? 'Salvando...' : investimentoId ? 'Atualizar' : 'Criar'}
                                    </button>
                                </div>
                            </form>
                        </div>
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
        </div>
    );
}
