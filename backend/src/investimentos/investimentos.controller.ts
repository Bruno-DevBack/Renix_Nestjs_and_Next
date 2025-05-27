import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvestimentosService } from './investimentos.service';
import { CreateInvestimentoDto } from './dto/create-investimento.dto';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Investimentos')
@Controller('investimentos')
@UseGuards(RateLimitGuard, JwtAuthGuard)
@ApiBearerAuth()
export class InvestimentosController {
  constructor(private readonly investimentosService: InvestimentosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os investimentos do usuário' })
  async findAll(@Request() req) {
    console.log('Buscando investimentos para o usuário:', req.user.sub);
    return this.investimentosService.findAll(req.user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo investimento' })
  async create(@Body() createInvestimentoDto: CreateInvestimentoDto, @Request() req) {
    console.log('Criando investimento para o usuário:', req.user.sub);
    return this.investimentosService.create({
      ...createInvestimentoDto,
      usuario_id: req.user.sub
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar investimento por ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    console.log('Buscando investimento:', id, 'para o usuário:', req.user.sub);
    return this.investimentosService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar investimento' })
  async remove(@Param('id') id: string, @Request() req) {
    console.log('Removendo investimento:', id, 'para o usuário:', req.user.sub);
    return this.investimentosService.remove(id);
  }
} 