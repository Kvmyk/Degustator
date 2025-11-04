import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { Neo4jModule } from './db/neo4j.module';
import { UsersModule } from './API/users/users.module';
import { PostsModule } from './API/posts/posts.module';
import { ReviewsModule } from './API/reviews/reviews.module';
import { TagsModule } from './API/tags/tags.module';
import { IngredientsModule } from './API/ingredients/ingredients.module';

@Module({
  imports: [
    ConfigModule,
    Neo4jModule,
    UsersModule,
    PostsModule,
    ReviewsModule,
    TagsModule,
    IngredientsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
