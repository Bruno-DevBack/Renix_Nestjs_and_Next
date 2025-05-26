import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banco, BancoDocument } from '../bancos/schemas/banco.schema';
import { TipoInvestimento } from '../investimentos/schemas/investimento.schema';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface NewsArticle {
    title: string;
    description: string;
}

@Injectable()
export class BancoAgentService {
    private readonly logger = new Logger(BancoAgentService.name);

    // Configuração completa dos bancos e seus investimentos
    private readonly bancosConfig = {
        'Nubank': {
            url: 'https://nubank.com.br',
            caracteristicas: {
                rendimentoBase: 100,
                taxaAdministracao: 0,
                investimentoMinimo: 1,
                liquidezDiaria: true
            },
            investimentos_disponiveis: [
                {
                    tipo: TipoInvestimento.RENDA_FIXA_CDB,
                    caracteristicas: {
                        rentabilidade_anual: 120,
                        indexador: 'CDI',
                        percentual_indexador: 120,
                        risco: 2,
                        liquidez: 1,
                        garantia_fgc: true,
                        valor_minimo: 100
                    }
                },
                {
                    tipo: TipoInvestimento.TESOURO_SELIC,
                    caracteristicas: {
                        indexador: 'SELIC',
                        percentual_indexador: 100,
                        risco: 1,
                        liquidez: 2,
                        garantia_fgc: false,
                        valor_minimo: 30
                    }
                }
            ]
        },
        'BTG Pactual digital': {
            url: 'https://www.btgpactualdigital.com',
            caracteristicas: {
                rendimentoBase: 100,
                taxaAdministracao: 0,
                investimentoMinimo: 500,
                liquidezDiaria: true
            },
            investimentos_disponiveis: [
                {
                    tipo: TipoInvestimento.RENDA_FIXA_CDB,
                    caracteristicas: {
                        rentabilidade_anual: 115,
                        indexador: 'CDI',
                        percentual_indexador: 115,
                        risco: 2,
                        liquidez: 1,
                        garantia_fgc: true,
                        valor_minimo: 1000
                    }
                },
                {
                    tipo: TipoInvestimento.TESOURO_IPCA,
                    caracteristicas: {
                        indexador: 'IPCA',
                        rentabilidade_anual: 5.5,
                        risco: 2,
                        liquidez: 3,
                        garantia_fgc: false,
                        valor_minimo: 50
                    }
                },
                {
                    tipo: TipoInvestimento.FUNDOS_RENDA_FIXA,
                    caracteristicas: {
                        rentabilidade_anual: 110,
                        indexador: 'CDI',
                        percentual_indexador: 110,
                        risco: 2,
                        liquidez: 2,
                        garantia_fgc: false,
                        valor_minimo: 500,
                        taxa_administracao: 0.5
                    }
                }
            ]
        },
        'XP Inc': {
            url: 'https://www.xpi.com.br',
            caracteristicas: {
                rendimentoBase: 100,
                taxaAdministracao: 0,
                investimentoMinimo: 1000,
                liquidezDiaria: true
            },
            investimentos_disponiveis: [
                {
                    tipo: TipoInvestimento.RENDA_FIXA_LCI,
                    caracteristicas: {
                        rentabilidade_anual: 98,
                        indexador: 'CDI',
                        percentual_indexador: 98,
                        risco: 2,
                        liquidez: 3,
                        garantia_fgc: true,
                        valor_minimo: 5000
                    }
                },
                {
                    tipo: TipoInvestimento.FUNDOS_IMOBILIARIOS,
                    caracteristicas: {
                        risco: 4,
                        liquidez: 2,
                        garantia_fgc: false,
                        valor_minimo: 100,
                        taxa_administracao: 1.5,
                        taxa_performance: 20
                    }
                }
            ]
        },
        'Itaú': {
            url: 'https://www.itau.com.br',
            caracteristicas: {
                rendimentoBase: 100,
                taxaAdministracao: 0.2,
                investimentoMinimo: 1000,
                liquidezDiaria: true
            },
            investimentos_disponiveis: [
                {
                    tipo: TipoInvestimento.RENDA_FIXA_CDB,
                    caracteristicas: {
                        rentabilidade_anual: 112,
                        indexador: 'CDI',
                        percentual_indexador: 112,
                        risco: 2,
                        liquidez: 1,
                        garantia_fgc: true,
                        valor_minimo: 1000
                    }
                },
                {
                    tipo: TipoInvestimento.FUNDOS_RENDA_FIXA,
                    caracteristicas: {
                        rentabilidade_anual: 108,
                        indexador: 'CDI',
                        percentual_indexador: 108,
                        risco: 2,
                        liquidez: 2,
                        garantia_fgc: false,
                        valor_minimo: 1000,
                        taxa_administracao: 1.0
                    }
                },
                {
                    tipo: TipoInvestimento.ACOES,
                    caracteristicas: {
                        risco: 4,
                        liquidez: 1,
                        garantia_fgc: false,
                        valor_minimo: 100,
                        taxa_corretagem: 0.5
                    }
                }
            ]
        },
        'Bradesco': {
            url: 'https://www.bradesco.com.br',
            caracteristicas: {
                rendimentoBase: 100,
                taxaAdministracao: 0.25,
                investimentoMinimo: 500,
                liquidezDiaria: true
            },
            investimentos_disponiveis: [
                {
                    tipo: TipoInvestimento.RENDA_FIXA_CDB,
                    caracteristicas: {
                        rentabilidade_anual: 110,
                        indexador: 'CDI',
                        percentual_indexador: 110,
                        risco: 2,
                        liquidez: 1,
                        garantia_fgc: true,
                        valor_minimo: 500
                    }
                },
                {
                    tipo: TipoInvestimento.RENDA_FIXA_LCA,
                    caracteristicas: {
                        rentabilidade_anual: 95,
                        indexador: 'CDI',
                        percentual_indexador: 95,
                        risco: 2,
                        liquidez: 3,
                        garantia_fgc: true,
                        valor_minimo: 10000
                    }
                },
                {
                    tipo: TipoInvestimento.FUNDOS_MULTIMERCADO,
                    caracteristicas: {
                        rentabilidade_anual: 115,
                        indexador: 'CDI',
                        percentual_indexador: 115,
                        risco: 3,
                        liquidez: 2,
                        garantia_fgc: false,
                        valor_minimo: 1000,
                        taxa_administracao: 1.8,
                        taxa_performance: 20
                    }
                }
            ]
        },
        'Banco do Brasil': {
            url: 'https://www.bb.com.br',
            caracteristicas: {
                rendimentoBase: 100,
                taxaAdministracao: 0.3,
                investimentoMinimo: 200,
                liquidezDiaria: true
            },
            investimentos_disponiveis: [
                {
                    tipo: TipoInvestimento.RENDA_FIXA_CDB,
                    caracteristicas: {
                        rentabilidade_anual: 108,
                        indexador: 'CDI',
                        percentual_indexador: 108,
                        risco: 2,
                        liquidez: 1,
                        garantia_fgc: true,
                        valor_minimo: 200
                    }
                },
                {
                    tipo: TipoInvestimento.TESOURO_PREFIXADO,
                    caracteristicas: {
                        rentabilidade_anual: 11.5,
                        risco: 1,
                        liquidez: 2,
                        garantia_fgc: false,
                        valor_minimo: 30
                    }
                },
                {
                    tipo: TipoInvestimento.FUNDOS_RENDA_FIXA,
                    caracteristicas: {
                        rentabilidade_anual: 105,
                        indexador: 'CDI',
                        percentual_indexador: 105,
                        risco: 2,
                        liquidez: 2,
                        garantia_fgc: false,
                        valor_minimo: 500,
                        taxa_administracao: 1.2
                    }
                }
            ]
        },
        'Santander': {
            url: 'https://www.santander.com.br',
            caracteristicas: {
                rendimentoBase: 100,
                taxaAdministracao: 0.35,
                investimentoMinimo: 1000,
                liquidezDiaria: true
            },
            investimentos_disponiveis: [
                {
                    tipo: TipoInvestimento.RENDA_FIXA_CDB,
                    caracteristicas: {
                        rentabilidade_anual: 111,
                        indexador: 'CDI',
                        percentual_indexador: 111,
                        risco: 2,
                        liquidez: 1,
                        garantia_fgc: true,
                        valor_minimo: 1000
                    }
                },
                {
                    tipo: TipoInvestimento.FUNDOS_MULTIMERCADO,
                    caracteristicas: {
                        rentabilidade_anual: 112,
                        indexador: 'CDI',
                        percentual_indexador: 112,
                        risco: 3,
                        liquidez: 2,
                        garantia_fgc: false,
                        valor_minimo: 1000,
                        taxa_administracao: 2.0,
                        taxa_performance: 20
                    }
                },
                {
                    tipo: TipoInvestimento.ACOES,
                    caracteristicas: {
                        risco: 4,
                        liquidez: 1,
                        garantia_fgc: false,
                        valor_minimo: 100,
                        taxa_corretagem: 0.75
                    }
                }
            ]
        }
    };

