import { Module } from '@nestjs/common';
import { AdminGuard } from './guards/admin.guard';
// import { RateLimitGuard } from './guards/rate-limit.guard';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';

/**
 * Módulo central que fornece funcionalidades comuns para toda a aplicação
 * 
 * @description
 * O CommonModule é um módulo fundamental que centraliza e disponibiliza
 * componentes, utilitários e configurações compartilhadas por toda a aplicação.
 * 
 * Responsabilidades:
 * - Fornecimento de guards para controle de acesso e proteção da API
 * - Implementação de interceptors para transformação de respostas
 * - Disponibilização de filtros para tratamento padronizado de exceções
 * - Centralização de configurações compartilhadas
 * - Exportação de utilitários comuns
 * 
 * Componentes principais:
 * - AdminGuard: Controle de acesso administrativo
 * - HttpExceptionFilter: Tratamento padronizado de erros
 * - TransformInterceptor: Padronização de respostas
 * 
 * @example
 * // Importação do módulo em outros módulos da aplicação
 * @Module({
 *   imports: [CommonModule],
 *   // ... outras configurações
 * })
 * export class OutroModule {}
 */
@Module({
    providers: [
        AdminGuard,           // Guard para controle de acesso administrativo
        // RateLimitGuard,       // Guard para limitação de requisições
        HttpExceptionFilter,   // Filtro para tratamento de exceções HTTP
        TransformInterceptor   // Interceptor para transformação de respostas
    ],
    exports: [
        AdminGuard,           // Exporta o guard de admin para uso em outros módulos
        // RateLimitGuard,       // Exporta o guard de rate limit para uso em outros módulos
        HttpExceptionFilter,   // Exporta o filtro de exceções para uso global
        TransformInterceptor   // Exporta o interceptor de transformação para uso global
    ]
})
export class CommonModule { } 