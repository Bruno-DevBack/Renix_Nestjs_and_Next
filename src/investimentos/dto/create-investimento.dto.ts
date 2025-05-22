import { IsNotEmpty, IsNumber, IsDateString, IsEnum, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { TipoInvestimento, CaracteristicasInvestimento } from '../schemas/investimento.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CaracteristicasInvestimentoDto implements CaracteristicasInvestimento {
  @ApiProperty({
    example: 'CDB',
    description: 'Tipo do investimento (CDB, LCI, LCA, etc)',
    enum: TipoInvestimento
  })
  @IsNotEmpty()
  @IsEnum(TipoInvestimento)
  tipo: TipoInvestimento;

  @ApiProperty({
    example: 12.5,
    description: 'Rentabilidade anual do investimento em percentual',
    required: false
  })
  @IsOptional()
  @IsNumber()
  rentabilidade_anual?: number;

  @ApiProperty({
    example: 'CDI',
    description: 'Indexador do investimento (CDI, IPCA, etc)',
    required: false
  })
  @IsOptional()
  indexador?: string;

  @ApiProperty({
    example: 110,
    description: 'Percentual do indexador (ex: 110% do CDI)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  percentual_indexador?: number;

  @ApiProperty({
    example: 2,
    description: 'Nível de risco do investimento (1-5)',
  })
  @IsNumber()
  @IsNotEmpty()
  risco: number;

  @ApiProperty({
    example: 3,
    description: 'Nível de liquidez do investimento (1-5)',
  })
  @IsNumber()
  @IsNotEmpty()
  liquidez: number;

  @ApiProperty({
    example: true,
    description: 'Se o investimento possui garantia do FGC',
  })
  @IsNotEmpty()
  garantia_fgc: boolean;

  @ApiProperty({
    example: '2025-12-31',
    description: 'Data de vencimento do investimento',
    required: false
  })
  @IsOptional()
  @IsDateString()
  vencimento?: Date;

  @ApiProperty({
    example: 0.5,
    description: 'Taxa de administração em percentual ao ano',
    required: false
  })
  @IsOptional()
  @IsNumber()
  taxa_administracao?: number;

  @ApiProperty({
    example: 20,
    description: 'Taxa de performance em percentual',
    required: false
  })
  @IsOptional()
  @IsNumber()
  taxa_performance?: number;

  @ApiProperty({
    example: 1000,
    description: 'Valor mínimo para investir',
  })
  @IsNumber()
  @IsNotEmpty()
  valor_minimo: number;
}

export class CreateInvestimentoDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID do usuário no MongoDB'
  })
  @IsNotEmpty()
  usuario_id: Types.ObjectId;

  @ApiProperty({
    example: '507f1f77bcf86cd799439012',
    description: 'ID do banco no MongoDB'
  })
  @IsNotEmpty()
  banco_id: Types.ObjectId;

  @ApiProperty({
    example: 10000,
    description: 'Valor inicial do investimento'
  })
  @IsNumber()
  @IsNotEmpty()
  valor_investimento: number;

  @ApiProperty({
    example: '2024-03-15',
    description: 'Data de início do investimento'
  })
  @IsDateString()
  data_inicio: Date;

  @ApiProperty({
    example: '2025-03-15',
    description: 'Data de vencimento do investimento'
  })
  @IsDateString()
  data_fim: Date;

  @ApiProperty({
    example: 'CDB',
    description: 'Tipo do investimento',
    enum: TipoInvestimento
  })
  @IsNotEmpty()
  @IsEnum(TipoInvestimento)
  tipo_investimento: TipoInvestimento;

  @ApiProperty({
    description: 'Características detalhadas do investimento',
    type: () => CaracteristicasInvestimentoDto
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CaracteristicasInvestimentoDto)
  caracteristicas: CaracteristicasInvestimentoDto;
} 