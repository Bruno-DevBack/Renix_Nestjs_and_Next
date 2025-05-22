import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interface que define o formato padrão de resposta da API
 */
export interface Response<T> {
  data: T;               // Dados da resposta
  timestamp: string;     // Timestamp da resposta
}

/**
 * Interceptor responsável por transformar todas as respostas da API
 * em um formato padronizado
 * 
 * Adiciona:
 * - Wrapper de dados
 * - Timestamp da resposta
 * 
 * @example
 * // Resposta original
 * { "id": 1, "nome": "Exemplo" }
 * 
 * // Resposta transformada
 * {
 *   "data": { "id": 1, "nome": "Exemplo" },
 *   "timestamp": "2024-03-14T12:00:00.000Z"
 * }
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  /**
   * Intercepta a resposta e aplica a transformação
   * @param context - Contexto da execução
   * @param next - Handler da chamada
   * @returns Observable com a resposta transformada
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => ({
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
} 