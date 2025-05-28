import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Guard responsável por implementar limitação de taxa de requisições (Rate Limiting)
 * 
 * Este guard estende o ThrottlerGuard do @nestjs/throttler para implementar
 * proteção contra excesso de requisições na API. Ele é fundamental para:
 * 
 * @description
 * - Limitar o número de requisições por IP em um determinado período
 * - Prevenir ataques de força bruta e DoS (Denial of Service)
 * - Proteger a API contra sobrecarga de requisições
 * - Garantir distribuição justa dos recursos do servidor
 * 
 * A configuração do limite de requisições é definida no módulo ThrottlerModule
 * nas configurações globais da aplicação.
 * 
 * @example
 * // Uso em um controller
 * @UseGuards(RateLimitGuard)
 * @Controller('api')
 * export class ApiController {
 *   // Todas as rotas deste controller serão protegidas contra excesso de requisições
 *   @Get()
 *   findAll() {
 *     return 'Esta rota está protegida contra excesso de requisições';
 *   }
 * }
 */
@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  /**
   * Obtém o identificador único para rastreamento de requisições
   * 
   * @param req - Objeto da requisição contendo informações do cliente
   * @returns String contendo o IP para rastreamento
   * 
   * @description
   * Este método é responsável por extrair o IP do cliente para ser usado
   * como identificador no controle de taxa de requisições. Ele:
   * - Verifica primeiro a lista de IPs (útil quando há proxies)
   * - Usa o primeiro IP da lista se disponível
   * - Caso contrário, usa o IP direto da requisição
   * 
   * O IP é usado como chave para controlar o número de requisições
   * permitidas em um determinado período de tempo.
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ips.length ? req.ips[0] : req.ip;
  }
} 