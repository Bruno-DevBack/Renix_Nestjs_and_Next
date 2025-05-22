import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { BancoAgentService } from './banco-agent.service';
import { BancoAgentController } from './banco-agent.controller';
import { Banco, BancoSchema } from '../bancos/schemas/banco.schema';

/**
 * Módulo responsável por gerenciar o agente automatizado de atualização de bancos
 * 
 * Este módulo:
 * - Configura o agendamento de tarefas para atualização automática dos bancos
 * - Gerencia a coleta e atualização de informações bancárias
 * - Mantém os dados dos bancos sempre atualizados
 * - Processa taxas, rendimentos e informações de mercado
 * - Atualiza automaticamente logos e informações visuais dos bancos
 */
@Module({
    imports: [
        // Configura o módulo de agendamento de tarefas
        ScheduleModule.forRoot(),
        // Registra o modelo de Banco no Mongoose
        MongooseModule.forFeature([{ name: Banco.name, schema: BancoSchema }])
    ],
    controllers: [BancoAgentController],  // Controller para operações manuais do agente
    providers: [BancoAgentService],       // Service que implementa a lógica do agente
    exports: [BancoAgentService]          // Exporta o service para uso em outros módulos
})
export class BancoAgentModule { } 