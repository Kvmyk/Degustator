import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Neo4jModule } from '../../db/neo4j.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [Neo4jModule, NotificationsModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
