import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dashboard, DashboardDocument } from './schemas/dashboard.schema';
import { PdfService } from './pdf.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Dashboard.name) private dashboardModel: Model<DashboardDocument>,
    private pdfService: PdfService
  ) { }

  async findAll(): Promise<Dashboard[]> {
    return this.dashboardModel.find().exec();
  }

  async gerarPdf(id: string): Promise<Buffer> {
    const dashboard = await this.dashboardModel.findById(id);
    if (!dashboard) {
      throw new Error('Dashboard não encontrado');
    }

    const dadosDashboard = {
      totalInvestido: this.calcularTotalInvestido(dashboard),
      rendimentoMedio: this.calcularRendimentoMedio(dashboard),
      riscoMedio: this.calcularRiscoMedio(dashboard),
      distribuicao: this.calcularDistribuicao(dashboard),
      rendimentos: this.calcularRendimentos(dashboard),
      comparativo: this.gerarComparativo(dashboard)
    };

    return this.pdfService.gerarPdfDashboard(dadosDashboard);
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