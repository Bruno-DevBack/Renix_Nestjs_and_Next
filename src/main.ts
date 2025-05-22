import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Configuração de validação global
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Configuração do Swagger
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

      ### 4. Adição de Investimento ao Histórico
      \`\`\`json
      POST /api/usuarios/{id}/investimentos/historico
      {
        "tipo": "Renda Fixa",
        "valor": 1000.00,
        "banco": "Banco XYZ",
        "rendimento": 5.5
      }
      \`\`\`

      ### 5. Geração de Dashboard PDF
      \`\`\`
      GET /api/dashboard/{id}/pdf
      \`\`\`

      ### 6. Atualização de Bancos
      \`\`\`
      POST /api/banco-agent/atualizar
      \`\`\`
    `)
    .setVersion('1.0')
    .addTag('Usuários', 'Operações relacionadas a usuários')
    .addTag('Bancos', 'Operações relacionadas a bancos')
    .addTag('Investimentos', 'Operações relacionadas a investimentos')
    .addTag('Dashboard', 'Operações relacionadas a dashboards')
    .addTag('Banco Agent', 'Operações de atualização automática de bancos')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Prefixo global para todas as rotas
  app.setGlobalPrefix('api');

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Forçando a porta 3333
  const port = 3333;
  await app.listen(port);
  console.log(`Aplicação rodando na porta ${port}`);
}
bootstrap();

