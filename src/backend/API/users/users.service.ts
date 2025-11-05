import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Neo4jService } from '../../db/neo4j.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private neo4jService: Neo4jService) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const query = `
        CREATE (u:User {
          id: randomUUID(),
          name: $name,
          email: $email,
          password_hash: $password_hash,
          photo_url: $photo_url,
          bio: $bio,
          created_at: datetime()
        })
        RETURN u
      `;

      const result = await this.neo4jService.write(query, {
        name: createUserDto.name,
        email: createUserDto.email,
        password_hash: hashedPassword,
        photo_url: createUserDto.photo_url || null,
        bio: createUserDto.bio || null,
      });

      const user = result[0].u.properties;
      return this.excludePassword(user);
    } catch (error) {
      throw new BadRequestException(`Failed to create user: ${error.message}`);
    }
  }

  async findAll(): Promise<any[]> {
    const query = `
      MATCH (u:User)
      RETURN u
      LIMIT 100
    `;

    const result = await this.neo4jService.read(query);
    return result.map(r => this.excludePassword(r.u.properties));
  }

  async findOne(id: string): Promise<any> {
    const query = `
      MATCH (u:User { id: $id })
      RETURN u
    `;

    const result = await this.neo4jService.read(query, { id });

    if (result.length === 0) {
      throw new NotFoundException('User not found');
    }

    return this.excludePassword(result[0].u.properties);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    try {
      const query = `
        MATCH (u:User { id: $id })
        SET u += $data
        RETURN u
      `;

      const result = await this.neo4jService.write(query, {
        id,
        data: updateUserDto,
      });

      if (result.length === 0) {
        throw new NotFoundException('User not found');
      }

      return this.excludePassword(result[0].u.properties);
    } catch (error) {
      throw new BadRequestException(`Failed to update user: ${error.message}`);
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const query = `
      MATCH (u:User { id: $id })
      DETACH DELETE u
      RETURN id(u) as deletedId
    `;

    const result = await this.neo4jService.write(query, { id });

    if (result.length === 0) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }

  async getFollowers(userId: string): Promise<any[]> {
    const query = `
      MATCH (u:User { id: $userId })<-[:FOLLOWS]-(follower:User)
      RETURN follower
      LIMIT 50
    `;

    const result = await this.neo4jService.read(query, { userId });
    return result.map(r => this.excludePassword(r.follower.properties));
  }

  async getFollowing(userId: string): Promise<any[]> {
    const query = `
      MATCH (u:User { id: $userId })-[:FOLLOWS]->(following:User)
      RETURN following
      LIMIT 50
    `;

    const result = await this.neo4jService.read(query, { userId });
    return result.map(r => this.excludePassword(r.following.properties));
  }

  async followUser(userId: string, targetUserId: string): Promise<{ message: string }> {
    try {
      const query = `
        MATCH (u:User { id: $userId }), (f:User { id: $targetUserId })
        MERGE (u)-[:FOLLOWS]->(f)
        RETURN u, f
      `;

      await this.neo4jService.write(query, { userId, targetUserId });
      return { message: 'User followed successfully' };
    } catch (error) {
      throw new BadRequestException(`Failed to follow user: ${error.message}`);
    }
  }

  async unfollowUser(userId: string, targetUserId: string): Promise<{ message: string }> {
    try {
      const query = `
        MATCH (u:User { id: $userId })-[r:FOLLOWS]->(f:User { id: $targetUserId })
        DELETE r
        RETURN u, f
      `;

      await this.neo4jService.write(query, { userId, targetUserId });
      return { message: 'User unfollowed successfully' };
    } catch (error) {
      throw new BadRequestException(`Failed to unfollow user: ${error.message}`);
    }
  }

  async getUserPosts(userId: string): Promise<any[]> {
    const query = `
      MATCH (u:User { id: $userId })-[:CREATED]->(p:Post)
      RETURN p
      ORDER BY p.created_at DESC
      LIMIT 50
    `;

    const result = await this.neo4jService.read(query, { userId });
    return result.map(r => r.p.properties);
  }

  async getLikedPosts(userId: string): Promise<any[]> {
    const query = `
      MATCH (u:User { id: $userId })-[:LIKES]->(p:Post)
      RETURN p
      ORDER BY p.created_at DESC
      LIMIT 50
    `;

    const result = await this.neo4jService.read(query, { userId });
    return result.map(r => r.p.properties);
  }

  private excludePassword(user: any): any {
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
