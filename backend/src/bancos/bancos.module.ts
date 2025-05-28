import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BancosController } from './bancos.controller';
import { BancosService } from './bancos.service';
import { Banco, BancoSchema } from './schemas/banco.schema';

/**
 * Módulo central para gerenciamento de bancos no sistema
 * 
 * @description
 * Este módulo é responsável por toda a infraestrutura relacionada
 * aos bancos cadastrados no sistema. Suas responsabilidades incluem:
 * 
 * Funcionalidades principais:
 * - CRUD completo de bancos
 * - Gerenciamento de informações bancárias
 * - Controle de taxas e investimentos
 * - Gestão de recursos visuais (logos)
 * - Histórico de atualizações
 * 
 * Integrações:
 * - MongoDB via Mongoose para persistência
 * - Endpoints REST para acesso externo
 * - Validação de dados via DTOs
 * - Schemas para modelagem de dados
 * 
 * @example
 * // Importação e uso em outros módulos
 * @Module({
 *   imports: [BancosModule],
 *   // ... outras configurações
 * })
 * export class AppModule {}
 */
@Module({
  imports: [
    // Configura o modelo Banco no MongoDB via Mongoose
    // Permite operações CRUD na coleção de bancos
    MongooseModule.forFeature([{ name: Banco.name, schema: BancoSchema }])
  ],
  controllers: [
    BancosController  // Gerencia endpoints REST para operações com bancos
  ],
  providers: [
    BancosService     // Implementa a lógica de negócio para bancos
  ],
  exports: [
    BancosService     // Permite que outros módulos utilizem o serviço de bancos
  ]
})
export class BancosModule { } 