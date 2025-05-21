import { Injectable } from '@nestjs/common';
import { TipoInvestimento, CaracteristicasInvestimento } from '../schemas/investimento.schema';

interface ResultadoCalculo {
  rendimentoBruto: number;
  valorLiquido: number;
  valorIOF: number;
  valorImpostoRenda: number;
  percentualRendimento: number;
  valorEstimado: number;
}

@Injectable()
export class CalculoInvestimentoService {
  calcularRendimento(
    tipoInvestimento: TipoInvestimento,
    caracteristicas: CaracteristicasInvestimento,
    valorInvestimento: number,
    diasCorridos: number,
    cdi: number
  ): ResultadoCalculo {
    let rendimentoBruto = 0;
    const taxaDiaria = Math.pow(1 + (cdi / 100), 1 / 365) - 1;

    switch (tipoInvestimento) {
      case TipoInvestimento.RENDA_FIXA_CDB:
      case TipoInvestimento.RENDA_FIXA_LCI:
      case TipoInvestimento.RENDA_FIXA_LCA:
        rendimentoBruto = this.calcularRendaFixa(
          valorInvestimento,
          caracteristicas.percentual_indexador || 100,
          taxaDiaria,
          diasCorridos
        );
        break;

      case TipoInvestimento.TESOURO_SELIC:
        rendimentoBruto = this.calcularTesouroSelic(
          valorInvestimento,
          caracteristicas.percentual_indexador || 100,
          taxaDiaria,
          diasCorridos
        );
        break;

      case TipoInvestimento.TESOURO_IPCA:
        rendimentoBruto = this.calcularTesouroIPCA(
          valorInvestimento,
          caracteristicas.rentabilidade_anual || 0,
          diasCorridos
        );
        break;

      case TipoInvestimento.TESOURO_PREFIXADO:
        rendimentoBruto = this.calcularTesouroPrefixado(
          valorInvestimento,
          caracteristicas.rentabilidade_anual || 0,
          diasCorridos
        );
        break;

      case TipoInvestimento.POUPANCA:
        rendimentoBruto = this.calcularPoupanca(
          valorInvestimento,
          cdi,
          diasCorridos
        );
        break;

      case TipoInvestimento.FUNDOS_RENDA_FIXA:
      case TipoInvestimento.FUNDOS_MULTIMERCADO:
        rendimentoBruto = this.calcularFundos(
          valorInvestimento,
          caracteristicas.rentabilidade_anual || 0,
          caracteristicas.taxa_administracao || 0,
          caracteristicas.taxa_performance || 0,
          diasCorridos
        );
        break;

      default:
        rendimentoBruto = valorInvestimento * Math.pow(1 + taxaDiaria, diasCorridos);
    }

    // Cálculo do IOF regressivo
    let taxaIOF = 0;
    if (diasCorridos <= 30) {
      taxaIOF = (30 - diasCorridos) * 0.0033;
    }

    const lucro = rendimentoBruto - valorInvestimento;
    const valorIOF = this.calcularIOF(lucro, taxaIOF, tipoInvestimento);
    const impostoRenda = this.calcularAliquotaIR(diasCorridos, tipoInvestimento);
    const valorImpostoRenda = this.calcularImpostoRenda(lucro - valorIOF, impostoRenda, tipoInvestimento);
    const valorLiquido = rendimentoBruto - valorIOF - valorImpostoRenda;
    const percentualRendimento = ((valorLiquido - valorInvestimento) / valorInvestimento) * 100;

    // Projeção futura
    const diasRestantes = Math.max(0, diasCorridos - Math.floor((new Date().getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
    const valorEstimado = valorInvestimento * Math.pow(1 + taxaDiaria, diasRestantes);

    return {
      rendimentoBruto,
      valorLiquido,
      valorIOF,
      valorImpostoRenda,
      percentualRendimento,
      valorEstimado
    };
  }

  private calcularRendaFixa(valor: number, percentualCDI: number, taxaDiaria: number, dias: number): number {
    const taxaEfetiva = taxaDiaria * (percentualCDI / 100);
    return valor * Math.pow(1 + taxaEfetiva, dias);
  }

  private calcularTesouroSelic(valor: number, percentualSelic: number, taxaDiaria: number, dias: number): number {
    const taxaEfetiva = taxaDiaria * (percentualSelic / 100);
    return valor * Math.pow(1 + taxaEfetiva, dias);
  }

  private calcularTesouroIPCA(valor: number, rentabilidadeAnual: number, dias: number): number {
    const inflacaoEstimada = 4.5; // Valor de referência, pode ser parametrizado
    const taxaAnual = (1 + rentabilidadeAnual / 100) * (1 + inflacaoEstimada / 100) - 1;
    const taxaDiaria = Math.pow(1 + taxaAnual, 1 / 365) - 1;
    return valor * Math.pow(1 + taxaDiaria, dias);
  }

  private calcularTesouroPrefixado(valor: number, rentabilidadeAnual: number, dias: number): number {
    const taxaDiaria = Math.pow(1 + rentabilidadeAnual / 100, 1 / 365) - 1;
    return valor * Math.pow(1 + taxaDiaria, dias);
  }

  private calcularPoupanca(valor: number, cdi: number, dias: number): number {
    // Regra: Se SELIC > 8.5% a.a.: 0.5% a.m. + TR; Se SELIC <= 8.5% a.a.: 70% da SELIC
    const selicAnual = cdi; // Considerando CDI próximo da SELIC
    let rendimentoMensal: number;

    if (selicAnual > 8.5) {
      rendimentoMensal = 0.5 / 100; // 0.5% ao mês + TR (TR considerada 0 para simplificar)
    } else {
      rendimentoMensal = (selicAnual * 0.7) / 12 / 100;
    }

    const mesesDecorridos = dias / 30;
    return valor * Math.pow(1 + rendimentoMensal, mesesDecorridos);
  }

  private calcularFundos(
    valor: number,
    rentabilidadeAnual: number,
    taxaAdministracao: number,
    taxaPerformance: number,
    dias: number
  ): number {
    const taxaDiaria = Math.pow(1 + rentabilidadeAnual / 100, 1 / 365) - 1;
    const rendimentoBruto = valor * Math.pow(1 + taxaDiaria, dias);
    
    // Desconta taxa de administração
    const custoAdministracao = (rendimentoBruto - valor) * (taxaAdministracao / 100);
    
    // Calcula taxa de performance se houver rendimento acima do benchmark
    const benchmark = 0.02; // 2% como exemplo, pode ser parametrizado
    let custoPerformance = 0;
    const rendimentoPercentual = (rendimentoBruto - valor) / valor;
    if (rendimentoPercentual > benchmark) {
      custoPerformance = (rendimentoBruto - valor - (valor * benchmark)) * (taxaPerformance / 100);
    }

    return rendimentoBruto - custoAdministracao - custoPerformance;
  }

  private calcularIOF(lucro: number, taxaIOF: number, tipo: TipoInvestimento): number {
    // LCI, LCA e alguns outros investimentos são isentos de IOF
    if ([TipoInvestimento.RENDA_FIXA_LCI, TipoInvestimento.RENDA_FIXA_LCA].includes(tipo)) {
      return 0;
    }
    return lucro * taxaIOF;
  }

  private calcularAliquotaIR(dias: number, tipo: TipoInvestimento): number {
    // LCI, LCA são isentos de IR
    if ([TipoInvestimento.RENDA_FIXA_LCI, TipoInvestimento.RENDA_FIXA_LCA].includes(tipo)) {
      return 0;
    }

    // Tabela regressiva de IR
    if (dias <= 180) return 0.225; // 22.5%
    if (dias <= 360) return 0.20;  // 20%
    if (dias <= 720) return 0.175; // 17.5%
    return 0.15;                   // 15%
  }

  private calcularImpostoRenda(lucroLiquido: number, aliquota: number, tipo: TipoInvestimento): number {
    // LCI, LCA são isentos de IR
    if ([TipoInvestimento.RENDA_FIXA_LCI, TipoInvestimento.RENDA_FIXA_LCA].includes(tipo)) {
      return 0;
    }
    return lucroLiquido * aliquota;
  }
} 