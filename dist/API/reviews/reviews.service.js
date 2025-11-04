"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const neo4j_service_1 = require("../../db/neo4j.service");
let ReviewsService = class ReviewsService {
    constructor(neo4jService) {
        this.neo4jService = neo4jService;
    }
    async create(createReviewDto) {
        try {
            const query = `
        MATCH (u:User { id: $userId }), (p:Post { id: $postId })
        CREATE (r:Review {
          id: apoc.create.uuid(),
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
                throw new common_1.NotFoundException('User or Post not found');
            }
            return result[0].r.properties;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to create review: ${error.message}`);
        }
    }
    async findByPost(postId) {
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
    async findByUser(userId) {
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
    async findOne(id) {
        const query = `
      MATCH (r:Review { id: $id })
      OPTIONAL MATCH (u:User)-[:CREATED]->(r)
      OPTIONAL MATCH (r)-[:REVIEWED]->(p:Post)
      RETURN r, u as author, p as post
    `;
        const result = await this.neo4jService.read(query, { id });
        if (result.length === 0) {
            throw new common_1.NotFoundException('Review not found');
        }
        const record = result[0];
        return {
            ...record.r.properties,
            author: record.author?.properties,
            post: record.post?.properties,
        };
    }
    async update(id, updateReviewDto) {
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
                throw new common_1.NotFoundException('Review not found');
            }
            return result[0].r.properties;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to update review: ${error.message}`);
        }
    }
    async remove(id) {
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
                throw new common_1.NotFoundException('Review not found');
            }
            return { message: 'Review deleted successfully' };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to delete review: ${error.message}`);
        }
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [neo4j_service_1.Neo4jService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map