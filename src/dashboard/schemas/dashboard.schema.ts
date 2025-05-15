import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DashboardDocument = Dashboard & Document;

@Schema({ timestamps: true })
export class Dashboard {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Usuario', required: true })
  usuario_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Banco', required: true })
  banco_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Investimento', required: true })
  investimento_id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  valor_estimado: number;

  @Prop({ required: true })
  valor_liquido: number;

  @Prop({ required: true })
  dias_corridos: number;

  @Prop({ required: true })
  percentual_rendimento: number;

  @Prop({ required: true })
  imposto_renda: number;

  @Prop({ required: true })
  IOF: number;
}

export const DashboardSchema = SchemaFactory.createForClass(Dashboard); 