import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  async createTag(@Body() createTagDto: CreateTagDto) {
    return await this.tagsService.create(createTagDto);
  }

  @Get()
  async getAllTags() {
    return await this.tagsService.findAll();
  }

  @Get('popular')
  async getPopularTags() {
    return await this.tagsService.findPopular();
  }

  @Get(':id')
  async getTagById(@Param('id') id: string) {
    const tag = await this.tagsService.findOne(id);
    if (!tag) {
      throw new HttpException('Tag not found', HttpStatus.NOT_FOUND);
    }
    return tag;
  }

  @Put(':id')
  async updateTag(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return await this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  async deleteTag(@Param('id') id: string) {
    return await this.tagsService.remove(id);
  }

  @Get(':id/posts')
  async getPostsByTag(@Param('id') id: string) {
    return await this.tagsService.getPostsByTag(id);
  }
}
