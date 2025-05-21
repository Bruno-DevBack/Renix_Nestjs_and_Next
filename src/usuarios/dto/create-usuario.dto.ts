import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'João Silva', description: 'Nome completo do usuário' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nome_usuario: string;

  @ApiProperty({ example: 'joao@email.com', description: 'Email do usuário' })
  @IsEmail()
  email_usuario: string;

  @ApiProperty({ example: 'Senha123!', description: 'Senha do usuário' })
  @IsString()
  @MinLength(8)
  senha_usuario: string;

  @ApiProperty({ example: '(11) 98765-4321', description: 'Telefone do usuário' })
  @IsString()
  @IsOptional()
  telefone_usuario?: string;
} 