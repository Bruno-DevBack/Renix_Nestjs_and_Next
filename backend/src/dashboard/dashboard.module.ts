import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Dashboard, DashboardSchema } from './schemas/dashboard.schema';
import { PdfService } from './pdf.service';

/**
 * Módulo responsável por gerenciar os dashboards de investimentos
 * 
 * Este módulo:
 * - Gerencia a criação e visualização de dashboards
 * - Processa dados de investimentos para visualização
 * - Gera relatórios em PDF dos dashboards
 * - Calcula métricas e indicadores de performance
 * - Fornece análises comparativas de investimentos
 * - Mantém o histórico de dashboards por usuário
 */
@Module({
  imports: [
    // Registra o modelo de Dashboard no Mongoose
    MongooseModule.forFeature([{ name: Dashboard.name, schema: DashboardSchema }])
  ],
  controllers: [DashboardController], // Controller que gerencia as rotas de dashboard
  providers: [
    DashboardService,               // Service principal de dashboard
    PdfService                      // Service para geração de PDFs
  ]
})
export class DashboardModule { } 