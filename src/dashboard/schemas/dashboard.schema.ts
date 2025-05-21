import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TipoInvestimento } from '../../investimentos/schemas/investimento.schema';

export type DashboardDocument = Dashboard & Document;

export interface RendimentoDetalhado {
  valor_bruto: number;
  valor_liquido: number;
  rentabilidade_periodo: number;    // Rentabilidade no período (%)
  rentabilidade_anualizada: number; // Rentabilidade anualizada (%)
  imposto_renda: number;
  iof: number;
  outras_taxas: number;            // Taxas adicionais (administração, performance, etc)
}

export interface InvestimentoDashboard {
  valor: number;
  rendimento: number;
  risco: number;
  tipo: string;
  banco: string;
  liquidez: number;
}

@Schema({ timestamps: true })
export class Dashboard {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Usuario', required: true })
  usuario_id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  nome_usuario: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Banco', required: true })
  banco_id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  nome_banco: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Investimento', required: true })
  investimento_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: TipoInvestimento,
    required: true
  })
  tipo_investimento: TipoInvestimento;

  @Prop({ required: true })
  valor_investido: number;

  @Prop({ required: true })
  data_inicio: Date;

  @Prop({ required: true })
  data_fim: Date;

  @Prop({ required: true })
  dias_corridos: number;

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

  @Prop({ required: true, default: 0 })
  valor_atual: number;         // Valor atual do investimento

  @Prop({ required: true, default: 0 })
  valor_projetado: number;     // Valor projetado para o vencimento

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
  indicadores_mercado?: {       // Indicadores de mercado relacionados
    selic: number;
    cdi: number;
    ipca: number;
    ibovespa?: number;      // Para investimentos em ações
    ifix?: number;          // Para fundos imobiliários
  };

  @Prop({ type: [String], default: [] })
  alertas: string[];          // Alertas importantes sobre o investimento

  @Prop({
    type: {
      versus_poupanca: Number,
      versus_cdi: Number,
      versus_ipca: Number
    },
    required: false
  })
  comparativo_mercado?: {      // Comparativo com outros investimentos
    versus_poupanca: number;
    versus_cdi: number;
    versus_ipca: number;
  };

  @Prop({ type: [Object], default: [] })
  investimentos: InvestimentoDashboard[];
}

export const DashboardSchema = SchemaFactory.createForClass(Dashboard); 