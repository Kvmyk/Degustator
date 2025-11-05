import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Neo4jService } from '../../db/neo4j.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private neo4jService: Neo4jService) {}

  async create(createTagDto: CreateTagDto): Promise<any> {
    try {
      const query = `
        CREATE (t:Tag {
          id: randomUUID(),
          name: $name,
          description: $description,
          popularity: 0,
          created_at: datetime()
        })
        RETURN t
      `;

      const result = await this.neo4jService.write(query, {
        name: createTagDto.name,
        description: createTagDto.description || null,
      });

      return result[0].t.properties;
    } catch (error) {
      throw new BadRequestException(`Failed to create tag: ${error.message}`);
    }
  }

  async findAll(): Promise<any[]> {
    const query = `
      MATCH (t:Tag)
      RETURN t
      LIMIT 100
    `;

    const result = await this.neo4jService.read(query);
    return result.map(r => r.t.properties);
  }

  async findPopular(): Promise<any[]> {
    const query = `
      MATCH (t:Tag)
      RETURN t
      ORDER BY t.popularity DESC
      LIMIT 50
    `;

    const result = await this.neo4jService.read(query);
    return result.map(r => r.t.properties);
  }

  async findOne(id: string): Promise<any> {
    const query = `
      MATCH (t:Tag { id: $id })
      RETURN t
    `;

    const result = await this.neo4jService.read(query, { id });

    if (result.length === 0) {
      throw new NotFoundException('Tag not found');
    }

    return result[0].t.properties;
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<any> {
    try {
      const query = `
        MATCH (t:Tag { id: $id })
        SET t += $data
        RETURN t
      `;

      const result = await this.neo4jService.write(query, {
        id,
        data: updateTagDto,
      });

      if (result.length === 0) {
        throw new NotFoundException('Tag not found');
      }

      return result[0].t.properties;
    } catch (error) {
      throw new BadRequestException(`Failed to update tag: ${error.message}`);
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const query = `
      MATCH (t:Tag { id: $id })
      DETACH DELETE t
      RETURN id(t) as deletedId
    `;

    const result = await this.neo4jService.write(query, { id });

    if (result.length === 0) {
      throw new NotFoundException('Tag not found');
    }

    return { message: 'Tag deleted successfully' };
  }

  async getPostsByTag(tagId: string): Promise<any[]> {
    const query = `
      MATCH (t:Tag { id: $tagId })<-[:HAS_TAG]-(p:Post)
      RETURN p
      ORDER BY p.created_at DESC
      LIMIT 100
    `;

    const result = await this.neo4jService.read(query, { tagId });
    return result.map(r => r.p.properties);
  }
}
