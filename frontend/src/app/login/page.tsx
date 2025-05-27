"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { authService } from '@/services/authService';
import { AuthGuard } from '@/components/AuthGuard';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { signIn } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem("");
    setIsLoading(true);

    if (!email || !senha) {
      setMensagem('Preencha todos os campos!');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setMensagem('Por favor, insira um email válido.');
      setIsLoading(false);
      return;
    }

    if (senha.length < 8) {
      setMensagem('A senha deve ter pelo menos 8 caracteres.');
      setIsLoading(false);
      return;
    }

    try {
      await signIn(email, senha);
      // O redirecionamento é feito automaticamente pelo AuthContext
    } catch (error: any) {
      console.error('Erro no login:', error);
      if (error.response?.status === 400) {
        const mensagem = error.response.data.message;
        if (Array.isArray(mensagem)) {
          setMensagem(mensagem.join('. '));
        } else {
          setMensagem(mensagem || 'Email ou senha incorretos');
        }
      } else {
        setMensagem(error.message || 'Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard>
      <main className="bg-gray-50 min-h-screen flex items-center justify-center">
        <section className="bg-white w-[90%] max-w-[460px] p-8 rounded-2xl shadow-2xl border border-[#e5e5e5]">
          <h2 className="text-gray-900 font-bold text-2xl text-center mb-6 tracking-wide">
            LOGIN
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0e7a63] focus:border-transparent transition duration-150"
                placeholder="Digite seu e-mail"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="senha"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0e7a63] focus:border-transparent transition duration-150"
                  placeholder="Digite sua senha"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg"
                  disabled={isLoading}
                >
                  <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {mensagem && (
              <div className="text-center mt-4 text-sm text-red-600">{mensagem}</div>
            )}

            <div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0e7a63] text-white font-semibold text-sm shadow-md hover:bg-[#0e7a63]/90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>

            <div className="flex justify-between text-sm mt-4 text-[#0e7a63]">
              <a
                href="cadastro"
                className="hover:underline transition"
              >
                Criar conta
              </a>
              <a
                href="esqueci-senha"
                className="hover:underline transition"
              >
                Esqueci a senha
              </a>
            </div>
          </form>
        </section>
      </main>
    </AuthGuard>
  );
}
