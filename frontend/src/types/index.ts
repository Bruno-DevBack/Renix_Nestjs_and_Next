// Interfaces de Usuário
export interface Usuario {
    id: string;
    nome_usuario: string;
    email_usuario: string;
    telefone_usuario?: string;
    eAdmin: boolean;
    ePremium: boolean;
    dashboards: any[];
    historico_investimentos: any[];
    historico_dashboards: any[];
    foto_perfil?: string;
    fotoPerfilBase64?: string;
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
    usuario: Usuario;
    auth: {
        token: string;
        tipo: string;
        expira_em: string;
        gerado_em: string;
    };
}

export interface AuthContextData {
    usuario: Usuario | null;
    loading: boolean;
    isAuthenticated: boolean;
    signIn: (email: string, senha: string) => Promise<void>;
    signOut: () => void;
    updateUserData: (data: Partial<Usuario>) => Promise<Usuario>;
    updateProfilePhoto: (file: File) => Promise<Usuario>;
}

export interface LoginCredentials {
    email_usuario: string;
    senha: string;
}

// Interfaces de Investimento
export interface Investimento {
    id: string;
    titulo: string;
    valor_investimento: number;
    banco_id: string;
    usuario_id: string;
    data_inicio: string;
    data_fim: string;
    tipo_investimento: string;
    caracteristicas: {
        tipo: string;
        rentabilidade_anual?: number;
        indexador?: string;
        percentual_indexador?: number;
        risco: number;
        liquidez: number;
        garantia_fgc: boolean;
        vencimento?: Date;
        taxa_administracao?: number;
        taxa_performance?: number;
        valor_minimo: number;
    };
    created_at?: string;
    updated_at?: string;
}

export interface CreateInvestimentoDto {
    titulo: string;
    valor_investimento: number;
    banco_id: string;
    usuario_id?: string;
    data_inicio: string;
    data_fim: string;
    tipo_investimento: string;
    caracteristicas: {
        tipo: string;
        rentabilidade_anual?: number;
        indexador?: string;
        percentual_indexador?: number;
        risco: number;
        liquidez: number;
        garantia_fgc: boolean;
        vencimento?: Date;
        taxa_administracao?: number;
        taxa_performance?: number;
        valor_minimo: number;
    };
}

export interface InvestimentoHistorico {
    investimento_id: string;
    data_operacao: string;
    tipo_operacao: string;
    valor: number;
}

// Interfaces de Dashboard
export interface Dashboard {
    usuario_id: string;
    nome_usuario: string;
    banco_id: string;
    nome_banco: string;
    investimento_id: string;
    tipo_investimento: string;
    valor_investido: number;
    data_inicio: Date;
    data_fim: Date;
    dias_corridos: number;
    rendimento: {
        valor_bruto: number;
        valor_liquido: number;
        valor_rendido: number;
        rentabilidade_periodo: number;
        rentabilidade_anualizada: number;
        imposto_renda: number;
        iof: number;
        outras_taxas: number;
    };
    valor_atual: number;
    valor_projetado: number;
    indicadores_mercado: {
        selic: number;
        cdi: number;
        ipca: number;
    };
    investimentos: Array<{
        valor: number;
        rendimento: number;
        risco: number;
        tipo: string;
        banco: string;
        liquidez: number;
    }>;
}

export interface DashboardHistorico {
    nome: string;
    bancos_comparados: string[];
    filtros_aplicados: string[];
    data_geracao?: string;
}

// Interfaces de Banco
export interface Banco {
    _id: string;
    nome_banco: string;
    IOF_diario: number;
    cdi: number;
    IR_ate_180_dias: number;
    IR_ate_360_dias: number;
    IR_ate_720_dias: number;
    IR_acima_720_dias: number;
    logoBase64?: string;
    ultima_atualizacao: Date;
    caracteristicas: {
        rendimentoBase: number;
        taxaAdministracao: number;
        investimentoMinimo: number;
        liquidezDiaria: boolean;
    };
    investimentos_disponiveis: Array<{
        tipo: string;
        caracteristicas: {
            rentabilidade_anual: number;
            indexador?: string;
            percentual_indexador?: number;
            risco: number;
            liquidez: number;
            garantia_fgc: boolean;
            vencimento?: Date;
            taxa_administracao?: number;
            taxa_performance?: number;
            valor_minimo: number;
        };
    }>;
    historico_atualizacoes: Array<{
        data: Date;
        cdi: number;
        fator_variacao: number;
        sentimento_mercado: number;
    }>;
}

export interface HistoricoResponse {
    banco_id: string;
    atualizacoes: {
        data: string;
        tipo: string;
        detalhes: string;
    }[];
} 