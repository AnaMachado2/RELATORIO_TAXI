import { Injectable, NotFoundException } from '@nestjs/common';
import { HistoricoRepository } from '../repository/historico.repository';
import PDFDocument from 'pdfkit';

@Injectable()
export class HistoricoService {
  constructor(private readonly repository: HistoricoRepository) {}

  async generatePdf(nome?: string, cpf?: string): Promise<Buffer> {
    const data = await this.repository.findByFilters(nome, cpf);
    if (!data || data.length === 0) {
      throw new NotFoundException('Nenhum registro encontrado para os filtros informados.');
    }

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // 1. Cabeçalho
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#1a365d').text('RELATÓRIO DE HISTÓRICO DO MOTORISTA', { align: 'center' });
      doc.fontSize(9).font('Helvetica').fillColor('#4a5568').text('Secretaria de Estado de Mobilidade - SEMOB / DFTRANS', { align: 'center' });
      doc.moveDown(1);

      // Linha divisória
      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#cbd5e1').lineWidth(1).stroke();
      doc.moveDown(1);

      // 2. Dados do Motorista (Primeiro Registro)
      const primary = data[0];
      if (!primary) {
        throw new NotFoundException('Erro ao processar dados de histórico.');
      }
      
      const formattedCpf = primary.NR_CPF_PREPOSTO
        ? primary.NR_CPF_PREPOSTO.toString().padStart(11, '0').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        : 'Não informado';

      doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a365d').text('DADOS DO MOTORISTA');
      doc.moveDown(0.3);

      const dataStartY = doc.y;
      
      // Desenhar caixa de fundo cinza
      doc.rect(40, dataStartY - 5, 515, 60).fillColor('#f8fafc').fill();
      
      doc.fillColor('#2d3748').fontSize(9);
      doc.font('Helvetica-Bold').text('Nome: ', 50, dataStartY).font('Helvetica').text(primary.NM_PREPOSTO || 'Não informado', 90, dataStartY);
      
      const nextY = dataStartY + 15;
      doc.font('Helvetica-Bold').text('CPF: ', 50, nextY).font('Helvetica').text(formattedCpf, 90, nextY);
      doc.font('Helvetica-Bold').text('CNH: ', 280, nextY).font('Helvetica').text(primary.CD_CNH_PREPOSTO || 'Não informado', 320, nextY);

      const nextY2 = nextY + 15;
      doc.font('Helvetica-Bold').text('Celular: ', 50, nextY2).font('Helvetica').text(primary.NR_TELEFONE_CELULAR_PREPOSTO || 'Não informado', 90, nextY2);
      
      const nextY3 = nextY2 + 15;
      doc.font('Helvetica-Bold').text('Endereço: ', 50, nextY3).font('Helvetica').text(primary.TX_LOGRADOURO_PREPOSTO || 'Não informado', 100, nextY3);

      doc.y = nextY3 + 25; // Mover cursor para baixo
      doc.moveDown(1.5);

      // 3. Histórico de Alocações
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a365d').text('HISTÓRICO DE ALOCAÇÕES E PERMISSÕES');
      doc.moveDown(0.5);

      // Cabeçalho da Tabela
      const tableHeaderY = doc.y;
      doc.rect(40, tableHeaderY, 515, 20).fillColor('#1a365d').fill();

      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
      doc.text('Autorização', 45, tableHeaderY + 6, { width: 65 });
      doc.text('Dt. Entrada', 115, tableHeaderY + 6, { width: 85 });
      doc.text('Dt. Saída', 205, tableHeaderY + 6, { width: 85 });
      doc.text('Tipo Importação', 295, tableHeaderY + 6, { width: 110 });
      doc.text('Dt. Importação', 410, tableHeaderY + 6, { width: 140 });

      // Linhas da Tabela
      let currentY = tableHeaderY + 20;
      doc.font('Helvetica').fontSize(8);

      data.forEach((row, index) => {
        // Cor alternada nas linhas
        if (index % 2 === 1) {
          doc.rect(40, currentY, 515, 20).fillColor('#f1f5f9').fill();
        }

        doc.fillColor('#2d3748');
        doc.text(row.AUTORIZACAO || 'Não inf.', 45, currentY + 6, { width: 65 });
        doc.text(row.DT_ENTRADA_PREPOSTO ? formatDate(row.DT_ENTRADA_PREPOSTO) : 'Ativo', 115, currentY + 6, { width: 85 });
        doc.text(row.DT_SAIDA_PREPOSTO ? formatDate(row.DT_SAIDA_PREPOSTO) : 'Ativo', 205, currentY + 6, { width: 85 });
        doc.text(row.TIPO_IMPORTACAO || 'Não inf.', 295, currentY + 6, { width: 110 });
        doc.text(row.DT_IMPORTACAO_TBTAXI ? formatDate(row.DT_IMPORTACAO_TBTAXI) : 'Não inf.', 410, currentY + 6, { width: 140 });

        // Desenhar linha de borda inferior
        doc.moveTo(40, currentY + 20).lineTo(555, currentY + 20).strokeColor('#cbd5e1').lineWidth(0.5).stroke();

        currentY += 20;

        // Se houver overflow de página
        if (currentY > 750) {
          doc.addPage();
          currentY = 40; // resetar
          
          doc.rect(40, currentY, 515, 20).fillColor('#1a365d').fill();
          doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
          doc.text('Autorização', 45, currentY + 6, { width: 65 });
          doc.text('Dt. Entrada', 115, currentY + 6, { width: 85 });
          doc.text('Dt. Saída', 205, currentY + 6, { width: 85 });
          doc.text('Tipo Importação', 295, currentY + 6, { width: 110 });
          doc.text('Dt. Importação', 410, currentY + 6, { width: 140 });
          
          currentY += 20;
          doc.font('Helvetica').fontSize(8);
        }
      });

      // Rodapé
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        
        doc.moveTo(40, 785).lineTo(555, 785).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
        
        doc.fontSize(7).fillColor('#94a3b8').font('Helvetica');
        const generationDate = new Date().toLocaleString('pt-BR');
        doc.text(`Relatório emitido em: ${generationDate}`, 40, 790);
        doc.text(`Página ${i + 1} de ${totalPages}`, 450, 790, { align: 'right', width: 105 });
      }

      doc.end();
    });
  }
}

function formatDate(dateValue: string | Date | number): string {
  if (!dateValue) return 'Não informado';
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return String(dateValue);
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
