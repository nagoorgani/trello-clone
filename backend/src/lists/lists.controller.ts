import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ListsService } from './lists.service';
import { CreateListDto, UpdateListDto, ReorderListDto } from './dto/list.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Lists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new list on a board' })
  create(@GetUser('id') userId: string, @Body() dto: CreateListDto) {
    return this.listsService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update list title, position, or archive state' })
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateListDto,
  ) {
    return this.listsService.update(id, userId, dto);
  }

  @Patch(':id/reorder')
  @ApiOperation({ summary: 'Reorder list within board' })
  reorder(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: ReorderListDto,
  ) {
    return this.listsService.reorder(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a list' })
  delete(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.listsService.delete(id, userId);
  }
}
