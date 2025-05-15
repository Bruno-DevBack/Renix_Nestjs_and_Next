import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateBancoDto {
  @IsString()
  @IsNotEmpty()
  nome_banco: string;

  @IsNumber()
  @IsNotEmpty()
  IOF_diario: number;

  @IsNumber()
  @IsNotEmpty()
  cdi: number;

  @IsNumber()
  @IsNotEmpty()
  IR_ate_180_dias: number;

  @IsNumber()
  @IsNotEmpty()
  IR_ate_360_dias: number;

  @IsNumber()
  @IsNotEmpty()
  IR_ate_720_dias: number;

  @IsNumber()
  @IsNotEmpty()
  IR_acima_720_dias: number;
} 