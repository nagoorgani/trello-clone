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
import { ChecklistsService } from './checklists.service';
import {
  CreateChecklistDto,
  UpdateChecklistDto,
  CreateChecklistItemDto,
  UpdateChecklistItemDto,
} from './dto/checklist.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Checklists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('checklists')
export class ChecklistsController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new checklist on a card' })
  createChecklist(@GetUser('id') userId: string, @Body() dto: CreateChecklistDto) {
    return this.checklistsService.createChecklist(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update checklist title' })
  updateChecklist(@Param('id') id: string, @Body() dto: UpdateChecklistDto) {
    return this.checklistsService.updateChecklist(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a checklist' })
  deleteChecklist(@Param('id') id: string) {
    return this.checklistsService.deleteChecklist(id);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add an item to a checklist' })
  addItem(@Param('id') checklistId: string, @Body() dto: CreateChecklistItemDto) {
    return this.checklistsService.addItem(checklistId, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update item completion state, title or position' })
  updateItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateChecklistItemDto,
  ) {
    return this.checklistsService.updateItem(itemId, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Delete an item from a checklist' })
  deleteItem(@Param('itemId') itemId: string) {
    return this.checklistsService.deleteItem(itemId);
  }
}
