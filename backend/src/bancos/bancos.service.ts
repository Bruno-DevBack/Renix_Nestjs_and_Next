import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banco, BancoDocument, AtualizacaoHistorico } from './schemas/banco.schema';

export interface HistoricoResponse {
  nome_banco: string;
  ultima_atualizacao: Date;
  historico: AtualizacaoHistorico[];
}

export interface DadosBancoResponse {
  taxas: {
    IOF_diario: number;
    cdi: number;
    IR_ate_180_dias: number;
    IR_ate_360_dias: number;
    IR_ate_720_dias: number;
    IR_acima_720_dias: number;
  };
  caracteristicas: {
    rendimentoBase: number;
    taxaAdministracao: number;
    investimentoMinimo: number;
    liquidezDiaria: boolean;
  };
}

export interface TipoInvestimento {
  tipo: string;
  nome: string;
  descricao: string;
}

@Injectable()
export class BancosService {
  constructor(
    @InjectModel(Banco.name) private bancoModel: Model<BancoDocument>
  ) { }

  async findAll(): Promise<Banco[]> {
    return this.bancoModel.find().exec();
  }

  async findById(id: string): Promise<Banco> {
    const banco = await this.bancoModel.findById(id);
    if (!banco) {
      throw new NotFoundException('Banco não encontrado');
    }
    return banco;
  }

  async getDadosBanco(id: string): Promise<DadosBancoResponse> {
    const banco = await this.findById(id);
    
    return {
      taxas: {
        IOF_diario: banco.IOF_diario,
        cdi: banco.cdi,
        IR_ate_180_dias: banco.IR_ate_180_dias,
        IR_ate_360_dias: banco.IR_ate_360_dias,
        IR_ate_720_dias: banco.IR_ate_720_dias,
        IR_acima_720_dias: banco.IR_acima_720_dias,
      },
      caracteristicas: banco.caracteristicas
    };
  }

  async getTiposInvestimento(id: string): Promise<TipoInvestimento[]> {
    const banco = await this.findById(id);
    
    return banco.investimentos_disponiveis.map(inv => ({
      tipo: inv.tipo,
      nome: this.getNomeTipoInvestimento(inv.tipo),
      descricao: this.getDescricaoTipoInvestimento(inv.tipo)
    }));
  }

  async getInvestimentosDisponiveis(id: string) {
    const banco = await this.findById(id);
    return banco.investimentos_disponiveis;
  }

  private getNomeTipoInvestimento(tipo: string): string {
    const nomes = {
      CDB: 'Certificado de Depósito Bancário',
      LCI: 'Letra de Crédito Imobiliário',
      LCA: 'Letra de Crédito do Agronegócio',
      TESOURO_SELIC: 'Tesouro Selic',
      TESOURO_IPCA: 'Tesouro IPCA+',
      TESOURO_PREFIXADO: 'Tesouro Prefixado',
      POUPANCA: 'Poupança',
      FUNDOS_RF: 'Fundos de Renda Fixa',
      FUNDOS_MULTI: 'Fundos Multimercado',
      ACOES: 'Ações',
      FII: 'Fundos Imobiliários'
    };
    return nomes[tipo] || tipo;
  }

  private getDescricaoTipoInvestimento(tipo: string): string {
    const descricoes = {
      CDB: 'Título de renda fixa emitido por bancos com rentabilidade pré ou pós-fixada',
      LCI: 'Título de renda fixa vinculado a créditos imobiliários com isenção de IR',
      LCA: 'Título de renda fixa vinculado ao agronegócio com isenção de IR',
      TESOURO_SELIC: 'Título público indexado à taxa Selic',
      TESOURO_IPCA: 'Título público que oferece rentabilidade acima da inflação',
      TESOURO_PREFIXADO: 'Título público com rentabilidade fixa definida no momento da compra',
      POUPANCA: 'Investimento mais tradicional do Brasil, com rendimento atrelado à TR',
      FUNDOS_RF: 'Fundos que investem em títulos de renda fixa',
      FUNDOS_MULTI: 'Fundos que investem em diferentes classes de ativos',
      ACOES: 'Investimento em participações de empresas listadas na bolsa',
      FII: 'Fundos que investem em ativos imobiliários'
    };
    return descricoes[tipo] || 'Tipo de investimento específico do banco';
  }

  async getHistorico(id: string): Promise<HistoricoResponse> {
    const banco = await this.findById(id);

    return {
      nome_banco: banco.nome_banco,
      ultima_atualizacao: banco.ultima_atualizacao,
      historico: banco.historico_atualizacoes
    };
  }

  async uploadLogo(id: string, file: Express.Multer.File): Promise<Banco> {
    const banco = await this.findById(id);

    // Converter o buffer da imagem para base64
    const base64Image = file.buffer.toString('base64');
    banco.logoBase64 = `data:${file.mimetype};base64,${base64Image}`;
    const bancoAtualizado = await this.bancoModel.findByIdAndUpdate(
      id,
      { logoBase64: banco.logoBase64 },
      { new: true }
    );
    
    if (!bancoAtualizado) {
      throw new NotFoundException('Banco não encontrado ao atualizar logo');
    }
    
    return bancoAtualizado;
  }

  async deleteLogo(id: string): Promise<Banco> {
    const bancoAtualizado = await this.bancoModel.findByIdAndUpdate(
      id,
      { logoBase64: '' },
      { new: true }
    );
    
    if (!bancoAtualizado) {
      throw new NotFoundException('Banco não encontrado ao deletar logo');
    }
    
    return bancoAtualizado;
  }
} 