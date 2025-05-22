import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBancoDto {
  @ApiProperty({
    example: 'Banco do Brasil',
    description: 'Nome oficial do banco'
  })
  @IsString()
  @IsNotEmpty()
  nome_banco: string;

  @ApiProperty({
    example: 0.0038,
    description: 'Taxa de IOF diário cobrada pelo banco (em decimal)'
  })
  @IsNumber()
  @IsNotEmpty()
  IOF_diario: number;

  @ApiProperty({
    example: 13.75,
    description: 'Taxa CDI atual do banco (em percentual)'
  })
  @IsNumber()
  @IsNotEmpty()
  cdi: number;

  @ApiProperty({
    example: 22.5,
    description: 'Imposto de Renda para investimentos até 180 dias (em percentual)'
  })
  @IsNumber()
  @IsNotEmpty()
  IR_ate_180_dias: number;

  @ApiProperty({
    example: 20,
    description: 'Imposto de Renda para investimentos entre 181 e 360 dias (em percentual)'
  })
  @IsNumber()
  @IsNotEmpty()
  IR_ate_360_dias: number;

  @ApiProperty({
    example: 17.5,
    description: 'Imposto de Renda para investimentos entre 361 e 720 dias (em percentual)'
  })
  @IsNumber()
  @IsNotEmpty()
  IR_ate_720_dias: number;

  @ApiProperty({
    example: 15,
    description: 'Imposto de Renda para investimentos acima de 720 dias (em percentual)'
  })
  @IsNumber()
  @IsNotEmpty()
  IR_acima_720_dias: number;
} 