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
      valor_bruto: Number,
      valor_liquido: Number,
      rentabilidade_periodo: Number,
      rentabilidade_anualizada: Number,
      imposto_renda: Number,
      iof: Number,
      outras_taxas: Number
    },
    required: true
  })
  rendimento: RendimentoDetalhado;

  @Prop({ required: true })
  valor_atual: number;         // Valor atual do investimento

  @Prop({ required: true })
  valor_projetado: number;     // Valor projetado para o vencimento

  @Prop({ type: Object })
  indicadores_mercado: {       // Indicadores de mercado relacionados
    selic: number;
    cdi: number;
    ipca: number;
    ibovespa?: number;      // Para investimentos em ações
    ifix?: number;          // Para fundos imobiliários
  };

  @Prop({ type: [String] })
  alertas: string[];          // Alertas importantes sobre o investimento

  @Prop({ type: Object })
  comparativo_mercado: {      // Comparativo com outros investimentos
    versus_poupanca: number;
    versus_cdi: number;
    versus_ipca: number;
  };

  @Prop({ type: [Object], required: true })
  investimentos: InvestimentoDashboard[];
}

export const DashboardSchema = SchemaFactory.createForClass(Dashboard); 