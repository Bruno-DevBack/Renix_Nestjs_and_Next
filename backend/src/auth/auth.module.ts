/**
 * Módulo central de autenticação e autorização da aplicação
 * 
 * @description
 * Este módulo é responsável por toda a infraestrutura de autenticação
 * e autorização da aplicação. Ele configura e gerencia:
 * 
 * Componentes principais:
 * - Estratégia JWT para autenticação segura
 * - Serviços de geração e validação de tokens
 * - Guards para proteção de rotas
 * - Integração com o módulo de usuários
 * 
 * Configurações:
 * - Passport.js configurado com estratégia JWT
 * - Token JWT com expiração de 24 horas
 * - Algoritmo HS256 para assinatura
 * - Validação de tokens expirados
 * 
 * Dependências:
 * - JWT_SECRET nas variáveis de ambiente
 * - Módulo de usuários para validação
 * - ConfigModule para configurações
 * 
 * @example
 * // Importação e uso em outros módulos
 * @Module({
 *   imports: [AuthModule],
 *   controllers: [MeuController],
 * })
 * export class MeuModule {}
 * 
 * // Uso do guard em controllers
 * @UseGuards(JwtAuthGuard)
 * @Controller('api')
 * export class MeuController {}
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

        // Configura o módulo JWT com opções assíncronas e seguras
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
                        algorithm: 'HS256',    // Algoritmo de assinatura seguro
                        expiresIn: '24h'       // Tokens expiram em 24 horas
                    },
                    verifyOptions: {
                        algorithms: ['HS256'], // Aceita apenas tokens HS256
                        ignoreExpiration: false // Rejeita tokens expirados
                    }
                };
            },
            inject: [ConfigService],
        }),

        // Integração com o módulo de usuários para validação e acesso aos dados
        forwardRef(() => UsuariosModule),
        ConfigModule,
    ],
    providers: [
        AuthService,      // Serviço principal de autenticação
        JwtStrategy,      // Estratégia de autenticação JWT
        JwtAuthGuard     // Guard para proteção de rotas
    ],
    exports: [
        AuthService,      // Permite que outros módulos usem o serviço de autenticação
        JwtStrategy,      // Disponibiliza a estratégia JWT
        PassportModule,   // Disponibiliza funcionalidades do Passport
        JwtAuthGuard,     // Permite que outros módulos protejam suas rotas
        JwtModule        // Permite que outros módulos manipulem tokens JWT
    ],
})
export class AuthModule { } 