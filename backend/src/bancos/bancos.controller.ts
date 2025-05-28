import { Controller, Get, Param, Post, Delete, UseInterceptors, UploadedFile, ParseFilePipeBuilder } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BancosService } from './bancos.service';
import { Banco } from './schemas/banco.schema';
import { HistoricoResponse, DadosBancoResponse, TipoInvestimento } from './bancos.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

/**
 * Controller responsável por gerenciar as operações relacionadas a bancos
 * 
 * @description
 * Este controller fornece endpoints para:
 * - Consulta de informações bancárias
 * - Gestão de recursos visuais (logos)
 * - Acesso a dados de investimentos
 * - Histórico de atualizações
 * 
 * Todos os endpoints são documentados com Swagger e incluem:
 * - Descrições detalhadas
 * - Exemplos de uso
 * - Tipos de retorno
 * - Validações de entrada
 * 
 * @example
 * // Exemplo de uso dos endpoints
 * GET /bancos - Lista todos os bancos
 * GET /bancos/:id - Busca banco específico
 * GET /bancos/:id/dados - Dados detalhados
 * POST /bancos/:id/logo - Upload de logo
 */
@ApiTags('Bancos')
@Controller('bancos')
export class BancosController {
  constructor(private readonly bancosService: BancosService) { }

  /**
   * Lista todos os bancos cadastrados
   * 
   * @description
   * Retorna uma lista completa de todos os bancos
   * cadastrados no sistema, incluindo suas informações
   * básicas e status atual.
   * 
   * @returns Promise<Banco[]> Lista de bancos
   */
  @Get()
  @ApiOperation({ summary: 'Listar todos os bancos' })
  async findAll(): Promise<Banco[]> {
    return this.bancosService.findAll();
  }

  /**
   * Busca um banco específico por ID
   * 
   * @description
   * Retorna todas as informações de um banco específico,
   * incluindo dados cadastrais, taxas e investimentos.
   * 
   * @param id ID único do banco
   * @returns Promise<Banco> Dados do banco
   */
  @Get(':id')
  @ApiOperation({ summary: 'Buscar banco por ID' })
  async findById(@Param('id') id: string): Promise<Banco> {
    return this.bancosService.findById(id);
  }

  /**
   * Retorna dados específicos de um banco
   * 
   * @description
   * Fornece um conjunto específico de dados do banco,
   * formatados para uso em dashboards e relatórios.
   * 
   * @param id ID único do banco
   * @returns Promise<DadosBancoResponse> Dados formatados
   */
  @Get(':id/dados')
  @ApiOperation({ summary: 'Buscar dados específicos do banco' })
  async getDadosBanco(@Param('id') id: string): Promise<DadosBancoResponse> {
    return this.bancosService.getDadosBanco(id);
  }

  /**
   * Lista tipos de investimento disponíveis
   * 
   * @description
   * Retorna todos os tipos de investimento que o banco
   * oferece atualmente aos seus clientes.
   * 
   * @param id ID único do banco
   * @returns Promise<TipoInvestimento[]> Lista de tipos
   */
  @Get(':id/tipos-investimento')
  @ApiOperation({ summary: 'Buscar tipos de investimento disponíveis no banco' })
  async getTiposInvestimento(@Param('id') id: string): Promise<TipoInvestimento[]> {
    return this.bancosService.getTiposInvestimento(id);
  }

  /**
   * Lista investimentos disponíveis
   * 
   * @description
   * Retorna todos os produtos de investimento atualmente
   * disponíveis no banco, com suas características e taxas.
   * 
   * @param id ID único do banco
   * @returns Promise<any> Lista de investimentos
   */
  @Get(':id/investimentos')
  @ApiOperation({ summary: 'Buscar investimentos disponíveis no banco' })
  async getInvestimentosDisponiveis(@Param('id') id: string) {
    return this.bancosService.getInvestimentosDisponiveis(id);
  }

  /**
   * Retorna histórico de atualizações
   * 
   * @description
   * Fornece o histórico completo de atualizações do banco,
   * incluindo mudanças em taxas e características.
   * 
   * @param id ID único do banco
   * @returns Promise<HistoricoResponse> Histórico de atualizações
   */
  @Get(':id/historico')
  @ApiOperation({ summary: 'Buscar histórico de atualizações do banco' })
  async getHistorico(@Param('id') id: string): Promise<HistoricoResponse> {
    return this.bancosService.getHistorico(id);
  }

  /**
   * Realiza upload da logo do banco
   * 
   * @description
   * Permite fazer upload de uma nova logo para o banco.
   * O arquivo deve ser:
   * - Formato JPG, JPEG ou PNG
   * - Tamanho máximo de 5MB
   * - Dimensões adequadas para exibição
   * 
   * @param id ID único do banco
   * @param file Arquivo de imagem
   * @returns Promise<Banco> Banco atualizado
   */
  @Post(':id/logo')
  @ApiOperation({ summary: 'Fazer upload da logo do banco' })
  @ApiConsumes('multipart/form-data')
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
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
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
  ): Promise<Banco> {
    return this.bancosService.uploadLogo(id, file);
  }

  /**
   * Remove a logo do banco
   * 
   * @description
   * Exclui a logo atual do banco, retornando à
   * imagem padrão ou placeholder.
   * 
   * @param id ID único do banco
   * @returns Promise<Banco> Banco atualizado
   */
  @Delete(':id/logo')
  @ApiOperation({ summary: 'Deletar a logo do banco' })
  async deleteLogo(@Param('id') id: string): Promise<Banco> {
    return this.bancosService.deleteLogo(id);
  }
} 