import { Controller, Get, Query } from '@nestjs/common';
import { HistoricoService } from '../service/historico';
import { HistoricoDto } from '../dto/historico.dto';
import { HistoricoEntity } from '../entity/historico.entity';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Relatórios de Táxi')
@Controller('historico')
export class HistoricoController {
  constructor(private readonly service: HistoricoService) {}

  @Get()
  @ApiOperation({
    summary: 'Retorna o histórico de alocações do motorista (ATENA)',
    description: 'Filtra motoristas no banco ATENA por nome e/ou CPF e retorna a lista de registros cadastrais e de alocações.',
  })
  @ApiOkResponse({
    description: 'Registros do histórico do motorista retornados com sucesso.',
    type: [HistoricoEntity],
  })
  async getHistorico(@Query() query: HistoricoDto): Promise<HistoricoEntity[]> {
    return this.service.getDados(query.nome, query.cpf);
  }
}
