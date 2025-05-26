import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Guard responsável por implementar limitação de taxa de requisições
 * 
 * Estende o ThrottlerGuard do @nestjs/throttler para:
 * - Limitar o número de requisições por IP
 * - Prevenir ataques de força bruta
 * - Proteger a API contra sobrecarga
 * 
 * @example
 * // Uso em um controller
 * @UseGuards(RateLimitGuard)
 * @Controller('api')
 * export class ApiController {
 *   // Rotas protegidas contra excesso de requisições
 * }
 */
@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  /**
   * Obtém o identificador único para rastreamento de requisições
   * Usa o primeiro IP da lista de IPs ou o IP direto
   * @param req - Objeto da requisição
   * @returns String do IP para rastreamento
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ips.length ? req.ips[0] : req.ip;
  }
} 