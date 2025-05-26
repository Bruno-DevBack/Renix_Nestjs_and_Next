// Interfaces de Usuário
export interface Usuario {
    _id?: string;
    nome_usuario: string;
    email_usuario: string;
    telefone_usuario?: string;
    eAdmin: boolean;
    ePremium: boolean;
    dashboards: string[];
    historico_investimentos: InvestimentoHistorico[];
    historico_dashboards: DashboardHistorico[];
    foto_perfil?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateUsuarioDto {
    nome_usuario: string;
    email_usuario: string;
    senha_usuario: string;
    telefone_usuario: string;
}

export interface LoginUsuarioDto {
    email_usuario: string;
    senha_usuario: string;
}

export interface UpdateUsuarioDto {
    nome_usuario?: string;
    email_usuario?: string;
    senha_usuario?: string;
    telefone_usuario?: string;
}

export interface AuthResponse {
    token: string;
    user: Usuario;
}

export interface AuthContextData {
    user: Usuario | null;
    setUser: (user: Usuario | null) => void;
    signIn: (email: string, senha: string) => Promise<AuthResponse>;
    signOut: () => void;
    isAuthenticated: boolean;
}

export interface LoginCredentials {
    email_usuario: string;
    senha: string;
}

// Interfaces de Investimento
export interface Investimento {
    id: string;
    titulo: string;
    valor: number;
    tipo: string;
    banco: string;
    rendimento: number;
    status: string;
    data_inicio: string;
    data_vencimento: string;
    usuario_id: string;
    created_at: string;
    updated_at: string;
}

export interface CreateInvestimentoDto {
    titulo: string;
    valor: number;
    tipo: string;
    banco: string;
    data_inicio: string;
    data_vencimento: string;
}

export interface InvestimentoHistorico {
    investimento_id: string;
    data_operacao: string;
    tipo_operacao: string;
    valor: number;
}

// Interfaces de Dashboard
export interface Dashboard {
    id: string;
    titulo: string;
    usuario_id: string;
    data_criacao: string;
    investimentos: string[];
    metricas: {
        total_investido: number;
        rendimento_total: number;
        rendimento_medio: number;
    };
}

export interface DashboardHistorico {
    nome: string;
    bancos_comparados: string[];
    filtros_aplicados: string[];
    data_geracao?: string;
}

// Interfaces de Banco
export interface Banco {
    id: string;
    nome: string;
    codigo: string;
    taxas: {
        tipo: string;
        valor: number;
    }[];
    logo_url?: string;
    ultima_atualizacao: string;
}

export interface HistoricoResponse {
    banco_id: string;
    atualizacoes: {
        data: string;
        tipo: string;
        detalhes: string;
    }[];
} 