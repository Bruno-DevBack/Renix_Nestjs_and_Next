import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BancosController } from './bancos.controller';
import { BancosService } from './bancos.service';
import { Banco, BancoSchema } from './schemas/banco.schema';

/**
 * Módulo responsável por gerenciar as operações relacionadas aos bancos
 * 
 * Este módulo:
 * - Gerencia o cadastro e manutenção dos bancos no sistema
 * - Controla as informações de cada banco (taxas, investimentos, etc)
 * - Gerencia o upload e armazenamento de logos dos bancos
 * - Mantém o histórico de atualizações de cada banco
 * - Fornece endpoints para consulta de informações bancárias
 */
@Module({
  imports: [
    // Registra o modelo de Banco no Mongoose
    MongooseModule.forFeature([{ name: Banco.name, schema: BancoSchema }])
  ],
  controllers: [BancosController], // Controller que gerencia as rotas de bancos
  providers: [BancosService]      // Service que implementa a lógica de negócio
})
export class BancosModule { } 