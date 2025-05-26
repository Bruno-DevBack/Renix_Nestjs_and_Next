import { IsNotEmpty, IsNumber } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDashboardDto {
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
    example: '507f1f77bcf86cd799439013',
    description: 'ID do investimento no MongoDB'
  })
  @IsNotEmpty()
  investimento_id: Types.ObjectId;

  @ApiProperty({
    example: 10500.00,
    description: 'Valor estimado do investimento com rendimentos'
  })
  @IsNumber()
  @IsNotEmpty()
  valor_estimado: number;

  @ApiProperty({
    example: 10000.00,
    description: 'Valor líquido do investimento após descontos de impostos e taxas'
  })
  @IsNumber()
  @IsNotEmpty()
  valor_liquido: number;

  @ApiProperty({
    example: 30,
    description: 'Quantidade de dias corridos desde o início do investimento'
  })
  @IsNumber()
  @IsNotEmpty()
  dias_corridos: number;

  @ApiProperty({
    example: 5.25,
    description: 'Percentual de rendimento do investimento'
  })
  @IsNumber()
  @IsNotEmpty()
  percentual_rendimento: number;

  @ApiProperty({
    example: 22.5,
    description: 'Percentual de imposto de renda aplicado'
  })
  @IsNumber()
  @IsNotEmpty()
  imposto_renda: number;

  @ApiProperty({
    example: 0.0038,
    description: 'Percentual de IOF aplicado'
  })
  @IsNumber()
  @IsNotEmpty()
  IOF: number;
} 