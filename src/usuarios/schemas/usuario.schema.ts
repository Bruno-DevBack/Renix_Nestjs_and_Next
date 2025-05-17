import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type UsuarioDocument = Usuario & Document;

export interface InvestimentoHistorico {
  data: Date;
  tipo: string;
  valor: number;
  banco: string;
  rendimento: number;
}

export interface DashboardHistorico {
  data: Date;
  nome: string;
  bancos_comparados: string[];
  filtros_aplicados: string[];
}

@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true })
  nome_usuario: string;

  @Prop({ required: true, unique: true })
  email_usuario: string;

  @Prop({ required: true })
  telefone_usuario: string;

  @Prop({ default: false })
  eAdmin: boolean;

  @Prop({ default: false })
  ePremium: boolean;

  @Prop({ required: true })
  senha_usuario: string;

  @Prop({ default: null })
  cnpj_usuario: string;

  @Prop({ default: null, unique: true })
  cpf_usuario: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Dashboard' }] })
  dashboards: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [{
      data: { type: Date, default: Date.now },
      tipo: String,
      valor: Number,
      banco: String,
      rendimento: Number
    }],
    default: []
  })
  historico_investimentos: InvestimentoHistorico[];

  @Prop({
    type: [{
      data: { type: Date, default: Date.now },
      nome: String,
      bancos_comparados: [String],
      filtros_aplicados: [String]
    }],
    default: []
  })
  historico_dashboards: DashboardHistorico[];
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);

// Adicionando os métodos
UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('senha_usuario')) return next();
  const salt = await bcrypt.genSalt(10);
  this.senha_usuario = await bcrypt.hash(this.senha_usuario, salt);
  next();
});

UsuarioSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.senha_usuario);
}; 