import { Injectable, BadRequestException } from '@nestjs/common';
import { Neo4jService } from '../../db/neo4j.service';

@Injectable()
export class RecommendationsService {
    constructor(private readonly neo4jService: Neo4jService) { }

    async getRecommendations(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
        console.log('[Recommendations] Getting recommendations for userId:', userId);
        try {
            // Fetch pre-computed recommendations from Python ML script
            // These are stored as (User)-[:RECOMMENDED]->(Post) relationships
            const query = `
                MATCH (u:User { id: $userId })-[r:RECOMMENDED]->(p:Post)
                OPTIONAL MATCH (author:User)-[:CREATED]->(p)
                RETURN p, author, r.score as score
                ORDER BY r.score DESC
                SKIP $offset
                LIMIT $limit
            `;

            const result = await this.neo4jService.read(query, { userId, limit, offset });
            console.log('[Recommendations] Found', result.length, 'pre-computed recommendations');

            let recommendations = result.map(r => ({
                ...r.p.properties,
                author: r.author?.properties,
                __recommendationScore: r.score
            }));

            // Fallback to trending if no pre-computed recommendations
            if (recommendations.length < limit) {
                const trendingQuery = `
                    MATCH (u:User { id: $userId })
                    MATCH (p:Post)
                    WHERE NOT (u)-[:LIKES]->(p)
                      AND NOT (u)-[:CREATED]->(p)
                      AND NOT (u)-[:RECOMMENDED]->(p)
                    OPTIONAL MATCH (author:User)-[:CREATED]->(p)
                    RETURN p, author
                    ORDER BY p.likes_count DESC, p.created_at DESC
                    LIMIT $limit
                `;
                const trending = await this.neo4jService.read(trendingQuery, { userId, limit: limit - recommendations.length });
                const trendingPosts = trending.map(r => ({
                    ...r.p.properties,
                    author: r.author?.properties,
                    __isTrending: true
                }));

                // Filter out duplicates
                const existingIds = new Set(recommendations.map(r => r.id));
                const newTrending = trendingPosts.filter(p => !existingIds.has(p.id));

                recommendations = [...recommendations, ...newTrending];
            }

            return recommendations;
        } catch (error) {
            console.error("Recommendation error:", error);
            // Fallback to simple latest posts on error
            return [];
        }
    }

    async getGuestRecommendations(limit: number = 20): Promise<any[]> {
        const query = `
        MATCH (p:Post)
        OPTIONAL MATCH (u:User)-[:CREATED]->(p)
        RETURN p, u as author
        ORDER BY p.likes_count DESC, p.created_at DESC
        LIMIT $limit
      `;
        const result = await this.neo4jService.read(query, { limit });
        return result.map(r => ({
            ...r.p.properties,
            author: r.author?.properties
        }));
    }
}
