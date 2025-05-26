import { Injectable, NotFoundException } from '@nestjs/common';
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
      throw new NotFoundException('Dashboard não encontrado');
    }

    const valorRendido = dashboard.rendimento.valor_liquido - dashboard.valor_investido;

    const dadosDashboard = {
      totalInvestido: dashboard.valor_investido,
      rendimentoMedio: dashboard.rendimento.rentabilidade_anualizada,
      riscoMedio: dashboard.investimentos[0].risco,
      distribuicao: [{
        tipo: dashboard.tipo_investimento,
        valor: dashboard.valor_investido
      }],
      rendimentos: [{
        banco: dashboard.nome_banco,
        valor: dashboard.rendimento.rentabilidade_periodo
      }],
      comparativo: [{
        banco: dashboard.nome_banco,
        investimento: dashboard.tipo_investimento,
        rendimento: dashboard.rendimento.rentabilidade_periodo,
        risco: dashboard.investimentos[0].risco,
        liquidez: dashboard.investimentos[0].liquidez
      }],
      detalhes: {
        valorBruto: dashboard.rendimento.valor_bruto,
        valorLiquido: dashboard.rendimento.valor_liquido,
        valorRendido: valorRendido,
        valorInvestido: dashboard.valor_investido,
        impostoRenda: dashboard.rendimento.imposto_renda,
        iof: dashboard.rendimento.iof,
        outrasTaxas: dashboard.rendimento.outras_taxas,
        dataInicio: dashboard.data_inicio,
        dataFim: dashboard.data_fim,
        diasCorridos: dashboard.dias_corridos,
        indicadoresMercado: dashboard.indicadores_mercado || {
          selic: 0,
          cdi: 0,
          ipca: 0
        }
      }
    };

    console.log('Dados do Dashboard:', {
      valor_investido: dashboard.valor_investido,
      valor_liquido: dashboard.rendimento.valor_liquido,
      valor_rendido: valorRendido
    });

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