    constructor(
        @InjectModel(Banco.name) private bancoModel: Model<BancoDocument>
    ) {
        // Inicializar bancos ao iniciar o serviço
        this.inicializarBancos();
    }

    private async inicializarBancos() {
        try {
            for (const [nomeBanco, config] of Object.entries(this.bancosConfig)) {
                // Verificar se o banco já existe
                const bancoExistente = await this.bancoModel.findOne({ nome_banco: nomeBanco });

                if (!bancoExistente) {
                    // Buscar taxa CDI atual
                    const cdiAtual = await this.buscarTaxaCDI();

                    // Criar novo banco com configurações padrão
                    const novoBanco = new this.bancoModel({
                        nome_banco: nomeBanco,
                        IOF_diario: 0.0033,
                        cdi: cdiAtual,
                        IR_ate_180_dias: 22.5,
                        IR_ate_360_dias: 20,
                        IR_ate_720_dias: 17.5,
                        IR_acima_720_dias: 15,
                        caracteristicas: config.caracteristicas,
                        investimentos_disponiveis: config.investimentos_disponiveis
                    });

                    await novoBanco.save();
                    this.logger.log(`Banco ${nomeBanco} inicializado com sucesso`);
                }
            }
        } catch (error) {
            this.logger.error('Erro ao inicializar bancos:', error);
        }
    }

