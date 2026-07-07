import { ApiProperty } from '@nestjs/swagger';

export class HistoricoEntity {
  @ApiProperty({ description: 'CPF do preposto/motorista', example: 72714263100 })
  NR_CPF_PREPOSTO!: number;

  @ApiProperty({ description: 'Nome do preposto/motorista', example: 'WESLEY ALVES CHAVES' })
  NM_PREPOSTO!: string;

  @ApiProperty({ description: 'Código da CNH', example: '12345678900' })
  CD_CNH_PREPOSTO?: string;

  @ApiProperty({ description: 'Endereço/Logradouro', example: 'QNF 15 CASA 10' })
  TX_LOGRADOURO_PREPOSTO?: string;

  @ApiProperty({ description: 'Telefone Celular', example: '61999999999' })
  NR_TELEFONE_CELULAR_PREPOSTO?: string;

  @ApiProperty({ description: 'Número de Autorização (Permissão)', example: '01234' })
  AUTORIZACAO!: string;

  @ApiProperty({ description: 'Data de Entrada da Alocação', example: '2023-01-10T03:00:00.000Z' })
  DT_ENTRADA_PREPOSTO?: Date;

  @ApiProperty({ description: 'Data de Saída da Alocação', example: '2024-05-20T03:00:00.000Z' })
  DT_SAIDA_PREPOSTO?: Date;

  @ApiProperty({ description: 'Tipo da Importação (Atualização/Inclusão)', example: 'ATUALIZAÇÃO' })
  TIPO_IMPORTACAO?: string;

  @ApiProperty({ description: 'Data da Importação', example: '2023-01-10T03:00:00.000Z' })
  DT_IMPORTACAO_TBTAXI?: Date;
}
