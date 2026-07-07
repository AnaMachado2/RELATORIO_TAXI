import { Controller, Get, Query } from '@nestjs/common';
import { DeclaracaoService } from '../service/declaracao';
import { DeclaracaoDto } from '../dto/declaracao.dto';
import { DeclaracaoEntity } from '../entity/declaracao.entity';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Relatórios de Táxi')
@Controller('declaracao')
export class DeclaracaoController {
  constructor(private readonly service: DeclaracaoService) {}

  @Get()
  @ApiOperation({
    summary: 'Retorna os vínculos por tempo de serviço do motorista (PRD_SEMOB)',
    description: 'Filtra o histórico de vínculos no banco PRD_SEMOB por nome e/ou CPF e retorna a lista de vínculos correspondente.',
  })
  @ApiOkResponse({
    description: 'Lista de vínculos retornada com sucesso.',
    type: [DeclaracaoEntity],
  })
  async getDeclaracao(@Query() query: DeclaracaoDto): Promise<DeclaracaoEntity[]> {
    return this.service.getDados(query.nome, query.cpf);
  }
}
