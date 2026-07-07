import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { DeclaracaoService } from '../service/declaracao';
import { DeclaracaoDto } from '../dto/declaracao.dto';
import { ApiTags, ApiOperation, ApiProduces, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Relatórios de Táxi')
@Controller('declaracao')
export class DeclaracaoController {
  constructor(private readonly service: DeclaracaoService) {}

  @Get('pdf')
  @ApiOperation({
    summary: 'Gera a declaração em PDF por tempo de serviço do motorista (PRD_SEMOB)',
    description: 'Busca o histórico de vínculos no banco PRD_SEMOB e monta o documento de declaração formal.',
  })
  @ApiProduces('application/pdf')
  @ApiOkResponse({
    description: 'Declaração PDF gerada e retornada com sucesso.',
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
    @Query() query: DeclaracaoDto,
    @Res() res: Response,
  ) {
    const buffer = await this.service.generatePdf(query.nome, query.cpf);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=declaracao-tempo-servico.pdf');
    res.setHeader('Content-Length', buffer.length.toString());
    res.end(buffer);
  }
}
