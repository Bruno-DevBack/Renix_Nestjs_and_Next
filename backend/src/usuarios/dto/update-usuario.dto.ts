/**
 * DTO para atualização parcial de usuário
 * 
 * @description
 * Define os campos que podem ser atualizados:
 * 
 * Campos Opcionais:
 * - nome_usuario: Novo nome (3-100 caracteres)
 * - email_usuario: Novo email (único)
 * 
 * Validações:
 * - Nome: Mínimo 3, máximo 100 caracteres
 * - Email: Formato válido e único
 * 
 * Observações:
 * - Todos os campos são opcionais
 * - Senha não pode ser atualizada por esta rota
 * - Email requer validação de unicidade
 * 
 * @example
 * // Atualizar apenas nome
 * {
 *   "nome_usuario": "João Silva Atualizado"
 * }
 * 
 * // Atualizar apenas email
 * {
 *   "email_usuario": "joao.novo@email.com"
 * }
 * 
 * // Atualizar ambos
 * {
 *   "nome_usuario": "João Silva Atualizado",
 *   "email_usuario": "joao.novo@email.com"
 * }
 */

import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUsuarioDto {
    /**
     * Novo nome do usuário
     * @description Opcional, entre 3 e 100 caracteres
     * @example "João Silva Atualizado"
     */
    @ApiProperty({ example: 'João Silva', description: 'Nome completo do usuário', required: false })
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    nome_usuario?: string;

    /**
     * Novo email do usuário
     * @description Opcional, deve ser único no sistema
     * @example "joao.novo@email.com"
     */
    @ApiProperty({ example: 'joao@email.com', description: 'Email do usuário', required: false })
    @IsOptional()
    @IsEmail()
    email_usuario?: string;
} 