'use client'

import { useState, useEffect } from 'react'
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel
} from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import { AuthGuard } from '@/components/AuthGuard'

const navigation = [
  { name: 'Sobre', href: '#sobre' },
  { name: 'Serviços', href: '#servicos' },
  { name: 'Contato', href: '#contato' },
]

export default function Home() {
  const [isOpen, setIsOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [showSobreModal, setShowSobreModal] = useState(false)
  const [showContatoModal, setShowContatoModal] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText('renixcorporate@gmail.com')
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
    } catch (err) {
      console.error('Erro ao copiar email:', err)
    }
  }

  const handleNavigationClick = (item: any, e: React.MouseEvent) => {
    if (item.name === 'Sobre') {
      e.preventDefault()
      setShowSobreModal(true)
    } else if (item.name === 'Contato') {
      e.preventDefault()
      setShowContatoModal(true)
    }
    setIsOpen(false)
  }

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

  return (
    <AuthGuard>
      {/* Notificação de email copiado */}
      {showNotification && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 notification-slide">
          Email copiado com sucesso!
        </div>
      )}

      {/* Navbar */}
      <Disclosure
        as="nav"
        className="bg-white shadow h-20 fixed top-0 left-0 w-full z-50"
      >
        {({ open }) => {
          //Disclosure para Mobile
          if (open !== isOpen) setIsOpen(open)

          return (
            <>
              <div className="mx-auto max-w-7xl px-6 sm:px-6 md:px-12 lg:px-16">
                <div className="flex h-full items-center justify-between">
                  {/* LOGO */}
                  <div className="flex items-center flex-shrink-0 mt-2">
                    <img
                      src="/1.png"
                      alt="Renix Logo"
                      className="h-16 w-auto object-contain"
                    />
                  </div>

                  {/* MENU LINKS */}
                  <div className="hidden sm:flex space-x-6 md:mt-6">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={(e) => handleNavigationClick(item, e)}
                        className="text-black-800 hover:text-black-200 font-bold text-lg cursor-pointer"
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>

                  {/* Ícone mobile (≡) */}
                  {!open && (
                    <div className="sm:hidden">
                      <DisclosureButton className="text-gray-800 hover:text-gray-600 focus:outline-none mt-5">
                        <Bars3Icon className="h-6 w-6" />
                      </DisclosureButton>
                    </div>
                  )}
                </div>
              </div>

              {/* Overlay escuro */}
              {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 sm:hidden" />
              )}

              {/* Menu mobile */}
              <DisclosurePanel className="sm:hidden bg-white px-4 pt-4 pb-4 mt-2 w-full max-w-xs rounded-r-lg fixed top-0 right-0 h-full z-50 shadow-lg">
                {/* Botão de fechar */}
                <div className="flex justify-end">
                  <DisclosureButton className="p-2 text-gray-700 hover:text-gray-500">
                    <XMarkIcon className="h-6 w-6" />
                  </DisclosureButton>
                </div>

                {/* Links com ícones */}
                <div className="flex flex-col space-y-2 mt-2">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => handleNavigationClick(item, e)}
                      className="flex items-center gap-3 text-black font-bold py-2 border-b-2 border-gray-400 w-full cursor-pointer"
                    >
                      {item.name === 'Sobre' && (
                        <InformationCircleIcon className="h-5 w-5 text-gray-700" />
                      )}
                      {item.name === 'Serviços' && (
                        <Cog6ToothIcon className="h-5 w-5 text-gray-700" />
                      )}
                      {item.name === 'Contato' && (
                        <PhoneIcon className="h-5 w-5 text-gray-700" />
                      )}
                      <span>{item.name}</span>
                    </a>
                  ))}
                </div>
              </DisclosurePanel>
            </>
          )
        }}
      </Disclosure>

      {/* Conteúdo principal */}
      <main className="pt-28 px-4 sm:px-6 lg:px-16 xl:px-20 2xl:px-32">
        <div className="mt-10 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-24 ml-2 md:mt-[120px]">
            {/* Texto e botão */}
            <div className="flex flex-col items-start gap-6 max-w-xl">
              <h1 className="text-black font-extrabold text-4xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-6xl">
                Faça seu investimento <br /> com a Renix
              </h1>
              <a href="/login" className="bg-[#028264] text-white px-8 py-3 rounded inline-block hover:bg-[#026d54] transition-colors">
                <span className="font-extrabold text-lg">INVESTIR</span>
              </a>
            </div>

            {/* Imagem */}
            <div className="w-full flex justify-center md:justify-end">
              <img
                src="/woman.jpeg"
                alt="Renix Banner"
                className="object-contain w-full max-w-[520px] md:max-w-[480px] lg:max-w-[560px] xl:max-w-[640px]"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Seção verde fora do container */}
      <section id="servicos" className="w-full bg-[#028264] mt-36 py-12 px-4">
        <div className="mx-auto text-white text-center">
          <h2 className="text-3xl font-bold">O que oferecemos?</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-x-12 lg:gap-x-[200px] mt-16 gap-y-12">
            <div className="flex flex-col items-center w-full max-w-xs text-center">
              <h2 className="text-xl font-semibold">Investimento de Qualidade</h2>
              <p className="mt-4 text-base leading-relaxed text-justify">
                Oferecemos uma ferramenta prática e confiável para que você possa simular investimentos com qualidade e segurança.
                Com base em bancos digitais confiáveis, nosso sistema permite que você visualize de forma clara o desempenho
                potencial do seu dinheiro, ajudando você a tomar decisões mais conscientes e estratégicas.
              </p>
            </div>

            <div className="flex flex-col items-center w-full max-w-xs text-center">
              <h2 className="text-xl font-semibold">Prévia de Valores</h2>
              <p className="mt-4 text-base leading-relaxed text-justify">
                Tenha acesso a uma estimativa detalhada dos seus rendimentos antes mesmo de investir.
                Basta informar o valor que deseja aplicar, o prazo e o banco escolhido, e o sistema calculará uma previsão
                dos lucros, considerando fatores como taxas, impostos e tempo de aplicação.
              </p>
            </div>

            <div className="flex flex-col items-center w-full max-w-xs text-center">
              <h2 className="text-xl font-semibold">Análise de Investimentos</h2>
              <p className="mt-4 text-base leading-relaxed text-justify">
                Compare diferentes opções de investimento de maneira clara e eficiente.
                A ferramenta analisa aspectos como rendimento, tempo de retorno, imposto de renda e outros fatores importantes,
                ajudando você a identificar a melhor escolha com base no seu perfil e objetivo financeiro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Branca fora do container */}
      <section id="sobre" className="w-full bg-white">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between">
          {/* Imagem */}
          <div className="w-full md:w-1/2">
            <img
              src="/equipe.png"
              alt="Renix Banner"
              className="object-contain w-full max-w-[620px] md:max-w-[720px] lg:max-w-[820px] xl:max-w-[920px] mt-10 md:mt-0 lg:mt-0"
            />
          </div>

          {/* Texto */}
          <div className="w-full md:w-1/2 px-4 mt-8 md:mt-0 ">
            <h2 className="text-2xl font-bold text-center flex justify-center md:text-left">Nosso Time</h2>
            <p className="w-[90%] mt-4 text-base leading-relaxed text-justify mx-auto md:mx-0">
              Somos uma equipe formada por cinco alunos dedicados da ETEC de Guarulhos, unidos pelo propósito de desenvolver um projeto relevante e aplicável como Trabalho de Conclusão de Curso (TCC). Ao longo do nosso percurso acadêmico, compartilhamos aprendizados, desafios e conquistas, e este projeto representa o ápice dessa jornada.

              Nosso TCC tem como foco o gerenciamento e a análise de investimentos, uma área cada vez mais essencial no cenário financeiro atual. Com ele, buscamos oferecer uma ferramenta e um conteúdo que ajude pessoas e empresas a tomarem decisões mais conscientes e estratégicas sobre onde e como investir.

              Nosso compromisso com a qualidade, a clareza e a utilidade do trabalho reflete não apenas nossa formação técnica, mas também nossa paixão pelo conhecimento e pela inovação.
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-white mt-12 shadow-sm">
        <div className="max-w-screen-lg mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <span>© 2025 <a href="/" className="hover:underline">Renix™</a>. Todos os direitos reservados.</span>
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
    </AuthGuard>
  )
}
