import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type InvestimentoDocument = Investimento & Document;

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

export interface CaracteristicasInvestimento {
  tipo: TipoInvestimento;
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
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Usuario', required: true })
  usuario_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Banco', required: true })
  banco_id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  valor_investimento: number;

  @Prop({ required: true })
  data_inicio: Date;

  @Prop({ required: true })
  data_fim: Date;

  @Prop({
    type: String,
    enum: TipoInvestimento,
    required: true
  })
  tipo_investimento: TipoInvestimento;

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

  @Prop({ type: Boolean, default: false })
  resgatado: boolean;

  @Prop({ type: Date })
  data_resgate: Date;

  @Prop({ type: Number })
  valor_resgate: number;
}

export const InvestimentoSchema = SchemaFactory.createForClass(Investimento); 