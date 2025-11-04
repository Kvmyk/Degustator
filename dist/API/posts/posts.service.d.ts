import { Neo4jService } from '../../db/neo4j.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
export declare class PostsService {
    private neo4jService;
    constructor(neo4jService: Neo4jService);
    create(createPostDto: CreatePostDto): Promise<any>;
    findAll(options: {
        limit?: number;
        offset?: number;
        sortBy?: string;
    }): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updatePostDto: UpdatePostDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
    likePost(postId: string, userId: string): Promise<any>;
    unlikePost(postId: string, userId: string): Promise<any>;
    getReviews(postId: string): Promise<any[]>;
    getTags(postId: string): Promise<any[]>;
    getIngredients(postId: string): Promise<any[]>;
    addTag(postId: string, tagId: string): Promise<{
        message: string;
    }>;
    addIngredient(postId: string, ingredientId: string): Promise<{
        message: string;
    }>;
    searchPosts(query: string): Promise<any[]>;
}
