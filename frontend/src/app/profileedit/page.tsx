'use client'

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { authService } from '@/services/authService';
import { Usuario } from '@/types';
import { FiCamera, FiX } from 'react-icons/fi';

export default function ProfileEditPage() {
  const { usuario, updateProfileWithPhoto } = useAuth();
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);
  const [user, setUser] = useState<Usuario | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (usuario) {
      setUser(usuario);
      setPreviewUrl(usuario.fotoPerfilBase64 || null);
    }
  }, [usuario]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setUser((prev) => prev ? { ...prev, [name]: value } : null);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = async () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setMensagem('Foto marcada para remoção. Clique em Salvar.');
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setMensagem('');
    setLoading(true);

    try {
      const updatedUser = await updateProfileWithPhoto({
        nome_usuario: user.nome_usuario,
        email_usuario: user.email_usuario,
        fotoPerfilBase64: previewUrl
      }, selectedFile);

      setMensagem('Perfil atualizado com sucesso!');
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      
      if (err.response?.status === 409) {
        setMensagem('Este e-mail já está em uso por outro usuário.');
      } else if (err.response?.status === 401) {
        setMensagem('Sua sessão expirou. Por favor, faça login novamente.');
        setTimeout(() => {
          authService.logout();
          router.push('/login');
        }, 2000);
      } else {
        setMensagem(err.message || 'Erro ao atualizar perfil. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (!usuario) {
    return null;
  }

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-800">
        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 p-6 z-40 transform transition-transform duration-300 ${menuAberto ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <button onClick={() => setMenuAberto(false)} className="mb-6 text-gray-600 font-bold text-xl">
            ✕
          </button>
          <ul className="space-y-4 text-lg">
            <li>
              <button onClick={() => router.push('/investments')} className="hover:text-blue-600">Página Inicial</button>
            </li>
          </ul>
        </div>

        {/* Perfil */}
        <main className="flex-1 flex items-center justify-center py-10 px-4 bg-gray-50">
          <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6 flex flex-col items-center space-y-6">
            {/* Área da foto de perfil */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border border-gray-300">
                <img
                  src={previewUrl || "/avatar.png"}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/avatar.png";
                  }}
                />
              </div>
              
              {/* Botões de ação da foto */}
              <div className="absolute bottom-0 right-0 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-[#028264] text-white rounded-full hover:bg-[#026953] transition-colors"
                >
                  <FiCamera size={16} />
                </button>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <h2 className="text-xl font-semibold text-gray-900">{user?.nome_usuario || 'Nome do Usuário'}</h2>

            <div className="w-full space-y-4 text-sm">
              <div>
                <label htmlFor="nome_usuario" className="text-gray-600 font-medium block mb-1">Nome completo</label>
                <input
                  id="nome_usuario"
                  name="nome_usuario"
                  type="text"
                  value={user?.nome_usuario || ''}
                  onChange={handleChange}
                  className="w-full bg-gray-100 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#028264]"
                />
              </div>
              <div>
                <label htmlFor="email_usuario" className="text-gray-600 font-medium block mb-1">E-mail</label>
                <input
                  id="email_usuario"
                  name="email_usuario"
                  type="email"
                  value={user?.email_usuario || ''}
                  onChange={handleChange}
                  className="w-full bg-gray-100 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#028264]"
                />
              </div>
            </div>

            {mensagem && (
              <div className={`text-sm ${mensagem.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
                {mensagem}
              </div>
            )}

            <div className="flex gap-4 w-full">
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 bg-[#028264] text-white rounded-xl hover:bg-[#0e7a63] transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </AuthGuard>
  );
}
