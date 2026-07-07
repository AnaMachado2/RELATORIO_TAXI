import { ApiProperty } from '@nestjs/swagger';

export class DeclaracaoEntity {
  @ApiProperty({ description: 'Número da autorização do táxi', example: '01234' })
  AUTORIZACAO!: string;

  @ApiProperty({ description: 'Nome do motorista ou autorizatário', example: 'WESLEY ALVES CHAVES' })
  NOME!: string;

  @ApiProperty({ description: 'CPF do motorista ou autorizatário', example: '72714263100' })
  COD_CPF!: string | number;

  @ApiProperty({ description: 'Órgão expedidor do RG', example: 'SSP/DF' })
  NOM_EXPEDIDOR_RG?: string;

  @ApiProperty({ description: 'Número/Endereço de residência', example: '10' })
  NUM_ENDERECO?: string | number;

  @ApiProperty({ description: 'Tipo do vínculo (Autorizatario ou Motorista)', example: 'Motorista' })
  TIPO_AUTORIZATARIO!: string;

  @ApiProperty({ description: 'Data de início do vínculo', example: '2015-02-12T03:00:00.000Z' })
  DTA_INICIO_VINCULO?: Date;

  @ApiProperty({ description: 'Data de fim do vínculo', example: '2019-10-30T03:00:00.000Z' })
  DTA_FIM_VINCULO?: Date;
}
