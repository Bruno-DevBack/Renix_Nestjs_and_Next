import { Controller, Post } from '@nestjs/common';
import { BancoAgentService } from './banco-agent.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Controller responsável por gerenciar as operações manuais do agente de bancos
 * Permite forçar atualizações e verificar o status do agente
 */
@ApiTags('Banco Agent')
@Controller('banco-agent')
export class BancoAgentController {
    constructor(private readonly bancoAgentService: BancoAgentService) { }

    /**
     * Força a atualização imediata de todos os bancos cadastrados
     * Útil quando é necessário atualizar os dados fora do ciclo automático
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