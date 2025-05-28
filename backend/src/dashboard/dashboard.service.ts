/**
 * Serviço responsável pela lógica de negócio dos dashboards
 * 
 * @description
 * Este serviço implementa todas as operações relacionadas aos
 * dashboards de investimentos, incluindo:
 * 
 * Funcionalidades principais:
 * - Busca e listagem de dashboards
 * - Cálculos de rendimentos e indicadores
 * - Geração de relatórios em PDF
 * - Análise de performance
 * - Gestão de dados do usuário
 * 
 * O serviço utiliza:
 * - MongoDB via Mongoose para persistência
 * - PdfService para geração de relatórios
 * - Cálculos financeiros complexos
 * - Logging detalhado para debug
 * 
 * @example
 * // Exemplo de uso em um controller
 * @Controller('dashboard')
 * export class DashboardController {
 *   constructor(private dashboardService: DashboardService) {}
 * 
 *   @Get()
 *   async findAll() {
 *     return this.dashboardService.findAll();
 *   }
 * }
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Dashboard, DashboardDocument } from './schemas/dashboard.schema';
import { PdfService } from './pdf.service';

@Injectable()
export class DashboardService {
  /**
   * Construtor do serviço de dashboard
   * 
   * @param dashboardModel - Modelo Mongoose para operações com dashboards
   * @param pdfService - Serviço para geração de PDFs
   */
  constructor(
    @InjectModel(Dashboard.name) private dashboardModel: Model<DashboardDocument>,
    private pdfService: PdfService
  ) { }

  /**
   * Lista todos os dashboards cadastrados
   * 
   * @description
   * Busca e retorna todos os dashboards existentes no banco de dados.
   * Inclui logging detalhado para debug.
   * 
   * @returns Promise<DashboardDocument[]> Lista de dashboards
   * @throws {Error} Se houver erro na consulta ao banco
   */
  async findAll(): Promise<DashboardDocument[]> {
    console.log('Debug - Buscando todos os dashboards');
    try {
      const dashboards = await this.dashboardModel.find().exec();
      console.log('Debug - Dashboards encontrados:', {
        quantidade: dashboards.length,
        ids: dashboards.map(d => d._id)
      });
      return dashboards;
    } catch (error) {
      console.error('Debug - Erro ao buscar dashboards:', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Busca um dashboard específico por ID
   * 
   * @description
   * Localiza e retorna um dashboard pelo seu ID único.
   * Valida o formato do ID antes da busca.
   * 
   * @param id - ID único do dashboard
   * @returns Promise<DashboardDocument | null> Dashboard encontrado ou null
   * @throws {BadRequestException} Se o ID for inválido
   */
  async findOne(id: string): Promise<DashboardDocument | null> {
    try {
      console.log('Debug - Buscando dashboard por ID:', id);

      if (!isValidObjectId(id)) {
        console.error('Debug - ID de dashboard inválido:', id);
        throw new BadRequestException('ID de dashboard inválido');
      }

      const dashboard = await this.dashboardModel
        .findById(id)
        .exec();

      console.log('Debug - Resultado da busca:', dashboard ? 'Dashboard encontrado' : 'Dashboard não encontrado');

      if (!dashboard) {
        return null;
      }

      console.log('Debug - Dashboard encontrado:', {
        id: dashboard._id,
        usuario_id: dashboard.usuario_id,
        valor_investido: dashboard.valor_investido,
        tipo_investimento: dashboard.tipo_investimento
      });

      return dashboard;
    } catch (error) {
      console.error('Debug - Erro ao buscar dashboard:', {
        id,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Busca dashboards de um usuário específico
   * 
   * @description
   * Retorna todos os dashboards associados a um usuário.
   * Valida o formato do ID do usuário antes da busca.
   * 
   * @param usuarioId - ID único do usuário
   * @returns Promise<DashboardDocument[]> Lista de dashboards do usuário
   * @throws {BadRequestException} Se o ID do usuário for inválido
   */
  async findByUsuario(usuarioId: string): Promise<DashboardDocument[]> {
    console.log('Debug - Buscando dashboards do usuário:', usuarioId);
    try {
      if (!isValidObjectId(usuarioId)) {
        console.error('Debug - ID de usuário inválido:', usuarioId);
        throw new BadRequestException('ID de usuário inválido');
      }

      const dashboards = await this.dashboardModel
        .find({ usuario_id: usuarioId })
        .exec();

      console.log('Debug - Dashboards do usuário encontrados:', {
        usuarioId,
        quantidade: dashboards.length,
        ids: dashboards.map(d => d._id)
      });

      return dashboards;
    } catch (error) {
      console.error('Debug - Erro ao buscar dashboards do usuário:', {
        usuarioId,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Gera um relatório PDF do dashboard
   * 
   * @description
   * Cria um relatório PDF detalhado do dashboard, incluindo:
   * - Dados do investimento
   * - Rendimentos e taxas
   * - Indicadores de mercado
   * - Gráficos e análises
   * 
   * @param id - ID único do dashboard
   * @returns Promise<Buffer> Buffer contendo o PDF gerado
   * @throws {NotFoundException} Se o dashboard não for encontrado
   */
  async gerarPdf(id: string): Promise<Buffer> {
    try {
      console.log('Debug - Buscando dashboard para PDF:', id);

      const dashboard = await this.dashboardModel.findById(id);
      if (!dashboard) {
        console.log('Debug - Dashboard não encontrado:', id);
        throw new NotFoundException('Dashboard não encontrado');
      }

      console.log('Debug - Dashboard encontrado, processando dados para PDF');

      // Garantir que todos os campos numéricos existam para evitar erros no PDF
      const dadosDashboard = {
        ...dashboard.toObject(),
        valor_investido: dashboard.valor_investido || 0,
        valor_atual: dashboard.valor_atual || 0,
        rendimento: {
          valor_bruto: dashboard.rendimento?.valor_bruto || 0,
          valor_liquido: dashboard.rendimento?.valor_liquido || 0,
          valor_rendido: (dashboard.rendimento?.valor_liquido || 0) - (dashboard.valor_investido || 0),
          rentabilidade_periodo: dashboard.rendimento?.rentabilidade_periodo || 0,
          rentabilidade_anualizada: dashboard.rendimento?.rentabilidade_anualizada || 0,
          imposto_renda: dashboard.rendimento?.imposto_renda || 0,
          iof: dashboard.rendimento?.iof || 0,
          outras_taxas: dashboard.rendimento?.outras_taxas || 0
        },
        indicadores_mercado: {
          selic: dashboard.indicadores_mercado?.selic || 0,
          cdi: dashboard.indicadores_mercado?.cdi || 0,
          ipca: dashboard.indicadores_mercado?.ipca || 0
        }
      };

      console.log('Debug - Iniciando geração do PDF');
      const buffer = await this.pdfService.gerarPdfDashboard(dadosDashboard);
      console.log('Debug - PDF gerado com sucesso');

      return buffer;
    } catch (error) {
      console.error('Debug - Erro ao gerar PDF:', {
        id,
        erro: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Calcula o valor total investido
   * 
   * @description
   * Soma todos os valores investidos nos diferentes
   * investimentos do dashboard.
   * 
   * @param dashboard - Dashboard para cálculo
   * @returns number Valor total investido
   * @private
   */
  private calcularTotalInvestido(dashboard: Dashboard): number {
    return dashboard.investimentos?.reduce((total, inv) => total + inv.valor, 0) || 0;
  }

  /**
   * Calcula o rendimento médio dos investimentos
   * 
   * @description
   * Calcula a média dos rendimentos de todos os
   * investimentos do dashboard.
   * 
   * @param dashboard - Dashboard para cálculo
   * @returns number Rendimento médio
   * @private
   */
  private calcularRendimentoMedio(dashboard: Dashboard): number {
    const rendimentos = dashboard.investimentos?.map(inv => inv.rendimento) || [];
    if (rendimentos.length === 0) return 0;
    return rendimentos.reduce((a, b) => a + b) / rendimentos.length;
  }

  /**
   * Calcula o risco médio dos investimentos
   * 
   * @description
   * Calcula a média dos níveis de risco de todos os
   * investimentos do dashboard.
   * 
   * @param dashboard - Dashboard para cálculo
   * @returns number Risco médio (arredondado)
   * @private
   */
  private calcularRiscoMedio(dashboard: Dashboard): number {
    const riscos = dashboard.investimentos?.map(inv => inv.risco) || [];
    if (riscos.length === 0) return 0;
    return Math.round(riscos.reduce((a, b) => a + b) / riscos.length);
  }

  /**
   * Calcula a distribuição dos investimentos
   * 
   * @description
   * Agrupa os investimentos por tipo e calcula
   * o valor total em cada categoria.
   * 
   * @param dashboard - Dashboard para cálculo
   * @returns Array de objetos com tipo e valor
   * @private
   */
  private calcularDistribuicao(dashboard: Dashboard): any[] {
    const distribuicao = {};
    dashboard.investimentos?.forEach(inv => {
      distribuicao[inv.tipo] = (distribuicao[inv.tipo] || 0) + inv.valor;
    });
    return Object.entries(distribuicao).map(([tipo, valor]) => ({ tipo, valor }));
  }

  /**
   * Calcula os rendimentos por banco
   * 
   * @description
   * Agrupa os rendimentos por banco e calcula
   * o valor total rendido em cada instituição.
   * 
   * @param dashboard - Dashboard para cálculo
   * @returns Array de objetos com banco e valor
   * @private
   */
  private calcularRendimentos(dashboard: Dashboard): any[] {
    const rendimentos = {};
    dashboard.investimentos?.forEach(inv => {
      rendimentos[inv.banco] = (rendimentos[inv.banco] || 0) + inv.rendimento;
    });
    return Object.entries(rendimentos).map(([banco, valor]) => ({ banco, valor }));
  }

  /**
   * Gera comparativo detalhado dos investimentos
   * 
   * @description
   * Cria um comparativo entre os investimentos,
   * incluindo dados de rendimento, risco e liquidez.
   * 
   * @param dashboard - Dashboard para análise
   * @returns Array com comparativo detalhado
   * @private
   */
  private gerarComparativo(dashboard: Dashboard): any[] {
    return dashboard.investimentos?.map(inv => ({
      banco: inv.banco,
      investimento: inv.tipo,
      rendimento: inv.rendimento,
      risco: inv.risco,
      liquidez: this.traduzirLiquidez(inv.liquidez)
    })) || [];
  }

  /**
   * Traduz o código de liquidez para formato legível
   * 
   * @description
   * Converte o código numérico de liquidez para
   * uma string no formato "D+X".
   * 
   * @param liquidez - Código de liquidez (1-4)
   * @returns string Liquidez em formato legível
   * @private
   */
  private traduzirLiquidez(liquidez: number): string {
    switch (liquidez) {
      case 1: return 'D+0';
      case 2: return 'D+1';
      case 3: return 'D+30';
      case 4: return 'D+60';
      default: return 'D+0';
    }
  }

  /**
   * Remove um dashboard
   * 
   * @description
   * Exclui permanentemente um dashboard do banco de dados.
   * Valida o formato do ID antes da exclusão.
   * 
   * @param id - ID único do dashboard
   * @throws {BadRequestException} Se o ID for inválido
   * @throws {NotFoundException} Se o dashboard não for encontrado
   */
  async remove(id: string): Promise<void> {
    console.log('Debug - Removendo dashboard:', id);
    try {
      if (!isValidObjectId(id)) {
        console.error('Debug - ID de dashboard inválido:', id);
        throw new BadRequestException('ID de dashboard inválido');
      }

      const resultado = await this.dashboardModel.deleteOne({ _id: id });

      if (resultado.deletedCount === 0) {
        console.error('Debug - Dashboard não encontrado para exclusão:', id);
        throw new NotFoundException('Dashboard não encontrado');
      }

      console.log('Debug - Dashboard removido com sucesso:', id);
    } catch (error) {
      console.error('Debug - Erro ao remover dashboard:', {
        id,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
} 