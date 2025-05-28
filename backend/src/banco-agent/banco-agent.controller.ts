import { Controller, Post } from '@nestjs/common';
import { BancoAgentService } from './banco-agent.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Controller para operações manuais do agente de atualização de bancos
 * 
 * @description
 * Este controller fornece endpoints para interação manual com o agente
 * automatizado de atualização de bancos. Permite:
 * - Forçar atualizações imediatas
 * - Verificar status do agente
 * - Controlar o ciclo de atualizações
 * 
 * Todas as rotas são documentadas com Swagger para facilitar
 * o teste e integração.
 * 
 * @example
 * // Exemplo de requisição para forçar atualização
 * POST /banco-agent/atualizar
 * 
 * // Resposta esperada
 * {
 *   "message": "Atualização dos bancos iniciada com sucesso"
 * }
 */
@ApiTags('Banco Agent')
@Controller('banco-agent')
export class BancoAgentController {
    /**
     * Construtor do controller
     * @param bancoAgentService Serviço que implementa a lógica de atualização
     */
    constructor(private readonly bancoAgentService: BancoAgentService) { }

    /**
     * Endpoint para forçar atualização imediata dos bancos
     * 
     * @description
     * Este endpoint permite iniciar manualmente o processo de atualização
     * de todos os bancos cadastrados no sistema. É útil em situações como:
     * - Necessidade de atualização fora do ciclo automático
     * - Verificação de novos dados
     * - Testes de integração
     * - Correção de inconsistências
     * 
     * O processo é assíncrono e retorna imediatamente após iniciar
     * a atualização em background.
     * 
     * @returns Objeto com mensagem de confirmação
     * @throws {InternalServerErrorException} Se houver erro ao iniciar atualização
     */
    @Post('atualizar')
    @ApiOperation({ summary: 'Força a atualização imediata de todos os bancos' })
    @ApiResponse({ status: 200, description: 'Atualização iniciada com sucesso' })
    @ApiResponse({ status: 500, description: 'Erro ao iniciar atualização' })
    async atualizarTodosBancos(): Promise<{ message: string }> {
        await this.bancoAgentService.atualizarTodosBancosAgora();
        return { message: 'Atualização dos bancos iniciada com sucesso' };
    }
} 