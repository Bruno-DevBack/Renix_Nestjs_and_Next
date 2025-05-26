/**
 * Serviço responsável pela autenticação e gerenciamento de tokens JWT
 * 
 * Este serviço:
 * - Gera tokens JWT para usuários autenticados
 * - Valida tokens existentes
 * - Verifica a autenticidade dos usuários
 */

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class AuthService {
    constructor(
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
    async generateToken(userId: string, email: string, isAdmin: boolean) {
        const payload = {
            sub: userId,
            email: email,
            isAdmin: isAdmin,
            iat: Date.now(),
            exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas em milissegundos
        };

        return {
            access_token: this.jwtService.sign(payload),
            expires_in: 24 * 60 * 60 * 1000 // 24 horas em milissegundos
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
            return payload;
        } catch (error) {
            return null;
        }
    }
} 