/**
 * Arquivo principal da aplicação NestJS
 * 
 * @description
 * Este arquivo é o ponto de entrada da aplicação e configura:
 * 
 * Segurança:
 * - CORS para comunicação segura com o frontend
 * - Validação global de dados via class-validator
 * - Filtros globais para tratamento de exceções
 * - Interceptors para transformação de respostas
 * 
 * Documentação:
 * - Swagger/OpenAPI para documentação da API
 * - Descrição detalhada dos endpoints
 * - Exemplos de uso e payloads
 * - Autenticação e autorização
 * 
 * Configurações:
 * - Prefixo global para todas as rotas
 * - Headers de segurança
 * - Validação de dados
 * - Transformação de respostas
 * 
 * @example
 * // Exemplo de uso da API documentada
 * http://localhost:3333/api/docs
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  // Cria a instância da aplicação NestJS
  const app = await NestFactory.create(AppModule);

  /**
   * Configuração do CORS para permitir requisições do frontend
   * 
   * @description
   * Em ambiente de desenvolvimento, aceita requisições de qualquer origem.
   * Em produção, isso deve ser restrito aos domínios permitidos.
   * 
   * Configurações:
   * - origin: true (permite todas as origens em dev)
   * - credentials: true (permite envio de cookies)
   * - methods: métodos HTTP permitidos
   * - headers: headers permitidos
   */
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Authorization'],
  });

  /**
   * Configuração da validação global usando class-validator
   * 
   * @description
   * Configura a validação automática de todas as requisições:
   * - transform: converte dados para os tipos corretos
   * - whitelist: remove propriedades não decoradas
   * - forbidNonWhitelisted: erro para props não permitidas
   */
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  /**
   * Configuração do Swagger/OpenAPI
   * 
   * @description
   * Configura a documentação interativa da API com:
   * - Título e descrição da API
   * - Detalhamento dos módulos
   * - Exemplos de uso
   * - Autenticação necessária
   * - Respostas esperadas
   */
  const config = new DocumentBuilder()
    .setTitle('Renix API')
    .setDescription(`
      API para análise de rendimentos bancários e gestão de investimentos.
      
      ## Módulos Principais

      ### Usuários
      - Registro e autenticação de usuários
      - Gestão de perfil e preferências
      - Histórico de operações

      ### Bancos
      - Consulta de informações bancárias
      - Taxas e rendimentos atualizados
      - Upload e gestão de logos

      ### Investimentos
      - Criação e gestão de investimentos
      - Cálculos de rendimentos
      - Comparativos entre bancos

      ### Dashboards
      - Visualização de dados
      - Geração de relatórios PDF
      - Análises comparativas

      ## Exemplos de Uso

      ### 1. Registro de Usuário
      \`\`\`json
      POST /api/usuarios/registro
      {
        "nome_usuario": "João Silva",
        "email_usuario": "joao@email.com",
        "senha_usuario": "Senha123!",
        "telefone_usuario": "(11) 98765-4321"
      }
      \`\`\`

      ### 2. Criação de Investimento
      \`\`\`json
      POST /api/investimentos
      {
        "usuario_id": "user123",
        "banco_id": "bank456",
        "valor_investimento": 1000.00,
        "data_inicio": "2024-03-14",
        "data_fim": "2025-03-14",
        "tipo_investimento": "RENDA_FIXA_CDB",
        "caracteristicas": {
          "tipo": "RENDA_FIXA_CDB",
          "rentabilidade_anual": 12.5,
          "indexador": "CDI",
          "percentual_indexador": 120,
          "risco": 2,
          "liquidez": 1,
          "garantia_fgc": true,
          "valor_minimo": 1000
        }
      }
      \`\`\`

      ### 3. Atualização de Usuário
      \`\`\`json
      PATCH /api/usuarios/{id}
      {
        "nome_usuario": "João Silva Atualizado",
        "email_usuario": "joao.novo@email.com"
      }
      \`\`\`
    `)
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Adiciona filtro global para tratamento de exceções
  app.useGlobalFilters(new HttpExceptionFilter());

  // Adiciona interceptor global para transformação de respostas
  app.useGlobalInterceptors(new TransformInterceptor());

  // Define o prefixo global /api para todas as rotas
  app.setGlobalPrefix('api');

  // Inicia o servidor na porta 3333
  await app.listen(3333);
}

bootstrap();

