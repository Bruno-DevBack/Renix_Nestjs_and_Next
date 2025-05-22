import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema';

/**
 * Módulo responsável por gerenciar todas as funcionalidades relacionadas aos usuários
 * 
 * Este módulo:
 * - Configura o modelo Mongoose para Usuários
 * - Registra o controller e service de usuários
 * - Gerencia operações de CRUD de usuários
 * - Controla autenticação e autorização
 * - Gerencia histórico de investimentos e dashboards
 */
@Module({
  imports: [
    // Registra o modelo de Usuário no Mongoose
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }])
  ],
  controllers: [UsuariosController], // Controller que gerencia as rotas de usuários
  providers: [UsuariosService]      // Service que implementa a lógica de negócio
})
export class UsuariosModule { } 