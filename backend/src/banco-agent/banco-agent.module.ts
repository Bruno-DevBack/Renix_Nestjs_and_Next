import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { BancoAgentService } from './banco-agent.service';
import { BancoAgentController } from './banco-agent.controller';
import { Banco, BancoSchema } from '../bancos/schemas/banco.schema';

/**
 * Módulo responsável pelo agente automatizado de atualização de bancos
 * 
 * @description
 * Este módulo implementa um agente automatizado que gerencia e mantém
 * atualizadas as informações bancárias no sistema. Suas responsabilidades incluem:
 * 
 * Funcionalidades principais:
 * - Agendamento e execução de tarefas automáticas
 * - Coleta periódica de informações bancárias
 * - Atualização de taxas e rendimentos
 * - Sincronização de dados com fontes externas
 * - Manutenção de logos e recursos visuais
 * 
 * Componentes:
 * - ScheduleModule: Gerenciamento de tarefas agendadas
 * - MongooseModule: Persistência de dados dos bancos
 * - BancoAgentService: Lógica de atualização
 * - BancoAgentController: Endpoints de controle
 * 
 * @example
 * // Uso do módulo em outro módulo da aplicação
 * @Module({
 *   imports: [BancoAgentModule],
 *   // ... outras configurações
 * })
 * export class AppModule {}
 */
@Module({
    imports: [
        // Configura o módulo de agendamento para tarefas automáticas
        ScheduleModule.forRoot(),

        // Registra o modelo de Banco no MongoDB via Mongoose
        // Permite operações CRUD na coleção de bancos
        MongooseModule.forFeature([{ name: Banco.name, schema: BancoSchema }])
    ],
    controllers: [
        BancoAgentController  // Controller para operações manuais e monitoramento do agente
    ],
    providers: [
        BancoAgentService    // Serviço que implementa a lógica de atualização automática
    ],
    exports: [
        BancoAgentService    // Permite que outros módulos utilizem o serviço de atualização
    ]
})
export class BancoAgentModule { } 