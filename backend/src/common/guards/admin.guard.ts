import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * Guard responsável por proteger rotas que requerem acesso administrativo
 * 
 * Verifica se a requisição contém o parâmetro eAdmin=true
 * Caso contrário, bloqueia o acesso à rota
 * 
 * @example
 * // Uso em um controller
 * @UseGuards(AdminGuard)
 * @Get('rota-admin')
 * rotaProtegida() {
 *   // Apenas administradores podem acessar
 * }
 */
@Injectable()
export class AdminGuard implements CanActivate {
  /**
   * Verifica se a requisição tem permissão de administrador
   * @param context - Contexto da requisição
   * @returns true se tiver acesso, false caso contrário
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.query.eAdmin === 'true';
  }
} 