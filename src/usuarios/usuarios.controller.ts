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
  Delete
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { AdminGuard } from '../common/guards/admin.guard';
import { InvestimentoHistorico, DashboardHistorico } from './schemas/usuario.schema';

@ApiTags('Usuários')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  @Post('registro')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  async registro(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login de usuário' })
  async login(@Body() loginUsuarioDto: LoginUsuarioDto) {
    return this.usuariosService.login(loginUsuarioDto);
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Buscar usuário por ID (apenas admin)' })
  async findOne(
    @Param('id') id: string,
    @Query('eAdmin') eAdmin: string
  ) {
    if (eAdmin !== 'true') {
      throw new UnauthorizedException('Apenas administradores podem acessar esses dados');
    }
    return this.usuariosService.findOne(id);
  }

  @Post(':id/investimentos/historico')
  @ApiOperation({ summary: 'Adicionar investimento ao histórico' })
  async adicionarInvestimentoHistorico(
    @Param('id') id: string,
    @Body() investimento: InvestimentoHistorico
  ) {
    await this.usuariosService.adicionarInvestimentoHistorico(id, investimento);
    return { message: 'Histórico de investimento adicionado com sucesso' };
  }

  @Post(':id/dashboards/historico')
  @ApiOperation({ summary: 'Adicionar dashboard ao histórico' })
  async adicionarDashboardHistorico(
    @Param('id') id: string,
    @Body() dashboard: DashboardHistorico
  ) {
    await this.usuariosService.adicionarDashboardHistorico(id, dashboard);
    return { message: 'Histórico de dashboard adicionado com sucesso' };
  }

  @Delete(':id/historico')
  @ApiOperation({ summary: 'Limpar histórico do usuário' })
  async limparHistorico(@Param('id') id: string) {
    await this.usuariosService.limparHistorico(id);
    return { message: 'Histórico limpo com sucesso' };
  }
} 