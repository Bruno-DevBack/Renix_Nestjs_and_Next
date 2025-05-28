import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para criação de um novo banco no sistema
 * 
 * @description
 * Define a estrutura e validação dos dados necessários para
 * criar um novo banco. Inclui:
 * - Informações básicas do banco
 * - Taxas e impostos aplicáveis
 * - Validações de tipos e obrigatoriedade
 * - Documentação Swagger
 * 
 * Todas as propriedades são validadas usando class-validator
 * e documentadas com Swagger para facilitar o uso da API.
 * 
 * @example
 * // Exemplo de uso em uma requisição
 * POST /bancos
 * {
 *   "nome_banco": "Banco do Brasil",
 *   "IOF_diario": 0.0038,
 *   "cdi": 13.75,
 *   "IR_ate_180_dias": 22.5,
 *   "IR_ate_360_dias": 20,
 *   "IR_ate_720_dias": 17.5,
 *   "IR_acima_720_dias": 15
 * }
 */
export class CreateBancoDto {
  /**
   * Nome oficial da instituição bancária
   * @example "Banco do Brasil"
   */
  @ApiProperty({
    example: 'Banco do Brasil',
    description: 'Nome oficial do banco',
    required: true
  })
  @IsString({ message: 'O nome do banco deve ser uma string' })
  @IsNotEmpty({ message: 'O nome do banco é obrigatório' })
  nome_banco: string;

  /**
   * Taxa de IOF diário aplicada pelo banco
   * @example 0.0038
   * @description Valor em decimal (0.0038 = 0.38%)
   */
  @ApiProperty({
    example: 0.0038,
    description: 'Taxa de IOF diário cobrada pelo banco (em decimal)',
    required: true
  })
  @IsNumber({}, { message: 'O IOF diário deve ser um número' })
  @IsNotEmpty({ message: 'O IOF diário é obrigatório' })
  IOF_diario: number;

  /**
   * Taxa CDI atual praticada pelo banco
   * @example 13.75
   * @description Valor em percentual (13.75 = 13.75%)
   */
  @ApiProperty({
    example: 13.75,
    description: 'Taxa CDI atual do banco (em percentual)',
    required: true
  })
  @IsNumber({}, { message: 'O CDI deve ser um número' })
  @IsNotEmpty({ message: 'O CDI é obrigatório' })
  cdi: number;

  /**
   * Alíquota de IR para investimentos até 180 dias
   * @example 22.5
   * @description Valor em percentual (22.5 = 22.5%)
   */
  @ApiProperty({
    example: 22.5,
    description: 'Imposto de Renda para investimentos até 180 dias (em percentual)',
    required: true
  })
  @IsNumber({}, { message: 'O IR até 180 dias deve ser um número' })
  @IsNotEmpty({ message: 'O IR até 180 dias é obrigatório' })
  IR_ate_180_dias: number;

  /**
   * Alíquota de IR para investimentos entre 181 e 360 dias
   * @example 20
   * @description Valor em percentual (20 = 20%)
   */
  @ApiProperty({
    example: 20,
    description: 'Imposto de Renda para investimentos entre 181 e 360 dias (em percentual)',
    required: true
  })
  @IsNumber({}, { message: 'O IR até 360 dias deve ser um número' })
  @IsNotEmpty({ message: 'O IR até 360 dias é obrigatório' })
  IR_ate_360_dias: number;

  /**
   * Alíquota de IR para investimentos entre 361 e 720 dias
   * @example 17.5
   * @description Valor em percentual (17.5 = 17.5%)
   */
  @ApiProperty({
    example: 17.5,
    description: 'Imposto de Renda para investimentos entre 361 e 720 dias (em percentual)',
    required: true
  })
  @IsNumber({}, { message: 'O IR até 720 dias deve ser um número' })
  @IsNotEmpty({ message: 'O IR até 720 dias é obrigatório' })
  IR_ate_720_dias: number;

  /**
   * Alíquota de IR para investimentos acima de 720 dias
   * @example 15
   * @description Valor em percentual (15 = 15%)
   */
  @ApiProperty({
    example: 15,
    description: 'Imposto de Renda para investimentos acima de 720 dias (em percentual)',
    required: true
  })
  @IsNumber({}, { message: 'O IR acima de 720 dias deve ser um número' })
  @IsNotEmpty({ message: 'O IR acima de 720 dias é obrigatório' })
  IR_acima_720_dias: number;
} 