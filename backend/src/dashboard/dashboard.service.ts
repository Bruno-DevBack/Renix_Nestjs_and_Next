import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Dashboard, DashboardDocument } from './schemas/dashboard.schema';
import { PdfService } from './pdf.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Dashboard.name) private dashboardModel: Model<DashboardDocument>,
    private pdfService: PdfService
  ) { }

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

  private calcularTotalInvestido(dashboard: Dashboard): number {
    // Implementar lógica de cálculo do total investido
    return dashboard.investimentos?.reduce((total, inv) => total + inv.valor, 0) || 0;
  }

  private calcularRendimentoMedio(dashboard: Dashboard): number {
    // Implementar lógica de cálculo do rendimento médio
    const rendimentos = dashboard.investimentos?.map(inv => inv.rendimento) || [];
    if (rendimentos.length === 0) return 0;
    return rendimentos.reduce((a, b) => a + b) / rendimentos.length;
  }

  private calcularRiscoMedio(dashboard: Dashboard): number {
    // Implementar lógica de cálculo do risco médio
    const riscos = dashboard.investimentos?.map(inv => inv.risco) || [];
    if (riscos.length === 0) return 0;
    return Math.round(riscos.reduce((a, b) => a + b) / riscos.length);
  }

  private calcularDistribuicao(dashboard: Dashboard): any[] {
    // Implementar lógica de cálculo da distribuição dos investimentos
    const distribuicao = {};
    dashboard.investimentos?.forEach(inv => {
      distribuicao[inv.tipo] = (distribuicao[inv.tipo] || 0) + inv.valor;
    });
    return Object.entries(distribuicao).map(([tipo, valor]) => ({ tipo, valor }));
  }

  private calcularRendimentos(dashboard: Dashboard): any[] {
    // Implementar lógica de cálculo dos rendimentos por banco
    const rendimentos = {};
    dashboard.investimentos?.forEach(inv => {
      rendimentos[inv.banco] = (rendimentos[inv.banco] || 0) + inv.rendimento;
    });
    return Object.entries(rendimentos).map(([banco, valor]) => ({ banco, valor }));
  }

  private gerarComparativo(dashboard: Dashboard): any[] {
    // Implementar lógica de geração do comparativo detalhado
    return dashboard.investimentos?.map(inv => ({
      banco: inv.banco,
      investimento: inv.tipo,
      rendimento: inv.rendimento,
      risco: inv.risco,
      liquidez: this.traduzirLiquidez(inv.liquidez)
    })) || [];
  }

  private traduzirLiquidez(liquidez: number): string {
    switch (liquidez) {
      case 1: return 'D+0';
      case 2: return 'D+1';
      case 3: return 'D+30';
      case 4: return 'D+60';
      default: return 'D+0';
    }
  }
} 