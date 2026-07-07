import { Injectable, NotFoundException } from '@nestjs/common';
import { DeclaracaoRepository } from '../repository/declaracao.repository';
import PDFDocument from 'pdfkit';

@Injectable()
export class DeclaracaoService {
  constructor(private readonly repository: DeclaracaoRepository) {}

  async generatePdf(nome?: string, cpf?: string): Promise<Buffer> {
    const data = await this.repository.findByFilters(nome, cpf);
    if (!data || data.length === 0) {
      throw new NotFoundException('Nenhum registro de vínculo encontrado para os filtros informados.');
    }

    // Ordenar períodos por data de início
    const sortedData = [...data].sort((a, b) => {
      const da = a.DTA_INICIO_VINCULO ? new Date(a.DTA_INICIO_VINCULO).getTime() : 0;
      const db = b.DTA_INICIO_VINCULO ? new Date(b.DTA_INICIO_VINCULO).getTime() : 0;
      return da - db;
    });

    const primary = sortedData[0];
    if (!primary) {
      throw new NotFoundException('Erro ao processar dados de declaração.');
    }

    const formattedCpf = primary.COD_CPF
      ? primary.COD_CPF.toString().padStart(11, '0').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      : 'Não informado';

    // Calcular o tempo total de serviço
    let totalDays = 0;
    sortedData.forEach((row) => {
      if (row.DTA_INICIO_VINCULO) {
        const start = new Date(row.DTA_INICIO_VINCULO);
        const end = row.DTA_FIM_VINCULO ? new Date(row.DTA_FIM_VINCULO) : new Date();
        const diffTime = Math.max(0, end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalDays += diffDays;
      }
    });

    const years = Math.floor(totalDays / 365);
    const remainingDaysAfterYears = totalDays % 365;
    const months = Math.floor(remainingDaysAfterYears / 30);
    const days = remainingDaysAfterYears % 30;

    let tempoServicoFormatado = '';
    if (years > 0) tempoServicoFormatado += `${years} ${years === 1 ? 'ano' : 'anos'}`;
    if (months > 0) {
      if (tempoServicoFormatado) tempoServicoFormatado += ', ';
      tempoServicoFormatado += `${months} ${months === 1 ? 'mês' : 'meses'}`;
    }
    if (days > 0 || totalDays === 0) {
      if (tempoServicoFormatado) tempoServicoFormatado += ' e ';
      tempoServicoFormatado += `${days} ${days === 1 ? 'dia' : 'dias'}`;
    }

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // 1. Brasão e Cabeçalho do Distrito Federal
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#1a365d').text('GOVERNO DO DISTRITO FEDERAL', { align: 'center' });
      doc.fontSize(10).font('Helvetica').fillColor('#4a5568').text('SECRETARIA DE ESTADO DE MOBILIDADE - SEMOB', { align: 'center' });
      doc.fontSize(9).text('Subsecretaria de Serviços e Trânsito - Subtrans', { align: 'center' });
      doc.moveDown(1.5);

      // Linha divisória elegante
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#4a5568').lineWidth(1.5).stroke();
      doc.moveDown(2);

      // Título da Declaração
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#1a365d').text('DECLARAÇÃO DE TEMPO DE SERVIÇO', { align: 'center' });
      doc.moveDown(2);

      // Texto de Abertura
      doc.fontSize(11).font('Helvetica').fillColor('#2d3748').lineGap(6);
      
      const textoDeclaracao = `Declaramos, para os devidos fins de direito e comprovação de tempo de vínculo, que o(a) Sr(a). ${primary.NOME}, inscrito(a) no CPF sob o nº ${formattedCpf}, RG sob a indicação do órgão expedidor ${primary.NOM_EXPEDIDOR_RG || 'Não informado'}, residente e domiciliado(a) no endereço/número ${primary.NUM_ENDERECO || 'Não informado'}, esteve vinculado(a) ao Serviço de Transporte Individual de Passageiros (Táxi) do Distrito Federal na categoria de ${primary.TIPO_AUTORIZATARIO}, sob a Autorização nº ${primary.AUTORIZACAO || 'Não informada'}.`;

      doc.text(textoDeclaracao, {
        align: 'justify',
        indent: 40,
      });
      doc.moveDown(1.5);

      doc.text('Constam no sistema de registro da Secretaria os seguintes períodos de vínculo:', {
        align: 'justify',
      });
      doc.moveDown(1);

      // Tabela de Períodos
      const tableHeaderY = doc.y;
      doc.rect(50, tableHeaderY, 495, 20).fillColor('#1a365d').fill();

      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
      doc.text('Início do Vínculo', 60, tableHeaderY + 5, { width: 130 });
      doc.text('Fim do Vínculo', 200, tableHeaderY + 5, { width: 130 });
      doc.text('Tipo de Vínculo', 340, tableHeaderY + 5, { width: 195 });

      let currentY = tableHeaderY + 20;
      doc.font('Helvetica').fontSize(9);

      sortedData.forEach((row, index) => {
        if (index % 2 === 1) {
          doc.rect(50, currentY, 495, 20).fillColor('#f8fafc').fill();
        }

        doc.fillColor('#2d3748');
        doc.text(row.DTA_INICIO_VINCULO ? formatDate(row.DTA_INICIO_VINCULO) : 'Não informado', 60, currentY + 5, { width: 130 });
        doc.text(row.DTA_FIM_VINCULO ? formatDate(row.DTA_FIM_VINCULO) : 'Vínculo Ativo', 200, currentY + 5, { width: 130 });
        doc.text(row.TIPO_AUTORIZATARIO || 'Não informado', 340, currentY + 5, { width: 195 });

        doc.moveTo(50, currentY + 20).lineTo(545, currentY + 20).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
        currentY += 20;

        // Limite simples para evitar quebras
        if (currentY > 650) {
          doc.addPage();
          currentY = 50;
          doc.rect(50, currentY, 495, 20).fillColor('#1a365d').fill();
          doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
          doc.text('Início do Vínculo', 60, currentY + 5, { width: 130 });
          doc.text('Fim do Vínculo', 200, currentY + 5, { width: 130 });
          doc.text('Tipo de Vínculo', 340, currentY + 5, { width: 195 });
          currentY += 20;
          doc.font('Helvetica').fontSize(9);
        }
      });

      doc.y = currentY;
      doc.moveDown(1.5);

      // Totalizadores
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a365d');
      doc.text(`Tempo Total Computado: ${tempoServicoFormatado} (equivalente a aproximadamente ${totalDays} dias de serviço ativo).`, {
        align: 'left',
      });
      doc.moveDown(2);

      // Data e Localidade
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      const dataExtenso = new Date().toLocaleDateString('pt-BR', options);
      
      doc.fontSize(11).font('Helvetica').fillColor('#2d3748');
      doc.text(`Brasília - DF, ${dataExtenso}.`, {
        align: 'right',
      });
      doc.moveDown(3.5);

      // Linha de Assinatura
      const sigY = doc.y;
      doc.moveTo(150, sigY).lineTo(395, sigY).strokeColor('#94a3b8').lineWidth(1).stroke();
      doc.moveDown(0.5);
      
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a365d').text('Diretoria de Serviços de Transporte Individual', { align: 'center' });
      doc.fontSize(9).font('Helvetica').fillColor('#4a5568').text('Subsecretaria de Serviços - SEMOB', { align: 'center' });

      // Rodapé dinâmico das páginas
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.moveTo(50, 785).lineTo(545, 785).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
        
        doc.fontSize(7).fillColor('#94a3b8').font('Helvetica');
        const generationDate = new Date().toLocaleString('pt-BR');
        doc.text(`Código de Validação de Certificado: GDF-TAX-${primary.AUTORIZACAO || '00000'}-${primary.COD_CPF}`, 50, 790);
        doc.text(`Página ${i + 1} de ${totalPages}`, 450, 790, { align: 'right', width: 95 });
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
