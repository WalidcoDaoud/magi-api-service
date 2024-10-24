import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Client } from 'pg';
import { IDatabaseReturnModel } from '@src/model/DatabaseReturn.model';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private client: Client;

  constructor() {
    const sslEnabled = process.env.PG_SSL === 'true';

    this.client = new Client({
      host: process.env.PG_HOST,
      port: parseInt(process.env.PG_PORT, 10),
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      ssl: sslEnabled ? { rejectUnauthorized: false } : false,
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Erro ao conectar ao banco de dados:', error);
      throw new Error('Não foi possível conectar ao banco de dados');
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.end();
      console.log('Conexão com o banco de dados encerrada');
    } catch (error) {
      console.error('Erro ao encerrar a conexão com o banco de dados:', error);
    }
  }

  async query(
    queryText: string,
    values?: any[],
  ): Promise<IDatabaseReturnModel | any> {
    try {
      const result = await this.client.query(queryText, values);
      return result;
    } catch (error) {
      console.error('Erro ao executar query:', error);

      if (error.code === '23505') {
        throw new ConflictException(`Chave duplicada: ${error.detail}`);
      }

      throw new InternalServerErrorException(
        'Erro ao executar a query no banco de dados',
      );
    }
  }
}
