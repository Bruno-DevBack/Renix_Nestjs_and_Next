/**
 * Serviço central de autenticação e gerenciamento de tokens JWT
 * 
 * @description
 * Este serviço é responsável por toda a lógica de autenticação e autorização,
 * incluindo:
 * - Geração e validação de tokens JWT
 * - Autenticação de usuários
 * - Verificação de credenciais
 * - Gerenciamento de sessões
 * 
 * O serviço utiliza:
 * - JWT para tokens de acesso seguros
 * - Integração com o serviço de usuários
 * - Configurações centralizadas via ConfigService
 * 
 * @example
 * // Exemplo de uso em um controller
 * @Controller('auth')
 * export class AuthController {
 *   constructor(private authService: AuthService) {}
 * 
 *   @Post('login')
 *   async login(@Body() credentials) {
 *     return this.authService.login(credentials);
 *   }
 * }
 */

import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    /**
     * Construtor do serviço de autenticação
     * 
     * @param usuariosService - Serviço para operações com usuários
     * @param jwtService - Serviço para operações com tokens JWT
     * @param configService - Serviço para acesso às configurações
     */
    constructor(
        @Inject(forwardRef(() => UsuariosService))
        private readonly usuariosService: UsuariosService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) { }

    /**
     * Gera um novo token JWT para um usuário autenticado
     * 
     * @description
     * Este método cria um novo token JWT contendo informações essenciais
     * do usuário. O token inclui:
     * - ID do usuário (sub)
     * - Email
     * - Status administrativo
     * - Nome do usuário
     * - Timestamp de geração (iat)
     * 
     * O token é configurado para expirar em 24 horas e usa
     * o algoritmo HS256 para assinatura.
     * 
     * @param userId - ID único do usuário
     * @param email - Email do usuário
     * @param isAdmin - Flag indicando se é administrador
     * @param nome - Nome completo do usuário
     * @returns Objeto contendo o token e tempo de expiração
     */
    async generateToken(userId: string, email: string, isAdmin: boolean, nome: string) {
        const currentDate = new Date();
        const expiresIn = '24h';

        console.log('Debug - Gerando token:', {
            currentDate: currentDate.toISOString(),
            timestamp: currentDate.getTime(),
            userId,
            email,
            nome,
            isAdmin,
            expiresIn
        });

        const payload = {
            sub: userId,
            email: email,
            isAdmin: isAdmin,
            nome: nome,
            iat: Math.floor(currentDate.getTime() / 1000)
        };

        console.log('Debug - Payload do token:', JSON.stringify(payload, null, 2));

        const token = this.jwtService.sign(payload);

        // Decodifica o token para verificar se foi gerado corretamente
        const decoded = this.jwtService.decode(token);
        console.log('Debug - Token decodificado:', {
            decoded,
            exp: decoded['exp'],
            iat: decoded['iat'],
            tokenLength: token.length,
            tokenFirstChars: token.substring(0, 20) + '...'
        });

        return {
            access_token: token,
            expires_in: 24 * 60 * 60 * 1000 // 24 horas em milissegundos
        };
    }

    /**
     * Valida a existência e status de um usuário
     * 
     * @description
     * Este método verifica se um usuário existe e está ativo no sistema.
     * É utilizado principalmente durante a validação de tokens JWT para
     * garantir que o usuário ainda tem acesso válido.
     * 
     * @param userId - ID do usuário a ser validado
     * @returns Objeto do usuário se encontrado, null caso contrário
     * 
     * @throws {Error} Se houver erro na consulta ao banco de dados
     */
    async validateUser(userId: string): Promise<any> {
        console.log('Debug - Validando usuário:', userId);

        try {
            const user = await this.usuariosService.findOne(userId);
            if (!user) {
                console.log('Debug - Usuário não encontrado:', userId);
                return null;
            }

            console.log('Debug - Usuário encontrado:', {
                id: user._id,
                email: user.email_usuario,
                nome: user.nome_usuario
            });

            return user;
        } catch (error) {
            console.error('Debug - Erro ao validar usuário:', {
                userId,
                error: error.message,
                stack: error.stack
            });
            return null;
        }
    }

    /**
     * Valida um token JWT
     * 
     * @description
     * Realiza a validação completa de um token JWT, verificando:
     * - Assinatura do token
     * - Data de expiração
     * - Formato do payload
     * 
     * @param token - Token JWT a ser validado
     * @returns Payload decodificado se válido, null se inválido
     * 
     * @throws {Error} Se houver erro na decodificação do token
     */
    async validateToken(token: string) {
        try {
            const payload = this.jwtService.verify(token);
            const currentTime = Math.floor(Date.now() / 1000);

            console.log('Debug - Validando token:', {
                payload: JSON.stringify(payload, null, 2),
                currentTime,
                isExpired: payload.exp < currentTime,
                timeUntilExpiration: payload.exp - currentTime,
                tokenLength: token.length,
                tokenFirstChars: token.substring(0, 20) + '...'
            });

            return payload;
        } catch (error) {
            console.error('Debug - Erro ao validar token:', {
                error: error.message,
                stack: error.stack,
                tokenLength: token?.length,
                tokenFirstChars: token?.substring(0, 20) + '...'
            });
            return null;
        }
    }

    /**
     * Realiza o login do usuário e gera um novo token
     * 
     * @description
     * Este método é responsável pelo processo de login, que inclui:
     * 1. Receber as credenciais do usuário
     * 2. Gerar um novo token JWT
     * 3. Retornar o token junto com informações básicas do usuário
     * 
     * @param user - Objeto contendo os dados do usuário autenticado
     * @returns Objeto com token de acesso e dados do usuário
     * 
     * @throws {UnauthorizedException} Se houver erro na geração do token
     */
    async login(user: any) {
        console.log('Debug - Gerando token para usuário:', {
            id: user._id,
            email: user.email_usuario
        });

        const payload = {
            sub: user._id,
            email: user.email_usuario,
            isAdmin: user.eAdmin,
            nome: user.nome_usuario
        };

        try {
            const token = this.jwtService.sign(payload);
            console.log('Debug - Token gerado com sucesso:', {
                tokenLength: token.length,
                tokenFirstChars: token.substring(0, 20) + '...',
                payload: JSON.stringify(payload)
            });

            return {
                access_token: token,
                user: {
                    id: user._id,
                    email: user.email_usuario,
                    nome: user.nome_usuario,
                    isAdmin: user.eAdmin
                }
            };
        } catch (error) {
            console.error('Debug - Erro ao gerar token:', {
                error: error.message,
                stack: error.stack,
                payload: JSON.stringify(payload)
            });
            throw new UnauthorizedException('Erro ao gerar token');
        }
    }
} 