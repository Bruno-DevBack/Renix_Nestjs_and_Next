import { IsNotEmpty, IsNumber, IsDateString, IsEnum, ValidateNested, IsOptional, IsString, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { TipoInvestimento, CaracteristicasInvestimento } from '../schemas/investimento.schema';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para criação de características do investimento
 * 
 * @description
 * Define a estrutura e validação dos dados das características
 * de um novo investimento. Inclui:
 * - Tipo e categoria
 * - Rentabilidade e indexadores
 * - Risco e liquidez
 * - Garantias e proteções
 * - Taxas e valores mínimos
 */
export class CaracteristicasInvestimentoDto implements CaracteristicasInvestimento {
  /**
   * Tipo do investimento
   * @description Categoria específica do investimento (CDB, LCI, etc)
   */
  @ApiProperty({
    example: 'CDB',
    description: 'Tipo do investimento (CDB, LCI, LCA, etc)',
    enum: TipoInvestimento
  })
  @IsNotEmpty()
  @IsEnum(TipoInvestimento)
  tipo: TipoInvestimento;

  /**
   * Rentabilidade anual
   * @description Taxa de rendimento anual esperada
   */
  @ApiProperty({
    example: 12.5,
    description: 'Rentabilidade anual do investimento em percentual',
    required: false
  })
  @IsOptional()
  @IsNumber()
  rentabilidade_anual?: number;

  /**
   * Indexador do investimento
   * @description Índice de referência (CDI, IPCA, etc)
   */
  @ApiProperty({
    example: 'CDI',
    description: 'Indexador do investimento (CDI, IPCA, etc)',
    required: false
  })
  @IsOptional()
  indexador?: string;

  /**
   * Percentual do indexador
   * @description Percentual aplicado sobre o indexador
   */
  @ApiProperty({
    example: 110,
    description: 'Percentual do indexador (ex: 110% do CDI)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  percentual_indexador?: number;

  /**
   * Nível de risco
   * @description Classificação de risco de 1 a 5
   */
  @ApiProperty({
    example: 2,
    description: 'Nível de risco do investimento (1-5)',
  })
  @IsNumber()
  @IsNotEmpty()
  risco: number;

  /**
   * Nível de liquidez
   * @description Classificação de liquidez de 1 a 5
   */
  @ApiProperty({
    example: 3,
    description: 'Nível de liquidez do investimento (1-5)',
  })
  @IsNumber()
  @IsNotEmpty()
  liquidez: number;

  /**
   * Garantia FGC
   * @description Se possui cobertura do FGC
   */
  @ApiProperty({
    example: true,
    description: 'Se o investimento possui garantia do FGC',
  })
  @IsNotEmpty()
  garantia_fgc: boolean;

  /**
   * Data de vencimento
   * @description Data de vencimento do investimento
   */
  @ApiProperty({
    example: '2025-12-31',
    description: 'Data de vencimento do investimento',
    required: false
  })
  @IsOptional()
  @IsDateString()
  vencimento?: Date;

  /**
   * Taxa de administração
   * @description Percentual da taxa de administração
   */
  @ApiProperty({
    example: 0.5,
    description: 'Taxa de administração em percentual ao ano',
    required: false
  })
  @IsOptional()
  @IsNumber()
  taxa_administracao?: number;

  /**
   * Taxa de performance
   * @description Percentual da taxa de performance
   */
  @ApiProperty({
    example: 20,
    description: 'Taxa de performance em percentual',
    required: false
  })
  @IsOptional()
  @IsNumber()
  taxa_performance?: number;

  /**
   * Valor mínimo
   * @description Valor mínimo para investir
   */
  @ApiProperty({
    example: 1000,
    description: 'Valor mínimo para investir',
  })
  @IsNumber()
  @IsNotEmpty()
  valor_minimo: number;
}

/**
 * DTO para criação de um novo investimento
 * 
 * @description
 * Define a estrutura e validação dos dados necessários para
 * criar um novo investimento. Inclui:
 * - Dados básicos do investimento
 * - Valores e datas
 * - Referências (banco, usuário)
 * - Características detalhadas
 */
export class CreateInvestimentoDto {
  /**
   * Título do investimento
   * @description Nome/identificação do investimento
   */
  @ApiProperty({
    example: 'CDB Banco X',
    description: 'Título do investimento'
  })
  @IsNotEmpty()
  @IsString()
  titulo: string;

  /**
   * Valor do investimento
   * @description Valor inicial a ser investido
   */
  @ApiProperty({
    example: 10000,
    description: 'Valor do investimento'
  })
  @IsNumber()
  @IsNotEmpty()
  valor_investimento: number;

  /**
   * ID do banco
   * @description Referência ao banco/instituição
   */
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID do banco'
  })
  @IsMongoId()
  @IsNotEmpty()
  banco_id: Types.ObjectId;

  /**
   * ID do usuário
   * @description Referência ao usuário proprietário
   */
  @ApiProperty({
    example: '507f1f77bcf86cd799439012',
    description: 'ID do usuário'
  })
  @IsMongoId()
  @IsOptional()
  usuario_id?: Types.ObjectId;

  /**
   * Data de início
   * @description Data de início do investimento
   */
  @ApiProperty({
    example: '2024-03-20',
    description: 'Data de início do investimento'
  })
  @IsDateString()
  @IsNotEmpty()
  data_inicio: string;

  /**
   * Data de vencimento
   * @description Data de vencimento do investimento
   */
  @ApiProperty({
    example: '2025-03-20',
    description: 'Data de vencimento do investimento'
  })
  @IsDateString()
  @IsNotEmpty()
  data_fim: string;

  /**
   * Tipo do investimento
   * @description Categoria do investimento
   */
  @ApiProperty({
    example: 'CDB',
    description: 'Tipo do investimento',
    enum: TipoInvestimento
  })
  @IsEnum(TipoInvestimento)
  @IsNotEmpty()
  tipo_investimento: TipoInvestimento;

  /**
   * Características do investimento
   * @description Detalhes e parâmetros específicos
   */
  @ApiProperty({
    description: 'Características do investimento'
  })
  @ValidateNested()
  @Type(() => CaracteristicasInvestimentoDto)
  @IsNotEmpty()
  caracteristicas: CaracteristicasInvestimentoDto;
} 