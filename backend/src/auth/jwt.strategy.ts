import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

/**
 * Estratégia de autenticação JWT para o Passport.js
 * 
 * @description
 * Esta classe implementa a estratégia de autenticação JWT (JSON Web Token)
 * utilizando o Passport.js. Ela é responsável por:
 * - Configurar como os tokens JWT serão extraídos das requisições
 * - Validar a assinatura dos tokens usando a chave secreta
 * - Processar e validar as informações contidas no payload do token
 * - Carregar os dados atualizados do usuário do banco de dados
 * 
 * A estratégia é configurada para:
 * - Extrair o token do header Authorization (formato Bearer)
 * - Não ignorar tokens expirados
 * - Usar a chave secreta definida em JWT_SECRET
 * 
 * @throws {Error} Se JWT_SECRET não estiver definido nas variáveis de ambiente
 * @throws {UnauthorizedException} Se o token for inválido ou o usuário não for encontrado
 * 
 * @example
 * // O token JWT deve ser enviado no header Authorization
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    /**
     * Construtor da estratégia JWT
     * 
     * @param authService - Serviço de autenticação para validação de usuários
     * @param configService - Serviço de configuração para acesso às variáveis de ambiente
     * 
     * @throws {Error} Se JWT_SECRET não estiver definido
     */
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error('JWT_SECRET não está definido nas variáveis de ambiente');
        }

        console.log('Debug - Inicializando JwtStrategy:', {
            hasSecret: !!secret,
            secretLength: secret.length,
            secretFirstChars: secret.substring(0, 5) + '...',
            extractorType: 'fromAuthHeaderAsBearerToken'
        });

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    /**
     * Valida o payload do token JWT e carrega os dados do usuário
     * 
     * @param payload - Payload decodificado do token JWT
     * @returns Objeto com os dados do usuário validado
     * 
     * @description
     * Este método é chamado automaticamente pelo Passport.js após a
     * validação da assinatura do token. Ele:
     * 1. Recebe o payload decodificado do token
     * 2. Busca o usuário no banco de dados
     * 3. Valida se o usuário ainda existe e está ativo
     * 4. Retorna os dados necessários para a requisição
     * 
     * @throws {UnauthorizedException} Se o usuário não for encontrado ou o token for inválido
     */
    async validate(payload: any) {
        console.log('Debug - Validando payload JWT:', {
            sub: payload.sub,
            email: payload.email,
            exp: payload.exp,
            currentTime: Math.floor(Date.now() / 1000),
            payloadCompleto: JSON.stringify(payload)
        });

        try {
            const user = await this.authService.validateUser(payload.sub);
            if (!user) {
                console.log('Debug - Usuário não encontrado:', payload.sub);
                throw new UnauthorizedException('Usuário não encontrado');
            }

            console.log('Debug - Usuário validado com sucesso:', {
                id: user._id,
                email: user.email_usuario,
                nome: user.nome_usuario
            });

            return {
                sub: payload.sub,
                email: user.email_usuario,
                isAdmin: user.eAdmin,
                nome: user.nome_usuario
            };
        } catch (error) {
            console.error('Debug - Erro na validação:', {
                error: error.message,
                stack: error.stack,
                payload: JSON.stringify(payload)
            });
            throw new UnauthorizedException('Token inválido');
        }
    }
} 