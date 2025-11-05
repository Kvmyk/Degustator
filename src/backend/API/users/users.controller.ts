import { Controller, Get, Post, Put, Delete, Body, Param, HttpStatus, HttpException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw new HttpException('Failed to create user', HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async getAllUsers() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }

  @Get(':id/followers')
  async getUserFollowers(@Param('id') id: string) {
    return await this.usersService.getFollowers(id);
  }

  @Get(':id/following')
  async getUserFollowing(@Param('id') id: string) {
    return await this.usersService.getFollowing(id);
  }

  @Post(':id/follow/:targetId')
  async followUser(@Param('id') id: string, @Param('targetId') targetId: string) {
    return await this.usersService.followUser(id, targetId);
  }

  @Delete(':id/follow/:targetId')
  async unfollowUser(@Param('id') id: string, @Param('targetId') targetId: string) {
    return await this.usersService.unfollowUser(id, targetId);
  }

  @Get(':id/posts')
  async getUserPosts(@Param('id') id: string) {
    return await this.usersService.getUserPosts(id);
  }

  @Get(':id/liked-posts')
  async getUserLikedPosts(@Param('id') id: string) {
    return await this.usersService.getLikedPosts(id);
  }
}
