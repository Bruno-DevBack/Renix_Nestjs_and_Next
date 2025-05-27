'use client'

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { authService } from '@/services/authService';
import { Usuario } from '@/types';

export default function ProfileEditPage() {
  const { usuario, updateUserData, updateProfilePhoto } = useAuth();
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);
  const [user, setUser] = useState<Usuario | null>(null);
  const [mensagem, setMensagem] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [fotoError, setFotoError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usuario) {
      setUser(usuario);
      setPreview(usuario.fotoPerfilBase64 || null);
    }
  }, [usuario]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setUser((prev) => prev ? { ...prev, [name]: value } : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    // Verifica se houve alterações nos dados
    if (
      user.nome_usuario === usuario?.nome_usuario &&
      user.email_usuario === usuario?.email_usuario
    ) {
      router.push('/profile');
      return;
    }

    setMensagem('');
    setLoading(true);

    try {
      await updateUserData({
        nome_usuario: user.nome_usuario,
        email_usuario: user.email_usuario,
      });

      setMensagem('Dados atualizados com sucesso!');
      // Aguarda um momento para mostrar a mensagem de sucesso antes de redirecionar
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err: any) {
      console.error('Erro ao atualizar dados:', err);
      
      if (err.response?.status === 409) {
        setMensagem('Este e-mail já está em uso por outro usuário.');
      } else if (err.response?.status === 401) {
        setMensagem('Sua sessão expirou. Por favor, faça login novamente.');
        setTimeout(() => {
          authService.logout();
          router.push('/login');
        }, 2000);
      } else {
        setMensagem(err.message || 'Erro ao atualizar dados. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFotoError('');
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validação do arquivo
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setFotoError('Formato inválido. Use apenas JPG ou PNG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFotoError('Arquivo muito grande. Tamanho máximo: 5MB.');
      return;
    }

    // Preview da imagem
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload da foto
    setUploading(true);
    setMensagem('');
    try {
      const updatedUser = await updateProfilePhoto(file);
      setUser(updatedUser);
      setMensagem('Foto atualizada com sucesso!');
      
      // Atualiza o preview com a nova foto
      if (updatedUser.fotoPerfilBase64) {
        setPreview(updatedUser.fotoPerfilBase64);
      }
    } catch (err: any) {
      console.error('Erro ao fazer upload da foto:', err);
      
      if (err.response?.status === 413) {
        setFotoError('Arquivo muito grande. Tamanho máximo: 5MB.');
      } else if (err.response?.status === 415) {
        setFotoError('Formato inválido. Use apenas JPG ou PNG.');
      } else if (err.response?.status === 401) {
        setFotoError('Não autorizado. Por favor, faça login novamente.');
        router.push('/login');
      } else {
        setFotoError(err.response?.data?.message || 'Erro ao fazer upload da foto. Tente novamente.');
      }
      // Restaura o preview anterior em caso de erro
      setPreview(usuario?.fotoPerfilBase64 || null);
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoverFoto() {
    if (!window.confirm('Remover foto de perfil?')) return;
    setRemoving(true);
    setFotoError('');
    try {
      const updatedUser = await authService.removeProfilePhoto();
      setUser(updatedUser);
      setPreview(null);
      setMensagem('Foto removida com sucesso!');
    } catch (err: any) {
      console.error('Erro ao remover foto:', err);
      if (err.response?.status === 404) {
        setFotoError('Usuário não encontrado.');
      } else if (err.response?.status === 401) {
        setFotoError('Não autorizado. Por favor, faça login novamente.');
        router.push('/login');
      } else {
        setFotoError('Erro ao remover foto.');
      }
    } finally {
      setRemoving(false);
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
            {/* Foto de perfil */}
            <div className="relative flex flex-col items-center mb-2">
              <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border border-gray-300 flex items-center justify-center group transition-all">
                {preview ? (
                  <img
                    src={preview}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover rounded-full group-hover:opacity-80 transition-all"
                    onError={e => { (e.target as HTMLImageElement).src = '/avatar.png'; }}
                  />
                ) : (
                  <img src="/avatar.png" alt="Avatar" className="w-16 h-16 object-cover rounded-full opacity-60" />
                )}
                <button
                  type="button"
                  className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow hover:bg-gray-200 transition-all border border-gray-300"
                  onClick={() => fileInputRef.current?.click()}
                  title="Alterar foto"
                  disabled={uploading || removing}
                >
                  <Camera size={20} className="text-gray-700" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  className="hidden"
                  onChange={handleFotoChange}
                  disabled={uploading || removing}
                />
              </div>
              {preview && (
                <button
                  type="button"
                  className="mt-2 text-xs text-red-600 hover:underline disabled:opacity-60"
                  onClick={handleRemoverFoto}
                  disabled={removing || uploading}
                >
                  {removing ? 'Removendo...' : 'Remover foto'}
                </button>
              )}
              {fotoError && <div className="text-xs text-red-600 mt-1">{fotoError}</div>}
              {uploading && <div className="text-xs text-gray-500 mt-1">Enviando foto...</div>}
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
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[#028264] text-white rounded-xl hover:bg-[#026953] focus:outline-none focus:ring-2 focus:ring-[#028264] disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </main>

        {/* Rodapé */}
        <footer className="bg-white mt-12 shadow-sm">
          <div className="max-w-screen-xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
            <span>© 2025 <a href="/" className="hover:underline">Renix™</a>. Todos os direitos reservados.</span>
            <div className="flex gap-4 mt-2 md:mt-0">
              <a href="/" className="hover:underline">Sobre</a>
              <a href="/" className="hover:underline">Contato</a>
            </div>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
