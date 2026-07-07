import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HistoricoModule } from './module/historico';
import { DeclaracaoModule } from './module/declaracao';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    HistoricoModule,
    DeclaracaoModule,
  ],
})
export class AppModule { }
