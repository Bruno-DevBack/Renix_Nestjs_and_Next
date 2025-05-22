import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

/**
 * Filtro responsável por padronizar o tratamento de exceções HTTP
 * 
 * Transforma todas as exceções HTTP em um formato consistente de resposta
 * contendo:
 * - Código de status
 * - Timestamp do erro
 * - Mensagem de erro
 * 
 * @example
 * // Resposta de erro padronizada
 * {
 *   "statusCode": 404,
 *   "timestamp": "2024-03-14T12:00:00.000Z",
 *   "message": "Recurso não encontrado"
 * }
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * Captura e formata a exceção HTTP
   * @param exception - A exceção HTTP capturada
   * @param host - O host dos argumentos
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        message: typeof exceptionResponse === 'object'
          ? (exceptionResponse as any).message
          : exceptionResponse,
      });
  }
} 