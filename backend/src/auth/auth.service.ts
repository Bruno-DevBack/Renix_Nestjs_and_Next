/**
 * Serviço responsável pela autenticação e gerenciamento de tokens JWT
 * 
 * Este serviço:
 * - Gera tokens JWT para usuários autenticados
 * - Valida tokens existentes
 * - Verifica a autenticidade dos usuários
 */

import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UsuariosService))
        private readonly usuariosService: UsuariosService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    /**
     * Gera um novo token JWT para um usuário autenticado
     * 
     * @param userId - ID do usuário
     * @param email - Email do usuário
     * @param isAdmin - Flag indicando se o usuário é administrador
     * @returns Objeto contendo o token de acesso e tempo de expiração
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
     * Valida a existência de um usuário pelo ID
     * 
     * @param userId - ID do usuário a ser validado
     * @returns Usuário encontrado ou null
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
     * @param token - Token JWT a ser validado
     * @returns Payload decodificado do token ou null se inválido
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