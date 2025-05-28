/**
 * Controller principal da aplicação
 * 
 * @description
 * Este é o controller raiz da aplicação, responsável por:
 * - Endpoint de healthcheck
 * - Verificação de status da API
 * - Rota padrão da aplicação
 * 
 * Funcionalidades:
 * - GET / - Retorna status da API
 * - Integração com AppService
 * - Monitoramento de saúde
 * 
 * @example
 * // Verificar status da API
 * GET /
 * Response: "Hello World!"
 */

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  /**
   * Endpoint de healthcheck da API
   * 
   * @description
   * Retorna uma mensagem simples para verificar
   * se a API está funcionando corretamente
   * 
   * @returns string Mensagem de status
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
