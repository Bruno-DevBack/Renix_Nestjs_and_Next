/**
 * Módulo principal da aplicação NestJS
 * 
 * @description
 * Este é o módulo raiz que configura e integra todos os componentes
 * da aplicação. Suas responsabilidades incluem:
 * 
 * Configurações:
 * - Variáveis de ambiente (.env)
 * - Conexão com MongoDB
 * - Rate limiting global
 * - Importação de módulos
 * 
 * Módulos integrados:
 * - AuthModule: Autenticação e autorização
 * - BancosModule: Gestão de bancos e instituições
 * - UsuariosModule: Gestão de usuários
 * - InvestimentosModule: Gestão de investimentos
 * - DashboardModule: Análise e visualização
 * - BancoAgentModule: Atualização automática
 * 
 * Configurações de banco de dados:
 * - MongoDB via Mongoose
 * - Conexão assíncrona
 * - URI configurável via env
 * 
 * Proteção da API:
 * - Rate limiting configurável
 * - TTL e limites via env
 * - Proteção contra ataques
 * 
 * @example
 * // Exemplo de configuração no .env
 * MONGODB_URI=mongodb://localhost:27017/renix
 * RATE_LIMIT_TTL=60
 * RATE_LIMIT_LIMIT=10
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { BancosModule } from './bancos/bancos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { InvestimentosModule } from './investimentos/investimentos.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { BancoAgentModule } from './banco-agent/banco-agent.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Configuração global de variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,      // Disponível em toda a aplicação
      envFilePath: '.env', // Arquivo de configuração
    }),

    // Configuração da conexão com MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // Configuração do rate limiting global
    /* ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<ThrottlerModuleOptions> => ({
        throttlers: [{
          ttl: configService.get<number>('RATE_LIMIT_TTL') || 60,    // Tempo de vida do limite
          limit: configService.get<number>('RATE_LIMIT_LIMIT') || 10, // Requisições permitidas
        }]
      }),
      inject: [ConfigService],
    }), */

    // Módulos da aplicação
    AuthModule,           // Autenticação e autorização
    BancosModule,        // Gestão de bancos
    UsuariosModule,      // Gestão de usuários
    InvestimentosModule, // Gestão de investimentos
    DashboardModule,     // Análise e visualização
    BancoAgentModule,    // Atualização automática
  ],
})
export class AppModule { }
