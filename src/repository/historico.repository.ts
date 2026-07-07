import { Injectable } from '@nestjs/common';
import { AtenaDatabaseService } from '../config/database';
import { HistoricoEntity } from '../entity/historico.entity';

@Injectable()
export class HistoricoRepository {
  constructor(private readonly databaseService: AtenaDatabaseService) {}

  async findByFilters(nome?: string, cpf?: string): Promise<HistoricoEntity[]> {
    let sql = `
      SELECT
        P.NR_CPF_PREPOSTO,
        P.NM_PREPOSTO,
        P.CD_CNH_PREPOSTO,
        P.TX_LOGRADOURO_PREPOSTO,
        P.NR_TELEFONE_CELULAR_PREPOSTO,
        TO_CHAR(p2.NR_PERMISSAO, 'FM00000') AS AUTORIZACAO, 
        OAP.DT_ENTRADA_PREPOSTO,
        OAP.DT_SAIDA_PREPOSTO,
        CASE 
          WHEN p2.ST_TIPO_IMPORTACAO_TBTAXI = 'A' THEN 'ATUALIZAÇÃO'
          WHEN p2.ST_TIPO_IMPORTACAO_TBTAXI = 'I' THEN 'INCLUSÃO'
        END AS tipo_importacao,
        p2.DT_IMPORTACAO_TBTAXI
      FROM 
        DFTRANS.PREPOSTOS p,
        DFTRANS.OPE_ALOCA_PREP oap,
        DFTRANS.PERMISSOES p2,
        DFTRANS.CATEGORIAS_FUNCIONAIS cf 
      WHERE 
        P.ID_PREPOSTO = OAP.ID_PREPOSTO 
        AND OAP.ID_PERMISSAO = P2.ID_PERMISSAO
        AND oap.ID_CATEG_FUNCIONAL = cf.ID_CATEG_FUNCIONAL
    `;

    const binds: any = {};

    if (cpf) {
      const numericCpf = cpf.replace(/\D/g, '');
      if (numericCpf) {
        sql += ` AND p.NR_CPF_PREPOSTO = :cpf`;
        binds.cpf = Number(numericCpf);
      }
    }

    if (nome) {
      sql += ` AND UPPER(p.NM_PREPOSTO) LIKE :nome`;
      binds.nome = `%${nome.toUpperCase()}%`;
    }

    sql += ` ORDER BY OAP.DT_SAIDA_PREPOSTO`;

    // Se nenhum filtro foi passado, evitamos um scan desnecessário retornando vazio
    if (!cpf && !nome) {
      return [];
    }

    return this.databaseService.execute<HistoricoEntity>(sql, binds);
  }
}
