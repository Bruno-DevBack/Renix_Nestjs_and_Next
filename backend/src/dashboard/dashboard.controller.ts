/**
 * Controller responsável pelo gerenciamento de dashboards de investimentos
 * 
 * @description
 * Este controller implementa endpoints REST para gerenciar dashboards
 * de análise de investimentos. Suas responsabilidades incluem:
 * 
 * Funcionalidades:
 * - Listagem de dashboards do usuário
 * - Busca de dashboard específico
 * - Geração de relatórios em PDF
 * - Exclusão de dashboards
 * 
 * Segurança:
 * - Autenticação via JWT em todos os endpoints
 * - Validação de propriedade do dashboard
 * - Logging detalhado para auditoria
 * - Tratamento de erros padronizado
 * 
 * Endpoints disponíveis:
 * - GET /dashboard - Lista todos os dashboards do usuário
 * - GET /dashboard/:id - Busca um dashboard específico
 * - GET /dashboard/:id/pdf - Gera relatório PDF do dashboard
 * - DELETE /dashboard/:id - Remove um dashboard
 * 
 * @example
 * // Exemplo de uso do endpoint de listagem
 * GET /dashboard
 * Authorization: Bearer {token}
 * 
 * // Resposta
 * [
 *   {
 *     "id": "123",
 *     "usuario_id": "456",
 *     "valor_investido": 1000,
 *     "tipo_investimento": "CDB",
 *     "rendimento": {
 *       "valor_bruto": 1100,
 *       "valor_liquido": 1080
 *     }
 *   }
 * ]
 */

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

  /**
   * Lista todos os dashboards do usuário autenticado
   * 
   * @description
   * Este endpoint retorna uma lista com todos os dashboards
   * associados ao usuário que fez a requisição. Inclui:
   * - Dados básicos do dashboard
   * - Valores e rendimentos
   * - Indicadores e métricas
   * - Status e alertas
   * 
   * @param req - Request com dados do usuário autenticado
   * @returns Promise<DashboardDocument[]> Lista de dashboards
   * 
   * @example
   * // Exemplo de requisição
   * GET /dashboard
   * Authorization: Bearer {token}
   * 
   * // Exemplo de resposta
   * [
   *   {
   *     "id": "123",
   *     "valor_investido": 1000,
   *     "rendimento": {
   *       "valor_bruto": 1100,
   *       "valor_liquido": 1080
   *     },
   *     "indicadores": {
   *       "rentabilidade": 8.5,
   *       "risco": "baixo"
   *     }
   *   }
   * ]
   */
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

  /**
   * Busca um dashboard específico por ID
   * 
   * @description
   * Este endpoint retorna os detalhes completos de um dashboard
   * específico. Inclui validações de:
   * - Existência do dashboard
   * - Propriedade do dashboard (usuário autenticado)
   * - Formato do ID
   * 
   * @param id - ID único do dashboard
   * @param req - Request com dados do usuário autenticado
   * @returns Promise<DashboardDocument> Dashboard encontrado
   * @throws {NotFoundException} Se o dashboard não for encontrado
   * 
   * @example
   * // Exemplo de requisição
   * GET /dashboard/123
   * Authorization: Bearer {token}
   * 
   * // Exemplo de resposta
   * {
   *   "id": "123",
   *   "usuario_id": "456",
   *   "valor_investido": 1000,
   *   "rendimento": {
   *     "valor_bruto": 1100,
   *     "valor_liquido": 1080,
   *     "rentabilidade": 8.5
   *   },
   *   "indicadores_mercado": {
   *     "selic": 12.75,
   *     "cdi": 12.65,
   *     "ipca": 4.5
   *   }
   * }
   */
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

  /**
   * Gera um relatório PDF do dashboard
   * 
   * @description
   * Este endpoint gera um arquivo PDF contendo uma análise
   * detalhada do dashboard, incluindo:
   * - Resumo do investimento
   * - Gráficos de rendimento
   * - Análise de performance
   * - Comparativos de mercado
   * - Projeções futuras
   * 
   * O PDF é gerado em memória e enviado como download
   * com headers apropriados.
   * 
   * @param id - ID único do dashboard
   * @param req - Request com dados do usuário
   * @param res - Response para envio do arquivo
   * @throws {NotFoundException} Se o dashboard não for encontrado
   * 
   * @example
   * // Exemplo de requisição
   * GET /dashboard/123/pdf
   * Authorization: Bearer {token}
   * 
   * // Headers da resposta
   * Content-Type: application/pdf
   * Content-Disposition: attachment; filename=dashboard-123.pdf
   */
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

  /**
   * Remove um dashboard específico
   * 
   * @description
   * Este endpoint exclui permanentemente um dashboard do sistema.
   * Realiza as seguintes validações:
   * - Existência do dashboard
   * - Propriedade do dashboard (usuário autenticado)
   * - Formato do ID
   * 
   * A exclusão é permanente e não pode ser desfeita.
   * 
   * @param id - ID único do dashboard
   * @param req - Request com dados do usuário
   * @throws {NotFoundException} Se o dashboard não for encontrado
   * 
   * @example
   * // Exemplo de requisição
   * DELETE /dashboard/123
   * Authorization: Bearer {token}
   * 
   * // Exemplo de resposta bem-sucedida
   * Status: 200 OK
   * 
   * // Exemplo de resposta com erro
   * Status: 404 Not Found
   * {
   *   "message": "Dashboard não encontrado"
   * }
   */
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