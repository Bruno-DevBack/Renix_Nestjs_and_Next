/**
 * Schema do Mongoose para a entidade Investimento
 * 
 * @description
 * Define a estrutura e validação dos dados de um investimento
 * no MongoDB. Inclui:
 * - Dados básicos do investimento
 * - Características e parâmetros
 * - Relacionamentos com outras entidades
 * - Campos de controle e auditoria
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type InvestimentoDocument = Investimento & Document;

/**
 * Enum que define os tipos de investimento disponíveis
 * 
 * @description
 * Lista todos os tipos de investimento suportados pela aplicação,
 * incluindo renda fixa, tesouro direto, fundos e ações.
 */
export enum TipoInvestimento {
  RENDA_FIXA_CDB = 'CDB',
  RENDA_FIXA_LCI = 'LCI',
  RENDA_FIXA_LCA = 'LCA',
  TESOURO_SELIC = 'TESOURO_SELIC',
  TESOURO_IPCA = 'TESOURO_IPCA',
  TESOURO_PREFIXADO = 'TESOURO_PREFIXADO',
  POUPANCA = 'POUPANCA',
  FUNDOS_RENDA_FIXA = 'FUNDOS_RF',
  FUNDOS_MULTIMERCADO = 'FUNDOS_MULTI',
  ACOES = 'ACOES',
  FUNDOS_IMOBILIARIOS = 'FII'
}

/**
 * Interface que define as características de um investimento
 * 
 * @description
 * Detalha todos os parâmetros e características que um
 * investimento pode ter, incluindo:
 * - Rentabilidade e indexadores
 * - Níveis de risco e liquidez
 * - Garantias e proteções
 * - Taxas e custos
 * - Valores mínimos
 */
export interface CaracteristicasInvestimento {
  tipo: TipoInvestimento;           // Tipo do investimento
  rentabilidade_anual?: number;     // Rentabilidade anual esperada (%)
  indexador?: string;               // SELIC, IPCA, CDI, etc
  percentual_indexador?: number;    // % do indexador (ex: 110% do CDI)
  risco: number;                    // 1 a 5 (1: Muito baixo, 5: Muito alto)
  liquidez: number;                 // 1 a 5 (1: D+0, 5: Acima de D+360)
  garantia_fgc: boolean;           // Se possui garantia do FGC
  vencimento?: Date;               // Data de vencimento (se aplicável)
  taxa_administracao?: number;     // Taxa de administração (%)
  taxa_performance?: number;       // Taxa de performance (%)
  valor_minimo: number;           // Valor mínimo para investir
}

@Schema({ timestamps: true })
export class Investimento {
  /**
   * Título/nome do investimento
   * @example "CDB Banco XYZ 120% CDI"
   */
  @Prop({ required: true })
  titulo: string;

  /**
   * Valor total do investimento
   * @example 10000.00
   */
  @Prop({ required: true })
  valor: number;

  /**
   * Nome do banco/instituição
   * @example "Banco XYZ"
   */
  @Prop({ required: true })
  banco: string;

  /**
   * Taxa de rendimento
   * @example 12.5
   */
  @Prop({ required: true })
  rendimento: number;

  /**
   * Tipo do investimento
   * @example "CDB"
   */
  @Prop({ required: true })
  tipo: string;

  /**
   * ID do usuário proprietário
   * @example "507f1f77bcf86cd799439011"
   */
  @Prop({ required: true, type: Types.ObjectId })
  usuario_id: Types.ObjectId;

  /**
   * Data de criação do registro
   * @example "2024-03-20T10:00:00.000Z"
   */
  @Prop()
  created_at?: Date;

  /**
   * Data da última atualização
   * @example "2024-03-20T10:00:00.000Z"
   */
  @Prop()
  updated_at?: Date;

  /**
   * ID do banco/instituição
   * @example "507f1f77bcf86cd799439012"
   */
  @Prop({ type: Types.ObjectId, ref: 'Banco', required: true })
  banco_id: Types.ObjectId;

  /**
   * Valor inicial investido
   * @example 10000.00
   */
  @Prop({ required: true })
  valor_investimento: number;

  /**
   * Data de início do investimento
   * @example "2024-03-20T00:00:00.000Z"
   */
  @Prop({ required: true })
  data_inicio: Date;

  /**
   * Data de vencimento/fim
   * @example "2025-03-20T00:00:00.000Z"
   */
  @Prop({ required: true })
  data_fim: Date;

  /**
   * Tipo específico do investimento
   * @example "CDB"
   */
  @Prop({
    type: String,
    enum: TipoInvestimento,
    required: true
  })
  tipo_investimento: TipoInvestimento;

  /**
   * Características detalhadas
   * @description Objeto com todos os parâmetros do investimento
   */
  @Prop({
    type: {
      tipo: String,
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
    },
    required: true
  })
  caracteristicas: CaracteristicasInvestimento;

  /**
   * Indica se o investimento foi resgatado
   * @example false
   */
  @Prop({ type: Boolean, default: false })
  resgatado: boolean;

  /**
   * Data do resgate (se houver)
   * @example "2024-06-20T00:00:00.000Z"
   */
  @Prop({ type: Date })
  data_resgate: Date;

  /**
   * Valor do resgate (se houver)
   * @example 10500.00
   */
  @Prop({ type: Number })
  valor_resgate: number;
}

export const InvestimentoSchema = SchemaFactory.createForClass(Investimento); 