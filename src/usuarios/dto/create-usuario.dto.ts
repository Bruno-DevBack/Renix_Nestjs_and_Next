import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
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
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
    message: 'O telefone deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX'
  })
  telefone_usuario: string;
} 