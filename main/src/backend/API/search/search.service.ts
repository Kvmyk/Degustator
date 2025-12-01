import { Injectable, BadRequestException } from '@nestjs/common';
import { Neo4jService } from '../../db/neo4j.service';
import { SearchPostsDto, SearchUsersDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(private neo4jService: Neo4jService) { }

  async searchPosts(searchDto: SearchPostsDto): Promise<any[]> {
    try {
      console.log('='.repeat(50));
      console.log('START searchPosts');
      console.log('Input:', { searchDto });

      const query = searchDto.query?.trim();
      console.log('Query after trim:', query);

      if (!query || query.length < 2) {
        console.log('Query too short, returning []');
        return [];
      }

      let limit = parseInt(String(searchDto.limit || 20), 10);
      let offset = parseInt(String(searchDto.offset || 0), 10);

      if (isNaN(limit)) limit = 20;
      if (isNaN(offset)) offset = 0;

      console.log('Parsed limit/offset:', { limit, offset });

      const cypherQuery = `
        MATCH (p:Post)
        WHERE 
          toLower(p.title) CONTAINS toLower($query) OR
          toLower(p.content) CONTAINS toLower($query)
        OPTIONAL MATCH (u:User)-[:CREATED]->(p)
        RETURN p, u
        ORDER BY p.created_at DESC
        SKIP $offset
        LIMIT $limit
      `;

      console.log('Executing Cypher...');
      const result = await this.neo4jService.read(cypherQuery, {
        query,
        limit,
        offset
      });

      console.log('Raw result from Neo4j:');
      console.log(JSON.stringify(result, null, 2));
      console.log('Result is array?', Array.isArray(result));
      console.log('Result length:', result?.length);

      if (!Array.isArray(result)) {
        console.log('⚠️ Result is not array, wrapping...');
        return [];
      }

      console.log('Starting map...');
      const mapped = result.map((r: any, index: number) => {
        console.log(`\nMapping record ${index}:`);
        console.log('Record:', JSON.stringify(r, null, 2));
        console.log('r.p:', r.p);
        console.log('r.u:', r.u);

        try {
          const mapped = {
            id: r.p?.properties?.id || r.p?.id,
            title: r.p?.properties?.title || r.p?.title,
            content: r.p?.properties?.content || r.p?.content,
            created_at: r.p?.properties?.created_at || r.p?.created_at,
            author: {
              id: r.u?.properties?.id || r.u?.id,
              name: r.u?.properties?.name || r.u?.name,
            },
          };
          console.log('Mapped successfully:', mapped);
          return mapped;
        } catch (mapError) {
          console.error(`Error mapping record ${index}:`, mapError);
          throw mapError;
        }
      });

      console.log('✅ FINAL RESULT:', mapped);
      console.log('='.repeat(50));
      return mapped;

    } catch (error: any) {
      console.error('❌ ERROR in searchPosts:');
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.error('Full error:', error);
      console.log('='.repeat(50));
      throw new BadRequestException('Search failed: ' + error.message);
    }
  }

  async searchUsers(searchDto: SearchUsersDto): Promise<any[]> {
    try {
      console.log('='.repeat(50));
      console.log('START searchUsers');
      console.log('Input:', { searchDto });

      const query = searchDto.query?.trim();
      console.log('Query after trim:', query);

      if (!query || query.length < 2) {
        console.log('Query too short, returning []');
        return [];
      }

      let limit = parseInt(String(searchDto.limit || 10), 10);
      if (isNaN(limit)) limit = 10;

      console.log('Parsed limit:', { limit });

      const cypherQuery = `
        MATCH (u:User)
        WHERE 
          toLower(u.name) CONTAINS toLower($query) OR
          toLower(u.email) CONTAINS toLower($query)
        OPTIONAL MATCH (u)<-[:FOLLOWS]-(followers:User)
        OPTIONAL MATCH (u)-[:FOLLOWS]->(following:User)
        RETURN u, count(distinct followers) as followerCount, count(distinct following) as followingCount
        ORDER BY u.name ASC
        LIMIT $limit
      `;

      console.log('Executing Cypher...');
      const result = await this.neo4jService.read(cypherQuery, {
        query,
        limit
      });

      console.log('Raw result from Neo4j:');
      console.log(JSON.stringify(result, null, 2));

      if (!Array.isArray(result)) {
        console.log('⚠️ Result is not array, wrapping...');
        return [];
      }
      console.log('Starting map...');
      const mapped = result.map((r: any, index: number) => {
        console.log(`\nMapping record ${index}:`);
        console.log('Record:', JSON.stringify(r, null, 2));

        try {
          const toNumber = (val: any) => {
            if (val === null || val === undefined) return 0;
            if (typeof val === 'number') return val;
            if (val.toNumber) return val.toNumber(); // Neo4j Integer object
            if (val.low !== undefined) return val.low; // Plain object with low/high
            return Number(val) || 0;
          };

          const mapped = {
            id: r.u?.properties?.id || r.u?.id,
            name: r.u?.properties?.name || r.u?.name,
            email: r.u?.properties?.email || r.u?.email,
            bio: r.u?.properties?.bio || r.u?.bio,
            photo_url: r.u?.properties?.photo_url || r.u?.photo_url,
            followerCount: toNumber(r.followerCount),
            followingCount: toNumber(r.followingCount),
          };
          console.log('Mapped successfully:', mapped);
          return mapped;
        } catch (mapError) {
          console.error(`Error mapping record ${index}:`, mapError);
          throw mapError;
        }
      });

      console.log('✅ FINAL RESULT:', mapped);
      console.log('='.repeat(50));
      return mapped;

    } catch (error: any) {
      console.error('❌ ERROR in searchUsers:');
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.log('='.repeat(50));
      throw new BadRequestException('Search failed: ' + error.message);
    }
  }
}