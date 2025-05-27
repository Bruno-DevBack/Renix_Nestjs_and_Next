"use client";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.css";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function Navbar() {
  const { usuario, signOut } = useAuth();
  const pathname = usePathname();

  // Não mostra a navbar nas rotas públicas
  if (['/login', '/register', '/'].includes(pathname)) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm px-6 py-3 flex justify-between items-center border-b border-gray-200">
      <div className="flex items-center gap-3">
        <Link href="/investments" className="flex items-center gap-3">
          <img src="/1.png" alt="Logo" className="w-8 h-8" />
          <span className="text-lg text-black font-bold">RENIX</span>
        </Link>
      </div>
      <div className="flex items-center gap-6">
        <Link 
          href="/investments"
          className="text-gray-600 hover:text-emerald-600 transition-colors"
        >
          Investimentos
        </Link>
        {usuario && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">{usuario.nome_usuario}</span>
            <div className="relative group">
              <button className="focus:outline-none">
                <img
                  src={usuario.fotoPerfilBase64 || "/avatar.png"}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/avatar.png";
                  }}
                />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 invisible group-hover:visible z-50">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Perfil
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
