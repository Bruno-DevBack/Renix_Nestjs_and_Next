import { 
  Controller, 
  Get, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(RateLimitGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os dashboards' })
  async findAll() {
    return this.dashboardService.findAll();
  }
} 