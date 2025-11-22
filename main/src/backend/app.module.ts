import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { Neo4jModule } from './db/neo4j.module';
import { ApiController } from './api.controller';
import { UsersModule } from './API/users/users.module';
import { PostsModule } from './API/posts/posts.module';
import { ReviewsModule } from './API/reviews/reviews.module';
import { TagsModule } from './API/tags/tags.module';
import { IngredientsModule } from './API/ingredients/ingredients.module';
import { AuthModule } from './API/auth/auth.module';
import { FollowModule } from './API/follow/follow.module';

@Module({
  imports: [
    ConfigModule,
    Neo4jModule,
    UsersModule,
    PostsModule,
    ReviewsModule,
    TagsModule,
    IngredientsModule,
    AuthModule,
    FollowModule
  ],
  controllers: [ApiController],
  providers: [],
})
export class AppModule {}
