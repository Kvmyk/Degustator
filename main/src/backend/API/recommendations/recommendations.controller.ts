import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';

@Controller('recommendations')
export class RecommendationsController {
    constructor(private readonly recommendationsService: RecommendationsService) { }

    @Get()
    @UseGuards(OptionalAuthGuard)
    async getRecommendations(@Req() req, @Query('limit') limit: number, @Query('offset') offset: number) {
        const userId = req.user?.id;
        const limitNum = limit ? parseInt(limit.toString()) : 20;
        const offsetNum = offset ? parseInt(offset.toString()) : 0;

        if (userId) {
            return this.recommendationsService.getRecommendations(userId, limitNum, offsetNum);
        } else {
            return this.recommendationsService.getGuestRecommendations(limitNum);
        }
    }
}
