import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TipoInvestimento, CaracteristicasInvestimento } from '../../investimentos/schemas/investimento.schema';

export type BancoDocument = Banco & Document;

export interface AtualizacaoHistorico {
  data: Date;
  cdi: number;
  fator_variacao: number;
  sentimento_mercado: number;
}

export interface CaracteristicasBanco {
  rendimentoBase: number;
  taxaAdministracao: number;
  investimentoMinimo: number;
  liquidezDiaria: boolean;
}

export interface InvestimentoDisponivel {
  tipo: TipoInvestimento;
  caracteristicas: CaracteristicasInvestimento;
}

@Schema({ timestamps: true })
export class Banco {
  @Prop({ required: true })
  nome_banco: string;

  @Prop({ required: true })
  IOF_diario: number;

  @Prop({ required: true })
  cdi: number;

  @Prop({ required: true })
  IR_ate_180_dias: number;

  @Prop({ required: true })
  IR_ate_360_dias: number;

  @Prop({ required: true })
  IR_ate_720_dias: number;

  @Prop({ required: true })
  IR_acima_720_dias: number;

  @Prop()
  logoBase64: string;

  @Prop({ type: Date, default: Date.now })
  ultima_atualizacao: Date;

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

  @Prop({
    type: [{
      data: { type: Date },
      cdi: { type: Number },
      fator_variacao: { type: Number },
      sentimento_mercado: { type: Number }
    }], default: []
  })
  historico_atualizacoes: AtualizacaoHistorico[];
}

export const BancoSchema = SchemaFactory.createForClass(Banco); 