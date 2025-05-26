import { Module } from '@nestjs/common';
import { AdminGuard } from './guards/admin.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';

/**
 * Módulo responsável por fornecer funcionalidades comuns para toda a aplicação
 * 
 * Este módulo:
 * - Fornece guards para controle de acesso e rate limiting
 * - Implementa interceptors para transformação de respostas
 * - Fornece filtros para tratamento de exceções
 * - Disponibiliza utilitários comuns
 * - Centraliza configurações compartilhadas
 */
@Module({
    providers: [
        AdminGuard,           // Guard para controle de acesso administrativo
        RateLimitGuard,       // Guard para limitação de requisições
        HttpExceptionFilter,   // Filtro para tratamento de exceções HTTP
        TransformInterceptor  // Interceptor para transformação de respostas
    ],
    exports: [
        AdminGuard,
        RateLimitGuard,
        HttpExceptionFilter,
        TransformInterceptor
    ]
})
export class CommonModule { } 