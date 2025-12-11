import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Neo4jService } from '../../db/neo4j.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { POST_CATEGORIES } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private neo4jService: Neo4jService) {}

  async create(createPostDto: CreatePostDto): Promise<any> {
    try {
      const query = `
        MATCH (u:User { id: $userId })
        CREATE (p:Post {
          id: randomUUID(),
          title: $title,
          content: $content,
          recipe: $recipe,
          photos: $photos,
          category: $category,
          avg_rating: 0,
          likes_count: 0,
          created_at: datetime()
        })
        CREATE (u)-[:CREATED]->(p)
        RETURN p
      `;

      const result = await this.neo4jService.write(query, {
        userId: createPostDto.userId,
        title: createPostDto.title,
        content: createPostDto.content,
        recipe: createPostDto.recipe,
        photos: createPostDto.photos || [],
        category: createPostDto.category,
      });

      if (result.length === 0) {
        throw new NotFoundException('User not found');
      }

      const post = result[0].p.properties;
      return post;
    } catch (error) {
      throw new BadRequestException(`Failed to create post: ${error.message}`);
    }
  }

  async findAll(options: { limit?: number; offset?: number; sortBy?: string }): Promise<any[]> {
    try {
      const limit = options.limit || 20;
      const offset = options.offset || 0;
      
      // Validate sortBy to prevent injection
      const validSortFields = ['created_at', 'avg_rating', 'likes_count'];
      const sortBy = validSortFields.includes(options.sortBy) ? options.sortBy : 'created_at';

      const query = `
        MATCH (p:Post)
        OPTIONAL MATCH (u:User)-[:CREATED]->(p)
        RETURN p, u AS author
        ORDER BY p.${sortBy} DESC
        SKIP $offset
        LIMIT $limit
      `;

      const result = await this.neo4jService.read(query, { limit, offset });
      return result.map(r => ({
        ...r.p.properties,
        author: r.author?.properties,
      }));
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new BadRequestException(`Failed to fetch posts: ${error.message}`);
    }
  }

  async findByCategory(options: { category: string; limit?: number; offset?: number; sortBy?: string }): Promise<any[]> {
    try {
      const { category } = options;
      if (!category || !(POST_CATEGORIES as unknown as string[]).includes(category)) {
        throw new BadRequestException('Invalid category');
      }

      const limit = options.limit || 20;
      const offset = options.offset || 0;
      const validSortFields = ['created_at', 'avg_rating', 'likes_count'];
      const sortBy = validSortFields.includes(options.sortBy) ? options.sortBy : 'created_at';

      const query = `
        MATCH (p:Post { category: $category })
        OPTIONAL MATCH (u:User)-[:CREATED]->(p)
        RETURN p, u AS author
        ORDER BY p.${sortBy} DESC
        SKIP $offset
        LIMIT $limit
      `;

      const result = await this.neo4jService.read(query, { category, limit, offset });
      return result.map(r => ({
        ...r.p.properties,
        author: r.author?.properties,
      }));
    } catch (error) {
      console.error('Error in findByCategory:', error);
      throw new BadRequestException(`Failed to fetch posts by category: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<any> {
    const query = `
      MATCH (p:Post { id: $id })
      OPTIONAL MATCH (p)-[:HAS_TAG]->(t:Tag)
      OPTIONAL MATCH (p)-[:HAS_INGREDIENT]->(i:Ingredient)
      OPTIONAL MATCH (u:User)-[:CREATED]->(p)
      OPTIONAL MATCH (p)<-[:REVIEWED]-(r:Review)
      RETURN p, collect(distinct t) as tags, collect(distinct i) as ingredients, u as author, collect(distinct r) as reviews
    `;

    const result = await this.neo4jService.read(query, { id });

    if (result.length === 0) {
      throw new NotFoundException('Post not found');
    }

    const record = result[0];
    return {
      ...record.p.properties,
      tags: record.tags.map(t => t.properties),
      ingredients: record.ingredients.map(i => i.properties),
      author: record.author?.properties,
      reviews: record.reviews.map(r => r.properties),
    };
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<any> {
    try {
      const query = `
        MATCH (p:Post { id: $id })
        SET p += $data
        RETURN p
      `;

      const result = await this.neo4jService.write(query, {
        id,
        data: updatePostDto,
      });

      if (result.length === 0) {
        throw new NotFoundException('Post not found');
      }

      return result[0].p.properties;
    } catch (error) {
      throw new BadRequestException(`Failed to update post: ${error.message}`);
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const query = `
      MATCH (p:Post { id: $id })
      DETACH DELETE p
      RETURN id(p) as deletedId
    `;

    const result = await this.neo4jService.write(query, { id });

    if (result.length === 0) {
      throw new NotFoundException('Post not found');
    }

    return { message: 'Post deleted successfully' };
  }

  async likePost(postId: string, userId: string): Promise<any> {
    try {
      const query = `
        MATCH (u:User { id: $userId }), (p:Post { id: $postId })
        MERGE (u)-[r:LIKES]->(p)
        ON CREATE SET r.created_at = datetime(), p.likes_count = p.likes_count + 1
        RETURN p, r as likeRel;
      `;

      const result = await this.neo4jService.write(query, { postId, userId });

      if (result.length === 0) {
        throw new NotFoundException('Post or User not found');
      }

      const p = result[0].p.properties;
      const rel = result[0].likeRel?.properties;
      return { ...p, liked_at: rel?.created_at };
    } catch (error) {
      throw new BadRequestException(`Failed to like post: ${error.message}`);
    }
  }

  async unlikePost(postId: string, userId: string): Promise<any> {
    try {
      const query = `
        MATCH (u:User { id: $userId })-[r:LIKES]->(p:Post { id: $postId })
        DELETE r
        SET p.likes_count = p.likes_count - 1
        RETURN p;
      `;

      const result = await this.neo4jService.write(query, { postId, userId });

      if (result.length === 0) {
        throw new NotFoundException('Like relationship not found');
      }

      return result[0].p.properties;
    } catch (error) {
      throw new BadRequestException(`Failed to unlike post: ${error.message}`);
    }
  }

  async isLiked(postId: string, userId: string): Promise<boolean> {
    const query = `
      MATCH (u:User { id: $userId }), (p:Post { id: $postId })
      RETURN EXISTS((u)-[:LIKES]->(p)) AS liked
    `;
    const result = await this.neo4jService.read(query, { postId, userId });
    if (!result || result.length === 0 || typeof result[0].liked === 'undefined') {
      return false;
    }
    return !!result[0].liked;
  }

  async getReviews(postId: string): Promise<any[]> {
    const query = `
      MATCH (p:Post { id: $postId })<-[:REVIEWED]-(r:Review)
      OPTIONAL MATCH (u:User)-[:CREATED]->(r)
      RETURN r, u as author
      ORDER BY r.created_at DESC
      LIMIT 100
    `;

    const result = await this.neo4jService.read(query, { postId });
    return result.map(r => ({
      ...r.r.properties,
      author: r.author?.properties,
    }));
  }
  
  async getReviewsCount(postId: string): Promise<number> {
    const query = `
      MATCH (p:Post { id: $postId })<-[:REVIEWED]-(r:Review)
      RETURN count(r) as reviewCount
    `;
    const result = await this.neo4jService.read(query, { postId });
    return result[0].reviewCount.toNumber();
  }


  async getTags(postId: string): Promise<any[]> {
    const query = `
      MATCH (p:Post { id: $postId })-[:HAS_TAG]->(t:Tag)
      RETURN t
      LIMIT 50
    `;

    const result = await this.neo4jService.read(query, { postId });
    return result.map(r => r.t.properties);
  }

  async getIngredients(postId: string): Promise<any[]> {
    const query = `
      MATCH (p:Post { id: $postId })-[:HAS_INGREDIENT]->(i:Ingredient)
      RETURN i
      LIMIT 100
    `;

    const result = await this.neo4jService.read(query, { postId });
    return result.map(r => r.i.properties);
  }

  async addTag(postId: string, tagId: string): Promise<{ message: string }> {
    try {
      const query = `
        MATCH (p:Post { id: $postId }), (t:Tag { id: $tagId })
        MERGE (p)-[:HAS_TAG]->(t)
        RETURN p, t
      `;

      await this.neo4jService.write(query, { postId, tagId });
      return { message: 'Tag added to post successfully' };
    } catch (error) {
      throw new BadRequestException(`Failed to add tag: ${error.message}`);
    }
  }

  async addIngredient(postId: string, ingredientId: string): Promise<{ message: string }> {
    try {
      const query = `
        MATCH (p:Post { id: $postId }), (i:Ingredient { id: $ingredientId })
        MERGE (p)-[:HAS_INGREDIENT]->(i)
        RETURN p, i
      `;

      await this.neo4jService.write(query, { postId, ingredientId });
      return { message: 'Ingredient added to post successfully' };
    } catch (error) {
      throw new BadRequestException(`Failed to add ingredient: ${error.message}`);
    }
  }

  async searchPosts(query: string): Promise<any[]> {
    const searchQuery = `
      MATCH (p:Post)
      WHERE p.title CONTAINS $query OR p.content CONTAINS $query OR p.recipe CONTAINS $query
      RETURN p
      LIMIT 50
    `;

    const result = await this.neo4jService.read(searchQuery, { query });
    return result.map(r => r.p.properties);
  }
}
