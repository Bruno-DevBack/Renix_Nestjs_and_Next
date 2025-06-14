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
  Put,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  BadRequestException,
  Patch,
  Request,
  NotFoundException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AdminGuard } from '../common/guards/admin.guard';
import { InvestimentoHistorico, DashboardHistorico } from './schemas/usuario.schema';
import { isValidObjectId } from 'mongoose';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { memoryStorage } from 'multer';

/**
 * Controller responsável por gerenciar todas as operações relacionadas aos usuários
 * 
 * @description
 * Este controller implementa endpoints REST para gerenciar usuários do sistema.
 * Suas responsabilidades incluem:
 * 
 * Funcionalidades:
 * - Registro de novos usuários
 * - Autenticação (login/logout)
 * - Atualização de perfil
 * - Upload de foto de perfil
 * - Gerenciamento de histórico
 * - Consulta de dados do usuário
 * 
 * Segurança:
 * - Autenticação via JWT
 * - Validação de permissões
 * - Proteção de rotas admin
 * - Validação de dados
 * 
 * Endpoints disponíveis:
 * - POST /usuarios/registro - Registra novo usuário
 * - POST /usuarios/login - Autentica usuário
 * - POST /usuarios/logout - Realiza logout
 * - GET /usuarios/me - Obtém dados do usuário logado
 * - GET /usuarios/:id - Busca usuário por ID (admin)
 * - PATCH /usuarios/:id - Atualiza dados do usuário
 * - POST /usuarios/:id/foto - Upload de foto de perfil
 * - PUT /usuarios/:id/foto - Atualiza foto de perfil
 * 
 * @example
 * // Exemplo de registro de usuário
 * POST /usuarios/registro
 * {
 *   "nome_usuario": "João Silva",
 *   "email_usuario": "joao@email.com",
 *   "senha_usuario": "Senha123!",
 *   "telefone_usuario": "(11) 98765-4321"
 * }
 * 
 * // Exemplo de login
 * POST /usuarios/login
 * {
 *   "email_usuario": "joao@email.com",
 *   "senha_usuario": "Senha123!"
 * }
 */
