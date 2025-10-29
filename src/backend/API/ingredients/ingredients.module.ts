import { Module } from '@nestjs/common';
import { IngredientsController } from './ingredients.controller';
import { IngredientsService } from './ingredients.service';

@Module({
  controllers: [IngredientsController],
  providers: [IngredientsService],
  exports: [IngredientsService],
})
export class IngredientsModule {}
