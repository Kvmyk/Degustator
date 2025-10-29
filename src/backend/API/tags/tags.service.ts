import { Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  async create(createTagDto: CreateTagDto): Promise<Tag> {
    // TODO: Implement tag creation
    throw new Error('Method not implemented');
  }

  async findAll(): Promise<Tag[]> {
    // TODO: Get all tags
    throw new Error('Method not implemented');
  }

  async findPopular(): Promise<Tag[]> {
    // TODO: Get tags sorted by popularity
    throw new Error('Method not implemented');
  }

  async findOne(id: string): Promise<Tag> {
    // TODO: Get single tag
    throw new Error('Method not implemented');
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    // TODO: Update tag
    throw new Error('Method not implemented');
  }

  async remove(id: string): Promise<void> {
    // TODO: Delete tag
    throw new Error('Method not implemented');
  }

  async getPostsByTag(tagId: string): Promise<any[]> {
    // TODO: Get all posts with this tag via HAS_TAG relationship
    throw new Error('Method not implemented');
  }
}
