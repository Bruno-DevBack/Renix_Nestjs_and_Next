/**
 * Módulo responsável pela autenticação e autorização na aplicação
 * 
 * Este módulo configura:
 * - Estratégia JWT para autenticação
 * - Serviços de geração e validação de tokens
 * - Guardas de autenticação
 * - Integração com o módulo de usuários
 */

import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
    imports: [
        // Configura o Passport com estratégia JWT como padrão
        PassportModule.register({ defaultStrategy: 'jwt' }),

        // Configura o módulo JWT com opções assíncronas
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                // Usa a chave secreta do arquivo .env ou fallback para desenvolvimento
                secret: configService.get<string>('JWT_SECRET') || 'sua_chave_secreta',
                signOptions: {
                    expiresIn: '24h', // Token expira em 24 horas
                    algorithm: 'HS256'
                },
                verifyOptions: {
                    algorithms: ['HS256']
                }
            }),
            inject: [ConfigService],
        }),

        // Importa o módulo de usuários para acesso aos serviços de usuário
        forwardRef(() => UsuariosModule),
    ],
    providers: [
        AuthService,      // Serviço principal de autenticação
        JwtStrategy,      // Estratégia de autenticação JWT
        JwtAuthGuard     // Guarda para proteger rotas
    ],
    exports: [
        AuthService,      // Permite que outros módulos usem o serviço de autenticação
        JwtStrategy,      // Disponibiliza a estratégia JWT
        PassportModule,   // Disponibiliza funcionalidades do Passport
        JwtAuthGuard,     // Permite que outros módulos protejam suas rotas
        JwtModule
    ],
})
export class AuthModule { } 