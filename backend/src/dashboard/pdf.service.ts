import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');

interface DadosDashboard {
    nome_banco: string;
    tipo_investimento: string;
    valor_investido: number;
    valor_atual: number;
    data_inicio: Date;
    data_fim: Date;
    dias_corridos: number;
    rendimento: {
        valor_bruto: number;
        valor_liquido: number;
        valor_rendido: number;
        rentabilidade_periodo: number;
        rentabilidade_anualizada: number;
        imposto_renda: number;
        iof: number;
        outras_taxas: number;
    };
    indicadores_mercado: {
        selic: number;
        cdi: number;
        ipca: number;
    };
    alertas?: string[];
}

@Injectable()
export class PdfService {
    async gerarPdfDashboard(dadosDashboard: DadosDashboard): Promise<Buffer> {
        try {
            console.log('Debug - Iniciando criação do documento PDF');
            
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                bufferPages: true,
                autoFirstPage: true,
                info: {
                    Title: 'Análise de Investimentos - Renix',
                    Author: 'Renix Finance',
                },
            });

            const buffers: Buffer[] = [];
            doc.on('data', buffers.push.bind(buffers));

            // Define cores padrão com uma paleta em tons de verde
            const cores = {
                primaria: '#047857',      // Verde escuro principal
                secundaria: '#059669',     // Verde escuro secundário
                terciaria: '#10B981',      // Verde médio
                quaternaria: '#34D399',    // Verde claro
                background: '#F0FDF4',     // Verde claro suave
                backgroundAlt: '#DCFCE7',  // Verde claro médio
                texto: '#1F2937',          // Cinza escuro para texto
                textoClaro: '#6B7280'      // Cinza para texto secundário
            };

            // Dimensões da página
            const pageWidth = doc.page.width;
            const contentWidth = pageWidth - 100; // 50px de margem em cada lado
            const marginX = 50;

            // Posições verticais das seções
            const headerHeight = 120;
            const cardsStartY = headerHeight + 30;
            const composicaoStartY = cardsStartY + 100;
            const rendimentosStartY = composicaoStartY + 220;
            const alertasStartY = rendimentosStartY + 140;

            // Adicionar seções
            this.adicionarCabecalho(doc, cores, dadosDashboard, marginX, headerHeight);
            this.adicionarCardsPrincipais(doc, dadosDashboard, cores, marginX, cardsStartY, contentWidth);
            this.adicionarComposicaoEDetalhes(doc, dadosDashboard, cores, marginX, composicaoStartY, contentWidth);
            this.adicionarDetalhamentoRendimentos(doc, dadosDashboard, cores, marginX, rendimentosStartY, contentWidth);

            if (dadosDashboard.alertas && dadosDashboard.alertas.length > 0) {
                this.adicionarAlertas(doc, dadosDashboard.alertas, cores, marginX, alertasStartY, contentWidth);
            }

            this.adicionarRodape(doc, cores);

