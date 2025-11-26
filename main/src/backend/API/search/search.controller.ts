import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchPostsDto, SearchUsersDto } from './dto/search.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('posts')
  async searchPosts(@Query() searchDto: SearchPostsDto) {
    try {
      const results = await this.searchService.searchPosts(searchDto);
      return {
        success: true,
        count: results.length,
        data: results,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Search failed',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('users')
  async searchUsers(@Query() searchDto: SearchUsersDto) {
    try {
      const results = await this.searchService.searchUsers(searchDto);
      return {
        success: true,
        count: results.length,
        data: results,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Search failed',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }
  
  // ❌ USUNĄŁ: @Get('ingredients') endpoint - nie jest potrzebny
}