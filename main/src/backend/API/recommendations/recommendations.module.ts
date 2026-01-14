import { Module } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { Neo4jModule } from '../../db/neo4j.module';

@Module({
    imports: [Neo4jModule],
    controllers: [RecommendationsController],
    providers: [RecommendationsService],
})
export class RecommendationsModule { }
