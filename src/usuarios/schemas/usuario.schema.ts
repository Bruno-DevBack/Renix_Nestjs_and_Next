/**
 * Schema do MongoDB para a entidade Usuário
 * 
 * Define a estrutura dos documentos de usuário no banco de dados, incluindo:
 * - Dados pessoais
 * - Credenciais de acesso
 * - Histórico de investimentos
 * - Configurações de dashboard
 * - Permissões e níveis de acesso
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as bcrypt from 'bcryptjs';

/**
 * Interface que estende o Document do Mongoose com métodos personalizados
 */
export type UsuarioDocument = Usuario & Document & {
  matchPassword(enteredPassword: string): Promise<boolean>;
};

/**
 * Interface para histórico de investimentos
 */
export interface InvestimentoHistorico {
  tipo: string;
  valor: number;
  data: Date;
  banco: string;
  rendimento: number;
}

/**
 * Interface para histórico de dashboards
 */
export interface DashboardHistorico {
  titulo: string;
  data_criacao: Date;
  tipo: string;
  configuracoes: Record<string, any>;
}

/**
 * Schema principal do usuário
 */
@Schema({
  timestamps: true, // Adiciona campos createdAt e updatedAt
  collection: 'usuarios' // Nome da coleção no MongoDB
})
export class Usuario {
  @Prop({
    required: true,
    trim: true
  })
  nome_usuario: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  })
  email_usuario: string;

  @Prop({
    required: true,
    minlength: 6
  })
  senha_usuario: string;

  @Prop({
    required: true,
    default: false
  })
  eAdmin: boolean;

  @Prop({
    required: true,
    default: false
  })
  ePremium: boolean;

  @Prop({
    type: String,
    required: false
  })
  fotoPerfilBase64?: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Dashboard' }]
  })
  dashboards: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: Array,
    default: []
  })
  historico_investimentos: InvestimentoHistorico[];

  @Prop({
    type: Array,
    default: []
  })
  historico_dashboards: DashboardHistorico[];
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);

/**
 * Método para comparar a senha fornecida com a senha hasheada do usuário
 * @param enteredPassword - Senha fornecida para comparação
 * @returns true se a senha estiver correta, false caso contrário
 */
UsuarioSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.senha_usuario);
};

/**
 * Middleware pre-save para hashear a senha antes de salvar no banco
 */
UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('senha_usuario')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.senha_usuario = await bcrypt.hash(this.senha_usuario, salt);
}); 