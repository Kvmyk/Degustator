import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    // TODO: Implement review creation
    // - Create REVIEWED relationship between User and Post
    // - Update post's avg_rating
    throw new Error('Method not implemented');
  }

  async findByPost(postId: string): Promise<Review[]> {
    // TODO: Get all reviews for a specific post
    throw new Error('Method not implemented');
  }

  async findByUser(userId: string): Promise<Review[]> {
    // TODO: Get all reviews by a specific user
    throw new Error('Method not implemented');
  }

  async findOne(id: string): Promise<Review> {
    // TODO: Get single review by ID
    throw new Error('Method not implemented');
  }

  async update(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    // TODO: Update review
    // - Update post's avg_rating if rating changed
    throw new Error('Method not implemented');
  }

  async remove(id: string): Promise<void> {
    // TODO: Delete review
    // - Update post's avg_rating
    throw new Error('Method not implemented');
  }
}
