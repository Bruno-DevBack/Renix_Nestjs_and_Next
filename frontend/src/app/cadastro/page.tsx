"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

export default function CadastroPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermosModal, setShowTermosModal] = useState(false);

  // Estados para os campos do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [termos, setTermos] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [error, setError] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateTelefone = (telefone: string) => {
    const telefoneRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/;
    return telefoneRegex.test(telefone);
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return value;
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatTelefone(e.target.value);
    setTelefone(formattedValue);
  };

  const openTermosModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowTermosModal(true);
  };

  const closeTermosModal = () => {
    setShowTermosModal(false);
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem("");
    setError("");
    setCarregando(true);

    // Validações
    if (!nome || !email || !senha || !confirmarSenha || !telefone) {
      setMensagem("Preencha todos os campos!");
      setError("Preencha todos os campos!");
      setCarregando(false);
      return;
    }

    if (!termos) {
      setMensagem("Você precisa aceitar os Termos de Uso.");
      setError("Você precisa aceitar os Termos de Uso.");
      setCarregando(false);
      return;
    }

    if (!validateEmail(email)) {
      setMensagem("Por favor, insira um email válido.");
      setError("Por favor, insira um email válido.");
      setCarregando(false);
      return;
    }

    if (senha.length < 8) {
      setMensagem("A senha deve ter pelo menos 8 caracteres.");
      setError("A senha deve ter pelo menos 8 caracteres.");
      setCarregando(false);
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagem("As senhas não coincidem.");
      setError("As senhas não coincidem.");
      setCarregando(false);
      return;
    }

    if (!validateTelefone(telefone)) {
      setMensagem("Por favor, insira um telefone válido no formato (99) 99999-9999.");
      setError("Por favor, insira um telefone válido no formato (99) 99999-9999.");
      setCarregando(false);
      return;
    }

    try {
      await authService.register({
        nome_usuario: nome,
        email_usuario: email,
        senha_usuario: senha,
        telefone_usuario: telefone,
      });
      setMensagem("Cadastro realizado com sucesso! Redirecionando para o login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      console.error('Detalhes do erro no componente:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : 'Sem resposta',
        isAxiosError: axios.isAxiosError(error)
      });

      if (error.response?.status === 409) {
        setMensagem("Este e-mail já está cadastrado.");
        setError("Este e-mail já está cadastrado.");
      } else if (error.response?.data?.message) {
        setMensagem(Array.isArray(error.response.data.message)
          ? error.response.data.message.join('. ')
          : error.response.data.message);
        setError(Array.isArray(error.response.data.message)
          ? error.response.data.message.join('. ')
          : error.response.data.message);
      } else if (error.message.includes('Erro ao processar resposta')) {
        setMensagem("Erro de comunicação com o servidor. Tente novamente.");
        setError("Erro de comunicação com o servidor. Tente novamente.");
      } else if (error.message) {
        setMensagem(error.message);
        setError(error.message);
      } else {
        setMensagem("Erro ao cadastrar usuário. Tente novamente.");
        setError("Erro ao cadastrar usuário. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <section className="bg-white w-full max-w-[550px] p-8 rounded-2xl shadow-2xl border border-gray-200">
        <h2 className="text-center text-2xl font-bold text-gray-900 mb-8 tracking-wide">
          CADASTRO
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full" onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={carregando}
            />
          </div>

          {/* SENHA */}
          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <div className="relative">
              <input
                id="senha"
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
                placeholder="Crie uma senha"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                disabled={carregando}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                disabled={carregando}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* NOME */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome completo
            </label>
            <input
              id="nome"
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
              placeholder="Seu nome completo"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
              disabled={carregando}
            />
          </div>

          {/* CONFIRMAR SENHA */}
          <div>
            <label htmlFor="C_senha" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar senha
            </label>
            <div className="relative">
              <input
                id="C_senha"
                type={showConfirmPassword ? "text" : "password"}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
                placeholder="Repita sua senha"
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                required
                disabled={carregando}
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                disabled={carregando}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* TELEFONE */}
          <div className="md:col-span-2">
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              id="telefone"
              type="tel"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
              placeholder="(99) 99999-9999"
              value={telefone}
              onChange={handleTelefoneChange}
              required
              disabled={carregando}
            />
          </div>

          {/* TERMOS DE USO */}
          <div className="md:col-span-2 flex items-start gap-3 mt-2">
            <input
              type="checkbox"
              id="t_priva"
              className="mt-1 w-5 h-5 text-emerald-600 rounded"
              checked={termos}
              onChange={e => setTermos(e.target.checked)}
              required
              disabled={carregando}
            />
            <label htmlFor="t_priva" className="text-sm text-gray-700">
              Aceito os <a href="#" className="underline text-emerald-600" onClick={openTermosModal}>Termos de Uso</a> e a <a href="#" className="underline text-emerald-600">Política de Privacidade</a>.
            </label>
          </div>

          {/* BOTÃO */}
          <div className="md:col-span-2 pt-4">
            <button
              id="cadastrar"
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-md hover:bg-emerald-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={carregando}
            >
              {carregando ? "Cadastrando..." : "Cadastrar-se"}
            </button>
          </div>

          {/* Link para Login */}
          <div className="md:col-span-2 text-center mt-4">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-emerald-600 hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </form>

        {/* MENSAGEM DE FEEDBACK */}
        {mensagem && (
          <div className={`text-center mt-4 text-sm ${mensagem.includes("sucesso") ? "text-emerald-600" : "text-red-600"}`}>
            {mensagem}
          </div>
        )}

        {/* Modal de Termos de Uso */}
        {showTermosModal && (
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeTermosModal}
          >
            <div 
              className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do Modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Termos de Uso</h3>
                <button
                  onClick={closeTermosModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Conteúdo do Modal */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                  <h4 className="font-semibold text-gray-900 text-base">1. Aceitação dos Termos</h4>
                  <p>
                    Ao acessar e usar a plataforma Renix, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
                    Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.
                  </p>
                  <h4 className="font-semibold text-gray-900 text-base">2. Descrição do Serviço</h4>
                  <p>
                    A Renix é uma plataforma educacional que oferece ferramentas para simulação e análise de investimentos. 
                    Nossos serviços incluem:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Simulação de investimentos em diferentes bancos digitais</li>
                    <li>Análise comparativa de rendimentos</li>
                    <li>Visualização de projeções financeiras</li>
                    <li>Educação sobre conceitos de investimento</li>
                  </ul>
                  <h4 className="font-semibold text-gray-900 text-base">3. Uso Responsável</h4>
                  <p>
                    Você concorda em usar a plataforma apenas para fins educacionais e de planejamento financeiro. 
                    Não garantimos lucros ou resultados específicos, e você é responsável por suas próprias decisões de investimento.
                  </p>
                  <h4 className="font-semibold text-gray-900 text-base">4. Privacidade e Dados</h4>
                  <p>
                    Coletamos e processamos seus dados pessoais conforme nossa Política de Privacidade. 
                    Você concorda com a coleta e uso de informações conforme descrito.
                  </p>
                  <h4 className="font-semibold text-gray-900 text-base">5. Limitações de Responsabilidade</h4>
                  <p>
                    A Renix não se responsabiliza por perdas financeiras decorrentes de decisões de investimento. 
                    As simulações são baseadas em dados históricos e não garantem resultados futuros.
                  </p>
                  <h4 className="font-semibold text-gray-900 text-base">6. Modificações</h4>
                  <p>
                    Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                    Alterações serão comunicadas através da plataforma.
                  </p>
                  <h4 className="font-semibold text-gray-900 text-base">7. Contato</h4>
                  <p>
                    Para dúvidas sobre estes termos, entre em contato conosco através do email: 
                    <span className="text-emerald-600"> renixcorporate@gmail.com</span>
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                    <p className="text-yellow-800 text-xs">
                      <strong>⚠️ Aviso Importante:</strong> Esta plataforma é educacional. 
                      Consulte um profissional de investimentos antes de tomar decisões financeiras. 
                      Rentabilidades passadas não garantem resultados futuros.
                    </p>
                  </div>
                </div>
              </div>
              {/* Footer do Modal */}
              <div className="flex justify-end p-6 border-t border-gray-200">
                <button
                  onClick={closeTermosModal}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
