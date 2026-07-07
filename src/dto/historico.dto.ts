import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class HistoricoDto {
  @ApiPropertyOptional({
    description: 'Nome do motorista para busca parcial (LIKE)',
    example: 'WESLEY ALVES CHAVES',
  })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({
    description: 'CPF do motorista (apenas números ou formatado)',
    example: '72714263100',
  })
  @IsOptional()
  @IsString()
  cpf?: string;
}
