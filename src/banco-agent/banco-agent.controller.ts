import { Controller, Post } from '@nestjs/common';
import { BancoAgentService } from './banco-agent.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Banco Agent')
@Controller('banco-agent')
export class BancoAgentController {
    constructor(private readonly bancoAgentService: BancoAgentService) { }

    @Post('atualizar')
    @ApiOperation({ summary: 'Força a atualização imediata de todos os bancos' })
    async atualizarTodosBancos(): Promise<{ message: string }> {
        await this.bancoAgentService.atualizarTodosBancosAgora();
        return { message: 'Atualização dos bancos iniciada com sucesso' };
    }
} 