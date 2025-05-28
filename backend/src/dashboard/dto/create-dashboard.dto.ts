/**
 * DTO para criação de um novo dashboard
 * 
 * @description
 * Define a estrutura e validação dos dados necessários para
 * criar um novo dashboard de investimento. Inclui:
 * - IDs de referência (usuário, banco, investimento)
 * - Valores e cálculos
 * - Impostos e taxas
 * - Validações via class-validator
 * - Documentação Swagger
 */

import { IsNotEmpty, IsNumber } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDashboardDto {
  /**
   * ID do usuário proprietário do dashboard
   * @description Referência ao usuário no MongoDB
   */
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID do usuário no MongoDB'
  })
  @IsNotEmpty({ message: 'O ID do usuário é obrigatório' })
  usuario_id: Types.ObjectId;

  /**
   * ID do banco do investimento
   * @description Referência ao banco no MongoDB
   */
  @ApiProperty({
    example: '507f1f77bcf86cd799439012',
    description: 'ID do banco no MongoDB'
  })
  @IsNotEmpty({ message: 'O ID do banco é obrigatório' })
  banco_id: Types.ObjectId;

  /**
   * ID do investimento
   * @description Referência ao investimento no MongoDB
   */
  @ApiProperty({
    example: '507f1f77bcf86cd799439013',
    description: 'ID do investimento no MongoDB'
  })
  @IsNotEmpty({ message: 'O ID do investimento é obrigatório' })
  investimento_id: Types.ObjectId;

  /**
   * Valor estimado do investimento
   * @description Valor total estimado incluindo rendimentos
   */
  @ApiProperty({
    example: 10500.00,
    description: 'Valor estimado do investimento com rendimentos'
  })
  @IsNumber({}, { message: 'O valor estimado deve ser um número' })
  @IsNotEmpty({ message: 'O valor estimado é obrigatório' })
  valor_estimado: number;

  /**
   * Valor líquido do investimento
   * @description Valor após descontos de impostos e taxas
   */
  @ApiProperty({
    example: 10000.00,
    description: 'Valor líquido do investimento após descontos de impostos e taxas'
  })
  @IsNumber({}, { message: 'O valor líquido deve ser um número' })
  @IsNotEmpty({ message: 'O valor líquido é obrigatório' })
  valor_liquido: number;

  /**
   * Dias corridos do investimento
   * @description Quantidade de dias desde o início
   */
  @ApiProperty({
    example: 30,
    description: 'Quantidade de dias corridos desde o início do investimento'
  })
  @IsNumber({}, { message: 'Os dias corridos devem ser um número' })
  @IsNotEmpty({ message: 'Os dias corridos são obrigatórios' })
  dias_corridos: number;

  /**
   * Percentual de rendimento
   * @description Taxa de rendimento do investimento
   */
  @ApiProperty({
    example: 5.25,
    description: 'Percentual de rendimento do investimento'
  })
  @IsNumber({}, { message: 'O percentual de rendimento deve ser um número' })
  @IsNotEmpty({ message: 'O percentual de rendimento é obrigatório' })
  percentual_rendimento: number;

  /**
   * Percentual de imposto de renda
   * @description Alíquota de IR aplicada
   */
  @ApiProperty({
    example: 22.5,
    description: 'Percentual de imposto de renda aplicado'
  })
  @IsNumber({}, { message: 'O imposto de renda deve ser um número' })
  @IsNotEmpty({ message: 'O imposto de renda é obrigatório' })
  imposto_renda: number;

  /**
   * Percentual de IOF
   * @description Taxa de IOF aplicada
   */
  @ApiProperty({
    example: 0.0038,
    description: 'Percentual de IOF aplicado'
  })
  @IsNumber({}, { message: 'O IOF deve ser um número' })
  @IsNotEmpty({ message: 'O IOF é obrigatório' })
  IOF: number;
} 