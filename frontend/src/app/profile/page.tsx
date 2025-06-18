'use client'

import Link from 'next/link';
import { useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { PhoneIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { usuario, signOut } = useAuth();
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

  if (!usuario) {
    return null;
  }

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-800">
        {/* Notificação de email copiado */}
        {showNotification && (
          <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 notification-slide">
            Email copiado com sucesso!
          </div>
        )}

        {/* Perfil */}
        <main className="flex-1 flex items-center justify-center py-10 px-4 bg-gray-50">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6 flex flex-col items-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border border-gray-300">
              <img
                src={usuario.fotoPerfilBase64 || "/avatar.png"}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/avatar.png";
                  target.onerror = null;
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
      </div>
    </AuthGuard>
  );
}