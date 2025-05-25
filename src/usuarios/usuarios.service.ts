/**
 * Serviço responsável por toda a lógica de negócio relacionada aos usuários
 * 
 * Este serviço gerencia:
 * - Criação e autenticação de usuários
 * - Atualização de perfis
 * - Histórico de investimentos
 * - Dashboards personalizados
 * - Permissões e níveis de acesso
 */

import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Usuario, UsuarioDocument, InvestimentoHistorico, DashboardHistorico } from './schemas/usuario.schema';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtService } from '@nestjs/jwt';

/**
 * Serviço responsável por toda a lógica de negócio relacionada aos usuários
 * Inclui operações de CRUD e gerenciamento de histórico
 */
@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
    private jwtService: JwtService
  ) { }

  /**
   * Cria um novo usuário no sistema
   * 
   * @param createUsuarioDto - Dados do novo usuário
   * @throws ConflictException - Se o email já estiver cadastrado
   * @returns Mensagem de sucesso
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
   * Realiza o login do usuário e gera um token JWT
   * 
   * @param loginUsuarioDto - Credenciais do usuário
   * @throws UnauthorizedException - Se as credenciais forem inválidas
   * @returns Dados do usuário e token de autenticação
   */
  async login(loginUsuarioDto: LoginUsuarioDto) {
    const usuario = await this.usuarioModel.findOne({
      email_usuario: loginUsuarioDto.email_usuario
    }).populate('dashboards');

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaCorreta = await usuario.matchPassword(loginUsuarioDto.senha_usuario);
    if (!senhaCorreta) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gera o token JWT com informações do usuário
    const jwt = this.jwtService.sign(
      {
        sub: usuario._id,
        email: usuario.email_usuario,
        isAdmin: usuario.eAdmin,
        nome: usuario.nome_usuario
      },
      {
        expiresIn: '24h',
        secret: process.env.JWT_SECRET || 'sua_chave_secreta'
      }
    );

    // Prepara os dados do usuário para retorno
    const dadosUsuario: any = {
      id: usuario._id,
      nome_usuario: usuario.nome_usuario,
      email_usuario: usuario.email_usuario,
      eAdmin: usuario.eAdmin,
      ePremium: usuario.ePremium,
      dashboards: usuario.dashboards,
      historico_investimentos: usuario.historico_investimentos,
      historico_dashboards: usuario.historico_dashboards
    };

    if (usuario.fotoPerfilBase64) {
      dadosUsuario.fotoPerfilBase64 = usuario.fotoPerfilBase64;
    }

    // Retorna no formato esperado pelo TransformInterceptor
    return {
      usuario: dadosUsuario,
      auth: {
        token: jwt,
        tipo: 'Bearer',
        expira_em: '24 horas',
        gerado_em: new Date().toISOString()
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
    if (!id || !isValidObjectId(id)) {
      throw new BadRequestException('ID de usuário inválido');
    }

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
   * Atualiza parcialmente os dados do usuário (nome e/ou email)
   * @param id - ID do usuário
   * @param updateUsuarioDto - Dados do usuário a serem atualizados
   * @returns Usuário atualizado
   * @throws NotFoundException - Se o usuário não for encontrado
   * @throws ConflictException - Se o novo email já estiver em uso
   * @throws BadRequestException - Se o ID for inválido
   */
  async atualizarUsuario(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<UsuarioDocument> {
    if (!id || !isValidObjectId(id)) {
      throw new BadRequestException('ID de usuário inválido');
    }

    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se o novo email já está em uso por outro usuário
    if (updateUsuarioDto.email_usuario && updateUsuarioDto.email_usuario !== usuario.email_usuario) {
      const emailEmUso = await this.usuarioModel.findOne({
        email_usuario: updateUsuarioDto.email_usuario,
        _id: { $ne: id }
      });

      if (emailEmUso) {
        throw new ConflictException('Email já está em uso por outro usuário');
      }
    }

    // Atualizar apenas os campos fornecidos
    if (updateUsuarioDto.nome_usuario) {
      usuario.nome_usuario = updateUsuarioDto.nome_usuario;
    }
    if (updateUsuarioDto.email_usuario) {
      usuario.email_usuario = updateUsuarioDto.email_usuario;
    }

    // Salvar e retornar com os dados populados
    await usuario.save();
    const usuarioAtualizado = await this.usuarioModel.findById(id).populate('dashboards');
    if (!usuarioAtualizado) {
      throw new NotFoundException('Usuário não encontrado após atualização');
    }
    return usuarioAtualizado;
  }

  /**
   * Faz upload da foto de perfil do usuário
   * @param id - ID do usuário
   * @param file - Arquivo de imagem
   * @returns Usuário atualizado
   * @throws NotFoundException - Se o usuário não for encontrado
   */
  async uploadFotoPerfil(id: string, file: Express.Multer.File): Promise<UsuarioDocument> {
    if (!id || !isValidObjectId(id)) {
      throw new BadRequestException('ID de usuário inválido');
    }

    const usuario = await this.findOne(id);
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Converter o buffer da imagem para base64
    const base64Image = file.buffer.toString('base64');
    usuario.fotoPerfilBase64 = `data:${file.mimetype};base64,${base64Image}`;
    return usuario.save();
  }

  /**
   * Remove a foto de perfil do usuário
   * @param id - ID do usuário
   * @returns Usuário atualizado
   * @throws NotFoundException - Se o usuário não for encontrado
   */
  async deleteFotoPerfil(id: string): Promise<UsuarioDocument> {
    if (!id || !isValidObjectId(id)) {
      throw new BadRequestException('ID de usuário inválido');
    }

    const usuario = await this.findOne(id);
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    usuario.fotoPerfilBase64 = undefined;
    return usuario.save();
  }

  /**
   * Edita a foto de perfil do usuário
   * @param id - ID do usuário
   * @param file - Nova imagem de perfil
   * @returns Usuário atualizado
   * @throws NotFoundException - Se o usuário não for encontrado
   */
  async editFotoPerfil(id: string, file: Express.Multer.File): Promise<UsuarioDocument> {
    if (!id || !isValidObjectId(id)) {
      throw new BadRequestException('ID de usuário inválido');
    }

    const usuario = await this.findOne(id);
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Converter o buffer da imagem para base64
    const base64Image = file.buffer.toString('base64');
    usuario.fotoPerfilBase64 = `data:${file.mimetype};base64,${base64Image}`;
    return usuario.save();
  }

  /**
   * Registra o logout do usuário e limpa suas sessões
   * 
   * @param id - ID do usuário
   * @throws NotFoundException - Se o usuário não for encontrado
   */
  async registrarLogout(id: string): Promise<void> {
    const usuario = await this.findOne(id);
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    // Aqui você pode adicionar lógica adicional se necessário
    // Por exemplo, registrar data/hora do logout, limpar sessões, etc.
  }
}
