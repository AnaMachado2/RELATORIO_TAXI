import { Injectable, NotFoundException } from '@nestjs/common';
import { DeclaracaoRepository } from '../repository/declaracao.repository';
import { DeclaracaoEntity } from '../entity/declaracao.entity';

@Injectable()
export class DeclaracaoService {
  constructor(private readonly repository: DeclaracaoRepository) {}

  async getDados(nome?: string, cpf?: string): Promise<DeclaracaoEntity[]> {
    const data = await this.repository.findByFilters(nome, cpf);
    if (!data || data.length === 0) {
      throw new NotFoundException('Nenhum registro de vínculo encontrado para os filtros informados.');
    }
    return data;
  }
}
