import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { Chart, ChartConfiguration, registerables } from 'chart.js/auto';
import { createCanvas } from 'canvas';

// Registrar os elementos necessários do Chart.js
Chart.register(...registerables);

@Injectable()
export class PdfService {
    async gerarPdfDashboard(dadosDashboard: any): Promise<Buffer> {
        const doc = new PDFDocument({
            size: 'A4',
            margin: 40,
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
            primaria: '#1B5E20',      // Verde escuro principal
            secundaria: '#2E7D32',     // Verde escuro secundário
            terciaria: '#388E3C',      // Verde médio
            background: '#E8F5E9',     // Verde claro suave
            backgroundAlt: '#C8E6C9',  // Verde claro médio
            destaque: '#43A047',       // Verde destaque
            texto: '#212121',          // Quase preto para texto
            textoClaro: '#757575'      // Cinza para texto secundário
        };

        // Cabeçalho com design melhorado
        this.adicionarCabecalho(doc, cores);

        // Resumo dos Dados com layout aprimorado
        this.adicionarResumoDados(doc, dadosDashboard, cores);

        // Detalhes do Investimento e Indicadores lado a lado
        this.adicionarDetalhesEIndicadores(doc, dadosDashboard.detalhes, cores);

        // Gráficos e Tabela na mesma página
        await this.adicionarGraficosETabela(doc, dadosDashboard, cores);

        // Rodapé único
        this.adicionarRodape(doc, cores);

        doc.end();
        return new Promise((resolve) => {
            doc.on('end', () => resolve(Buffer.concat(buffers)));
        });
    }

    private adicionarCabecalho(doc: typeof PDFDocument, cores: any) {
        // Faixa superior elegante
        doc.rect(0, 0, doc.page.width, 130)
           .fillColor(cores.background)
           .fill();

        // Linha decorativa
        doc.rect(40, 120, doc.page.width - 80, 2)
           .fillColor(cores.primaria)
           .fill();

        // Logo RENIX com destaque
        doc.fontSize(42)
           .fillColor(cores.primaria)
           .font('Helvetica-Bold')
           .text('RENIX', 40, 35, { align: 'center' });

        // Subtítulo elegante
        doc.fontSize(20)
           .fillColor(cores.secundaria)
           .font('Helvetica')
           .text('Análise de Investimentos', 40, 80, { align: 'center' });

        // Data com formatação elegante
        const dataFormatada = new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        doc.fontSize(10)
           .fillColor(cores.textoClaro)
           .text(dataFormatada, 40, 105, { align: 'center' });
    }

    private adicionarResumoDados(doc: typeof PDFDocument, dados: any, cores: any) {
        const startY = 150;
        const boxHeight = 90;
        const boxWidth = (doc.page.width - 100) / 4;

        const valorRendido = dados.detalhes.valorRendido;

        const boxes = [
            { 
                label: 'Total Investido', 
                valor: `R$ ${(dados.totalInvestido || 0).toFixed(2)}`,
                icon: '💰'
            },
            { 
                label: 'Valor Rendido', 
                valor: `R$ ${(valorRendido || 0).toFixed(2)}`,
                icon: '💸'
            },
            { 
                label: 'Rendimento Médio', 
                valor: `${(dados.rendimentoMedio || 0).toFixed(2)}%`,
                icon: '📈'
            },
            { 
                label: 'Nível de Risco', 
                valor: `${dados.riscoMedio || 0} de 5`,
                icon: '⚠️'
            }
        ];

        boxes.forEach((box, index) => {
            const x = 40 + (index * (boxWidth + 10));
            
            // Box com sombra suave
            doc.rect(x + 2, startY + 2, boxWidth, boxHeight)
               .fillColor('#E0E0E0')
               .fill();

            // Box principal com borda
            doc.rect(x, startY, boxWidth, boxHeight)
               .fillColor('#FFFFFF')
               .fill()
               .strokeColor(cores.backgroundAlt)
               .lineWidth(1)
               .stroke();

            // Ícone
            doc.fontSize(22)
               .text(box.icon, x + 15, startY + 15);

            // Label
            doc.fontSize(12)
               .fillColor(cores.textoClaro)
               .font('Helvetica')
               .text(box.label, x + 15, startY + 45);

            // Valor
            doc.fontSize(18)
               .fillColor(cores.texto)
               .font('Helvetica-Bold')
               .text(box.valor, x + 15, startY + 60);
        });
    }

    private adicionarDetalhesEIndicadores(doc: typeof PDFDocument, detalhes: any, cores: any) {
        const startY = 260;
        const colWidth = (doc.page.width - 90) / 2;

        // Seções com design moderno
        ['Detalhes do Investimento', 'Indicadores de Mercado'].forEach((titulo, index) => {
            const x = 40 + (index * (colWidth + 10));
            
            // Box com fundo e borda
            doc.rect(x, startY, colWidth, 180)
               .fillColor('#FFFFFF')
               .fill()
               .strokeColor(cores.backgroundAlt)
               .lineWidth(1)
               .stroke();

            // Título da seção
            doc.fontSize(16)
               .fillColor(cores.primaria)
               .font('Helvetica-Bold')
               .text(titulo, x + 15, startY + 15);

            const dados = index === 0 ? [
                { label: 'Valor Investido', valor: `R$ ${(detalhes.valorInvestido || 0).toFixed(2)}` },
                { label: 'Valor Bruto', valor: `R$ ${(detalhes.valorBruto || 0).toFixed(2)}` },
                { label: 'Valor Líquido', valor: `R$ ${(detalhes.valorLiquido || 0).toFixed(2)}` },
                { label: 'Valor Rendido', valor: `R$ ${(detalhes.valorRendido || 0).toFixed(2)}` },
                { label: 'Imposto de Renda', valor: `R$ ${(detalhes.impostoRenda || 0).toFixed(2)}` },
                { label: 'IOF', valor: `R$ ${(detalhes.iof || 0).toFixed(2)}` }
            ] : [
                { label: 'SELIC', valor: `${(detalhes.indicadoresMercado?.selic || 0).toFixed(2)}%` },
                { label: 'CDI', valor: `${(detalhes.indicadoresMercado?.cdi || 0).toFixed(2)}%` },
                { label: 'IPCA', valor: `${(detalhes.indicadoresMercado?.ipca || 0).toFixed(2)}%` }
            ];

            let currentY = startY + 45;
            dados.forEach(item => {
                // Label
                doc.fontSize(11)
                   .fillColor(cores.textoClaro)
                   .font('Helvetica')
                   .text(item.label, x + 15, currentY);

                // Valor
                doc.fontSize(12)
                   .fillColor(cores.texto)
                   .font('Helvetica-Bold')
                   .text(item.valor, x + 15, currentY + 20);

                currentY += 40;
            });
        });
    }

    private async adicionarGraficosETabela(doc: typeof PDFDocument, dados: any, cores: any) {
        const startY = 460;

        // Box para o gráfico
        doc.rect(40, startY, doc.page.width - 80, 280)
           .fillColor('#FFFFFF')
           .fill()
           .strokeColor(cores.backgroundAlt)
           .lineWidth(1)
           .stroke();

        // Título da seção
        doc.fontSize(16)
           .fillColor(cores.primaria)
           .font('Helvetica-Bold')
           .text('Distribuição do Investimento', 55, startY + 15);

        const canvas = createCanvas(380, 200);
        const ctx = canvas.getContext('2d');

        if (ctx) {
            const config: ChartConfiguration = {
                type: 'doughnut',
                data: {
                    labels: dados.distribuicao.map((d: any) => d.tipo),
                    datasets: [{
                        data: dados.distribuicao.map((d: any) => d.valor),
                        backgroundColor: [
                            cores.primaria,
                            cores.secundaria,
                            cores.terciaria,
                            cores.destaque,
                            cores.backgroundAlt
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                font: { size: 11 },
                                padding: 10
                            }
                        }
                    }
                }
            };

            new Chart(ctx as unknown as HTMLCanvasElement, config);

            // Centralizando o gráfico na página com posicionamento correto
            doc.image(canvas.toBuffer('image/png'), 50, startY + 40, {
                fit: [380, 200],
                align: 'center'
            });
        }

        // Tabela Comparativa compacta
        const tableStartY = startY + 250;
        const headers = ['Banco', 'Investimento', 'Rendimento', 'Risco', 'Liquidez'];
        const colWidth = (doc.page.width - 90) / headers.length;

        // Cabeçalho da tabela
        headers.forEach((header, i) => {
            doc.fontSize(10)
               .fillColor(cores.texto)
               .font('Helvetica-Bold')
               .text(header, 45 + (i * colWidth), tableStartY, { 
                   width: colWidth - 5, 
                   align: 'left' 
               });
        });

        // Linha separadora
        doc.moveTo(40, tableStartY + 20)
           .lineTo(doc.page.width - 40, tableStartY + 20)
           .strokeColor(cores.backgroundAlt)
           .stroke();

        // Dados da tabela
        let y = tableStartY + 25;
        dados.comparativo.slice(0, 4).forEach((item: any) => {
            doc.fontSize(9)
               .fillColor(cores.texto)
               .font('Helvetica')
               .text(item.banco, 45, y, { width: colWidth - 5 })
               .text(item.investimento, 45 + colWidth, y, { width: colWidth - 5 })
               .text(`${item.rendimento.toFixed(2)}%`, 45 + (colWidth * 2), y, { width: colWidth - 5 })
               .text(item.risco.toString(), 45 + (colWidth * 3), y, { width: colWidth - 5 })
               .text(item.liquidez.toString(), 45 + (colWidth * 4), y, { width: colWidth - 5 });

            y += 20;
        });
    }

    private adicionarRodape(doc: typeof PDFDocument, cores: any) {
        // Rodapé único na primeira página
        doc.rect(0, doc.page.height - 35, doc.page.width, 35)
           .fillColor(cores.background)
           .fill();

        // Texto do rodapé em uma única linha
        doc.fontSize(9)
           .fillColor(cores.primaria)
           .font('Helvetica-Bold')
           .text(
             'RENIX - Análise Inteligente de Investimentos    |    © ' + new Date().getFullYear() + ' Todos os direitos reservados',
             0,
             doc.page.height - 22,
             { 
               align: 'center',
               width: doc.page.width
             }
           );
    }
} 