import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Neo4jModule } from '../../db/neo4j.module';

@Module({
  imports: [Neo4jModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}