    @Cron(CronExpression.EVERY_WEEK)
    async atualizarInformacoesBancos() {
        this.logger.log('Iniciando atualização semanal das informações dos bancos');

        try {
            const cdiAtual = await this.buscarTaxaCDI();
            const iofInfo = await this.buscarInformacoesIOF();
            const irInfo = await this.buscarInformacoesIR();
            const bancos = await this.bancoModel.find().exec();

            for (const banco of bancos) {
                try {
                    this.logger.log(`Iniciando atualização do banco: ${banco.nome_banco}`);

                    const dadosBanco = await this.buscarDadosEspecificosBanco(banco.nome_banco);
                    const sentimentoMercado = await this.analisarNoticiasRecentes(banco.nome_banco);
                    const fatorVariacao = this.calcularFatorVariacao(banco.nome_banco, dadosBanco, sentimentoMercado);

                    // Atualizar taxas e rendimentos dos investimentos disponíveis
                    this.atualizarInvestimentosDisponiveis(banco, cdiAtual, sentimentoMercado);

                    banco.cdi = cdiAtual * fatorVariacao;
                    banco.IOF_diario = iofInfo.taxaDiaria;
                    banco.IR_ate_180_dias = irInfo.ate180;
                    banco.IR_ate_360_dias = irInfo.ate360;
                    banco.IR_ate_720_dias = irInfo.ate720;
                    banco.IR_acima_720_dias = irInfo.acima720;

                    banco.ultima_atualizacao = new Date();
                    banco.historico_atualizacoes = banco.historico_atualizacoes || [];
                    banco.historico_atualizacoes.push({
                        data: new Date(),
                        cdi: banco.cdi,
                        fator_variacao: fatorVariacao,
                        sentimento_mercado: sentimentoMercado
                    });

                    await banco.save();
                    this.logger.log(`Banco ${banco.nome_banco} atualizado com sucesso`);
                } catch (error) {
                    this.logger.error(`Erro ao atualizar ${banco.nome_banco}:`, error);
                    continue;
                }
            }

            this.logger.log('Atualização semanal concluída com sucesso');
        } catch (error) {
            this.logger.error('Erro na atualização semanal:', error);
        }
    }

