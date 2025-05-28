import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banco, BancoDocument, AtualizacaoHistorico } from './schemas/banco.schema';

/**
 * Interface que define a resposta do histórico de um banco
 * 
 * @property nome_banco - Nome do banco
 * @property ultima_atualizacao - Data da última atualização
 * @property historico - Lista de atualizações
 */
export interface HistoricoResponse {
  nome_banco: string;
  ultima_atualizacao: Date;
  historico: AtualizacaoHistorico[];
}

/**
 * Interface que define a resposta com dados específicos do banco
 * 
 * @property taxas - Conjunto de taxas aplicadas pelo banco
 * @property caracteristicas - Características operacionais
 */
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

/**
 * Interface que define um tipo de investimento
 * 
 * @property tipo - Identificador do tipo
 * @property nome - Nome amigável
 * @property descricao - Descrição detalhada
 */
export interface TipoInvestimento {
  tipo: string;
  nome: string;
  descricao: string;
}

/**
 * Serviço responsável pela lógica de negócio relacionada a bancos
 * 
 * @description
 * Este serviço implementa todas as operações de negócio
 * relacionadas aos bancos, incluindo:
 * - Consultas e buscas
 * - Formatação de dados
 * - Gestão de recursos
 * - Processamento de informações
 * 
 * O serviço utiliza o Mongoose para persistência e
 * implementa validações e tratamentos de erro.
 */
@Injectable()
export class BancosService {
  constructor(
    @InjectModel(Banco.name) private bancoModel: Model<BancoDocument>
  ) { }

  /**
   * Busca todos os bancos cadastrados
   * 
   * @description
   * Retorna uma lista completa de todos os bancos
   * cadastrados no sistema.
   * 
   * @returns Promise<Banco[]> Lista de bancos
   */
  async findAll(): Promise<Banco[]> {
    return this.bancoModel.find().exec();
  }

  /**
   * Busca um banco específico por ID
   * 
   * @description
   * Localiza e retorna um banco pelo seu ID único.
   * 
   * @param id ID único do banco
   * @returns Promise<Banco> Dados do banco
   * @throws {NotFoundException} Se o banco não for encontrado
   */
  async findById(id: string): Promise<Banco> {
    const banco = await this.bancoModel.findById(id);
    if (!banco) {
      throw new NotFoundException('Banco não encontrado');
    }
    return banco;
  }

  /**
   * Retorna dados específicos de um banco
   * 
   * @description
   * Formata e retorna um conjunto específico de dados
   * do banco, incluindo taxas e características.
   * 
   * @param id ID único do banco
   * @returns Promise<DadosBancoResponse> Dados formatados
   * @throws {NotFoundException} Se o banco não for encontrado
   */
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

  /**
   * Lista tipos de investimento disponíveis
   * 
   * @description
   * Retorna os tipos de investimento oferecidos pelo banco,
   * com nomes amigáveis e descrições detalhadas.
   * 
   * @param id ID único do banco
   * @returns Promise<TipoInvestimento[]> Lista de tipos
   * @throws {NotFoundException} Se o banco não for encontrado
   */
  async getTiposInvestimento(id: string): Promise<TipoInvestimento[]> {
    const banco = await this.findById(id);

    return banco.investimentos_disponiveis.map(inv => ({
      tipo: inv.tipo,
      nome: this.getNomeTipoInvestimento(inv.tipo),
      descricao: this.getDescricaoTipoInvestimento(inv.tipo)
    }));
  }

  /**
   * Lista investimentos disponíveis
   * 
   * @description
   * Retorna a lista completa de investimentos
   * disponíveis no banco com suas características.
   * 
   * @param id ID único do banco
   * @returns Promise<any> Lista de investimentos
   * @throws {NotFoundException} Se o banco não for encontrado
   */
  async getInvestimentosDisponiveis(id: string) {
    const banco = await this.findById(id);
    return banco.investimentos_disponiveis;
  }

  /**
   * Obtém o nome amigável de um tipo de investimento
   * 
   * @description
   * Converte o identificador técnico do tipo de investimento
   * em um nome mais amigável para exibição.
   * 
   * @param tipo Identificador do tipo
   * @returns string Nome amigável
   * @private
   */
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

  /**
   * Obtém a descrição de um tipo de investimento
   * 
   * @description
   * Retorna uma descrição detalhada explicando
   * as características do tipo de investimento.
   * 
   * @param tipo Identificador do tipo
   * @returns string Descrição detalhada
   * @private
   */
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

  /**
   * Retorna o histórico de atualizações
   * 
   * @description
   * Fornece o histórico completo de atualizações do banco,
   * incluindo datas e valores atualizados.
   * 
   * @param id ID único do banco
   * @returns Promise<HistoricoResponse> Histórico formatado
   * @throws {NotFoundException} Se o banco não for encontrado
   */
  async getHistorico(id: string): Promise<HistoricoResponse> {
    const banco = await this.findById(id);

    return {
      nome_banco: banco.nome_banco,
      ultima_atualizacao: banco.ultima_atualizacao,
      historico: banco.historico_atualizacoes
    };
  }

  /**
   * Realiza upload da logo do banco
   * 
   * @description
   * Processa e armazena uma nova logo para o banco,
   * convertendo a imagem para formato Base64.
   * 
   * @param id ID único do banco
   * @param file Arquivo de imagem
   * @returns Promise<Banco> Banco atualizado
   * @throws {NotFoundException} Se o banco não for encontrado
   */
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

  /**
   * Remove a logo do banco
   * 
   * @description
   * Exclui a logo atual do banco, limpando o
   * campo logoBase64 no banco de dados.
   * 
   * @param id ID único do banco
   * @returns Promise<Banco> Banco atualizado
   * @throws {NotFoundException} Se o banco não for encontrado
   */
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