import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import neo4j, { Driver, Session } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private driver: Driver;

  onModuleInit() {
    this.driver = neo4j.driver(
      'neo4j://localhost:7687',
      neo4j.auth.basic('neo4j', 'degustator') // 🔑 zmień na swoje hasło    
    );
    console.log('✅ Połączono z Neo4j');
  }

  getSession(): Session {
    return this.driver.session();
  }

  onModuleDestroy() {
    return this.driver.close();
  }
}
