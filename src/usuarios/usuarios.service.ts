import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument, InvestimentoHistorico, DashboardHistorico } from './schemas/usuario.schema';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>
  ) { }

  async create(createUsuarioDto: CreateUsuarioDto): Promise<{ message: string }> {
    const usuarioExistente = await this.usuarioModel.findOne({
      email_usuario: createUsuarioDto.email_usuario
    });

    if (usuarioExistente) {
      throw new ConflictException('Email já cadastrado');
    }

    // Hash da senha antes de salvar
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUsuarioDto.senha_usuario, salt);

    const usuario = new this.usuarioModel({
      ...createUsuarioDto,
      senha_usuario: hashedPassword,
      eAdmin: false,
      ePremium: false,
      historico_investimentos: [],
      historico_dashboards: []
    });

    await usuario.save();
    return { message: 'Usuário criado com sucesso' };
  }

  async login(loginUsuarioDto: LoginUsuarioDto) {
    const usuario = await this.usuarioModel.findOne({
      email_usuario: loginUsuarioDto.email_usuario
    }).populate('dashboards');

    if (!usuario || !(await bcrypt.compare(loginUsuarioDto.senha_usuario, usuario.senha_usuario))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return {
      usuario: {
        id: usuario._id,
        nome_usuario: usuario.nome_usuario,
        email_usuario: usuario.email_usuario,
        eAdmin: usuario.eAdmin,
        ePremium: usuario.ePremium,
        dashboards: usuario.dashboards,
        historico_investimentos: usuario.historico_investimentos,
        historico_dashboards: usuario.historico_dashboards
      }
    };
  }

  async findOne(id: string): Promise<UsuarioDocument> {
    const usuario = await this.usuarioModel.findById(id).populate('dashboards');
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return usuario;
  }

  async adicionarInvestimentoHistorico(
    usuarioId: string,
    investimento: InvestimentoHistorico
  ): Promise<void> {
    const usuario = await this.findOne(usuarioId);
    usuario.historico_investimentos.push(investimento);
    await usuario.save();
  }

  async adicionarDashboardHistorico(
    usuarioId: string,
    dashboard: DashboardHistorico
  ): Promise<void> {
    const usuario = await this.findOne(usuarioId);
    usuario.historico_dashboards.push(dashboard);
    await usuario.save();
  }

  async limparHistorico(usuarioId: string): Promise<void> {
    const usuario = await this.findOne(usuarioId);
    usuario.historico_investimentos = [];
    usuario.historico_dashboards = [];
    await usuario.save();
  }
} 