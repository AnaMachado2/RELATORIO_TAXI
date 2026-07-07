export class DeclaracaoEntity {
  AUTORIZACAO!: string;
  NOME!: string;
  COD_CPF!: string | number;
  NOM_EXPEDIDOR_RG?: string;
  NUM_ENDERECO?: string | number;
  TIPO_AUTORIZATARIO!: string;
  DTA_INICIO_VINCULO?: Date;
  DTA_FIM_VINCULO?: Date;
}
