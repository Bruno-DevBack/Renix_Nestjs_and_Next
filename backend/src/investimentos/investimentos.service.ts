/**
 * Serviço responsável por gerenciar operações de investimentos
 * 
 * @description
 * Este serviço implementa a lógica de negócio para:
 * - Criação e gestão de investimentos
 * - Cálculos de rendimentos e projeções
 * - Integração com dashboards
 * - Atualização de histórico do usuário
 * - Validações e regras de negócio
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Investimento, InvestimentoDocument } from './schemas/investimento.schema';
import { Dashboard, DashboardDocument } from '../dashboard/schemas/dashboard.schema';
import { Banco, BancoDocument } from '../bancos/schemas/banco.schema';
import { Usuario, UsuarioDocument } from '../usuarios/schemas/usuario.schema';
import { CreateInvestimentoDto } from './dto/create-investimento.dto';
import { CalculoInvestimentoService } from './services/calculo-investimento.service';

@Injectable()
export class InvestimentosService {
  /**
   * Construtor do serviço de investimentos
   * 
   * @param investimentoModel - Modelo Mongoose para investimentos
   * @param dashboardModel - Modelo Mongoose para dashboards
   * @param bancoModel - Modelo Mongoose para bancos
   * @param usuarioModel - Modelo Mongoose para usuários
   * @param calculoService - Serviço de cálculos financeiros
   */
  constructor(
    @InjectModel(Investimento.name) private investimentoModel: Model<InvestimentoDocument>,
    @InjectModel(Dashboard.name) private dashboardModel: Model<DashboardDocument>,
    @InjectModel(Banco.name) private bancoModel: Model<BancoDocument>,
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
    private calculoService: CalculoInvestimentoService
  ) { }

  /**
   * Cria um novo investimento
   * 
   * @description
   * Processo completo de criação de investimento:
   * 1. Valida usuário e banco
   * 2. Calcula rendimentos
   * 3. Cria registro do investimento
   * 4. Gera dashboard associado
   * 5. Atualiza histórico do usuário
   * 
   * @param createInvestimentoDto - DTO com dados do investimento
   * @returns Objeto com investimento e dashboard criados
   * @throws {NotFoundException} Se usuário ou banco não encontrado
   */
  async create(createInvestimentoDto: CreateInvestimentoDto) {
    const { usuario_id, banco_id, valor_investimento, data_inicio, data_fim, tipo_investimento, caracteristicas } = createInvestimentoDto;

    // Buscar o banco antes de criar o investimento para obter o CDI
    const banco = await this.bancoModel.findById(banco_id);
    const usuario = await this.usuarioModel.findById(usuario_id);

    if (!banco || !usuario) {
      throw new NotFoundException('Usuário ou banco não encontrado');
    }

    // Calcular o rendimento com base no tipo de investimento
    let rendimento = caracteristicas.rentabilidade_anual;
    if (!rendimento) {
      switch (tipo_investimento) {
        case 'TESOURO_SELIC':
          rendimento = banco.cdi; // Usa o CDI do banco
          break;
        case 'POUPANCA':
          rendimento = banco.cdi * 0.7; // 70% do CDI
          break;
        default:
          rendimento = banco.cdi; // Valor padrão
      }
    }

    // Mapear os campos do DTO para o schema do Mongoose
    const investimentoData = {
      ...createInvestimentoDto,
      valor: valor_investimento,
      banco: banco_id,
      rendimento: rendimento,
      tipo: tipo_investimento,
      usuario_id,
      banco_id,
      valor_investimento,
      data_inicio,
      data_fim,
      tipo_investimento,
      caracteristicas: {
        ...caracteristicas,
        rentabilidade_anual: rendimento // Atualiza também o valor na característica
      }
    };

    const novoInvestimento = new this.investimentoModel(investimentoData);
    await novoInvestimento.save();

    // Cálculos financeiros
    const diasCorridos = Math.ceil(
      (new Date(data_fim).getTime() - new Date(data_inicio).getTime()) / (1000 * 60 * 60 * 24)
    );

    const resultado = this.calculoService.calcularRendimento(
      tipo_investimento,
      caracteristicas,
      valor_investimento,
      diasCorridos,
      banco.cdi
    );

    // Criar dashboard
    const novoDashboard = new this.dashboardModel({
      usuario_id,
      nome_usuario: usuario.nome_usuario,
      banco_id,
      nome_banco: banco.nome_banco,
      investimento_id: novoInvestimento._id,
      tipo_investimento,
      valor_investido: valor_investimento,
      data_inicio,
      data_fim,
      dias_corridos: diasCorridos,
      rendimento: {
        valor_bruto: parseFloat(resultado.rendimentoBruto.toFixed(2)),
        valor_liquido: parseFloat(resultado.valorLiquido.toFixed(2)),
        valor_rendido: parseFloat((resultado.valorLiquido - valor_investimento).toFixed(2)),
        rentabilidade_periodo: parseFloat(resultado.percentualRendimento.toFixed(2)),
        rentabilidade_anualizada: parseFloat((resultado.percentualRendimento * 365 / diasCorridos).toFixed(2)),
        imposto_renda: parseFloat(resultado.valorImpostoRenda.toFixed(2)),
        iof: parseFloat(resultado.valorIOF.toFixed(2)),
        outras_taxas: 0
      },
      valor_atual: valor_investimento,
      valor_projetado: parseFloat(resultado.valorEstimado.toFixed(2)),
      indicadores_mercado: {
        selic: banco.cdi,
        cdi: banco.cdi,
        ipca: 4.5 // Valor padrão, pode ser atualizado depois
      },
      investimentos: [{
        valor: valor_investimento,
        rendimento: parseFloat(resultado.percentualRendimento.toFixed(2)),
        risco: caracteristicas.risco,
        tipo: tipo_investimento,
        banco: banco.nome_banco,
        liquidez: caracteristicas.liquidez
      }]
    });

    await novoDashboard.save();

    // Salvar no histórico do usuário
    await this.usuarioModel.findByIdAndUpdate(
      usuario_id,
      {
        $push: {
          historico_investimentos: {
            investimento_id: novoInvestimento._id,
            tipo: tipo_investimento,
            valor: valor_investimento,
            data: new Date(),
            banco: banco.nome_banco,
            rendimento: rendimento
          },
          historico_dashboards: {
            dashboard_id: novoDashboard._id,
            nome: `Dashboard - ${tipo_investimento} ${banco.nome_banco}`,
            data_geracao: new Date(),
            bancos_comparados: [banco.nome_banco],
            filtros_aplicados: []
          }
        }
      }
    );

    console.log('Criando investimento com valores:', {
      valor_investido: valor_investimento,
      valor_bruto: resultado.rendimentoBruto,
      valor_liquido: resultado.valorLiquido,
      valor_rendido: resultado.valorLiquido - valor_investimento,
      rendimento: rendimento
    });

    return {
      message: 'Investimento criado com sucesso',
      investimento: {
        ...novoInvestimento.toObject(),
        id: novoInvestimento._id
      },
      dashboard: {
        ...novoDashboard.toObject(),
        _id: novoDashboard._id
      }
    };
  }

  /**
   * Busca um investimento por ID
   * 
   * @param id - ID único do investimento
   * @returns Investimento encontrado
   * @throws {NotFoundException} Se investimento não encontrado
   */
  async findOne(id: string): Promise<Investimento> {
    const investimento = await this.investimentoModel.findById(id);
    if (!investimento) {
      throw new NotFoundException('Investimento não encontrado');
    }
    return investimento;
  }

  /**
   * Remove um investimento e seu dashboard associado
   * 
   * @param id - ID único do investimento
   * @returns Resultado da operação de remoção
   * @throws {NotFoundException} Se investimento não encontrado
   */
  async remove(id: string) {
    const investimento = await this.investimentoModel.findById(id);
    if (!investimento) {
      throw new NotFoundException('Investimento não encontrado');
    }

    // Remover dashboard associado
    await this.dashboardModel.deleteOne({ investimento_id: id });

    return this.investimentoModel.findByIdAndDelete(id);
  }

  /**
   * Lista todos os investimentos de um usuário
   * 
   * @param usuarioId - ID do usuário
   * @returns Lista de investimentos do usuário
   */
  async findAll(usuarioId: string): Promise<Investimento[]> {
    console.log('Buscando investimentos para o usuário:', usuarioId);
    try {
      const investimentos = await this.investimentoModel.find({ usuario_id: usuarioId });
      console.log(`Encontrados ${investimentos.length} investimentos`);
      return investimentos;
    } catch (error) {
      console.error('Erro ao buscar investimentos:', error);
      throw error;
    }
  }
} 