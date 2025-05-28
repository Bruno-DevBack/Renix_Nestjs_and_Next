/**
 * DTO para autenticação de usuário
 * 
 * @description
 * Define os dados necessários para login:
 * 
 * Campos Obrigatórios:
 * - email_usuario: Email cadastrado
 * - senha_usuario: Senha do usuário
 * 
 * Validações:
 * - Email: Formato válido
 * - Senha: Mínimo 8 caracteres
 * 
 * @example
 * {
 *   "email_usuario": "joao@email.com",
 *   "senha_usuario": "Senha123!"
 * }
 */

import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUsuarioDto {
  /**
   * Email do usuário
   * @description Email cadastrado para autenticação
   * @example "usuario@email.com"
   */
  @ApiProperty({
    example: 'usuario@email.com',
    description: 'Email cadastrado do usuário'
  })
  @IsEmail()
  email_usuario: string;

  /**
   * Senha do usuário
   * @description Senha com mínimo de 8 caracteres
   * @example "Senha123!"
   */
  @ApiProperty({
    example: 'Senha123!',
    description: 'Senha do usuário (mínimo 8 caracteres)'
  })
  @IsString()
  @MinLength(8)
  senha_usuario: string;
} 