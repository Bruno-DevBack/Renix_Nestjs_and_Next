import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUsuarioDto {
    @ApiProperty({ example: 'João Silva', description: 'Nome completo do usuário' })
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    nome_usuario: string;

    @ApiProperty({ example: 'joao@email.com', description: 'Email do usuário' })
    @IsEmail()
    email_usuario: string;
} 