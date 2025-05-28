import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvestimentosController } from './investimentos.controller';
import { InvestimentosService } from './investimentos.service';
import { Investimento, InvestimentoSchema } from './schemas/investimento.schema';
import { Dashboard, DashboardSchema } from '../dashboard/schemas/dashboard.schema';
import { Banco, BancoSchema } from '../bancos/schemas/banco.schema';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema';
import { CalculoInvestimentoService } from './services/calculo-investimento.service';
import { AuthModule } from '../auth/auth.module';

/**
 * Módulo responsável por gerenciar todas as operações de investimentos
 * 
 * Este módulo:
 * - Gerencia a criação e manutenção de investimentos
 * - Realiza cálculos de rendimentos e projeções
 * - Integra com bancos para obter taxas e condições
 * - Atualiza dashboards com informações de investimentos
 * - Mantém o histórico de investimentos dos usuários
 * - Fornece análises e comparativos de investimentos
 */
@Module({
  imports: [
    // Registra todos os modelos necessários no Mongoose
    MongooseModule.forFeature([
      { name: Investimento.name, schema: InvestimentoSchema }, // Modelo de Investimentos
      { name: Dashboard.name, schema: DashboardSchema },       // Modelo de Dashboards
      { name: Banco.name, schema: BancoSchema },              // Modelo de Bancos
      { name: Usuario.name, schema: UsuarioSchema },          // Modelo de Usuários
    ]),
    AuthModule // Importa o módulo de autenticação para validação do token JWT
  ],
  controllers: [InvestimentosController], // Controller que gerencia as rotas de investimentos
  providers: [
    InvestimentosService,              // Service principal de investimentos
    CalculoInvestimentoService         // Service especializado em cálculos
  ],
})
export class InvestimentosModule { } 