    private atualizarInvestimentosDisponiveis(banco: BancoDocument, cdiAtual: number, sentimentoMercado: number) {
        if (!banco.investimentos_disponiveis) return;

        for (const investimento of banco.investimentos_disponiveis) {
            switch (investimento.tipo) {
                case TipoInvestimento.RENDA_FIXA_CDB:
                case TipoInvestimento.RENDA_FIXA_LCI:
                case TipoInvestimento.RENDA_FIXA_LCA:
                    // Ajustar rentabilidade baseado no CDI e sentimento do mercado
                    investimento.caracteristicas.rentabilidade_anual =
                        this.ajustarRentabilidadeRendaFixa(investimento.caracteristicas.percentual_indexador ?? 100, sentimentoMercado);
                    break;

                case TipoInvestimento.FUNDOS_IMOBILIARIOS:
                case TipoInvestimento.ACOES:
                    // Ajustar risco e rentabilidade baseado no sentimento do mercado
                    this.ajustarInvestimentoVariavel(investimento, sentimentoMercado);
                    break;
            }
        }
    }

    private ajustarRentabilidadeRendaFixa(percentualBase: number, sentimentoMercado: number): number {
        // Ajusta o percentual do CDI baseado no sentimento do mercado
        const ajuste = sentimentoMercado * 5; // Máximo de 5% de variação
        return Math.max(90, Math.min(130, percentualBase + ajuste));
    }

    private ajustarInvestimentoVariavel(investimento: any, sentimentoMercado: number) {
        // Ajusta risco e potencial retorno baseado no sentimento do mercado
        investimento.caracteristicas.risco = Math.max(1, Math.min(5,
            investimento.caracteristicas.risco + (sentimentoMercado < 0 ? 1 : -1)
        ));
    }

    private async buscarDadosEspecificosBanco(nomeBanco: string): Promise<any> {
        try {
            const fonte = this.bancosConfig[nomeBanco];
            if (!fonte) {
                return null; // Banco não configurado
            }

            const response = await axios.get(fonte.url);
            const $ = cheerio.load(response.data);

            // Extrair dados específicos do banco usando o seletor configurado
            const dados = $(fonte.seletor).text();

            // Aqui você implementaria a lógica de parsing específica para cada banco
            return this.processarDadosBanco(nomeBanco, dados);
        } catch (error) {
            this.logger.error(`Erro ao buscar dados específicos do ${nomeBanco}:`, error);
            return null;
        }
    }

    private processarDadosBanco(nomeBanco: string, dados: string): any {
        // Implementar lógica específica de processamento para cada banco
        switch (nomeBanco) {
            case 'Banco do Brasil':
                // Lógica específica para BB
                return this.processarDadosBB(dados);
            case 'Itaú':
                // Lógica específica para Itaú
                return this.processarDadosItau(dados);
            default:
                return null;
        }
    }

    private processarDadosBB(dados: string): any {
        // Implementar processamento específico para BB
        return {};
    }

    private processarDadosItau(dados: string): any {
        // Implementar processamento específico para Itaú
        return {};
    }

    private async buscarTaxaCDI(): Promise<number> {
        try {
            const response = await axios.get('https://api.bcb.gov.br/dados/serie/bcdata.sgs.4389/dados/ultimos/1');
            return response.data[0].valor;
        } catch (error) {
            this.logger.error('Erro ao buscar taxa CDI:', error);
            throw error;
        }
    }

