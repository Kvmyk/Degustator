import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as neo4j from 'neo4j-driver';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private driver: neo4j.Driver;
  private readonly logger = new Logger(Neo4jService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const uri = this.configService.get<string>('NEO4J_URI') || 'neo4j://localhost:7687';
    const username = this.configService.get<string>('NEO4J_USERNAME') || 'neo4j';
    const password = this.configService.get<string>('NEO4J_PASSWORD') || 'password';

    try {
      this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
      this.logger.log('✓ Neo4j connected successfully');
    } catch (error) {
      this.logger.error('✗ Failed to connect to Neo4j', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.driver) {
      await this.driver.close();
      this.logger.log('Neo4j connection closed');
    }
  }

  getDriver(): neo4j.Driver {
    return this.driver;
  }

  async read(query: string, params?: Record<string, any>) {
    const session = this.driver.session({ defaultAccessMode: neo4j.session.READ });
    try {
      // Ensure limit and offset are integers using neo4j.int()
      if (params) {
        if (params.limit !== undefined) {
          params.limit = neo4j.int(params.limit);
        }
        if (params.offset !== undefined) {
          params.offset = neo4j.int(params.offset);
        }
      }
      const result = await session.run(query, params);
      return result.records.map(record => record.toObject());
    } catch (error) {
      this.logger.error(`Read query failed: ${query}`, error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async write(query: string, params?: Record<string, any>) {
    const session = this.driver.session({ defaultAccessMode: neo4j.session.WRITE });
    try {
      const result = await session.run(query, params);
      return result.records.map(record => record.toObject());
    } catch (error) {
      this.logger.error(`Write query failed: ${query}`, error);
      throw error;
    } finally {
      await session.close();
    }
  }
}
