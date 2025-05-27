/**
 * Serviço responsável pela autenticação e gerenciamento de tokens JWT
 * 
 * Este serviço:
 * - Gera tokens JWT para usuários autenticados
 * - Valida tokens existentes
 * - Verifica a autenticidade dos usuários
 */

import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UsuariosService))
        private readonly usuariosService: UsuariosService,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * Gera um novo token JWT para um usuário autenticado
     * 
     * @param userId - ID do usuário
     * @param email - Email do usuário
     * @param isAdmin - Flag indicando se o usuário é administrador
     * @returns Objeto contendo o token de acesso e tempo de expiração
     */
    async generateToken(userId: string, email: string, isAdmin: boolean, nome: string) {
        const now = Math.floor(Date.now() / 1000); // Converte para segundos
        const expiresIn = 24 * 60 * 60; // 24 horas em segundos

        const payload = {
            sub: userId,
            email: email,
            isAdmin: isAdmin,
            nome: nome,
            iat: now,
            exp: now + expiresIn
        };

        return {
            access_token: this.jwtService.sign(payload),
            expires_in: expiresIn * 1000 // Retorna em milissegundos para o frontend
        };
    }

    /**
     * Valida a existência de um usuário pelo ID
     * 
     * @param userId - ID do usuário a ser validado
     * @returns Usuário encontrado ou null
     */
    async validateUser(userId: string) {
        return this.usuariosService.findOne(userId);
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

            // Verifica se o token expirou
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                return null;
            }

            return payload;
        } catch (error) {
            return null;
        }
    }
} 