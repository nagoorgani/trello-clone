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
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto, InviteMemberDto, UpdateMemberRoleDto } from './dto/workspace.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Workspaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' })
  create(@GetUser('id') userId: string, @Body() dto: CreateWorkspaceDto) {
    return this.workspacesService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workspaces the authenticated user belongs to' })
  findAll(@GetUser('id') userId: string) {
    return this.workspacesService.findAllForUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workspace details by ID' })
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.workspacesService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workspace details' })
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workspace (Owner only)' })
  delete(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.workspacesService.delete(id, userId);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Invite a member to the workspace' })
  inviteMember(
    @Param('id') id: string,
    @GetUser('id') actorId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.workspacesService.inviteMember(id, actorId, dto);
  }

  @Patch(':id/members/:userId')
  @ApiOperation({ summary: 'Update a member role in the workspace' })
  updateMemberRole(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @GetUser('id') actorId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.workspacesService.updateMemberRole(id, actorId, targetUserId, dto);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove a member from the workspace' })
  removeMember(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @GetUser('id') actorId: string,
  ) {
    return this.workspacesService.removeMember(id, actorId, targetUserId);
  }
}
