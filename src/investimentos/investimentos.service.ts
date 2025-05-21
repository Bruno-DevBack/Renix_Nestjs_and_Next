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
  constructor(
    @InjectModel(Investimento.name) private investimentoModel: Model<InvestimentoDocument>,
    @InjectModel(Dashboard.name) private dashboardModel: Model<DashboardDocument>,
    @InjectModel(Banco.name) private bancoModel: Model<BancoDocument>,
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
    private calculoService: CalculoInvestimentoService
  ) { }

  async create(createInvestimentoDto: CreateInvestimentoDto) {
    const { usuario_id, banco_id, valor_investimento, data_inicio, data_fim, tipo_investimento, caracteristicas } = createInvestimentoDto;

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

    return {
      message: 'Investimento criado e dashboard atualizado com sucesso',
      investimento: novoInvestimento,
      dashboard: novoDashboard
    };
  }

  async findOne(id: string): Promise<Investimento> {
    const investimento = await this.investimentoModel.findById(id);
    if (!investimento) {
      throw new NotFoundException('Investimento não encontrado');
    }
    return investimento;
  }

  async remove(id: string) {
    const investimento = await this.investimentoModel.findById(id);
    if (!investimento) {
      throw new NotFoundException('Investimento não encontrado');
    }
    
    // Remover dashboard associado
    await this.dashboardModel.deleteOne({ investimento_id: id });
    
    return this.investimentoModel.findByIdAndDelete(id);
  }
} 