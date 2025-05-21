import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Chart, ChartConfiguration, registerables } from 'chart.js/auto';
import { createCanvas, Canvas } from 'canvas';
import { Readable } from 'stream';

// Registrar os elementos necessários do Chart.js
Chart.register(...registerables);

@Injectable()
export class PdfService {
    async gerarPdfDashboard(dadosDashboard: any): Promise<Buffer> {
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            info: {
                Title: 'Análise de Investimentos - Renix',
                Author: 'Renix Finance',
            },
        });

        // Buffer para armazenar o PDF
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));

        // Cabeçalho
        this.adicionarCabecalho(doc);

        // Resumo dos Dados
        this.adicionarResumoDados(doc, dadosDashboard);

        // Gráficos
        await this.adicionarGraficos(doc, dadosDashboard);

        // Tabela Comparativa
        this.adicionarTabelaComparativa(doc, dadosDashboard);

        // Rodapé
        this.adicionarRodape(doc);

        // Finalizar o documento
        doc.end();

        return new Promise((resolve) => {
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });
        });
    }

    private adicionarCabecalho(doc: PDFKit.PDFDocument) {
        doc
            .fontSize(24)
            .fillColor('#1a237e')
            .font('Helvetica-Bold')
            .text('Análise de Investimentos', { align: 'center' })
            .moveDown(0.5);

        doc
            .fontSize(14)
            .fillColor('#424242')
            .text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' })
            .moveDown(2);
    }

    private adicionarResumoDados(doc: PDFKit.PDFDocument, dados: any) {
        // Caixa de resumo
        doc
            .rect(50, doc.y, 495, 100)
            .fillColor('#f5f5f5')
            .fill();

        doc.y += 20;

        // Dados principais
        const colunas = [
            { label: 'Total Investido', valor: `R$ ${dados.totalInvestido.toFixed(2)}` },
            { label: 'Rendimento Médio', valor: `${dados.rendimentoMedio}%` },
            { label: 'Risco Médio', valor: dados.riscoMedio },
        ];

        let x = 70;
        colunas.forEach(coluna => {
            doc
                .fontSize(12)
                .fillColor('#616161')
                .text(coluna.label, x, doc.y)
                .fontSize(16)
                .fillColor('#1a237e')
                .text(coluna.valor, x, doc.y + 20);
            x += 165;
        });

        doc.moveDown(4);
    }

    private async adicionarGraficos(doc: PDFKit.PDFDocument, dados: any) {
        // Criar canvas para o gráfico de distribuição
        const canvas = createCanvas(500, 300);
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Gráfico de distribuição de investimentos
        const config: ChartConfiguration = {
            type: 'doughnut',
            data: {
                labels: dados.distribuicao.map((d: any) => d.tipo),
                datasets: [{
                    data: dados.distribuicao.map((d: any) => d.valor),
                    backgroundColor: [
                        '#1a237e', '#0d47a1', '#1565c0',
                        '#1976d2', '#1e88e5', '#2196f3'
                    ]
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribuição dos Investimentos'
                    }
                }
            }
        };

        new Chart(ctx as unknown as HTMLCanvasElement, config);

        // Adicionar gráfico ao PDF
        doc.image(canvas.toBuffer('image/png'), {
            fit: [400, 300],
            align: 'center'
        });

        doc.moveDown(2);

        // Gráfico de rendimentos
        const canvasRendimentos = createCanvas(500, 300);
        const ctxRendimentos = canvasRendimentos.getContext('2d');

        if (!ctxRendimentos) return;

        const configRendimentos: ChartConfiguration = {
            type: 'bar',
            data: {
                labels: dados.rendimentos.map((r: any) => r.banco),
                datasets: [{
                    label: 'Rendimento (%)',
                    data: dados.rendimentos.map((r: any) => r.valor),
                    backgroundColor: '#1976d2'
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparativo de Rendimentos'
                    }
                }
            }
        };

        new Chart(ctxRendimentos as unknown as HTMLCanvasElement, configRendimentos);

        doc.image(canvasRendimentos.toBuffer('image/png'), {
            fit: [400, 300],
            align: 'center'
        });

        doc.moveDown(2);
    }

    private adicionarTabelaComparativa(doc: PDFKit.PDFDocument, dados: any) {
        // Título da tabela
        doc
            .fontSize(16)
            .fillColor('#1a237e')
            .text('Comparativo Detalhado', { align: 'center' })
            .moveDown(1);

        // Cabeçalho da tabela
        const headers = ['Banco', 'Investimento', 'Rendimento', 'Risco', 'Liquidez'];
        let y = doc.y;
        let x = 50;

        // Estilo do cabeçalho
        doc
            .rect(x, y, 495, 30)
            .fillColor('#e3f2fd')
            .fill()
            .fillColor('#1a237e');

        headers.forEach((header, i) => {
            doc
                .fontSize(12)
                .text(header, x + (i * 99), y + 10, { width: 99, align: 'center' });
        });

        // Dados da tabela
        y += 30;
        dados.comparativo.forEach((item, index) => {
            const cor = index % 2 === 0 ? '#ffffff' : '#f5f5f5';
            doc
                .rect(x, y, 495, 25)
                .fillColor(cor)
                .fill()
                .fillColor('#424242');

            doc
                .fontSize(10)
                .text(item.banco, x, y + 7, { width: 99, align: 'center' })
                .text(item.investimento, x + 99, y + 7, { width: 99, align: 'center' })
                .text(`${item.rendimento}%`, x + 198, y + 7, { width: 99, align: 'center' })
                .text(item.risco, x + 297, y + 7, { width: 99, align: 'center' })
                .text(item.liquidez, x + 396, y + 7, { width: 99, align: 'center' });

            y += 25;
        });
    }

    private adicionarRodape(doc: PDFKit.PDFDocument) {
        const pageCount = doc.bufferedPageRange().count;

        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);

            // Linha separadora
            doc
                .moveTo(50, doc.page.height - 50)
                .lineTo(545, doc.page.height - 50)
                .strokeColor('#e0e0e0')
                .stroke();

            // Texto do rodapé
            doc
                .fontSize(8)
                .fillColor('#9e9e9e')
                .text(
                    'Renix Finance - Análise Inteligente de Investimentos',
                    50,
                    doc.page.height - 40,
                    { align: 'center' }
                );

            // Número da página
            doc.text(
                `Página ${i + 1} de ${pageCount}`,
                50,
                doc.page.height - 25,
                { align: 'center' }
            );
        }
    }
} 