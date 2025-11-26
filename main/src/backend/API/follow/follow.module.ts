import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { Neo4jService } from '../../db/neo4j.service';

@Module({
  providers: [FollowService, Neo4jService],
  controllers: [FollowController],
})
export class FollowModule {}
