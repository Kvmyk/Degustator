import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PostsService } from '../posts/posts.service';
import { Neo4jService } from '../../db/neo4j.service';
import { BadRequestException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';

describe('Reviews and Likes Integration (Mocked)', () => {
    let reviewsService: ReviewsService;
    let postsService: PostsService;
    let neo4jService: Neo4jService;

    const mockNeo4jService = {
        read: jest.fn(),
        write: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReviewsService,
                PostsService,
                {
                    provide: Neo4jService,
                    useValue: mockNeo4jService,
                },
            ],
        }).compile();

        reviewsService = module.get<ReviewsService>(ReviewsService);
        postsService = module.get<PostsService>(PostsService);
        neo4jService = module.get<Neo4jService>(Neo4jService);

        jest.clearAllMocks();
    });

    describe('Interactions: Reviewing and Liking Posts', () => {
        const userId = 'user-123';
        const postId = 'post-456';
        const reviewId = 'review-789';

        describe('Review Creation Flow', () => {
            it('should create a review and update post average rating', async () => {
                const createReviewDto: CreateReviewDto = {
                    userId,
                    postId,
                    rating: 5,
                    content: 'Great post!',
                };

                // Mock 1: Check if author (return false)
                // Mock 2: Check if already reviewed (return empty)
                // Mock 3: Create review query (return result)
                mockNeo4jService.read = jest.fn()
                    .mockResolvedValueOnce([]) // Not author
                    .mockResolvedValueOnce([]); // Not reviewed yet

                mockNeo4jService.write = jest.fn().mockResolvedValueOnce([
                    {
                        r: { properties: { id: reviewId, ...createReviewDto } }
                    }
                ]);

                const result = await reviewsService.create(createReviewDto);

                // Verify the query chain
                expect(mockNeo4jService.read).toHaveBeenCalledTimes(2); // Author check + Duplicate check

                // Verify the CREATE query includes the rating aggregation logic
                const createQuery = (mockNeo4jService.write as jest.Mock).mock.calls[0][0];
                expect(createQuery).toContain('CREATE (r:Review');
                expect(createQuery).toContain('avg(reviews.rating) AS avg_rating');
                expect(createQuery).toContain('SET p.avg_rating = avg_rating');

                expect(result).toBeDefined();
                expect(result.id).toBe(reviewId);
            });

            it('should prevent author from reviewing their own post', async () => {
                const createReviewDto: CreateReviewDto = {
                    userId,
                    postId,
                    rating: 5,
                };

                // Mock 1: Check if author (return TRUE)
                mockNeo4jService.read = jest.fn().mockResolvedValueOnce([
                    { isAuthor: true }
                ]);

                await expect(reviewsService.create(createReviewDto))
                    .rejects
                    .toThrow(BadRequestException);
            });
        });

        describe('Post Likes Flow', () => {
            it('should like a post and increment likes count', async () => {
                mockNeo4jService.write = jest.fn().mockResolvedValueOnce([
                    {
                        p: { properties: { id: postId, likes_count: 1 } }
                    }
                ]);

                await postsService.likePost(postId, userId);

                const likeQuery = (mockNeo4jService.write as jest.Mock).mock.calls[0][0];
                expect(likeQuery).toContain('MERGE (u)-[r:LIKES]->(p)');
                expect(likeQuery).toContain('SET p.likes_count = p.likes_count + 1');
            });

            it('should unlike a post and decrement likes count', async () => {
                mockNeo4jService.write = jest.fn().mockResolvedValueOnce([
                    {
                        p: { properties: { id: postId, likes_count: 0 } }
                    }
                ]);

                await postsService.unlikePost(postId, userId);

                const unlikeQuery = (mockNeo4jService.write as jest.Mock).mock.calls[0][0];
                expect(unlikeQuery).toContain('DELETE r');
                expect(unlikeQuery).toContain('SET p.likes_count = p.likes_count - 1');
            });
        });

        describe('Data Retrieval', () => {
            it('should retrieve reviews for a post', async () => {
                const mockReviews = [
                    {
                        r: { properties: { id: 'r1', rating: 5, content: 'Nice' } },
                        author: { properties: { id: 'u1', username: 'User1' } }
                    }
                ];

                mockNeo4jService.read = jest.fn().mockResolvedValueOnce(mockReviews);

                const result = await reviewsService.findByPost(postId);

                expect(result).toHaveLength(1);
                expect(result[0].rating).toBe(5);
                expect(result[0].author.username).toBe('User1');
            });
        });
    });
});
