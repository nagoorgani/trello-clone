import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto, InviteMemberDto, UpdateMemberRoleDto } from './dto/workspace.dto';
import { ActivityAction, NotificationType, WorkspaceRole } from '@prisma/client';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateWorkspaceDto) {
    const slug = `${dto.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const workspace = await this.prisma.workspace.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim(),
        logoUrl: dto.logoUrl,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: WorkspaceRole.OWNER,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
        boards: {
          where: { isArchived: false },
        },
      },
    });

    await this.prisma.activity.create({
      data: {
        workspaceId: workspace.id,
        userId,
        action: ActivityAction.WORKSPACE_CREATED,
        metadata: JSON.stringify({ name: workspace.name }),
      },
    });

    return workspace;
  }

  async findAllForUser(userId: string) {
    return this.prisma.workspace.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
        boards: {
          where: { isArchived: false },
          orderBy: { createdAt: 'desc' },
          include: {
            stars: {
              where: { userId },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(workspaceId: string, userId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true, bio: true },
            },
          },
        },
        boards: {
          where: { isArchived: false },
          include: {
            stars: {
              where: { userId },
            },
            members: {
              include: {
                user: { select: { id: true, name: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    return workspace;
  }

  async update(workspaceId: string, userId: string, dto: UpdateWorkspaceDto) {
    await this.verifyAdminOrOwner(workspaceId, userId);

    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        name: dto.name,
        description: dto.description,
        logoUrl: dto.logoUrl,
      },
    });
  }

  async delete(workspaceId: string, userId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenException('Only the workspace owner can delete it');
    }

    await this.prisma.workspace.delete({
      where: { id: workspaceId },
    });

    return { message: 'Workspace deleted successfully' };
  }

  async inviteMember(workspaceId: string, actorId: string, dto: InviteMemberDto) {
    await this.verifyAdminOrOwner(workspaceId, actorId);

    const targetUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!targetUser) {
      throw new NotFoundException('User with this email was not found');
    }

    const existingMember = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: targetUser.id,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member of this workspace');
    }

    const member = await this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: targetUser.id,
        role: dto.role || WorkspaceRole.MEMBER,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    const workspace = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });

    await this.prisma.notification.create({
      data: {
        userId: targetUser.id,
        actorId,
        type: NotificationType.WORKSPACE_INVITATION,
        title: 'Workspace Invitation',
        message: `You were added to the workspace "${workspace?.name}"`,
        link: `/workspaces/${workspaceId}`,
      },
    });

    return member;
  }

  async updateMemberRole(workspaceId: string, actorId: string, targetUserId: string, dto: UpdateMemberRoleDto) {
    await this.verifyAdminOrOwner(workspaceId, actorId);

    const workspace = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (workspace?.ownerId === targetUserId && dto.role !== WorkspaceRole.OWNER) {
      throw new BadRequestException('Cannot change the role of the workspace owner');
    }

    return this.prisma.workspaceMember.update({
      where: {
        workspaceId_userId: { workspaceId, userId: targetUserId },
      },
      data: { role: dto.role },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
  }

  async removeMember(workspaceId: string, actorId: string, targetUserId: string) {
    await this.verifyAdminOrOwner(workspaceId, actorId);

    const workspace = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (workspace?.ownerId === targetUserId) {
      throw new BadRequestException('Cannot remove the workspace owner');
    }

    await this.prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: { workspaceId, userId: targetUserId },
      },
    });

    return { message: 'Member removed from workspace' };
  }

  private async verifyAdminOrOwner(workspaceId: string, userId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });

    if (!member || (member.role !== WorkspaceRole.OWNER && member.role !== WorkspaceRole.ADMIN)) {
      throw new ForbiddenException('Admin or Owner privileges required');
    }
  }
}
