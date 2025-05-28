/**
 * DTO para criação de novo usuário
 * 
 * @description
 * Define a estrutura e validações dos dados para criar um usuário:
 * 
 * Campos Obrigatórios:
 * - nome_usuario: Nome completo (3-100 caracteres)
 * - email_usuario: Email válido e único
 * - senha_usuario: Senha forte (min 8 caracteres)
 * - telefone_usuario: Formato brasileiro
 * 
 * Validações:
 * - Nome: Mínimo 3 caracteres, máximo 100
 * - Email: Formato válido
 * - Senha: Mínimo 8 caracteres
 * - Telefone: Regex para formato (XX) XXXXX-XXXX
 * 
 * @example
 * {
 *   "nome_usuario": "João Silva",
 *   "email_usuario": "joao@email.com",
 *   "senha_usuario": "Senha123!",
 *   "telefone_usuario": "(11) 98765-4321"
 * }
 */

import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  /**
   * Nome completo do usuário
   * @description Deve ter entre 3 e 100 caracteres
   * @example "João Silva"
   */
  @ApiProperty({ example: 'João Silva', description: 'Nome completo do usuário' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nome_usuario: string;

  /**
   * Email do usuário
   * @description Deve ser um email válido e único no sistema
   * @example "joao@email.com"
   */
  @ApiProperty({ example: 'joao@email.com', description: 'Email do usuário' })
  @IsEmail()
  email_usuario: string;

  /**
   * Senha do usuário
   * @description Mínimo de 8 caracteres
   * @example "Senha123!"
   */
  @ApiProperty({ example: 'Senha123!', description: 'Senha do usuário' })
  @IsString()
  @MinLength(8)
  senha_usuario: string;

  /**
   * Telefone do usuário
   * @description Formato brasileiro: (XX) XXXXX-XXXX
   * @example "(11) 98765-4321"
   */
  @ApiProperty({ example: '(11) 98765-4321', description: 'Telefone do usuário' })
  @IsString()
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
    message: 'O telefone deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX'
  })
  telefone_usuario: string;
} 