/**
 * Controller responsável pelas rotas de investimentos
 * 
 * @description
 * Implementa os endpoints REST para:
 * - Listagem de investimentos
 * - Criação de novos investimentos
 * - Busca de investimentos específicos
 * - Remoção de investimentos
 * 
 * Características:
 * - Proteção por autenticação JWT
 * - Rate limiting para proteção contra abusos
 * - Documentação Swagger
 * - Logging detalhado para debug
 */

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
  constructor(private readonly investimentosService: InvestimentosService) { }

  /**
   * Lista todos os investimentos do usuário autenticado
   * 
   * @description
   * Retorna uma lista com todos os investimentos
   * associados ao usuário que fez a requisição.
   * 
   * @route GET /investimentos
   * @security JWT
   * @param req - Request com dados do usuário autenticado
   * @returns Array de investimentos do usuário
   */
  @Get()
  @ApiOperation({ summary: 'Listar todos os investimentos do usuário' })
  async findAll(@Request() req) {
    console.log('Debug - Buscando investimentos:', {
      userId: req.user.sub,
      userEmail: req.user.email
    });
    return this.investimentosService.findAll(req.user.sub);
  }

  /**
   * Cria um novo investimento
   * 
   * @description
   * Registra um novo investimento para o usuário autenticado.
   * Realiza validações e cálculos financeiros.
   * 
   * @route POST /investimentos
   * @security JWT
   * @param createInvestimentoDto - Dados do novo investimento
   * @param req - Request com dados do usuário autenticado
   * @returns Objeto com investimento e dashboard criados
   * @throws {UnauthorizedException} Se usuário não autenticado
   */
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

  /**
   * Busca um investimento específico
   * 
   * @description
   * Retorna os detalhes de um investimento pelo seu ID.
   * 
   * @route GET /investimentos/:id
   * @security JWT
   * @param id - ID do investimento
   * @param req - Request com dados do usuário autenticado
   * @returns Detalhes do investimento
   */
  @Get(':id')
  @ApiOperation({ summary: 'Buscar investimento por ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    console.log('Debug - Buscando investimento:', {
      investimentoId: id,
      userId: req.user.sub
    });
    return this.investimentosService.findOne(id);
  }

  /**
   * Remove um investimento
   * 
   * @description
   * Exclui um investimento e seu dashboard associado.
   * 
   * @route DELETE /investimentos/:id
   * @security JWT
   * @param id - ID do investimento
   * @param req - Request com dados do usuário autenticado
   * @returns Resultado da operação de remoção
   */
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