import { IsNotEmpty, IsNumber, IsDateString } from 'class-validator';
import { Types } from 'mongoose';

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
} 