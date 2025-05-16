import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BancoDocument = Banco & Document;

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
}

export const BancoSchema = SchemaFactory.createForClass(Banco); 