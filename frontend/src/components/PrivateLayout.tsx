'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { PhoneIcon } from '@heroicons/react/24/outline';

interface PrivateLayoutProps {
  children: React.ReactNode;
}

export function PrivateLayout({ children }: PrivateLayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [showSobreModal, setShowSobreModal] = useState(false);
  const [showContatoModal, setShowContatoModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    // flex vertical com altura mínima full screen
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* main cresce para preencher o espaço */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>

      {/* Notificação de email copiado */}
      {showNotification && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 notification-slide">
          Email copiado com sucesso!
        </div>
      )}

      {/* footer fixo no final */}
      <footer className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <span>
            © 2025 <Link href="/" className="hover:underline">Renix™</Link>. Todos os direitos reservados.
          </span>
          <div className="flex gap-4 mt-2 md:mt-0">
            <button
              onClick={() => setShowSobreModal(true)}
              className="hover:underline cursor-pointer"
            >
              Sobre
            </button>
            <button
              onClick={() => setShowContatoModal(true)}
              className="hover:underline cursor-pointer"
            >
              Contato
            </button>
          </div>
        </div>
      </footer>

      {/* Modal Sobre */}
      <Modal
        isOpen={showSobreModal}
        onClose={() => setShowSobreModal(false)}
        title="Sobre a Renix"
      >
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <div className="text-center mb-6">
            <img src="/1.png" alt="Renix Logo" className="w-20 h-20 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Renix</h3>
            <p className="text-[#028264] font-semibold">Plataforma de Investimentos Educacional</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 text-lg mb-3">Nossa Missão</h4>
            <p>
              A Renix nasceu da paixão por democratizar o conhecimento sobre investimentos.
              Nossa missão é fornecer ferramentas educacionais que tornem o mundo dos investimentos
              mais acessível e compreensível para todos.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 text-lg mb-3">Nossa Equipe</h4>
            <p>
              Somos uma equipe formada por cinco alunos dedicados da ETEC de Guarulhos,
              unidos pelo propósito de desenvolver um projeto relevante e aplicável como
              Trabalho de Conclusão de Curso (TCC).
            </p>
            <p className="mt-3">
              Ao longo do nosso percurso acadêmico, compartilhamos aprendizados, desafios e conquistas,
              e este projeto representa o ápice dessa jornada educacional.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 text-lg mb-3">Nosso Projeto</h4>
            <p>
              Nosso TCC tem como foco o gerenciamento e a análise de investimentos, uma área cada vez
              mais essencial no cenário financeiro atual. Com ele, buscamos oferecer uma ferramenta
              e um conteúdo que ajude pessoas e empresas a tomarem decisões mais conscientes e estratégicas
              sobre onde e como investir.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 text-lg mb-3">Nossos Valores</h4>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Educação:</strong> Acreditamos no poder da educação financeira</li>
              <li><strong>Transparência:</strong> Fornecemos informações claras e honestas</li>
              <li><strong>Inovação:</strong> Buscamos sempre melhorar e inovar</li>
              <li><strong>Responsabilidade:</strong> Compromisso com a qualidade e utilidade</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-blue-800 text-sm">
              <strong>💡 Dica:</strong> Nossa plataforma é educacional. Sempre consulte um profissional
              de investimentos antes de tomar decisões financeiras importantes.
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal Contato */}
      <Modal
        isOpen={showContatoModal}
        onClose={() => setShowContatoModal(false)}
        title="Entre em Contato"
      >
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#028264] rounded-full flex items-center justify-center mx-auto mb-4">
              <PhoneIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Fale Conosco</h3>
            <p className="text-gray-600">Estamos aqui para ajudar você!</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg">Informações de Contato</h4>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <button
                    onClick={copyEmail}
                    className="text-[#028264] hover:underline cursor-pointer"
                  >
                    renixcorporate@gmail.com
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Instituição</p>
                  <p className="text-gray-600">ETEC de Guarulhos</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Horário de Atendimento</p>
                  <p className="text-gray-600">Segunda a Sexta: 8h às 18h</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg">Como Podemos Ajudar?</h4>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#028264] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Dúvidas sobre Investimentos</p>
                    <p className="text-sm text-gray-600">Tire suas dúvidas sobre como usar nossa plataforma</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#028264] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Suporte Técnico</p>
                    <p className="text-sm text-gray-600">Problemas com a plataforma ou funcionalidades</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#028264] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Sugestões e Feedback</p>
                    <p className="text-sm text-gray-600">Compartilhe suas ideias para melhorarmos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
            <p className="text-green-800 text-sm">
              <strong>📧 Resposta Rápida:</strong> Respondemos todos os emails em até 24 horas úteis.
              Para questões urgentes, você pode clicar no email acima para copiá-lo.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
