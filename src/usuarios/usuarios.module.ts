import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'sua_chave_secreta',
        signOptions: {
          expiresIn: '24h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsuariosController], // Controller que gerencia as rotas de usuários
  providers: [UsuariosService],      // Service que implementa a lógica de negócio
  exports: [UsuariosService]
})
export class UsuariosModule { } 