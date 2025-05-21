import { IsNotEmpty, IsNumber, IsDateString, IsEnum, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { TipoInvestimento, CaracteristicasInvestimento } from '../schemas/investimento.schema';

export class CaracteristicasInvestimentoDto implements CaracteristicasInvestimento {
  @IsNotEmpty()
  @IsEnum(TipoInvestimento)
  tipo: TipoInvestimento;

  @IsOptional()
  @IsNumber()
  rentabilidade_anual?: number;

  @IsOptional()
  indexador?: string;

  @IsOptional()
  @IsNumber()
  percentual_indexador?: number;

  @IsNumber()
  @IsNotEmpty()
  risco: number;

  @IsNumber()
  @IsNotEmpty()
  liquidez: number;

  @IsNotEmpty()
  garantia_fgc: boolean;

  @IsOptional()
  @IsDateString()
  vencimento?: Date;

  @IsOptional()
  @IsNumber()
  taxa_administracao?: number;

  @IsOptional()
  @IsNumber()
  taxa_performance?: number;

  @IsNumber()
  @IsNotEmpty()
  valor_minimo: number;
}

export class CreateInvestimentoDto {
  @IsNotEmpty()
  usuario_id: Types.ObjectId;

  @IsNotEmpty()
  banco_id: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  valor_investimento: number;

  @IsDateString()
  data_inicio: Date;

  @IsDateString()
  data_fim: Date;

  @IsNotEmpty()
  @IsEnum(TipoInvestimento)
  tipo_investimento: TipoInvestimento;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CaracteristicasInvestimentoDto)
  caracteristicas: CaracteristicasInvestimentoDto;
} 