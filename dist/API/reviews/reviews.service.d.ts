import { Neo4jService } from '../../db/neo4j.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
export declare class ReviewsService {
    private neo4jService;
    constructor(neo4jService: Neo4jService);
    create(createReviewDto: CreateReviewDto): Promise<any>;
    findByPost(postId: string): Promise<any[]>;
    findByUser(userId: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateReviewDto: UpdateReviewDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
