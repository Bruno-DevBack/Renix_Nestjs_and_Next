import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  HttpStatus,
  UnauthorizedException,
  Delete,
  Patch
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AdminGuard } from '../common/guards/admin.guard';
import { InvestimentoHistorico, DashboardHistorico } from './schemas/usuario.schema';

/**
 * Controller responsável por gerenciar todas as operações relacionadas aos usuários
 * Inclui operações de registro, login, atualização e gerenciamento de histórico
 */
@ApiTags('Usuários')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  /**
   * Endpoint para registrar um novo usuário no sistema
   */
  @Post('registro')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiBody({ type: CreateUsuarioDto })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  async registro(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  /**
   * Endpoint para autenticar um usuário no sistema
   */
  @Post('login')
  @ApiOperation({ summary: 'Login de usuário' })
  @ApiBody({ type: LoginUsuarioDto })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        usuario: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nome_usuario: { type: 'string' },
            email_usuario: { type: 'string' },
            eAdmin: { type: 'boolean' },
            ePremium: { type: 'boolean' },
            dashboards: { type: 'array', items: { type: 'string' } },
            historico_investimentos: { type: 'array' },
            historico_dashboards: { type: 'array' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginUsuarioDto: LoginUsuarioDto) {
    return this.usuariosService.login(loginUsuarioDto);
  }

  /**
   * Endpoint para buscar informações de um usuário específico (apenas admin)
   */
  @Get(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Buscar usuário por ID (apenas admin)' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiQuery({ name: 'eAdmin', required: true, type: 'boolean', description: 'Flag de administrador' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado - Apenas administradores' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(
    @Param('id') id: string,
    @Query('eAdmin') eAdmin: string
  ) {
    if (eAdmin !== 'true') {
      throw new UnauthorizedException('Apenas administradores podem acessar esses dados');
    }
    return this.usuariosService.findOne(id);
  }

  /**
   * Endpoint para adicionar um novo investimento ao histórico do usuário
   */
  @Post(':id/investimentos/historico')
  @ApiOperation({ summary: 'Adicionar investimento ao histórico' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tipo: { type: 'string', example: 'Renda Fixa' },
        valor: { type: 'number', example: 1000.00 },
        banco: { type: 'string', example: 'Banco XYZ' },
        rendimento: { type: 'number', example: 5.5 }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Investimento adicionado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async adicionarInvestimentoHistorico(
    @Param('id') id: string,
    @Body() investimento: InvestimentoHistorico
  ) {
    await this.usuariosService.adicionarInvestimentoHistorico(id, investimento);
    return { message: 'Histórico de investimento adicionado com sucesso' };
  }

  /**
   * Endpoint para adicionar um novo dashboard ao histórico do usuário
   */
  @Post(':id/dashboards/historico')
  @ApiOperation({ summary: 'Adicionar dashboard ao histórico' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nome: { type: 'string', example: 'Dashboard Mensal' },
        bancos_comparados: { type: 'array', items: { type: 'string' }, example: ['Banco A', 'Banco B'] },
        filtros_aplicados: { type: 'array', items: { type: 'string' }, example: ['Renda Fixa', 'CDB'] }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Dashboard adicionado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async adicionarDashboardHistorico(
    @Param('id') id: string,
    @Body() dashboard: DashboardHistorico
  ) {
    await this.usuariosService.adicionarDashboardHistorico(id, dashboard);
    return { message: 'Histórico de dashboard adicionado com sucesso' };
  }

  /**
   * Endpoint para limpar todo o histórico de um usuário
   */
  @Delete(':id/historico')
  @ApiOperation({ summary: 'Limpar histórico do usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Histórico limpo com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async limparHistorico(@Param('id') id: string) {
    await this.usuariosService.limparHistorico(id);
    return { message: 'Histórico limpo com sucesso' };
  }

  /**
   * Endpoint para atualizar informações básicas do usuário
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar nome e email do usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiBody({ type: UpdateUsuarioDto })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 409, description: 'Email já está em uso' })
  async atualizarUsuario(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto
  ) {
    return this.usuariosService.atualizarUsuario(id, updateUsuarioDto);
  }
} 