    private async buscarInformacoesIOF(): Promise<{ taxaDiaria: number }> {
        try {
            // Tentar buscar de fonte oficial
            const response = await axios.get('https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/tributos/iof');
            // Implementar parsing da página
            return {
                taxaDiaria: 0.0033
            };
        } catch (error) {
            this.logger.warn('Erro ao buscar IOF da fonte oficial, usando valor padrão:', error);
            return {
                taxaDiaria: 0.0033
            };
        }
    }

    private async buscarInformacoesIR(): Promise<{
        ate180: number;
        ate360: number;
        ate720: number;
        acima720: number;
    }> {
        try {
            // Tentar buscar de fonte oficial
            const response = await axios.get('https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/tributos/irpf');
            // Implementar parsing da página
            return {
                ate180: 22.5,
                ate360: 20,
                ate720: 17.5,
                acima720: 15
            };
        } catch (error) {
            this.logger.warn('Erro ao buscar IR da fonte oficial, usando valores padrão:', error);
            return {
                ate180: 22.5,
                ate360: 20,
                ate720: 17.5,
                acima720: 15
            };
        }
    }

    private calcularFatorVariacao(
        nomeBanco: string,
        dadosBanco: any,
        sentimentoMercado: number
    ): number {
        // Base inicial
        let fatorBase = 1.0;

        // Ajuste baseado no sentimento do mercado (-1 a 1)
        fatorBase += sentimentoMercado * 0.05; // Máximo de 5% de variação

        // Ajuste baseado nos dados específicos do banco
        if (dadosBanco) {
            // Implementar lógica específica de ajuste
            // Por exemplo, baseado em indicadores de performance do banco
        }

        // Garantir que o fator está dentro de limites razoáveis
        return Math.max(0.9, Math.min(1.1, fatorBase));
    }

    private async analisarNoticiasRecentes(nomeBanco: string): Promise<number> {
        try {
            const noticias = await this.buscarNoticias(nomeBanco);
            let sentimentoTotal = 0;

            for (const noticia of noticias) {
                try {
                    // Aqui você pode usar uma API de análise de sentimento
                    // Por exemplo: Google Cloud Natural Language API
                    const sentimento = await this.analisarSentimento(noticia);
                    sentimentoTotal += sentimento;
                } catch (error) {
                    this.logger.error(`Erro ao analisar sentimento da notícia para ${nomeBanco}:`, error);
                }
            }

            return noticias.length > 0 ? sentimentoTotal / noticias.length : 0;
        } catch (error) {
            this.logger.error(`Erro na análise de notícias para ${nomeBanco}:`, error);
            return 0;
        }
    }

    private async buscarNoticias(nomeBanco: string): Promise<string[]> {
        try {
            // Em desenvolvimento, retornar notícias simuladas
            const noticiasFake = [
                `${nomeBanco} reporta crescimento no último trimestre`,
                `${nomeBanco} anuncia novos investimentos em tecnologia`,
                `${nomeBanco} mantém posição forte no mercado financeiro`,
                `Analistas recomendam investimentos no ${nomeBanco}`,
                `${nomeBanco} expande operações digitais`
            ];

            return noticiasFake;

            // Código original comentado - descomentar quando tiver API key
            /*
            const response = await axios.get(
                `https://newsapi.org/v2/everything?q=${encodeURIComponent(nomeBanco)}&language=pt&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}`
            );
            return response.data.articles.map((article: NewsArticle) => article.title + ' ' + article.description);
            */
        } catch (error) {
            this.logger.error(`Erro ao buscar notícias para ${nomeBanco}:`, error);
            return [];
        }
    }

    private async analisarSentimento(texto: string): Promise<number> {
        // Em desenvolvimento, gerar um sentimento aleatório
        // -1 (muito negativo) até 1 (muito positivo)
        return Math.random() * 2 - 1;
    }

