'use client';
import './globals.css';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';  // Importa o X

function Navbar() {
  const { usuario, signOut } = useAuth();
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  if (['/login', '/register', '/'].includes(pathname)) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMenuAberto(true)}
          className="text-xl font-bold md:hidden"
          aria-label="Abrir menu"
        >
          <FiMenu size={24} />
        </button>
        <img src="/logo.png" alt="Logo" className="w-10 h-10" />
        <Link href="/investments" className="text-xl text-black font-bold mr-10">
          RENIX
        </Link>
      </div>

      {/* Direita: usuário */}
      <div className="flex items-center gap-3">
        <span className="text-md hidden sm:block">
          {usuario?.nome_usuario || 'Olá, Usuário'}
        </span>


        <Link href="/profile" passHref>
          <img
            src={usuario?.fotoPerfilBase64 || '/avatar.png'}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover cursor-pointer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/avatar.png';
            }}
          />
        </Link>

      </div>

      {/* Menu lateral */}
      {menuAberto && (
        <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-6 z-50">
          {/* Botão fechar com ícone X */}
          <button
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu"
            className="mb-6 text-2xl font-bold"
          >
            <FiX />
          </button>

          <ul className="space-y-4">
            <li>
              <Link href="/investments" onClick={() => setMenuAberto(false)} className="hover:text-blue-600">
                Investimentos
              </Link>
            </li>
            <li>
              {/* Para sair, chamar signOut e fechar menu */}
              <button
                onClick={() => {
                  signOut();
                  setMenuAberto(false);
                }}
                className="text-red-600 hover:text-red-800"
              >
                Sair
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
