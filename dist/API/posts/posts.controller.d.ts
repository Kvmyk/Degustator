import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    createPost(createPostDto: CreatePostDto): Promise<any>;
    getAllPosts(limit?: string, offset?: string, sortBy?: 'created_at' | 'avg_rating' | 'likes_count'): Promise<any[]>;
    searchPosts(query: string): Promise<any[]>;
    getPostById(id: string): Promise<any>;
    updatePost(id: string, updatePostDto: UpdatePostDto): Promise<any>;
    deletePost(id: string): Promise<{
        message: string;
    }>;
    likePost(id: string, userId: string): Promise<any>;
    unlikePost(id: string, userId: string): Promise<any>;
    getPostReviews(id: string): Promise<any[]>;
    getPostTags(id: string): Promise<any[]>;
    getPostIngredients(id: string): Promise<any[]>;
    addTagToPost(id: string, tagId: string): Promise<{
        message: string;
    }>;
    addIngredientToPost(id: string, ingredientId: string): Promise<{
        message: string;
    }>;
}
