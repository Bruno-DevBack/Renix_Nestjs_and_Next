import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TipoInvestimento, CaracteristicasInvestimento } from '../../investimentos/schemas/investimento.schema';

/**
 * Tipo que representa um documento de banco no MongoDB
 */
export type BancoDocument = Banco & Document;

/**
 * Interface que define o histórico de atualizações de um banco
 * 
 * @property data - Data da atualização
 * @property cdi - Taxa CDI no momento da atualização
 * @property fator_variacao - Fator de ajuste aplicado
 * @property sentimento_mercado - Índice de sentimento (-1 a 1)
 */
export interface AtualizacaoHistorico {
  data: Date;
  cdi: number;
  fator_variacao: number;
  sentimento_mercado: number;
}

/**
 * Interface que define as características básicas de um banco
 * 
 * @property rendimentoBase - Rendimento base oferecido (em %)
 * @property taxaAdministracao - Taxa de administração cobrada (em %)
 * @property investimentoMinimo - Valor mínimo para investir
 * @property liquidezDiaria - Se oferece liquidez diária
 */
export interface CaracteristicasBanco {
  rendimentoBase: number;
  taxaAdministracao: number;
  investimentoMinimo: number;
  liquidezDiaria: boolean;
}

/**
 * Interface que define um investimento disponível no banco
 * 
 * @property tipo - Tipo do investimento (enum TipoInvestimento)
 * @property caracteristicas - Características específicas do investimento
 */
export interface InvestimentoDisponivel {
  tipo: TipoInvestimento;
  caracteristicas: CaracteristicasInvestimento;
}

/**
 * Schema do Mongoose para a entidade Banco
 * 
 * @description
 * Define a estrutura e validação dos dados de um banco no MongoDB.
 * Inclui:
 * - Informações básicas do banco
 * - Taxas e impostos
 * - Características operacionais
 * - Investimentos disponíveis
 * - Histórico de atualizações
 * 
 * O schema inclui timestamps automáticos (createdAt, updatedAt)
 * e validações para campos obrigatórios.
 */
@Schema({ timestamps: true })
export class Banco {
  /**
   * Nome oficial do banco
   * @example "Banco do Brasil"
   */
  @Prop({ required: true })
  nome_banco: string;

  /**
   * Taxa de IOF diário
   * @example 0.0038
   * @description Valor em decimal (0.0038 = 0.38%)
   */
  @Prop({ required: true })
  IOF_diario: number;

  /**
   * Taxa CDI atual
   * @example 13.75
   * @description Valor em percentual
   */
  @Prop({ required: true })
  cdi: number;

  /**
   * Alíquota de IR até 180 dias
   * @example 22.5
   * @description Valor em percentual
   */
  @Prop({ required: true })
  IR_ate_180_dias: number;

  /**
   * Alíquota de IR de 181 a 360 dias
   * @example 20
   * @description Valor em percentual
   */
  @Prop({ required: true })
  IR_ate_360_dias: number;

  /**
   * Alíquota de IR de 361 a 720 dias
   * @example 17.5
   * @description Valor em percentual
   */
  @Prop({ required: true })
  IR_ate_720_dias: number;

  /**
   * Alíquota de IR acima de 720 dias
   * @example 15
   * @description Valor em percentual
   */
  @Prop({ required: true })
  IR_acima_720_dias: number;

  /**
   * Logo do banco em formato Base64
   * @description Imagem codificada em Base64
   */
  @Prop()
  logoBase64: string;

  /**
   * Data da última atualização dos dados
   * @description Atualizado automaticamente
   */
  @Prop({ type: Date, default: Date.now })
  ultima_atualizacao: Date;

  /**
   * Características operacionais do banco
   * @description Configurações padrão de operação
   */
  @Prop({
    type: {
      rendimentoBase: Number,
      taxaAdministracao: Number,
      investimentoMinimo: Number,
      liquidezDiaria: Boolean
    },
    default: {
      rendimentoBase: 100,
      taxaAdministracao: 0,
      investimentoMinimo: 1,
      liquidezDiaria: true
    }
  })
  caracteristicas: CaracteristicasBanco;

  /**
   * Lista de investimentos disponíveis
   * @description Produtos de investimento oferecidos
   */
  @Prop({
    type: [{
      tipo: { type: String, enum: Object.values(TipoInvestimento) },
      caracteristicas: {
        rentabilidade_anual: Number,
        indexador: String,
        percentual_indexador: Number,
        risco: Number,
        liquidez: Number,
        garantia_fgc: Boolean,
        vencimento: Date,
        taxa_administracao: Number,
        taxa_performance: Number,
        valor_minimo: Number
      }
    }],
    default: []
  })
  investimentos_disponiveis: InvestimentoDisponivel[];

  /**
   * Histórico de atualizações do banco
   * @description Registro de todas as atualizações
   */
  @Prop({
    type: [{
      data: { type: Date },
      cdi: { type: Number },
      fator_variacao: { type: Number },
      sentimento_mercado: { type: Number }
    }],
    default: []
  })
  historico_atualizacoes: AtualizacaoHistorico[];
}

/**
 * Schema do Mongoose gerado a partir da classe Banco
 * @description Usado para operações no MongoDB
 */
export const BancoSchema = SchemaFactory.createForClass(Banco); 