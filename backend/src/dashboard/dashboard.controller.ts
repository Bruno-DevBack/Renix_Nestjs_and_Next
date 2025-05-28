import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  UseGuards,
  Request,
  Delete
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { DashboardService } from './dashboard.service';
import { Dashboard, DashboardDocument } from './schemas/dashboard.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Types, Document } from 'mongoose';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get()
  @ApiOperation({ summary: 'Listar todos os dashboards do usuário' })
  async findAll(@Request() req): Promise<DashboardDocument[]> {
    console.log('Debug - Requisição para listar dashboards:', {
      usuario: req.user,
      headers: req.headers,
      url: req.url,
      method: req.method
    });

    try {
      const dashboards = await this.dashboardService.findByUsuario(req.user.sub);
      console.log('Debug - Dashboards encontrados:', {
        quantidade: dashboards.length,
        ids: dashboards.map(d => ((d as unknown) as Document).id)
      });
      return dashboards;
    } catch (error) {
      console.error('Debug - Erro ao listar dashboards:', {
        error: error.message,
        stack: error.stack,
        usuario: req.user
      });
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar dashboard por ID' })
  @ApiParam({ name: 'id', description: 'ID do dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Dashboard não encontrado' })
  async findOne(@Param('id') id: string, @Request() req): Promise<DashboardDocument> {
    console.log('Debug - Requisição de dashboard:', {
      id,
      usuario: req.user,
      headers: req.headers,
      url: req.url,
      method: req.method
    });

    try {
      const dashboard = await this.dashboardService.findOne(id);
      if (!dashboard) {
        console.log('Debug - Dashboard não encontrado:', id);
        throw new NotFoundException('Dashboard não encontrado');
      }

      // Verificar se o dashboard pertence ao usuário
      if (dashboard.usuario_id.toString() !== req.user.sub) {
        console.log('Debug - Acesso negado:', {
          dashboardUsuarioId: dashboard.usuario_id,
          requestUsuarioId: req.user.sub
        });
        throw new NotFoundException('Dashboard não encontrado');
      }

      console.log('Debug - Dashboard retornado:', {
        id: ((dashboard as unknown) as Document).id,
        usuario_id: dashboard.usuario_id,
        valor_investido: dashboard.valor_investido,
        tipo: dashboard.tipo_investimento
      });

      return dashboard;
    } catch (error) {
      console.error('Debug - Erro ao buscar dashboard:', {
        id,
        error: error.message,
        stack: error.stack,
        usuario: req.user
      });
      throw error;
    }
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Gerar PDF do dashboard' })
  async gerarPdf(
    @Param('id') id: string,
    @Request() req,
    @Res() res: Response
  ): Promise<void> {
    try {
      console.log('Debug - Iniciando geração de PDF:', {
        id,
        usuario: req.user
      });

      const buffer = await this.dashboardService.gerarPdf(id);

      console.log('Debug - PDF gerado com sucesso. Tamanho:', buffer.length);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=dashboard-${id}.pdf`,
        'Content-Length': buffer.length,
      });

      res.end(buffer);
    } catch (error) {
      console.error('Debug - Erro ao gerar PDF:', {
        id,
        erro: error.message,
        stack: error.stack,
        usuario: req.user
      });

      if (error.name === 'NotFoundException') {
        res.status(404).json({ message: 'Dashboard não encontrado' });
        return;
      }

      res.status(500).json({
        message: 'Erro ao gerar PDF',
        error: error.message
      });
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um dashboard' })
  @ApiParam({ name: 'id', description: 'ID do dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Dashboard não encontrado' })
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    console.log('Debug - Requisição para excluir dashboard:', {
      id,
      usuario: req.user,
      headers: req.headers,
      url: req.url,
      method: req.method
    });

    try {
      const dashboard = await this.dashboardService.findOne(id);
      if (!dashboard) {
        console.log('Debug - Dashboard não encontrado:', id);
        throw new NotFoundException('Dashboard não encontrado');
      }

      // Verificar se o dashboard pertence ao usuário
      if (dashboard.usuario_id.toString() !== req.user.sub) {
        console.log('Debug - Acesso negado:', {
          dashboardUsuarioId: dashboard.usuario_id,
          requestUsuarioId: req.user.sub
        });
        throw new NotFoundException('Dashboard não encontrado');
      }

      await this.dashboardService.remove(id);
      console.log('Debug - Dashboard excluído com sucesso:', id);
    } catch (error) {
      console.error('Debug - Erro ao excluir dashboard:', {
        id,
        error: error.message,
        stack: error.stack,
        usuario: req.user
      });
      throw error;
    }
  }
} 