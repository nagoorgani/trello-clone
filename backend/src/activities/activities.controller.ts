import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get('board/:boardId')
  @ApiOperation({ summary: 'Get recent activity log for a board' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getBoardActivities(
    @Param('boardId') boardId: string,
    @Query('limit') limit?: number,
  ) {
    return this.activitiesService.getBoardActivities(boardId, limit ? Number(limit) : 50);
  }

  @Get('card/:cardId')
  @ApiOperation({ summary: 'Get recent activity log for a card' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getCardActivities(
    @Param('cardId') cardId: string,
    @Query('limit') limit?: number,
  ) {
    return this.activitiesService.getCardActivities(cardId, limit ? Number(limit) : 50);
  }
}
