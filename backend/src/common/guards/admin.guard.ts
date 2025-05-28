import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * Guard responsável por proteger rotas que requerem acesso administrativo
 * 
 * Este guard implementa a lógica de verificação de permissões administrativas
 * verificando se a requisição contém o parâmetro eAdmin=true na query string.
 * 
 * @description
 * O AdminGuard é utilizado para proteger rotas que devem ser acessadas apenas
 * por usuários com privilégios administrativos. Ele implementa a interface
 * CanActivate do NestJS para realizar esta verificação.
 * 
 * @example
 * // Uso em um controller
 * @UseGuards(AdminGuard)
 * @Get('rota-admin')
 * rotaProtegida() {
 *   // Apenas administradores podem acessar
 *   return 'Acesso permitido apenas para admins';
 * }
 */
@Injectable()
export class AdminGuard implements CanActivate {
  /**
   * Método responsável por verificar se a requisição tem permissão de administrador
   * 
   * @param context - Contexto da execução que contém informações sobre a requisição
   * @returns boolean - true se o usuário tiver acesso administrativo, false caso contrário
   * 
   * @description
   * O método extrai a query string da requisição e verifica se o parâmetro
   * eAdmin está presente e possui o valor 'true'. Esta é uma implementação
   * simplificada e pode ser expandida para incluir verificações mais robustas.
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.query.eAdmin === 'true';
  }
} 