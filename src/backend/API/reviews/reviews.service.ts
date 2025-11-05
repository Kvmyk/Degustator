import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Neo4jService } from '../../db/neo4j.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private neo4jService: Neo4jService) {}

  async create(createReviewDto: CreateReviewDto): Promise<any> {
    try {
      const query = `
        MATCH (u:User { id: $userId }), (p:Post { id: $postId })
        CREATE (r:Review {
          id: randomUUID(),
          rating: $rating,
          content: $content,
          created_at: datetime()
        })
        CREATE (u)-[:CREATED]->(r)
        CREATE (r)-[:REVIEWED]->(p)
        WITH p, r
        MATCH (p)<-[:REVIEWED]-(reviews:Review)
        WITH p, avg(reviews.rating) as avg_rating
        SET p.avg_rating = avg_rating
        RETURN r
      `;

      const result = await this.neo4jService.write(query, {
        userId: createReviewDto.userId,
        postId: createReviewDto.postId,
        rating: createReviewDto.rating,
        content: createReviewDto.content || null,
      });

      if (result.length === 0) {
        throw new NotFoundException('User or Post not found');
      }

      return result[0].r.properties;
    } catch (error) {
      throw new BadRequestException(`Failed to create review: ${error.message}`);
    }
  }

  async findAll(): Promise<any[]> {
    const query = `
      MATCH (r:Review)
      OPTIONAL MATCH (u:User)-[:CREATED]->(r)
      OPTIONAL MATCH (r)-[:REVIEWED]->(p:Post)
      RETURN r, u as author, p as post
      ORDER BY r.created_at DESC
      LIMIT 100
    `;

    const result = await this.neo4jService.read(query);
    return result.map(r => ({
      ...r.r.properties,
      author: r.author?.properties,
      post: r.post?.properties,
    }));
  }

  async findByPost(postId: string): Promise<any[]> {
    const query = `
      MATCH (r:Review)-[:REVIEWED]->(p:Post { id: $postId })
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

  async findByUser(userId: string): Promise<any[]> {
    const query = `
      MATCH (u:User { id: $userId })-[:CREATED]->(r:Review)
      OPTIONAL MATCH (r)-[:REVIEWED]->(p:Post)
      RETURN r, p as post
      ORDER BY r.created_at DESC
      LIMIT 100
    `;

    const result = await this.neo4jService.read(query, { userId });
    return result.map(r => ({
      ...r.r.properties,
      post: r.post?.properties,
    }));
  }

  async findOne(id: string): Promise<any> {
    const query = `
      MATCH (r:Review { id: $id })
      OPTIONAL MATCH (u:User)-[:CREATED]->(r)
      OPTIONAL MATCH (r)-[:REVIEWED]->(p:Post)
      RETURN r, u as author, p as post
    `;

    const result = await this.neo4jService.read(query, { id });

    if (result.length === 0) {
      throw new NotFoundException('Review not found');
    }

    const record = result[0];
    return {
      ...record.r.properties,
      author: record.author?.properties,
      post: record.post?.properties,
    };
  }

  async update(id: string, updateReviewDto: UpdateReviewDto): Promise<any> {
    try {
      const query = `
        MATCH (r:Review { id: $id })
        SET r += $data
        RETURN r
      `;

      const result = await this.neo4jService.write(query, {
        id,
        data: updateReviewDto,
      });

      if (result.length === 0) {
        throw new NotFoundException('Review not found');
      }

      return result[0].r.properties;
    } catch (error) {
      throw new BadRequestException(`Failed to update review: ${error.message}`);
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const query = `
        MATCH (r:Review { id: $id })-[:REVIEWED]->(p:Post)
        DETACH DELETE r
        WITH p
        MATCH (p)<-[:REVIEWED]-(reviews:Review)
        WITH p, avg(reviews.rating) as avg_rating
        SET p.avg_rating = avg_rating
        RETURN id(r) as deletedId
      `;

      const result = await this.neo4jService.write(query, { id });

      if (result.length === 0) {
        throw new NotFoundException('Review not found');
      }

      return { message: 'Review deleted successfully' };
    } catch (error) {
      throw new BadRequestException(`Failed to delete review: ${error.message}`);
    }
  }
}
