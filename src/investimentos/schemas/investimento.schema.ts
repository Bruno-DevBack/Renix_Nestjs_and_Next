import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type InvestimentoDocument = Investimento & Document;

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
}

export const InvestimentoSchema = SchemaFactory.createForClass(Investimento); 