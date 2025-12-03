import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async createPost(@Body() createPostDto: CreatePostDto) {
    return await this.postsService.create(createPostDto);
  }

  @Get()
  async getAllPosts(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('sortBy') sortBy?: 'created_at' | 'avg_rating' | 'likes_count',
  ) {
    return await this.postsService.findAll({
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      sortBy,
    });
  }

  @Get('search')
  async searchPosts(@Query('q') query: string) {
    return await this.postsService.searchPosts(query);
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    const post = await this.postsService.findOne(id);
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    return post;
  }

  @Put(':id')
  async updatePost(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return await this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    return await this.postsService.remove(id);
  }

  @Post(':id/like')
  async likePost(@Param('id') id: string, @Body('userId') userId: string) {
    return await this.postsService.likePost(id, userId);
  }

  @Delete(':id/like')
  async unlikePost(@Param('id') id: string, @Body('userId') userId: string) {
    return await this.postsService.unlikePost(id, userId);
  }

  @Get(':id/like/status')
  async likeStatus(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ) {
    const liked = await this.postsService.isLiked(id, userId);
    return { liked };
  }

  @Get(':id/reviews')
  async getPostReviews(@Param('id') id: string) {
    return await this.postsService.getReviews(id);
  }

  @Get(':id/reviews/count')
  async getPostReviewsCount(@Param('id') id: string) {
    return { reviews_count: await this.postsService.getReviewsCount(id) };
  }

  @Get(':id/tags')
  async getPostTags(@Param('id') id: string) {
    return await this.postsService.getTags(id);
  }

  @Get(':id/ingredients')
  async getPostIngredients(@Param('id') id: string) {
    return await this.postsService.getIngredients(id);
  }

  @Post(':id/tags')
  async addTagToPost(@Param('id') id: string, @Body('tagId') tagId: string) {
    return await this.postsService.addTag(id, tagId);
  }

  @Post(':id/ingredients')
  async addIngredientToPost(@Param('id') id: string, @Body('ingredientId') ingredientId: string) {
    return await this.postsService.addIngredient(id, ingredientId);
  }
}
