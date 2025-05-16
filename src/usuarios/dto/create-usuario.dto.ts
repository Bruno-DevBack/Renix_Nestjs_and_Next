import { IsString, IsEmail, IsBoolean, IsOptional } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  nome_usuario: string;

  @IsEmail()
  email_usuario: string;

  @IsString()
  telefone_usuario: string;

  @IsString()
  senha_usuario: string;

  @IsOptional()
  @IsString()
  cnpj_usuario?: string;

  @IsOptional()
  @IsString()
  cpf_usuario?: string;

  @IsOptional()
  @IsBoolean()
  eAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  ePremium?: boolean;
} 