import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DeclaracaoDto {
  @ApiPropertyOptional({
    description: 'Nome do motorista/permissionário para busca parcial (LIKE)',
    example: 'WESLEY ALVES CHAVES',
  })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({
    description: 'CPF do motorista/permissionário (apenas números ou formatado)',
    example: '72714263100',
  })
  @IsOptional()
  @IsString()
  cpf?: string;
}
