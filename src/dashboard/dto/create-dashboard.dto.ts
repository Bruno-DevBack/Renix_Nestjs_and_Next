import { IsNotEmpty, IsNumber } from 'class-validator';
import { Types } from 'mongoose';

export class CreateDashboardDto {
  @IsNotEmpty()
  usuario_id: Types.ObjectId;

  @IsNotEmpty()
  banco_id: Types.ObjectId;

  @IsNotEmpty()
  investimento_id: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  valor_estimado: number;

  @IsNumber()
  @IsNotEmpty()
  valor_liquido: number;

  @IsNumber()
  @IsNotEmpty()
  dias_corridos: number;

  @IsNumber()
  @IsNotEmpty()
  percentual_rendimento: number;

  @IsNumber()
  @IsNotEmpty()
  imposto_renda: number;

  @IsNumber()
  @IsNotEmpty()
  IOF: number;
} 