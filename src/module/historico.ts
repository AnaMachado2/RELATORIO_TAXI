import { Module } from '@nestjs/common';
import { HistoricoController } from '../controller/historico';
import { HistoricoService } from '../service/historico';
import { HistoricoRepository } from '../repository/historico.repository';
import { AtenaDatabaseService } from '../config/database';

@Module({
  controllers: [HistoricoController],
  providers: [
    HistoricoService,
    HistoricoRepository,
    AtenaDatabaseService,
  ],
  exports: [HistoricoService],
})
export class HistoricoModule {}
