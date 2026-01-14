import { Controller, Post, Delete, Get, Param, UseGuards, Req } from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post(':id')
@UseGuards(JwtAuthGuard)
async follow(@Req() req, @Param('id') targetUserId: string) {
  const followerId = req.user.sub; // poprawka
  return this.followService.followUser(followerId, targetUserId);
}

@Get('is-following/:id')
@UseGuards(JwtAuthGuard)
async isFollowing(@Req() req, @Param('id') targetUserId: string) {
  const followerId = req.user.sub; // poprawka
  return this.followService.isFollowing(followerId, targetUserId);
}

@Delete(':id')
@UseGuards(JwtAuthGuard)
async unfollow(@Req() req, @Param('id') targetUserId: string) {
  const followerId = req.user.sub; // poprawka
  return this.followService.unfollowUser(followerId, targetUserId);
}

}
