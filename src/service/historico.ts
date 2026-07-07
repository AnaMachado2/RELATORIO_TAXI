import { Injectable, NotFoundException } from '@nestjs/common';
import { HistoricoRepository } from '../repository/historico.repository';
import { HistoricoEntity } from '../entity/historico.entity';

@Injectable()
export class HistoricoService {
  constructor(private readonly repository: HistoricoRepository) {}

  async getDados(nome?: string, cpf?: string): Promise<HistoricoEntity[]> {
    const data = await this.repository.findByFilters(nome, cpf);
    if (!data || data.length === 0) {
      throw new NotFoundException('Nenhum registro de histórico encontrado para os filtros informados.');
    }
    return data;
  }
}