    private async buscarLogoNaWeb(nomeBanco: string): Promise<string> {
        try {
            // Usando Clearbit Logo API (gratuito)
            const domain = this.bancosConfig[nomeBanco]?.url;
            if (!domain) {
                throw new Error('URL do banco não configurada');
            }

            const domainWithoutProtocol = domain.replace(/^https?:\/\//, '');
            const logoUrl = `https://logo.clearbit.com/${domainWithoutProtocol}`;

            const imageResponse = await axios.get(logoUrl, {
                responseType: 'arraybuffer',
                validateStatus: (status) => status === 200
            });

            // Converter para base64
            const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
            return `data:image/png;base64,${base64Image}`;
        } catch (error) {
            // Se falhar com Clearbit, tentar URL padrão do banco
            try {
                const domain = this.bancosConfig[nomeBanco]?.url;
                if (!domain) {
                    throw new Error('URL do banco não configurada');
                }

                const faviconUrl = `${domain}/favicon.ico`;
                const imageResponse = await axios.get(faviconUrl, {
                    responseType: 'arraybuffer',
                    validateStatus: (status) => status === 200
                });

                // Converter para base64
                const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
                return `data:image/x-icon;base64,${base64Image}`;
            } catch (secondError) {
                console.error(`Erro ao buscar logo para ${nomeBanco}:`, error);
                throw error;
            }
        }
    }

    private async salvarLogoBanco(banco: BancoDocument): Promise<void> {
        try {
            const base64Image = await this.buscarLogoNaWeb(banco.nome_banco);
            banco.logoBase64 = base64Image;
            await banco.save();
        } catch (error) {
            console.error(`Erro ao salvar logo para ${banco.nome_banco}:`, error);
        }
    }

    async atualizarInformacoesBanco(banco: BancoDocument): Promise<void> {
        try {
            // Se o banco não tem logo, buscar e salvar
            if (!banco.logoBase64) {
                await this.salvarLogoBanco(banco);
            }

            // ... resto do código de atualização ...
        } catch (error) {
            console.error('Erro ao atualizar informações do banco:', error);
            throw error;
        }
    }

    // Método público para forçar atualização imediata
    async atualizarTodosBancosAgora(): Promise<void> {
        this.logger.log('Iniciando atualização manual de todos os bancos');

        try {
            const cdiAtual = await this.buscarTaxaCDI();
            const iofInfo = await this.buscarInformacoesIOF();
            const irInfo = await this.buscarInformacoesIR();
            const bancos = await this.bancoModel.find().exec();

            for (const banco of bancos) {
                try {
                    this.logger.log(`Atualizando banco: ${banco.nome_banco}`);

                    // Atualizar logo se não existir
                    if (!banco.logoBase64) {
                        await this.salvarLogoBanco(banco);
                    }

                    const dadosBanco = await this.buscarDadosEspecificosBanco(banco.nome_banco);
                    const sentimentoMercado = await this.analisarNoticiasRecentes(banco.nome_banco);
                    const fatorVariacao = this.calcularFatorVariacao(banco.nome_banco, dadosBanco, sentimentoMercado);

                    // Atualizar taxas e rendimentos dos investimentos disponíveis
                    this.atualizarInvestimentosDisponiveis(banco, cdiAtual, sentimentoMercado);

                    banco.cdi = cdiAtual * fatorVariacao;
                    banco.IOF_diario = iofInfo.taxaDiaria;
                    banco.IR_ate_180_dias = irInfo.ate180;
                    banco.IR_ate_360_dias = irInfo.ate360;
                    banco.IR_ate_720_dias = irInfo.ate720;
                    banco.IR_acima_720_dias = irInfo.acima720;

                    banco.ultima_atualizacao = new Date();
                    banco.historico_atualizacoes = banco.historico_atualizacoes || [];
                    banco.historico_atualizacoes.push({
                        data: new Date(),
                        cdi: banco.cdi,
                        fator_variacao: fatorVariacao,
                        sentimento_mercado: sentimentoMercado
                    });

                    await banco.save();
                    this.logger.log(`Banco ${banco.nome_banco} atualizado com sucesso`);
                } catch (error) {
                    this.logger.error(`Erro ao atualizar ${banco.nome_banco}:`, error);
                    continue;
                }
            }

            this.logger.log('Atualização manual concluída com sucesso');
        } catch (error) {
            this.logger.error('Erro na atualização manual:', error);
            throw error;
        }
    }
} 