            doc.end();
            return new Promise((resolve) => {
                doc.on('end', () => {
                    const buffer = Buffer.concat(buffers);
                    console.log('Debug - PDF gerado com sucesso. Tamanho:', buffer.length);
                    resolve(buffer);
                });
            });
        } catch (error) {
            console.error('Debug - Erro ao gerar PDF:', error);
            throw new Error(`Erro ao gerar PDF: ${error.message}`);
        }
    }

    private adicionarCabecalho(doc: typeof PDFDocument, cores: any, dados: any, marginX: number, height: number) {
        // Faixa superior
        doc.rect(0, 0, doc.page.width, height)
           .fillColor(cores.background)
           .fill();

        // Logo e Título
        doc.fontSize(32)
           .fillColor(cores.primaria)
           .font('Helvetica-Bold')
           .text('RENIX', marginX, 35);

        doc.fontSize(20)
           .fillColor(cores.secundaria)
           .font('Helvetica')
           .text('Dashboard de Investimento', marginX, 75);

        // Informações do Investimento
        doc.fontSize(12)
           .fillColor(cores.textoClaro)
           .text(`${dados.nome_banco} • ${dados.tipo_investimento}`, marginX, 105);
    }

    private adicionarCardsPrincipais(doc: typeof PDFDocument, dados: any, cores: any, marginX: number, startY: number, contentWidth: number) {
        const boxWidth = (contentWidth - 60) / 4; // 20px de espaço entre os cards
        const boxHeight = 80;

        const cards = [
            {
                titulo: 'Valor Investido',
                valor: `R$ ${dados.valor_investido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                icone: '💰'
            },
            {
                titulo: 'Rendimento Anual',
                valor: `${dados.rendimento.rentabilidade_anualizada.toFixed(2)}%`,
                icone: '📈'
            },
            {
                titulo: 'Valor Rendido',
                valor: `R$ ${dados.rendimento.valor_rendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                icone: '💸'
            },
            {
                titulo: 'Valor Atual',
                valor: `R$ ${dados.valor_atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                icone: '📊'
            }
        ];

        cards.forEach((card, index) => {
            const x = marginX + (index * (boxWidth + 20));

            // Box com sombra
            doc.rect(x, startY, boxWidth, boxHeight)
               .fillColor('#FFFFFF')
               .fill()
               .strokeColor(cores.backgroundAlt)
               .lineWidth(1)
               .stroke();

            // Título
            doc.fontSize(10)
               .fillColor(cores.textoClaro)
               .text(card.titulo, x + 15, startY + 15);

            // Valor
            doc.fontSize(14)
               .fillColor(cores.texto)
               .font('Helvetica-Bold')
               .text(card.valor, x + 15, startY + 35, {
                   width: boxWidth - 50,
                   align: 'left'
               });

            // Ícone
            doc.fontSize(20)
               .text(card.icone, x + boxWidth - 35, startY + 15);
        });
    }

    private adicionarComposicaoEDetalhes(doc: typeof PDFDocument, dados: any, cores: any, marginX: number, startY: number, contentWidth: number) {
        const halfWidth = (contentWidth - 20) / 2; // 20px de espaço entre as seções
        const sectionHeight = 200;

        // Composição do Investimento (Lado Esquerdo)
        doc.rect(marginX, startY, halfWidth, sectionHeight)
           .fillColor('#FFFFFF')
           .fill()
           .strokeColor(cores.backgroundAlt)
           .lineWidth(1)
           .stroke();

        doc.fontSize(14)
           .fillColor(cores.texto)
           .font('Helvetica-Bold')
           .text('Composição do Investimento', marginX + 15, startY + 15);

        // Gráfico de barras
        const composicaoData = [
            { nome: 'Valor Investido', valor: dados.valor_investido },
            { nome: 'Rendimento Bruto', valor: dados.rendimento.valor_bruto },
            { nome: 'Impostos e Taxas', valor: dados.rendimento.imposto_renda + dados.rendimento.iof + dados.rendimento.outras_taxas },
            { nome: 'Valor Líquido', valor: dados.rendimento.valor_liquido }
        ];

        const barStartY = startY + 45;
        const barHeight = 25;
        const barWidth = halfWidth - 60;
        const total = composicaoData.reduce((sum, item) => sum + item.valor, 0);

        composicaoData.forEach((item, index) => {
            const y = barStartY + (index * (barHeight + 10));
            const percentual = (item.valor / total) * 100;
            const corIndex = index % 4;
            const cor = [cores.primaria, cores.secundaria, cores.terciaria, cores.quaternaria][corIndex];

            // Label
            doc.fontSize(10)
               .fillColor(cores.texto)
               .text(`${item.nome} (${percentual.toFixed(1)}%)`, marginX + 15, y - 15);

            // Barra
            doc.rect(marginX + 15, y, (percentual / 100) * barWidth, barHeight)
               .fillColor(cor)
               .fill();
        });

        // Detalhes do Investimento (Lado Direito)
        const detalhesX = marginX + halfWidth + 20;
        doc.rect(detalhesX, startY, halfWidth, sectionHeight)
           .fillColor('#FFFFFF')
           .fill()
           .strokeColor(cores.backgroundAlt)
           .lineWidth(1)
           .stroke();

        doc.fontSize(14)
           .fillColor(cores.texto)
           .font('Helvetica-Bold')
           .text('Detalhes do Investimento', detalhesX + 15, startY + 15);

        const detalhes = [
            { label: 'Data de Início', valor: new Date(dados.data_inicio).toLocaleDateString('pt-BR') },
            { label: 'Data de Vencimento', valor: new Date(dados.data_fim).toLocaleDateString('pt-BR') },
            { label: 'Dias Corridos', valor: `${dados.dias_corridos} dias` },
            { label: 'Taxa SELIC', valor: `${dados.indicadores_mercado.selic.toFixed(2)}%` },
            { label: 'Taxa CDI', valor: `${dados.indicadores_mercado.cdi.toFixed(2)}%` },
            { label: 'IPCA', valor: `${dados.indicadores_mercado.ipca.toFixed(2)}%` }
        ];

        detalhes.forEach((detalhe, index) => {
            const y = startY + 50 + (index * 25);
            
            // Label
            doc.fontSize(10)
               .fillColor(cores.textoClaro)
               .font('Helvetica')
               .text(detalhe.label, detalhesX + 15, y, { width: 120 });

            // Valor
            doc.fontSize(11)
               .fillColor(cores.texto)
               .font('Helvetica-Bold')
               .text(detalhe.valor, detalhesX + 140, y, { width: halfWidth - 160 });
        });
    }

    private adicionarDetalhamentoRendimentos(doc: typeof PDFDocument, dados: any, cores: any, marginX: number, startY: number, contentWidth: number) {
        const sectionHeight = 120;

        // Box principal
        doc.rect(marginX, startY, contentWidth, sectionHeight)
           .fillColor('#FFFFFF')
           .fill()
           .strokeColor(cores.backgroundAlt)
           .lineWidth(1)
           .stroke();

        // Título
        doc.fontSize(14)
           .fillColor(cores.texto)
           .font('Helvetica-Bold')
           .text('Detalhamento dos Rendimentos', marginX + 15, startY + 15);

        const rendimentos = [
            { label: 'Valor Bruto', valor: dados.rendimento.valor_bruto },
            { label: 'Imposto de Renda', valor: dados.rendimento.imposto_renda },
            { label: 'IOF', valor: dados.rendimento.iof },
            { label: 'Outras Taxas', valor: dados.rendimento.outras_taxas },
            { label: 'Valor Líquido', valor: dados.rendimento.valor_liquido }
        ];

        const colWidth = (contentWidth - 30) / 5;
        rendimentos.forEach((item, index) => {
            const x = marginX + 15 + (index * colWidth);
            
            // Label
            doc.fontSize(10)
               .fillColor(cores.textoClaro)
               .text(item.label, x, startY + 50, { width: colWidth - 10 });

            // Valor
            doc.fontSize(12)
               .fillColor(cores.texto)
               .font('Helvetica-Bold')
               .text(
                   `R$ ${item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                   x,
                   startY + 70,
                   { width: colWidth - 10 }
               );
        });
    }

    private adicionarAlertas(doc: typeof PDFDocument, alertas: string[], cores: any, marginX: number, startY: number, contentWidth: number) {
        const sectionHeight = Math.min(80, 30 + (alertas.length * 20));

        doc.rect(marginX, startY, contentWidth, sectionHeight)
           .fillColor(cores.background)
           .fill()
           .strokeColor(cores.backgroundAlt)
           .lineWidth(1)
           .stroke();

        doc.fontSize(14)
           .fillColor(cores.primaria)
           .font('Helvetica-Bold')
           .text('⚠️ Alertas', marginX + 15, startY + 15);

        alertas.forEach((alerta, index) => {
            doc.fontSize(10)
               .fillColor(cores.texto)
               .text(`• ${alerta}`, marginX + 15, startY + 40 + (index * 20), {
                   width: contentWidth - 30
               });
        });
    }

    private adicionarRodape(doc: typeof PDFDocument, cores: any) {
        const rodapeY = doc.page.height - 40;

        doc.rect(0, rodapeY, doc.page.width, 40)
           .fillColor(cores.background)
           .fill();

        doc.fontSize(9)
           .fillColor(cores.texto)
           .font('Helvetica')
           .text(
               `Gerado por Renix Finance em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
               0,
               rodapeY + 15,
               { align: 'center' }
           );
    }
} 