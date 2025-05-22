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
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcryptjs'; // Utilizando bcryptjs para hash de senhas

/**
 * Serviço responsável por toda a lógica de negócio relacionada aos usuários
 * Inclui operações de CRUD e gerenciamento de histórico
 */
@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>
  ) { }

  /**
   * Cria um novo usuário no sistema
   * @param createUsuarioDto - Dados do usuário a ser criado
   * @returns Mensagem de sucesso
   * @throws ConflictException - Se o email já estiver cadastrado
   */
  async create(createUsuarioDto: CreateUsuarioDto): Promise<{ message: string }> {
    // Verificar se o email já está cadastrado
    const usuarioExistente = await this.usuarioModel.findOne({
      email_usuario: createUsuarioDto.email_usuario
    });

    if (usuarioExistente) {
      throw new ConflictException('Email já cadastrado');
    }

    // Criando o usuário com os dados fornecidos
    const usuario = new this.usuarioModel({
      ...createUsuarioDto,
      eAdmin: false,
      ePremium: false,
      historico_investimentos: [],
      historico_dashboards: []
    });

    await usuario.save();
    return { message: 'Usuário criado com sucesso' };
  }

  /**
   * Realiza o login do usuário no sistema
   * @param loginUsuarioDto - Credenciais do usuário
   * @returns Dados do usuário autenticado
   * @throws UnauthorizedException - Se as credenciais forem inválidas
   */
  async login(loginUsuarioDto: LoginUsuarioDto) {
    const usuario = await this.usuarioModel.findOne({
      email_usuario: loginUsuarioDto.email_usuario
    }).populate('dashboards');

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Logar as senhas para verificar
    console.log("Senha fornecida: ", loginUsuarioDto.senha_usuario);
    console.log("Senha armazenada (hash): ", usuario.senha_usuario);

    const senhaCorreta = await bcrypt.compare(loginUsuarioDto.senha_usuario, usuario.senha_usuario);
    if (!senhaCorreta) {
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

  /**
   * Busca um usuário pelo ID
   * @param id - ID do usuário
   * @returns Dados do usuário encontrado
   * @throws NotFoundException - Se o usuário não for encontrado
   */
  async findOne(id: string): Promise<UsuarioDocument> {
    const usuario = await this.usuarioModel.findById(id).populate('dashboards');
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return usuario;
  }

  /**
   * Adiciona um novo investimento ao histórico do usuário
   * @param usuarioId - ID do usuário
   * @param investimento - Dados do investimento
   * @throws NotFoundException - Se o usuário não for encontrado
   */
  async adicionarInvestimentoHistorico(
    usuarioId: string,
    investimento: InvestimentoHistorico
  ): Promise<void> {
    const usuario = await this.findOne(usuarioId); // Buscar o usuário
    usuario.historico_investimentos.push(investimento); // Adicionar o investimento ao histórico
    await usuario.save(); // Salvar as alterações
  }

  /**
   * Adiciona um novo dashboard ao histórico do usuário
   * @param usuarioId - ID do usuário
   * @param dashboard - Dados do dashboard
   * @throws NotFoundException - Se o usuário não for encontrado
   */
  async adicionarDashboardHistorico(
    usuarioId: string,
    dashboard: DashboardHistorico
  ): Promise<void> {
    const usuario = await this.findOne(usuarioId); // Buscar o usuário
    usuario.historico_dashboards.push(dashboard); // Adicionar o dashboard ao histórico
    await usuario.save(); // Salvar as alterações
  }

  /**
   * Limpa todo o histórico de um usuário
   * @param usuarioId - ID do usuário
   * @throws NotFoundException - Se o usuário não for encontrado
   */
  async limparHistorico(usuarioId: string): Promise<void> {
    const usuario = await this.findOne(usuarioId); // Buscar o usuário
    usuario.historico_investimentos = []; // Limpar histórico de investimentos
    usuario.historico_dashboards = []; // Limpar histórico de dashboards
    await usuario.save(); // Salvar as alterações
  }

  /**
   * Atualiza o nome e email de um usuário
   * @param id - ID do usuário
   * @param updateUsuarioDto - Novos dados do usuário
   * @returns Usuário atualizado
   * @throws NotFoundException - Se o usuário não for encontrado
   * @throws ConflictException - Se o novo email já estiver em uso
   */
  async atualizarUsuario(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<UsuarioDocument> {
    // Verificar se o email já está em uso por outro usuário
    const emailExistente = await this.usuarioModel.findOne({
      email_usuario: updateUsuarioDto.email_usuario,
      _id: { $ne: id }
    });

    if (emailExistente) {
      throw new ConflictException('Email já está em uso por outro usuário');
    }

    const usuarioAtualizado = await this.usuarioModel.findByIdAndUpdate(
      id,
      {
        nome_usuario: updateUsuarioDto.nome_usuario,
        email_usuario: updateUsuarioDto.email_usuario
      },
      { new: true }
    );

    if (!usuarioAtualizado) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return usuarioAtualizado;
  }
}
