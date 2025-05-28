'use client'

import Link from 'next/link';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { usuario, signOut } = useAuth();


  if (!usuario) {
    return null;
  }

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-800">
        {/* Perfil */}
        <main className="flex-1 flex items-center justify-center py-10 px-4 bg-gray-50">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6 flex flex-col items-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border border-gray-300">
              <img
                src={usuario?.fotoPerfilBase64 || "/avatar.png"}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/avatar.png";
                  target.onerror = null; // Previne loop infinito
                }}
              />
            </div>

            <h2 className="text-xl font-semibold text-gray-900">{usuario.nome_usuario}</h2>

            <div className="w-full space-y-4 text-sm">
              <div>
                <label className="text-gray-600 font-medium block mb-1">Nome completo</label>
                <div className="w-full bg-gray-100 p-2 rounded-md border border-gray-300">
                  {usuario.nome_usuario}
                </div>
              </div>

              <div>
                <label className="text-gray-600 font-medium block mb-1">E-mail</label>
                <div className="w-full bg-gray-100 p-2 rounded-md border border-gray-300">
                  {usuario.email_usuario}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Link href="/profileedit">
                <button className="bg-[#028264] hover:bg-[#026953] transition-colors text-white font-semibold px-10 py-2 rounded-xl mt-4 shadow-md">
                  EDITAR
                </button>
              </Link>
              <button
                onClick={() => {
                  signOut();
                }}
                className="bg-[#e12f2f] hover:bg-[#cb2b2b] transition-colors text-white font-semibold px-10 py-2 rounded-xl mt-4 shadow-md"
              >
                SAIR
              </button>

            </div>
          </div>
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