import { Injectable, BadRequestException } from '@nestjs/common';
import { Neo4jService } from '../../db/neo4j.service';

@Injectable()
export class RecommendationsService {
    constructor(private readonly neo4jService: Neo4jService) { }

    async getRecommendations(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
        try {
            // Hybrid Recommendation Query
            // 1. Collaborative Filtering: Posts liked by users who liked the same posts as current user
            // 2. Content-Based: Posts with tags similar to posts liked by current user
            // 3. Fallback: Trending posts (if no history or not enough recommendations)

            const query = `
        MATCH (u:User { id: $userId })
        
        // 1. Find similar users (users who liked same posts)
        OPTIONAL MATCH (u)-[:LIKES]->(p:Post)<-[:LIKES]-(other:User)
        WHERE other.id <> $userId
        WITH u, collect(distinct other) as similarUsers
        
        // 2. Find posts liked by similar users (Collaborative)
        OPTIONAL MATCH (other)-[:LIKES]->(recPost:Post)
        WHERE other in similarUsers AND NOT (u)-[:LIKES]->(recPost) AND NOT (u)-[:CREATED]->(recPost)
        WITH u, recPost, count(other) as strength
        ORDER BY strength DESC
        
        // 3. Find posts with similar tags (Content-based)
        OPTIONAL MATCH (u)-[:LIKES]->(:Post)-[:HAS_TAG]->(t:Tag)<-[:HAS_TAG]-(tagPost:Post)
        WHERE NOT (u)-[:LIKES]->(tagPost) AND NOT (u)-[:CREATED]->(tagPost)
        
        // Combine and score
        WITH recPost, strength, tagPost
        WITH collect({post: recPost, score: strength * 2}) + collect({post: tagPost, score: 1}) as candidates
        UNWIND candidates as c
        WITH c.post as post, sum(c.score) as finalScore
        WHERE post IS NOT NULL
        
        // Fetch details
        MATCH (post)
        OPTIONAL MATCH (author:User)-[:CREATED]->(post)
        RETURN post, author, finalScore
        ORDER BY finalScore DESC
        SKIP $offset
        LIMIT $limit
      `;

            const result = await this.neo4jService.read(query, { userId, limit, offset });

            let recommendations = result.map(r => ({
                ...r.post.properties,
                author: r.author?.properties,
                __recommendationScore: r.finalScore
            }));

            // Fallback to trending if few recommendations
            if (recommendations.length < limit) {
                const trendingQuery = `
           MATCH (u:User { id: $userId })
           MATCH (p:Post)
           WHERE p.created_at > datetime() - duration('P30D')
             AND NOT (u)-[:LIKES]->(p)
             AND NOT (u)-[:CREATED]->(p)
           OPTIONAL MATCH (author:User)-[:CREATED]->(p)
           RETURN p, author
           ORDER BY p.likes_count + p.avg_rating DESC
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
