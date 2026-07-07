import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { HistoricoService } from '../service/historico';
import { HistoricoDto } from '../dto/historico.dto';
import { ApiTags, ApiOperation, ApiProduces, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Relatórios de Táxi')
@Controller('historico')
export class HistoricoController {
  constructor(private readonly service: HistoricoService) {}

  @Get('pdf')
  @ApiOperation({
    summary: 'Gera o relatório PDF de histórico de alocações do motorista (ATENA)',
    description: 'Filtra motoristas no banco ATENA por nome e/ou CPF e gera o relatório consolidado de alocações.',
  })
  @ApiProduces('application/pdf')
  @ApiOkResponse({
    description: 'Relatório PDF gerado e retornado com sucesso.',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async downloadPdf(
    @Query() query: HistoricoDto,
    @Res() res: Response,
  ) {
    const buffer = await this.service.generatePdf(query.nome, query.cpf);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=historico-motorista.pdf');
    res.setHeader('Content-Length', buffer.length.toString());
    res.end(buffer);
  }
}
