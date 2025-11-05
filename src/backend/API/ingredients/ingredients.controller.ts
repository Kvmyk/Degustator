import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  async createIngredient(@Body() createIngredientDto: CreateIngredientDto) {
    return await this.ingredientsService.create(createIngredientDto);
  }

  @Get()
  async getAllIngredients() {
    return await this.ingredientsService.findAll();
  }

  @Get('popular')
  async getPopularIngredients() {
    return await this.ingredientsService.findPopular();
  }

  @Get(':id')
  async getIngredientById(@Param('id') id: string) {
    const ingredient = await this.ingredientsService.findOne(id);
    if (!ingredient) {
      throw new HttpException('Ingredient not found', HttpStatus.NOT_FOUND);
    }
    return ingredient;
  }

  @Put(':id')
  async updateIngredient(@Param('id') id: string, @Body() updateIngredientDto: UpdateIngredientDto) {
    return await this.ingredientsService.update(id, updateIngredientDto);
  }

  @Delete(':id')
  async deleteIngredient(@Param('id') id: string) {
    return await this.ingredientsService.remove(id);
  }

  @Get(':id/posts')
  async getPostsByIngredient(@Param('id') id: string) {
    return await this.ingredientsService.getPostsByIngredient(id);
  }
}
