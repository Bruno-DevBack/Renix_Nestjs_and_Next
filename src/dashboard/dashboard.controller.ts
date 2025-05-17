import {
  Controller,
  Get,
  Post,
  Param,
  Res
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { DashboardService } from './dashboard.service';
import { Dashboard } from './schemas/dashboard.schema';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get()
  @ApiOperation({ summary: 'Listar todos os dashboards' })
  async findAll(): Promise<Dashboard[]> {
    return this.dashboardService.findAll();
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Gerar PDF do dashboard' })
  async gerarPdf(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<void> {
    const buffer = await this.dashboardService.gerarPdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=dashboard-${id}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
} 