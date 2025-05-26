"use client";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.css";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

function Sidebar({ menuAberto, setMenuAberto }: { menuAberto: boolean; setMenuAberto: (v: boolean) => void }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 p-6 z-40 transform transition-transform duration-300 ${menuAberto ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <button onClick={() => setMenuAberto(false)} className="mb-6 text-gray-600 font-bold text-xl">
        <X size={24} />
      </button>
      <ul className="space-y-4 text-lg">
        <li>
          <button onClick={() => router.push('/investments')} className="hover:text-emerald-600 w-full text-left">
            Página Inicial
          </button>
        </li>
        <li>
          <button onClick={() => router.push('/profile')} className="hover:text-emerald-600 w-full text-left">
            Meu Perfil
          </button>
        </li>
        <li>
          <button onClick={async () => { signOut(); router.push('/login'); }} className="hover:text-red-600 w-full text-left">
            Sair
          </button>
        </li>
      </ul>
    </div>
  );
}

function NavbarSession({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !user) return null;

  return (
    <nav className="bg-white shadow-sm px-6 py-3 flex justify-between items-center border-b border-gray-200">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="text-xl font-bold mr-2">
          <span className="sr-only">Abrir menu</span>
          <Menu size={24} />
        </button>
        <img src="/logo.png" alt="Logo" className="w-8 h-8" />
        <span className="text-lg text-black font-bold">RENIX</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">{user.nome_usuario}</span>
        <Link href="/profile">
          <img
            src={user.fotoPerfilBase64 ? user.fotoPerfilBase64 : "/avatar.png"}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
        </Link>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [menuAberto, setMenuAberto] = useState(false);
  const pathname = usePathname();
  const hideNavbar = pathname === '/login' || pathname === '/cadastro';
  const hideSidebar = pathname === '/login' || pathname === '/cadastro';

  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {!hideSidebar && <Sidebar menuAberto={menuAberto} setMenuAberto={setMenuAberto} />}
          {!hideNavbar && <NavbarSession onMenuClick={() => setMenuAberto(true)} />}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
