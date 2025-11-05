import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async createReview(@Body() createReviewDto: CreateReviewDto) {
    return await this.reviewsService.create(createReviewDto);
  }

  @Get()
  async getAllReviews() {
    return await this.reviewsService.findAll();
  }

  @Get('post/:postId')
  async getReviewsByPost(@Param('postId') postId: string) {
    return await this.reviewsService.findByPost(postId);
  }

  @Get('user/:userId')
  async getReviewsByUser(@Param('userId') userId: string) {
    return await this.reviewsService.findByUser(userId);
  }

  @Get(':id')
  async getReviewById(@Param('id') id: string) {
    const review = await this.reviewsService.findOne(id);
    if (!review) {
      throw new HttpException('Review not found', HttpStatus.NOT_FOUND);
    }
    return review;
  }

  @Put(':id')
  async updateReview(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return await this.reviewsService.update(id, updateReviewDto);
  }

  @Delete(':id')
  async deleteReview(@Param('id') id: string) {
    return await this.reviewsService.remove(id);
  }
}
