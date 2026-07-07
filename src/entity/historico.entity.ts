export class HistoricoEntity {
  NR_CPF_PREPOSTO!: number;
  NM_PREPOSTO!: string;
  CD_CNH_PREPOSTO?: string;
  TX_LOGRADOURO_PREPOSTO?: string;
  NR_TELEFONE_CELULAR_PREPOSTO?: string;
  AUTORIZACAO!: string;
  DT_ENTRADA_PREPOSTO?: Date;
  DT_SAIDA_PREPOSTO?: Date;
  TIPO_IMPORTACAO?: string;
  DT_IMPORTACAO_TBTAXI?: Date;
}
