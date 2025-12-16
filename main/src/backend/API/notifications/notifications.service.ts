import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Neo4jService } from '../../db/neo4j.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getUserNotifications(userId: string): Promise<any[]> {
    const query = `
      MATCH (u:User { id: $userId })-[:HAS_NOTIFICATION]->(n:Notification)
      OPTIONAL MATCH (n)-[:ABOUT_POST]->(p:Post)
      OPTIONAL MATCH (author:User)-[:CREATED]->(p)
      RETURN n, p, author
      ORDER BY n.created_at DESC
      LIMIT 100
    `;

    const result = await this.neo4jService.read(query, { userId });

    return result.map(r => ({
      ...r.n.properties,
      post: r.p
        ? {
            ...r.p.properties,
            author: r.author ? r.author.properties : null,
          }
        : null,
    }));
  }

  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    const query = `
      MATCH (n:Notification { id: $notificationId })
      WITH n
      DETACH DELETE n
      RETURN 1 as deletedCount
    `;

    const result = await this.neo4jService.write(query, { notificationId });

    if (!result || result.length === 0) {
      throw new NotFoundException('Notification not found');
    }

    return { message: 'Notification deleted successfully' };
  }

  async createPostNotifications(authorId: string, postId: string, postTitle?: string): Promise<void> {
    try {
      const message = postTitle
        ? `New post from user you follow: ${postTitle}`
        : 'New post from a user you follow';

      const query = `
        MATCH (author:User { id: $authorId })
        MATCH (p:Post { id: $postId })
        MATCH (follower:User)-[:FOLLOWS]->(author)
        CREATE (n:Notification {
          id: randomUUID(),
          type: 'NEW_POST',
          message: $message,
          created_at: datetime()
        })
        CREATE (follower)-[:HAS_NOTIFICATION]->(n)
        CREATE (n)-[:ABOUT_POST]->(p)
        RETURN count(n) as createdCount
      `;

      await this.neo4jService.write(query, { authorId, postId, message });
    } catch (error: any) {
      // Do not fail the main operation if notifications fail
      throw new BadRequestException(`Failed to create notifications: ${error.message}`);
    }
  }
}
