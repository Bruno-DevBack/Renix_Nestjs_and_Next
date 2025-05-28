import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interface que define o formato padrão de resposta da API
 * 
 * @description
 * Esta interface estabelece um contrato para todas as respostas da API,
 * garantindo um formato consistente com:
 * 
 * @property {T} data - Dados principais da resposta (payload)
 * @property {string} timestamp - Data e hora da resposta em formato ISO 8601
 */
export interface Response<T> {
  data: T;               // Dados da resposta
  timestamp: string;     // Timestamp da resposta em formato ISO 8601
}

/**
 * Interceptor responsável por transformar todas as respostas da API
 * em um formato padronizado
 * 
 * @description
 * Este interceptor implementa um padrão de resposta consistente para toda a API.
 * Ele intercepta todas as respostas antes de serem enviadas ao cliente e:
 * - Encapsula os dados originais em um objeto padronizado
 * - Adiciona metadados úteis como timestamp
 * - Mantém consistência na estrutura de resposta
 * - Facilita o versionamento da API
 * - Melhora a experiência do cliente com respostas previsíveis
 * 
 * @example
 * // Resposta original do controller
 * @Get()
 * findOne() {
 *   return { "id": 1, "nome": "Exemplo" };
 * }
 * 
 * // Resposta transformada pelo interceptor
 * {
 *   "data": { 
 *     "id": 1, 
 *     "nome": "Exemplo" 
 *   },
 *   "timestamp": "2024-03-14T12:00:00.000Z"
 * }
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  /**
   * Intercepta e transforma a resposta da API
   * 
   * @param context - Contexto da execução contendo detalhes da requisição/resposta
   * @param next - Handler da chamada que contém a resposta original
   * @returns Observable com a resposta transformada no formato padronizado
   * 
   * @description
   * Este método:
   * 1. Captura a resposta original do controller
   * 2. Verifica se já está no formato esperado
   * 3. Se não estiver, aplica a transformação
   * 4. Adiciona o timestamp atual
   * 5. Retorna a resposta padronizada
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => {
        // Se a resposta já estiver no formato correto, não transforma novamente
        if (data && data.data && data.timestamp) {
          return data;
        }
        // Caso contrário, aplica a transformação padrão
        return {
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
} 