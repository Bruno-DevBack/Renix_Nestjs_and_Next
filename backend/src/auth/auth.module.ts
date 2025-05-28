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
            useFactory: async (configService: ConfigService) => {
                const secret = configService.get<string>('JWT_SECRET');
                if (!secret) {
                    console.error('Debug - JWT_SECRET não está definido nas variáveis de ambiente');
                    throw new Error('JWT_SECRET não está definido nas variáveis de ambiente');
                }
                
                console.log('Debug - Configurando JwtModule:', {
                    hasSecret: !!secret,
                    secretLength: secret.length,
                    secretFirstChars: secret.substring(0, 5) + '...',
                    nodeEnv: process.env.NODE_ENV
                });
                
                return {
                    secret: secret,
                    signOptions: {
                        algorithm: 'HS256',
                        expiresIn: '24h'
                    },
                    verifyOptions: {
                        algorithms: ['HS256'],
                        ignoreExpiration: false
                    }
                };
            },
            inject: [ConfigService],
        }),

        // Importa o módulo de usuários para acesso aos serviços de usuário
        forwardRef(() => UsuariosModule),
        ConfigModule,
    ],
    providers: [
        AuthService,      // Serviço principal de autenticação
        JwtStrategy,      // Estratégia de autenticação JWT
        JwtAuthGuard
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