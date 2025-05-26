'use client'

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import api from '@/lib/api';
import { Usuario } from '@/types';

export default function ProfileEditPage() {
    const { user, setUser } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState<Partial<Usuario>>({});
    const [mensagem, setMensagem] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [fotoError, setFotoError] = useState('');

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        setFormData({
            nome_usuario: user.nome_usuario,
            email_usuario: user.email_usuario
        });
        setPreview(user.fotoPerfilBase64 || null);
    }, [user, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        setMensagem('');
        setLoading(true);

        try {
            const updatedUser = await authService.updateProfile(formData);
            setUser(updatedUser);
            setMensagem('Perfil atualizado com sucesso!');
            setTimeout(() => router.push('/profile'), 1500);
        } catch (err: any) {
            console.error('Erro ao atualizar usuário:', err);
            if (err.response?.status === 409) {
                setMensagem('Este email já está em uso.');
            } else {
                setMensagem(err.response?.data?.message || 'Erro ao atualizar perfil.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setFotoError('');
        setMensagem('');
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;

        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            setFotoError('Formato inválido. Use JPG ou PNG.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setFotoError('Arquivo muito grande (máx. 5MB).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            setPreview(ev.target?.result as string);
        };
        reader.readAsDataURL(file);

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const updatedUser = await authService.updateProfilePhoto(formData);
            setUser(updatedUser);
            setMensagem('Foto atualizada com sucesso!');
        } catch (err: any) {
            if (err.response?.status === 413) setFotoError('Arquivo muito grande.');
            else if (err.response?.status === 415) setFotoError('Formato de arquivo inválido.');
            else setFotoError('Erro ao fazer upload da foto.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoverFoto = async () => {
        if (!user?.id || !window.confirm('Tem certeza que deseja remover sua foto de perfil?')) return;

        setRemoving(true);
        setFotoError('');
        setMensagem('');

        try {
            const updatedUser = await authService.removeProfilePhoto();
            setUser(updatedUser);
            setPreview(null);
            setMensagem('Foto removida com sucesso!');
        } catch (err: any) {
            setFotoError('Erro ao remover foto.');
        } finally {
            setRemoving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                {/* Cabeçalho */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/profile')}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Voltar para perfil
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-8">Editar Perfil</h1>

                    {/* Seção da Foto */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="relative group">
                            <div
                                className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer transition-transform duration-300 transform group-hover:scale-105"
                                onClick={handleFotoClick}
                            >
                                <img
                                    src={preview || '/avatar.png'}
                                    alt="Foto de perfil"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                    <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/jpeg,image/png"
                                onChange={handleFotoChange}
                                disabled={uploading || removing}
                            />
                        </div>

                        {preview && (
                            <button
                                onClick={handleRemoverFoto}
                                className="mt-4 text-sm text-red-600 hover:text-red-800 transition-colors"
                                disabled={removing || uploading}
                            >
                                Remover foto
                            </button>
                        )}

                        {(fotoError || uploading || removing) && (
                            <p className={`mt-2 text-sm ${fotoError ? 'text-red-600' : 'text-gray-600'}`}>
                                {fotoError || (uploading ? 'Enviando foto...' : 'Removendo foto...')}
                            </p>
                        )}
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome completo
                                </label>
                                <input
                                    type="text"
                                    id="nome"
                                    name="nome_usuario"
                                    value={formData.nome_usuario || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-shadow"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    E-mail
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email_usuario"
                                    value={formData.email_usuario || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-shadow"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {mensagem && (
                            <div className={`p-4 rounded-lg ${mensagem.includes('sucesso')
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {mensagem}
                            </div>
                        )}

                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                disabled={loading}
                            >
                                <Save size={20} />
                                {loading ? 'Salvando...' : 'Salvar alterações'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-16 bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <p className="text-gray-500 text-sm">
                            © 2025 <a href="/" className="hover:text-emerald-600 transition-colors">Renix™</a>.
                            Todos os direitos reservados.
                        </p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <a href="/sobre" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">
                                Sobre
                            </a>
                            <a href="/contato" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">
                                Contato
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
