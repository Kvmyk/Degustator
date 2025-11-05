import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    createReview(createReviewDto: CreateReviewDto): Promise<any>;
    getAllReviews(): Promise<any[]>;
    getReviewsByPost(postId: string): Promise<any[]>;
    getReviewsByUser(userId: string): Promise<any[]>;
    getReviewById(id: string): Promise<any>;
    updateReview(id: string, updateReviewDto: UpdateReviewDto): Promise<any>;
    deleteReview(id: string): Promise<{
        message: string;
    }>;
}
