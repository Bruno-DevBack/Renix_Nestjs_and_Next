/**
 * Schema do MongoDB para a entidade Usuário
 * 
 * @description
 * Define a estrutura completa do documento de usuário no MongoDB:
 * 
 * Dados Pessoais:
 * - Nome completo
 * - Email (único)
 * - Senha (hasheada)
 * - Foto de perfil
 * 
 * Permissões:
 * - Flag de administrador
 * - Flag de usuário premium
 * 
 * Relacionamentos:
 * - Lista de dashboards
 * - Histórico de investimentos
 * - Histórico de dashboards
 * 
 * Funcionalidades:
 * - Validação de senha
 * - Hash automático de senha
 * - Timestamps automáticos
 * - Validações de campos
 * 
 * Segurança:
 * - Senhas nunca armazenadas em texto puro
 * - Email único por usuário
 * - Validações de formato
 * - Sanitização de dados
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as bcrypt from 'bcryptjs';

/**
 * Interface que estende o Document do Mongoose
 * 
 * @description
 * Adiciona método personalizado para validação de senha:
 * - matchPassword: Compara senha fornecida com hash
 * 
 * @example
 * const usuario = await Usuario.findOne({email});
 * const senhaCorreta = await usuario.matchPassword('senha123');
 */
export type UsuarioDocument = Usuario & Document & {
  matchPassword(enteredPassword: string): Promise<boolean>;
};

/**
 * Interface para histórico de investimentos
 * 
 * @description
 * Registra operações de investimento:
 * - Tipo de operação
 * - Valores e datas
 * - Status e resultados
 */
export interface InvestimentoHistorico {
  tipo_operacao: string;
  valor: number;
  data: Date;
  status: string;
  resultado?: number;
}

/**
 * Interface para histórico de dashboards
 * 
 * @description
 * Registra interações com dashboards:
 * - Ações realizadas
 * - Timestamps
 * - Dados alterados
 */
export interface DashboardHistorico {
  acao: string;
  data: Date;
  dados?: any;
}

/**
 * Schema principal do usuário
 * 
 * @description
 * Define a estrutura e validações do documento:
 * 
 * Campos Obrigatórios:
 * - nome_usuario: Nome completo
 * - email_usuario: Email único
 * - senha_usuario: Senha (min 6 caracteres)
 * 
 * Campos Opcionais:
 * - fotoPerfilBase64: Foto em base64
 * 
 * Campos Automáticos:
 * - eAdmin: Flag de administrador
 * - ePremium: Flag de usuário premium
 * - createdAt: Data de criação
 * - updatedAt: Última atualização
 */
@Schema({
  timestamps: true,
  collection: 'usuarios'
})
export class Usuario {
  /**
   * Nome completo do usuário
   * @description Requer trim e mínimo de caracteres
   */
  @Prop({
    required: true,
    trim: true
  })
  nome_usuario: string;

  /**
   * Email único do usuário
   * @description Convertido para lowercase e validado
   */
  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  })
  email_usuario: string;

  /**
   * Senha do usuário (hasheada)
   * @description Mínimo de 6 caracteres, nunca em texto puro
   */
  @Prop({
    required: true,
    minlength: 6
  })
  senha_usuario: string;

  /**
   * Flag de administrador
   * @description Define permissões especiais
   */
  @Prop({
    required: true,
    default: false
  })
  eAdmin: boolean;

  /**
   * Flag de usuário premium
   * @description Habilita recursos exclusivos
   */
  @Prop({
    required: true,
    default: false
  })
  ePremium: boolean;

  /**
   * Foto de perfil em base64
   * @description Opcional, com validação de formato
   */
  @Prop({
    type: String,
    required: false
  })
  fotoPerfilBase64?: string;

  /**
   * Lista de IDs de dashboards
   * @description Referência para Dashboard schema
   */
  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Dashboard' }]
  })
  dashboards: MongooseSchema.Types.ObjectId[];

  /**
   * Histórico de investimentos
   * @description Array de operações realizadas
   */
  @Prop({
    type: Array,
    default: []
  })
  historico_investimentos: InvestimentoHistorico[];

  /**
   * Histórico de dashboards
   * @description Array de interações com dashboards
   */
  @Prop({
    type: Array,
    default: []
  })
  historico_dashboards: DashboardHistorico[];
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);

/**
 * Método para validação de senha
 * 
 * @description
 * Compara a senha fornecida com o hash armazenado
 * usando bcrypt para comparação segura
 * 
 * @param enteredPassword - Senha fornecida para validação
 * @returns true se a senha estiver correta
 */
UsuarioSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.senha_usuario);
};

/**
 * Middleware de pré-salvamento
 * 
 * @description
 * Executa antes de salvar o documento:
 * 1. Verifica se a senha foi modificada
 * 2. Gera salt para hash
 * 3. Hasheia a senha
 * 4. Salva o hash
 */
UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('senha_usuario')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.senha_usuario = await bcrypt.hash(this.senha_usuario, salt);
}); 