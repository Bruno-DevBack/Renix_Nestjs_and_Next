/**
 * Schema do Mongoose para a entidade Dashboard
 * 
 * @description
 * Define a estrutura e validação dos dados de um dashboard
 * de investimentos no MongoDB. Inclui:
 * - Informações do usuário e banco
 * - Dados do investimento
 * - Cálculos de rendimentos
 * - Indicadores de mercado
 * - Histórico e projeções
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TipoInvestimento } from '../../investimentos/schemas/investimento.schema';

export type DashboardDocument = Dashboard & Document;

/**
 * Interface que define um investimento no dashboard
 * 
 * @description
 * Representa um investimento específico dentro do dashboard,
 * com suas características e métricas.
 * 
 * @property valor - Valor investido
 * @property rendimento - Rendimento atual
 * @property risco - Nível de risco (1-5)
 * @property tipo - Tipo do investimento
 * @property banco - Nome do banco
 * @property liquidez - Nível de liquidez (1-4)
 */
export interface InvestimentoDashboard {
  valor: number;
  rendimento: number;
  risco: number;
  tipo: string;
  banco: string;
  liquidez: number;
}

/**
 * Interface que define o detalhamento do rendimento
 * 
 * @description
 * Estrutura os dados de rendimento de um investimento,
 * incluindo valores brutos, líquidos e impostos.
 */
export interface RendimentoDetalhado {
  valor_bruto: number;
  valor_liquido: number;
  rentabilidade_periodo: number;
  rentabilidade_anualizada: number;
  imposto_renda: number;
  iof: number;
  outras_taxas?: number;
}

@Schema({ timestamps: true })
export class Dashboard {
  /**
   * ID do usuário proprietário do dashboard
   * @example "507f1f77bcf86cd799439011"
   */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Usuario', required: true })
  usuario_id: MongooseSchema.Types.ObjectId;

  /**
   * Nome do usuário para referência rápida
   * @example "João Silva"
   */
  @Prop({ required: true })
  nome_usuario: string;

  /**
   * ID do banco onde o investimento está aplicado
   * @example "507f1f77bcf86cd799439012"
   */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Banco', required: true })
  banco_id: MongooseSchema.Types.ObjectId;

  /**
   * Nome do banco para referência rápida
   * @example "Nubank"
   */
  @Prop({ required: true })
  nome_banco: string;

  /**
   * ID do investimento específico
   * @example "507f1f77bcf86cd799439013"
   */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Investimento', required: true })
  investimento_id: MongooseSchema.Types.ObjectId;

  /**
   * Tipo do investimento
   * @example "CDB"
   */
  @Prop({
    type: String,
    enum: TipoInvestimento,
    required: true
  })
  tipo_investimento: TipoInvestimento;

  /**
   * Valor inicial investido
   * @example 10000.00
   */
  @Prop({ required: true })
  valor_investido: number;

  /**
   * Data de início do investimento
   * @example "2024-01-01T00:00:00.000Z"
   */
  @Prop({ required: true })
  data_inicio: Date;

  /**
   * Data de vencimento/fim do investimento
   * @example "2025-01-01T00:00:00.000Z"
   */
  @Prop({ required: true })
  data_fim: Date;

  /**
   * Quantidade de dias corridos desde o início
   * @example 30
   */
  @Prop({ required: true })
  dias_corridos: number;

  /**
   * Detalhamento completo do rendimento
   * @description Inclui valores brutos, líquidos, impostos e taxas
   */
  @Prop({
    type: {
      valor_bruto: { type: Number, required: true },
      valor_liquido: { type: Number, required: true },
      rentabilidade_periodo: { type: Number, required: true },
      rentabilidade_anualizada: { type: Number, required: true },
      imposto_renda: { type: Number, required: true },
      iof: { type: Number, required: true },
      outras_taxas: { type: Number, default: 0 }
    },
    required: true
  })
  rendimento: RendimentoDetalhado;

  /**
   * Valor atual do investimento
   * @example 10500.00
   */
  @Prop({ required: true, default: 0 })
  valor_atual: number;

  /**
   * Valor projetado para o vencimento
   * @example 11000.00
   */
  @Prop({ required: true, default: 0 })
  valor_projetado: number;

  /**
   * Indicadores de mercado relacionados
   * @description Taxas e índices relevantes para comparação
   */
  @Prop({
    type: {
      selic: Number,
      cdi: Number,
      ipca: Number,
      ibovespa: Number,
      ifix: Number
    },
    required: false
  })
  indicadores_mercado?: {
    selic: number;
    cdi: number;
    ipca: number;
    ibovespa?: number;
    ifix?: number;
  }

  /**
   * Alertas importantes sobre o investimento
   * @example ["Vencimento próximo", "Alta volatilidade"]
   */
  @Prop({ type: [String], default: [] })
  alertas: string[];

  /**
   * Comparativo com outros investimentos
   * @description Performance relativa a outros tipos de investimento
   */
  @Prop({
    type: {
      versus_poupanca: Number,
      versus_cdi: Number,
      versus_ipca: Number
    },
    required: false
  })
  comparativo_mercado?: {
    versus_poupanca: number;
    versus_cdi: number;
    versus_ipca: number;
  };

  /**
   * Lista de investimentos no dashboard
   * @description Conjunto de investimentos sendo monitorados
   */
  @Prop({ type: [Object], default: [] })
  investimentos: InvestimentoDashboard[];
}

export const DashboardSchema = SchemaFactory.createForClass(Dashboard); 