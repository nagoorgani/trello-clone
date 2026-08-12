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
import { BoardsService } from './boards.service';
import { CreateBoardDto, UpdateBoardDto, InviteBoardMemberDto } from './dto/board.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Boards')
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new board' })
  create(@GetUser('id') userId: string, @Body() dto: CreateBoardDto) {
    return this.boardsService.create(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get complete board data with lists, cards, and labels' })
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.boardsService.findOne(id, userId);
  }

  @Public()
  @Get(':id/public')
  @ApiOperation({ summary: 'Get public board data without authentication' })
  findPublic(@Param('id') id: string) {
    return this.boardsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update board settings, title, or background' })
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.boardsService.update(id, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/star')
  @ApiOperation({ summary: 'Toggle starred / favorite state for a board' })
  toggleStar(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.boardsService.toggleStar(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate an entire board with lists and cards' })
  duplicate(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.boardsService.duplicate(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a board' })
  delete(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.boardsService.delete(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/members')
  @ApiOperation({ summary: 'Invite a member to the board' })
  inviteMember(
    @Param('id') id: string,
    @GetUser('id') actorId: string,
    @Body() dto: InviteBoardMemberDto,
  ) {
    return this.boardsService.inviteMember(id, actorId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove a member from the board' })
  removeMember(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @GetUser('id') actorId: string,
  ) {
    return this.boardsService.removeMember(id, actorId, targetUserId);
  }
}
