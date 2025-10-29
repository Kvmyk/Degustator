import { Module } from '@nestjs/common';
import { UsersModule } from './API/users/users.module';
import { PostsModule } from './API/posts/posts.module';
import { ReviewsModule } from './API/reviews/reviews.module';
import { TagsModule } from './API/tags/tags.module';
import { IngredientsModule } from './API/ingredients/ingredients.module';

@Module({
  imports: [
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
