import { Injectable } from '@nestjs/common';
import { SemobDatabaseService } from '../config/database';
import { DeclaracaoEntity } from '../entity/declaracao.entity';

@Injectable()
export class DeclaracaoRepository {
  constructor(private readonly databaseService: SemobDatabaseService) {}

  async findByFilters(nome?: string, cpf?: string): Promise<DeclaracaoEntity[]> {
    let sql = `
      SELECT DISTINCT 
        TO_CHAR(rma.NUM_AUTORIZACAO, 'FM00000') AS AUTORIZACAO,
        pf.NOM_PESSOA_FISICA AS Nome,
        pf.COD_CPF,
        pf.NOM_EXPEDIDOR_RG, 
        pf.NUM_ENDERECO,
        CASE 
          WHEN RMA.BLN_MOTORISTA_AUTORIZATARIO = 't' THEN 'Autorizatario'
          WHEN RMA.BLN_MOTORISTA_AUTORIZATARIO = 'f' THEN 'Motorista'
        END AS TIPO_AUTORIZATARIO,
        rma.DTA_INICIO_VINCULO,
        rma.DTA_FIM_VINCULO
      FROM
        TAXI.TAB_MOTORISTA_TAXI tx1,
        PESSOA.TAB_PESSOA_FISICA pf,
        TAXI.REL_MOTORISTA_AUTORIZACAO rma,
        TAXI.TAB_DOCUMENTO_MOTORISTA dm
      WHERE 
        tx1.COD_CPF = pf.COD_CPF 
        AND tx1.COD_CPF = rma.COD_CPF 
        AND tx1.COD_CPF = dm.COD_CPF
    `;

    const binds: any = {};

    if (cpf) {
      const numericCpf = cpf.replace(/\D/g, '');
      if (numericCpf) {
        sql += ` AND pf.COD_CPF = :cpf`;
        binds.cpf = Number(numericCpf);
      }
    }

    if (nome) {
      sql += ` AND UPPER(pf.NOM_PESSOA_FISICA) LIKE :nome`;
      binds.nome = `%${nome.toUpperCase()}%`;
    }

    sql += ` ORDER BY rma.DTA_FIM_VINCULO`;

    if (!cpf && !nome) {
      return [];
    }

    return this.databaseService.execute<DeclaracaoEntity>(sql, binds);
  }
}
