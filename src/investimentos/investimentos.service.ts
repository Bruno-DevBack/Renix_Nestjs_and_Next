import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Investimento, InvestimentoDocument } from './schemas/investimento.schema';
import { Dashboard, DashboardDocument } from '../dashboard/schemas/dashboard.schema';
import { Banco, BancoDocument } from '../bancos/schemas/banco.schema';
import { Usuario, UsuarioDocument } from '../usuarios/schemas/usuario.schema';
import { CreateInvestimentoDto } from './dto/create-investimento.dto';

@Injectable()
export class InvestimentosService {
  constructor(
    @InjectModel(Investimento.name) private investimentoModel: Model<InvestimentoDocument>,
    @InjectModel(Dashboard.name) private dashboardModel: Model<DashboardDocument>,
    @InjectModel(Banco.name) private bancoModel: Model<BancoDocument>,
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>
  ) { }

  async create(createInvestimentoDto: CreateInvestimentoDto) {
    const { usuario_id, banco_id, valor_investimento, data_inicio, data_fim } = createInvestimentoDto;

    const novoInvestimento = new this.investimentoModel(createInvestimentoDto);
    await novoInvestimento.save();

    const banco = await this.bancoModel.findById(banco_id);
    const usuario = await this.usuarioModel.findById(usuario_id);

    if (!banco || !usuario) {
      throw new NotFoundException('Usuário ou banco não encontrado');
    }

    // Cálculos financeiros
    const diasCorridos = Math.ceil(
      (new Date(data_fim).getTime() - new Date(data_inicio).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Cálculo com juros compostos
    const cdi = banco.cdi / 100;
    const taxaDiaria = Math.pow(1 + cdi, 1 / 365) - 1;
    const rendimentoBruto = valor_investimento * Math.pow(1 + taxaDiaria, diasCorridos);

    // Cálculo do IOF regressivo (máximo de 96% até 0% em 30 dias)
    let taxaIOF = 0;
    if (diasCorridos <= 30) {
      taxaIOF = (30 - diasCorridos) * 0.0033; // 0.33% por dia restante
    }

    // Cálculo de impostos
    const impostoRenda = this.calcularImpostoRenda(banco, diasCorridos);
    const lucro = rendimentoBruto - valor_investimento;
    const valorIOF = lucro * taxaIOF;
    const valorImpostoRenda = (lucro - valorIOF) * impostoRenda;
    const valorLiquido = rendimentoBruto - valorIOF - valorImpostoRenda;

    const percentualRendimento = ((valorLiquido - valor_investimento) / valor_investimento) * 100;

    // Projeção do valor estimado para o final do período
    const diasRestantes = Math.max(0, diasCorridos - Math.floor((new Date().getTime() - new Date(data_inicio).getTime()) / (1000 * 60 * 60 * 24)));
    const valorEstimado = valor_investimento * Math.pow(1 + taxaDiaria, diasRestantes);

    // Criar dashboard
    const novoDashboard = new this.dashboardModel({
      usuario_id,
      nome_usuario: usuario.nome_usuario,
      banco_id,
      nome_banco: banco.nome_banco,
      investimento_id: novoInvestimento._id,
      valor_bruto: parseFloat(rendimentoBruto.toFixed(2)),
      valor_liquido: parseFloat(valorLiquido.toFixed(2)),
      dias_corridos: diasCorridos,
      imposto_renda: parseFloat(valorImpostoRenda.toFixed(2)),
      IOF: parseFloat(valorIOF.toFixed(2)),
      percentual_rendimento: parseFloat(percentualRendimento.toFixed(2)),
      valor_estimado: parseFloat(valorEstimado.toFixed(2))
    });

    await novoDashboard.save();

    return {
      message: 'Investimento criado e dashboard atualizado com sucesso',
      novoInvestimento,
      novoDashboard
    };
  }

  private calcularImpostoRenda(banco: Banco, diasCorridos: number): number {
    if (diasCorridos <= 180) return banco.IR_ate_180_dias / 100;
    if (diasCorridos <= 360) return banco.IR_ate_360_dias / 100;
    if (diasCorridos <= 720) return banco.IR_ate_720_dias / 100;
    return banco.IR_acima_720_dias / 100;
  }

  async findOne(id: string): Promise<Investimento> {
    const investimento = await this.investimentoModel.findById(id);
    if (!investimento) {
      throw new NotFoundException('Investimento não encontrado');
    }
    return investimento;
  }

  async remove(id: string): Promise<{ message: string }> {
    const investimento = await this.investimentoModel.findByIdAndDelete(id);
    if (!investimento) {
      throw new NotFoundException('Investimento não encontrado');
    }
    return { message: 'Investimento deletado com sucesso' };
  }
} 