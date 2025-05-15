import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InvestimentosService } from './investimentos.service';
import { CreateInvestimentoDto } from './dto/create-investimento.dto';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';

@ApiTags('Investimentos')
@Controller('investimentos')
@UseGuards(RateLimitGuard)
export class InvestimentosController {
  constructor(private readonly investimentosService: InvestimentosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo investimento' })
  async create(@Body() createInvestimentoDto: CreateInvestimentoDto) {
    return this.investimentosService.create(createInvestimentoDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar investimento por ID' })
  async findOne(@Param('id') id: string) {
    return this.investimentosService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar investimento' })
  async remove(@Param('id') id: string) {
    return this.investimentosService.remove(id);
  }
} 