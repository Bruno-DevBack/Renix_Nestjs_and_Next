import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginUsuarioDto {
  @IsEmail()
  email_usuario: string;

  @IsString()
  @MinLength(6)
  senha_usuario: string;
} 