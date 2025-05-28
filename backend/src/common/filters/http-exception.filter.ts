import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

/**
 * Filtro global para tratamento padronizado de exceções HTTP
 * 
 * @description
 * Este filtro é responsável por capturar e transformar todas as exceções HTTP
 * lançadas pela aplicação em um formato de resposta consistente e amigável.
 * 
 * Benefícios:
 * - Padronização das respostas de erro
 * - Melhor experiência para os consumidores da API
 * - Facilitação do debug e monitoramento
 * - Ocultação de detalhes sensíveis da implementação
 * 
 * O filtro captura qualquer exceção que herde de HttpException e a transforma
 * em uma resposta estruturada contendo:
 * - Código de status HTTP
 * - Timestamp do erro
 * - Mensagem descritiva do erro
 * 
 * @example
 * // Exemplo de uso em um controller
 * @Get('recurso/:id')
 * findOne(@Param('id') id: string) {
 *   throw new NotFoundException('Recurso não encontrado');
 * }
 * 
 * // Resposta gerada pelo filtro
 * {
 *   "statusCode": 404,
 *   "timestamp": "2024-03-14T12:00:00.000Z",
 *   "message": "Recurso não encontrado"
 * }
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * Método responsável por capturar e formatar exceções HTTP
   * 
   * @param exception - A exceção HTTP capturada
   * @param host - O host dos argumentos que contém o contexto da requisição
   * 
   * @description
   * Este método:
   * 1. Captura a exceção HTTP lançada
   * 2. Extrai as informações relevantes (status, mensagem)
   * 3. Formata a resposta de erro
   * 4. Adiciona o timestamp
   * 5. Envia a resposta padronizada
   * 
   * A mensagem de erro pode vir de duas formas:
   * - String direta
   * - Objeto com propriedade message
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