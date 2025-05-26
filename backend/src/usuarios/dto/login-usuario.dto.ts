import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUsuarioDto {
  @ApiProperty({
    example: 'usuario@email.com',
    description: 'Email cadastrado do usuário'
  })
  @IsEmail()
  email_usuario: string;

  @ApiProperty({
    example: 'Senha123!',
    description: 'Senha do usuário (mínimo 8 caracteres)'
  })
  @IsString()
  @MinLength(8)
  senha_usuario: string;
} 