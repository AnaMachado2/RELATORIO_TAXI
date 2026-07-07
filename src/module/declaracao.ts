import { Module } from '@nestjs/common';
import { DeclaracaoController } from '../controller/declaracao';
import { DeclaracaoService } from '../service/declaracao';
import { DeclaracaoRepository } from '../repository/declaracao.repository';
import { SemobDatabaseService } from '../config/database';

@Module({
  controllers: [DeclaracaoController],
  providers: [
    DeclaracaoService,
    DeclaracaoRepository,
    SemobDatabaseService,
  ],
  exports: [DeclaracaoService],
})
export class DeclaracaoModule {}
