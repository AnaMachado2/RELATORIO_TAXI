import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as oracledb from 'oracledb';

@Injectable()
export class AtenaDatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: oracledb.Pool | null = null;
  private workingConnectString: string | null = null;
  private readonly logger = new Logger(AtenaDatabaseService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializePool();
  }

  private async initializePool(): Promise<boolean> {
    const user = this.configService.get<string>('DB_ATENA_USERNAME') || 'ANAMA#';
    const password = this.configService.get<string>('DB_ATENA_PASSWORD') || '88j1R2DWlwvp';
    const host = this.configService.get<string>('DB_ATENA_HOST') || '10.72.31.76';
    const port = this.configService.get<number>('DB_ATENA_PORT') || 1521;
    const serviceName = this.configService.get<string>('DB_ATENA_SERVICE') || 'ATENA1';

    // Lista de candidatos a TNS connect strings
    const candidates = [
      `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${host})(PORT=${port}))(CONNECT_DATA=(SID=ATENA)))`,
      `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${host})(PORT=${port}))(CONNECT_DATA=(SERVICE_NAME=${serviceName})))`,
      `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${host})(PORT=${port}))(CONNECT_DATA=(SERVICE_NAME=APOLO1)))`,
      `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${host})(PORT=${port}))(CONNECT_DATA=(SID=APOLO1)))`,
      `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${host})(PORT=${port}))(CONNECT_DATA=(SID=ATENA1)))`,
      `${host}:${port}/${serviceName}`,
    ];

    for (const connectString of candidates) {
      try {
        this.logger.log(`Tentando conectar ao banco ATENA usando: ${connectString}`);
        const tempConn = await oracledb.getConnection({ user, password, connectString });
        await tempConn.close();

        // Funcionou! Configura o pool com esta string
        this.workingConnectString = connectString;
        this.pool = await oracledb.createPool({
          user,
          password,
          connectString,
          poolMin: 1,
          poolMax: 10,
          poolIncrement: 1,
        });
        this.logger.log(`✅ Conectado com sucesso ao pool ATENA com string: ${connectString}`);
        return true;
      } catch (err: any) {
        this.logger.warn(`Falha na string de conexão ${connectString}: ${err.message}`);
      }
    }

    this.logger.error('❌ Falha ao inicializar o pool de conexão do banco ATENA com todas as candidatas.');
    return false;
  }

  async execute<T = any>(sql: string, params: any = {}): Promise<T[]> {
    let connection: oracledb.Connection | null = null;
    try {
      const activePool = this.pool;
      if (activePool) {
        connection = await activePool.getConnection();
      } else {
        const initialized = await this.initializePool();
        const recheckPool = this.pool;
        if (initialized && recheckPool) {
          connection = await recheckPool.getConnection();
        } else {
          throw new Error('Pool de conexões ATENA não disponível e falhou ao re-inicializar.');
        }
      }

      if (!connection) {
        throw new Error('Não foi possível obter uma conexão com o banco ATENA.');
      }

      const result = await connection.execute(sql, params, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        autoCommit: true,
      });

      return (result.rows || []) as T[];
    } catch (err) {
      this.logger.error(`Erro ao executar query no banco ATENA: ${sql}`, err);
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeErr) {
          this.logger.error('Erro ao fechar conexão ATENA', closeErr);
        }
      }
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      try {
        await this.pool.close();
        this.logger.log('ATENA database pool closed.');
      } catch (err) {
        this.logger.error('Error closing ATENA database pool', err);
      }
    }
  }
}

@Injectable()
export class SemobDatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: oracledb.Pool | null = null;
  private workingConnectString: string | null = null;
  private readonly logger = new Logger(SemobDatabaseService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializePool();
  }

  private async initializePool(): Promise<boolean> {
    const user = this.configService.get<string>('DB_SEMOB_USERNAME') || 'ANAJUL#';
    const password = this.configService.get<string>('DB_SEMOB_PASSWORD') || 'BR206yoeJH28';
    const host = this.configService.get<string>('DB_SEMOB_HOST') || 'codvm01-scan1.gdfnet.df';
    const port = this.configService.get<number>('DB_SEMOB_PORT') || 1521;
    const serviceName = this.configService.get<string>('DB_SEMOB_SERVICE') || 'PRD_SEMOB';

    const candidates = [
      `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${host})(PORT=${port}))(CONNECT_DATA=(SERVICE_NAME=${serviceName})))`,
      `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${host})(PORT=${port}))(CONNECT_DATA=(SID=${serviceName})))`,
      `${host}:${port}/${serviceName}`,
    ];

    for (const connectString of candidates) {
      try {
        this.logger.log(`Tentando conectar ao banco PRD_SEMOB usando: ${connectString}`);
        const tempConn = await oracledb.getConnection({ user, password, connectString });
        await tempConn.close();

        this.workingConnectString = connectString;
        this.pool = await oracledb.createPool({
          user,
          password,
          connectString,
          poolMin: 1,
          poolMax: 10,
          poolIncrement: 1,
        });
        this.logger.log(`✅ Conectado com sucesso ao pool PRD_SEMOB com string: ${connectString}`);
        return true;
      } catch (err: any) {
        this.logger.warn(`Falha na string de conexão ${connectString}: ${err.message}`);
      }
    }

    this.logger.error('❌ Falha ao inicializar o pool de conexão do banco PRD_SEMOB com todas as candidatas.');
    return false;
  }

  async execute<T = any>(sql: string, params: any = {}): Promise<T[]> {
    let connection: oracledb.Connection | null = null;
    try {
      const activePool = this.pool;
      if (activePool) {
        connection = await activePool.getConnection();
      } else {
        const initialized = await this.initializePool();
        const recheckPool = this.pool;
        if (initialized && recheckPool) {
          connection = await recheckPool.getConnection();
        } else {
          throw new Error('Pool de conexões PRD_SEMOB não disponível e falhou ao re-inicializar.');
        }
      }

      if (!connection) {
        throw new Error('Não foi possível obter uma conexão com o banco PRD_SEMOB.');
      }

      const result = await connection.execute(sql, params, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        autoCommit: true,
      });

      return (result.rows || []) as T[];
    } catch (err) {
      this.logger.error(`Erro ao executar query no banco PRD_SEMOB: ${sql}`, err);
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeErr) {
          this.logger.error('Error closing connection PRD_SEMOB', closeErr);
        }
      }
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      try {
        await this.pool.close();
        this.logger.log('PRD_SEMOB database pool closed.');
      } catch (err) {
        this.logger.error('Error closing PRD_SEMOB database pool', err);
      }
    }
  }
}