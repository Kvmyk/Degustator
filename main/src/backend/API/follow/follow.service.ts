import { Injectable, BadRequestException } from '@nestjs/common';
import { Neo4jService } from '../../db/neo4j.service';

@Injectable()
export class FollowService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async followUser(followerId: string, followeeId: string) {
    if (followerId === followeeId) throw new BadRequestException('Nie możesz obserwować samego siebie');
    
    await this.neo4jService.write(
      `MATCH (follower:User {id: $followerId}), (followee:User {id: $followeeId})
       MERGE (follower)-[:FOLLOWS]->(followee)`,
      { followerId, followeeId }
    );

    return { message: `Obserwujesz użytkownika ${followeeId}` };
  }

  async unfollowUser(followerId: string, followeeId: string) {
    await this.neo4jService.write(
      `MATCH (follower:User {id: $followerId})-[r:FOLLOWS]->(followee:User {id: $followeeId})
       DELETE r`,
      { followerId, followeeId }
    );

    return { message: `Przestałeś obserwować użytkownika ${followeeId}` };
  }

  async isFollowing(followerId: string, followeeId: string) {
    const result = await this.neo4jService.read(
      `MATCH (follower:User {id: $followerId})-[r:FOLLOWS]->(followee:User {id: $followeeId})
       RETURN COUNT(r) > 0 AS following`,
      { followerId, followeeId }
    );

    return result[0]?.following ?? false;
  }
}
