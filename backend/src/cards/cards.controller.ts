import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import {
  CreateCardDto,
  UpdateCardDto,
  MoveCardDto,
  AssignMemberDto,
  ToggleLabelDto,
} from './dto/card.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new card in a list' })
  create(@GetUser('id') userId: string, @Body() dto: CreateCardDto) {
    return this.cardsService.create(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full card details including checklists, labels, and comments' })
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update card details (title, description, cover, due date)' })
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateCardDto,
  ) {
    return this.cardsService.update(id, userId, dto);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move card within list or to another list with new position' })
  move(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: MoveCardDto,
  ) {
    return this.cardsService.move(id, userId, dto);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Assign a member to the card' })
  assignMember(
    @Param('id') id: string,
    @GetUser('id') actorId: string,
    @Body() dto: AssignMemberDto,
  ) {
    return this.cardsService.assignMember(id, actorId, dto);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Unassign a member from the card' })
  removeMember(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.cardsService.removeMember(id, targetUserId);
  }

  @Post(':id/labels')
  @ApiOperation({ summary: 'Toggle label attachment on a card' })
  toggleLabel(
    @Param('id') id: string,
    @Body() dto: ToggleLabelDto,
  ) {
    return this.cardsService.toggleLabel(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a card' })
  delete(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.cardsService.delete(id, userId);
  }
}
