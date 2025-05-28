import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Dashboard, DashboardSchema } from './schemas/dashboard.schema';
import { PdfService } from './pdf.service';
import { AuthModule } from '../auth/auth.module';

/**
 * Módulo central para gerenciamento de dashboards de investimentos
 * 
 * @description
 * Este módulo implementa toda a infraestrutura necessária para
 * gerenciar dashboards de análise de investimentos. Inclui:
 * 
 * Funcionalidades principais:
 * - Criação e gestão de dashboards personalizados
 * - Análise de performance de investimentos
 * - Geração de relatórios em PDF
 * - Cálculo de métricas e indicadores
 * - Comparação entre investimentos
 * - Histórico de análises
 * 
 * Integrações:
 * - MongoDB via Mongoose para persistência
 * - Autenticação via AuthModule
 * - Geração de PDFs
 * - APIs de dados financeiros
 * 
 * @example
 * // Importação e uso em outros módulos
 * @Module({
 *   imports: [DashboardModule],
 *   // ... outras configurações
 * })
 * export class AppModule {}
 */
@Module({
  imports: [
    // Configura o modelo Dashboard no MongoDB via Mongoose
    // Permite operações CRUD na coleção de dashboards
    MongooseModule.forFeature([{ name: Dashboard.name, schema: DashboardSchema }]),

    // Integra autenticação e autorização
    AuthModule
  ],
  controllers: [
    DashboardController  // Gerencia endpoints REST para operações com dashboards
  ],
  providers: [
    DashboardService,    // Implementa a lógica de negócio dos dashboards
    PdfService          // Fornece funcionalidades de geração de PDFs
  ],
  exports: [
    DashboardService    // Permite que outros módulos utilizem o serviço de dashboards
  ]
})
export class DashboardModule { } 