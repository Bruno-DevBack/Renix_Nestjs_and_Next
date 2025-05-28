import { Injectable } from '@nestjs/common';
import type * as PDFKit from 'pdfkit';
const PDFDocument = require('pdfkit');

@Injectable()
export class PdfService {
    async gerarPdfDashboard(dadosDashboard: any): Promise<Buffer> {
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4',
            bufferPages: true,
            info: {
                Title: 'Dashboard de Investimento - Renix',
                Author: 'Renix Finance',
            }
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));

        // Paleta de cores moderna e minimalista
        const cores = {
            primaria: '#047857',      // Verde escuro
            secundaria: '#059669',    // Verde médio
            terciaria: '#10B981',     // Verde claro
            quaternaria: '#34D399',   // Verde mais claro
            texto: '#1F2937',         // Cinza escuro
            textoClaro: '#6B7280',    // Cinza médio
            background: '#F0FDF4',    // Verde claríssimo
            backgroundAlt: '#DCFCE7'  // Verde muito claro
        };

        const marginX = doc.page.margins.left;
        const pageWidth = doc.page.width;
        const contentWidth = pageWidth - (marginX * 2);

        // Cabeçalho com fundo
        this.adicionarCabecalho(doc, cores, dadosDashboard);

        // Cards principais
        const cardsStartY = 150;
        this.adicionarCardsPrincipais(doc, dadosDashboard, cores, marginX, cardsStartY, contentWidth);

        // Composição do investimento
        const composicaoStartY = cardsStartY + 130;
        this.adicionarComposicaoInvestimento(doc, dadosDashboard, cores, marginX, composicaoStartY, contentWidth);

        // Detalhes e indicadores
        const detalhesStartY = composicaoStartY + 220;
        this.adicionarDetalhesIndicadores(doc, dadosDashboard, cores, marginX, detalhesStartY, contentWidth);

        // Rodapé
        this.adicionarRodape(doc, cores);

        doc.end();

        return new Promise((resolve) => {
            doc.on('end', () => {
                const buffer = Buffer.concat(buffers);
                resolve(buffer);
            });
        });
    }

    private adicionarCabecalho(doc: PDFKit.PDFDocument, cores: any, dados: any) {
        // Fundo do cabeçalho
        doc.rect(0, 0, doc.page.width, 100)
            .fill(cores.background);

        // Logo e título
        doc.fontSize(24)
            .fillColor(cores.primaria)
            .font('Helvetica-Bold')
            .text('RENIX', 50, 40);

        doc.fontSize(14)
            .fillColor(cores.textoClaro)
            .font('Helvetica')
            .text('Dashboard de Investimento', 50, 70);
    }

    private adicionarCardsPrincipais(doc: PDFKit.PDFDocument, dados: any, cores: any, marginX: number, startY: number, contentWidth: number) {
        const cards = [
            {
                titulo: 'Valor Investido',
                valor: `R$ ${dados.valor_investido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                cor: cores.primaria
            },
            {
                titulo: 'Rendimento Anual',
                valor: `${dados.rendimento.rentabilidade_anualizada.toFixed(2)}%`,
                cor: cores.secundaria
            },
            {
                titulo: 'Valor Rendido',
                valor: `R$ ${dados.rendimento.valor_rendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                cor: cores.terciaria
            },
            {
                titulo: 'Valor Atual',
                valor: `R$ ${dados.valor_atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                cor: cores.quaternaria
            }
        ];

        const cardWidth = (contentWidth - 30) / 4;
        const cardHeight = 100;

        cards.forEach((card, index) => {
            const x = marginX + (index * (cardWidth + 10));

            // Fundo do card com borda suave
            doc.roundedRect(x, startY, cardWidth, cardHeight, 5)
                .fillColor('#FFFFFF')
                .fill()
                .strokeColor(cores.backgroundAlt)
                .lineWidth(1)
                .stroke();

            // Título do card
            doc.fontSize(10)
                .fillColor(cores.textoClaro)
                .font('Helvetica')
                .text(card.titulo, x + 15, startY + 20);

            // Valor do card
            doc.fontSize(16)
                .fillColor(card.cor)
                .font('Helvetica-Bold')
                .text(card.valor, x + 15, startY + 45);
        });
    }

    private adicionarComposicaoInvestimento(doc: PDFKit.PDFDocument, dados: any, cores: any, marginX: number, startY: number, contentWidth: number) {
        // Título da seção
        doc.fontSize(16)
            .fillColor(cores.texto)
            .font('Helvetica-Bold')
            .text('Composição do Investimento', marginX, startY);

        const composicaoData = [
            { nome: 'Valor Investido', valor: dados.valor_investido },
            { nome: 'Rendimento Bruto', valor: dados.rendimento.valor_bruto },
            { nome: 'Impostos e Taxas', valor: dados.rendimento.imposto_renda + dados.rendimento.iof + dados.rendimento.outras_taxas },
            { nome: 'Valor Líquido', valor: dados.rendimento.valor_liquido }
        ];

        const total = composicaoData.reduce((sum, item) => sum + item.valor, 0);
        const barHeight = 30;
        const barSpacing = 50;
        const barStartY = startY + 40;

        composicaoData.forEach((item, index) => {
            const y = barStartY + (index * barSpacing);
            const percentual = (item.valor / total) * 100;
            const barWidth = (contentWidth - 100) * (percentual / 100);
            const cor = [cores.primaria, cores.secundaria, cores.terciaria, cores.quaternaria][index];

            // Rótulo
            doc.fontSize(10)
                .fillColor(cores.textoClaro)
                .font('Helvetica')
                .text(item.nome, marginX, y - 15);

            // Valor e percentual
            doc.fontSize(10)
                .fillColor(cores.texto)
                .font('Helvetica-Bold')
                .text(`R$ ${item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${percentual.toFixed(1)}%)`,
                    marginX + contentWidth - 150, y - 15);

            // Barra de progresso
            doc.roundedRect(marginX, y, barWidth, barHeight, 3)
                .fill(cor);
        });
    }

    private adicionarDetalhesIndicadores(doc: PDFKit.PDFDocument, dados: any, cores: any, marginX: number, startY: number, contentWidth: number) {
        // Título da seção
        doc.fontSize(16)
            .fillColor(cores.texto)
            .font('Helvetica-Bold')
            .text('Detalhes e Indicadores', marginX, startY);

        const detalhes = [
            { label: 'Data de Início', valor: new Date(dados.data_inicio).toLocaleDateString('pt-BR') },
            { label: 'Data de Vencimento', valor: new Date(dados.data_fim).toLocaleDateString('pt-BR') },
            { label: 'Dias Corridos', valor: `${dados.dias_corridos} dias` },
            { label: 'Taxa SELIC', valor: `${dados.indicadores_mercado.selic.toFixed(2)}%` },
            { label: 'Taxa CDI', valor: `${dados.indicadores_mercado.cdi.toFixed(2)}%` },
            { label: 'IPCA', valor: `${dados.indicadores_mercado.ipca.toFixed(2)}%` }
        ];

        const colWidth = (contentWidth - 20) / 2;
        let currentX = marginX;
        let currentY = startY + 40;

        detalhes.forEach((detalhe, index) => {
            if (index === 3) {
                currentX = marginX + colWidth + 20;
                currentY = startY + 40;
            }

            // Container do detalhe com fundo suave
            doc.roundedRect(currentX, currentY, colWidth, 40, 3)
                .fillColor(cores.background)
                .fill();

            // Label
            doc.fontSize(10)
                .fillColor(cores.textoClaro)
                .font('Helvetica')
                .text(detalhe.label, currentX + 15, currentY + 10);

            // Valor
            doc.fontSize(12)
                .fillColor(cores.texto)
                .font('Helvetica-Bold')
                .text(detalhe.valor, currentX + 15, currentY + 25);

            currentY += 50;
        });
    }

    private adicionarRodape(doc: PDFKit.PDFDocument, cores: any) {
        const rodapeY = doc.page.height - 50;

        // Linha separadora
        doc.moveTo(50, rodapeY)
            .lineTo(doc.page.width - 50, rodapeY)
            .strokeColor(cores.backgroundAlt)
            .lineWidth(1)
            .stroke();

        // Texto do rodapé
        doc.fontSize(8)
            .fillColor(cores.textoClaro)
            .font('Helvetica')
            .text(
                `Gerado por Renix Finance em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
                0,
                rodapeY + 15,
                { align: 'center' }
            );
    }
}