@ApiTags('Usuários')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  /**
   * Endpoint para registrar um novo usuário no sistema
   * 
   * @description
   * Realiza o registro de um novo usuário com validações:
   * - Email único
   * - Senha forte
   * - Formato de telefone
   * - Nome completo
   * 
   * Por padrão, novos usuários são criados com:
   * - eAdmin: false
   * - ePremium: false
   * - Históricos vazios
   * 
   * @throws ConflictException - Se o email já estiver cadastrado
   * @throws BadRequestException - Se os dados forem inválidos
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
   * 
   * @description
   * Realiza a autenticação do usuário e retorna:
   * - Dados do usuário
   * - Token JWT
   * - Informações de expiração
   * - Status premium/admin
   * 
   * O token gerado deve ser usado no header Authorization
   * para acessar endpoints protegidos.
   * 
   * @throws UnauthorizedException - Se as credenciais forem inválidas
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
            historico_dashboards: { type: 'array' },
            fotoPerfilBase64: {
              type: 'string',
              description: 'Foto de perfil em base64 (se existir)',
              nullable: true
            }
          }
        },
        auth: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'Token JWT para autenticação',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            tipo: {
              type: 'string',
              description: 'Tipo do token',
              example: 'Bearer'
            },
            expira_em: {
              type: 'string',
              description: 'Tempo de expiração do token',
              example: '24 horas'
            },
            gerado_em: {
              type: 'string',
              description: 'Data e hora de geração do token',
              example: '2024-03-14T10:30:00.000Z'
            }
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
   * Endpoint para buscar informações de um usuário específico
   * 
   * @description
   * Rota protegida apenas para administradores.
   * Retorna dados completos do usuário incluindo:
   * - Dados pessoais
   * - Status (admin/premium)
   * - Históricos
   * - Dashboards
   * 
   * @throws UnauthorizedException - Se o requisitante não for admin
   * @throws NotFoundException - Se o usuário não for encontrado
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar usuário por ID (apenas admin)' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiQuery({ name: 'eAdmin', required: true, type: 'boolean', description: 'Flag de administrador' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado - Apenas administradores' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 400, description: 'ID de usuário inválido' })
  async findOne(
    @Param('id') id: string,
    @Query('eAdmin') eAdmin: string
  ) {
    if (!id || !isValidObjectId(id)) {
      throw new BadRequestException('ID de usuário inválido');
    }

    if (eAdmin !== 'true') {
      throw new UnauthorizedException('Apenas administradores podem acessar esses dados');
    }
    return this.usuariosService.findOne(id);
  }

  /**
   * Endpoint para adicionar um novo investimento ao histórico do usuário
   */
  @Post(':id/investimentos/historico')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Limpar histórico do usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Histórico limpo com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async limparHistorico(@Param('id') id: string) {
    await this.usuariosService.limparHistorico(id);
    return { message: 'Histórico limpo com sucesso' };
  }

  /**
   * Endpoint para atualizar dados do usuário
   * 
   * @description
   * Permite atualização parcial dos dados:
   * - Nome do usuário
   * - Email (com validação de unicidade)
   * 
   * Mantém outros dados inalterados:
   * - Senha
   * - Status admin/premium
   * - Históricos
   * 
   * @throws ConflictException - Se o novo email já estiver em uso
   * @throws NotFoundException - Se o usuário não for encontrado
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar nome e/ou email do usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiBody({ type: UpdateUsuarioDto })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        nome_usuario: { type: 'string' },
        email_usuario: { type: 'string' },
        eAdmin: { type: 'boolean' },
        ePremium: { type: 'boolean' },
        dashboards: { type: 'array', items: { type: 'string' } },
        historico_investimentos: { type: 'array' },
        historico_dashboards: { type: 'array' },
        fotoPerfilBase64: { type: 'string', nullable: true }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'ID de usuário inválido' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 409, description: 'Email já está em uso por outro usuário' })
  async atualizarUsuario(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto
  ) {
    const usuarioAtualizado = await this.usuariosService.atualizarUsuario(id, updateUsuarioDto);
    return {
      id: usuarioAtualizado._id,
      nome_usuario: usuarioAtualizado.nome_usuario,
      email_usuario: usuarioAtualizado.email_usuario,
      eAdmin: usuarioAtualizado.eAdmin,
      ePremium: usuarioAtualizado.ePremium,
      dashboards: usuarioAtualizado.dashboards,
      historico_investimentos: usuarioAtualizado.historico_investimentos,
      historico_dashboards: usuarioAtualizado.historico_dashboards,
      ...(usuarioAtualizado.fotoPerfilBase64 && { fotoPerfilBase64: usuarioAtualizado.fotoPerfilBase64 })
    };
  }

  /**
   * Endpoint para fazer upload da foto de perfil do usuário
   */
  @Post(':id/foto-perfil')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Apenas arquivos JPG e PNG são permitidos'), false);
        }
        cb(null, true);
      },
    })
  )
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fazer upload da foto de perfil' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Foto de perfil atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 400, description: 'ID de usuário inválido' })
  async uploadFotoPerfil(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any
  ) {
    console.log('Recebendo upload de foto para usuário:', id);
    console.log('Arquivo recebido:', {
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
    });
    console.log('Usuário autenticado:', req.user);

    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    try {
      if (!id || !isValidObjectId(id)) {
        throw new BadRequestException('ID de usuário inválido');
      }

      // Verifica se o usuário autenticado está tentando modificar seu próprio perfil
      if (req.user.sub !== id) {
        throw new UnauthorizedException('Você só pode modificar seu próprio perfil');
      }

      const result = await this.usuariosService.uploadFotoPerfil(id, file);
      console.log('Foto atualizada com sucesso');
      return result;
    } catch (error) {
      console.error('Erro ao processar upload:', error);
      if (error instanceof NotFoundException || error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao processar upload da foto');
    }
  }

  /**
   * Endpoint para remover a foto de perfil do usuário
   */
  @Delete(':id/foto-perfil')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover foto de perfil' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Foto de perfil removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 400, description: 'ID de usuário inválido' })
  async deleteFotoPerfil(@Param('id') id: string) {
    if (!id || !isValidObjectId(id)) {
      throw new BadRequestException('ID de usuário inválido');
    }

    return this.usuariosService.deleteFotoPerfil(id);
  }

  /**
   * Endpoint para editar a foto de perfil do usuário
   */
  @Put(':id/foto-perfil')
  @ApiOperation({ summary: 'Editar foto de perfil' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Foto de perfil editada com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 400, description: 'ID de usuário inválido ou arquivo inválido' })
  @UseInterceptors(FileInterceptor('file'))
  async editFotoPerfil(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024 // 5MB
        })
        .build(),
    ) file: Express.Multer.File,
  ) {
    if (!id || !isValidObjectId(id)) {
      throw new BadRequestException('ID de usuário inválido');
    }

    return this.usuariosService.editFotoPerfil(id, file);
  }

  /**
   * Endpoint para realizar logout do usuário
   * 
   * @description
   * Registra o logout do usuário e invalida o token atual.
   * Requer autenticação via token JWT.
   * 
   * @throws UnauthorizedException - Se o token for inválido
   * @throws BadRequestException - Se o ID for inválido
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Realizar logout do usuário' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        usuario_id: { type: 'string', description: 'ID do usuário' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'ID de usuário inválido' })
  async logout(@Body('usuario_id') usuarioId: string) {
    if (!usuarioId || !isValidObjectId(usuarioId)) {
      throw new BadRequestException('ID de usuário inválido');
    }
    await this.usuariosService.registrarLogout(usuarioId);
    return { message: 'Logout realizado com sucesso' };
  }

  /**
   * Endpoint para obter dados do usuário logado
   * 
   * @description
   * Retorna os dados completos do usuário autenticado:
   * - Dados pessoais
   * - Status (admin/premium)
   * - Históricos
   * - Dashboards
   * - Foto de perfil (se existir)
   * 
   * @throws UnauthorizedException - Se o token for inválido
   * @throws NotFoundException - Se o usuário não for encontrado
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter informações do usuário logado' })
  @ApiResponse({
    status: 200,
    description: 'Informações do usuário retornadas com sucesso',
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
            historico_dashboards: { type: 'array' },
            fotoPerfilBase64: { type: 'string', nullable: true }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Não autorizado - Token inválido ou expirado' })
  async getMe(@Request() req) {
    const usuario = await this.usuariosService.findOne(req.user.sub);
    return {
      usuario: {
        id: usuario._id,
        nome_usuario: usuario.nome_usuario,
        email_usuario: usuario.email_usuario,
        eAdmin: usuario.eAdmin,
        ePremium: usuario.ePremium,
        dashboards: usuario.dashboards,
        historico_investimentos: usuario.historico_investimentos,
        historico_dashboards: usuario.historico_dashboards,
        ...(usuario.fotoPerfilBase64 && { fotoPerfilBase64: usuario.fotoPerfilBase64 })
      }
    };
  }
} 