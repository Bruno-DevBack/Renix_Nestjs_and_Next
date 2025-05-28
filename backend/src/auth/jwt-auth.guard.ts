import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard responsável pela autenticação JWT (JSON Web Token)
 * 
 * @description
 * Este guard estende o AuthGuard do Passport.js para implementar
 * a proteção de rotas baseada em JWT. Ele:
 * - Verifica a presença do token JWT no header Authorization
 * - Valida a autenticidade do token
 * - Extrai as informações do usuário do token
 * - Permite ou bloqueia o acesso à rota
 * 
 * @example
 * // Uso em um controller para proteger uma rota
 * @UseGuards(JwtAuthGuard)
 * @Get('perfil')
 * getPerfil(@Request() req) {
 *   return req.user; // Acesso aos dados do usuário autenticado
 * }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { } 