import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param,
  UseGuards,
  Request,
  UnauthorizedException
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
    console.log('Debug - Buscando investimentos:', {
      userId: req.user.sub,
      userEmail: req.user.email
    });
    return this.investimentosService.findAll(req.user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo investimento' })
  async create(@Body() createInvestimentoDto: CreateInvestimentoDto, @Request() req) {
    console.log('Debug - Criando investimento:', {
      userId: req.user.sub,
      userEmail: req.user.email,
      investimento: createInvestimentoDto
    });

    if (!req.user || !req.user.sub) {
      console.error('Debug - Usuário não autenticado');
      throw new UnauthorizedException('Usuário não autenticado');
    }

    const resultado = await this.investimentosService.create({
      ...createInvestimentoDto,
      usuario_id: req.user.sub
    });

    console.log('Debug - Resultado da criação:', resultado);

    return resultado;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar investimento por ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    console.log('Debug - Buscando investimento:', {
      investimentoId: id,
      userId: req.user.sub
    });
    return this.investimentosService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar investimento' })
  async remove(@Param('id') id: string, @Request() req) {
    console.log('Debug - Removendo investimento:', {
      investimentoId: id,
      userId: req.user.sub
    });
    return this.investimentosService.remove(id);
  }
} 