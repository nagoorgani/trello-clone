import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto, UpdateBoardDto, InviteBoardMemberDto } from './dto/board.dto';
import { ActivityAction, BoardRole, NotificationType } from '@prisma/client';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBoardDto) {
    const board = await this.prisma.board.create({
      data: {
        workspaceId: dto.workspaceId,
        ownerId: userId,
        title: dto.title.trim(),
        description: dto.description?.trim(),
        backgroundType: dto.backgroundType || 'gradient',
        backgroundValue: dto.backgroundValue || 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)',
        isPublic: dto.isPublic || false,
        members: {
          create: {
            userId,
            role: BoardRole.ADMIN,
          },
        },
        lists: {
          create: [
            { title: 'To Do', position: 1000 },
            { title: 'In Progress', position: 2000 },
            { title: 'Done', position: 3000 },
          ],
        },
        labels: {
          create: [
            { name: 'Bug', color: '#ef4444' },
            { name: 'Feature', color: '#3b82f6' },
            { name: 'Design', color: '#ec4899' },
            { name: 'DevOps', color: '#f59e0b' },
          ],
        },
      },
      include: {
        lists: {
          include: {
            cards: true,
          },
        },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
        labels: true,
      },
    });

    await this.prisma.activity.create({
      data: {
        workspaceId: dto.workspaceId,
        boardId: board.id,
        userId,
        action: ActivityAction.BOARD_CREATED,
        metadata: JSON.stringify({ title: board.title }),
      },
    });

    return board;
  }

  async findOne(boardId: string, userId?: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        workspace: {
          select: { id: true, name: true, slug: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true, bio: true },
            },
          },
        },
        stars: userId ? { where: { userId } } : false,
        labels: true,
        lists: {
          where: { isArchived: false },
          orderBy: { position: 'asc' },
          include: {
            cards: {
              where: { isArchived: false },
              orderBy: { position: 'asc' },
              include: {
                members: {
                  include: {
                    user: { select: { id: true, name: true, avatarUrl: true } },
                  },
                },
                labels: {
                  include: {
                    label: true,
                  },
                },
                checklists: {
                  orderBy: { position: 'asc' },
                  include: {
                    items: {
                      orderBy: { position: 'asc' },
                    },
                  },
                },
                comments: {
                  orderBy: { createdAt: 'desc' },
                  include: {
                    user: { select: { id: true, name: true, avatarUrl: true } },
                  },
                },
                attachments: true,
                _count: {
                  select: { comments: true, attachments: true },
                },
              },
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (!board.isPublic && userId) {
      const isMember = board.members.some((m) => m.userId === userId);
      const isWorkspaceMember = await this.prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId: board.workspaceId, userId } },
      });

      if (!isMember && !isWorkspaceMember) {
        throw new ForbiddenException('You do not have access to this board');
      }
    }

    return {
      ...board,
      isStarred: Boolean(board.stars && board.stars.length > 0),
    };
  }

  async update(boardId: string, userId: string, dto: UpdateBoardDto) {
    await this.verifyBoardAdmin(boardId, userId);

    const updated = await this.prisma.board.update({
      where: { id: boardId },
      data: {
        title: dto.title,
        description: dto.description,
        backgroundType: dto.backgroundType,
        backgroundValue: dto.backgroundValue,
        isPublic: dto.isPublic,
        isArchived: dto.isArchived,
      },
    });

    await this.prisma.activity.create({
      data: {
        boardId,
        userId,
        action: dto.isArchived ? ActivityAction.BOARD_ARCHIVED : ActivityAction.BOARD_UPDATED,
        metadata: JSON.stringify({ title: updated.title }),
      },
    });

    return updated;
  }

  async toggleStar(boardId: string, userId: string) {
    const existing = await this.prisma.boardStar.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });

    if (existing) {
      await this.prisma.boardStar.delete({
        where: { id: existing.id },
      });
      return { isStarred: false };
    } else {
      await this.prisma.boardStar.create({
        data: { boardId, userId },
      });
      return { isStarred: true };
    }
  }

  async duplicate(boardId: string, userId: string) {
    const sourceBoard = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        lists: {
          where: { isArchived: false },
          include: {
            cards: {
              where: { isArchived: false },
              include: {
                labels: true,
                checklists: {
                  include: { items: true },
                },
              },
            },
          },
        },
        labels: true,
      },
    });

    if (!sourceBoard) {
      throw new NotFoundException('Source board not found');
    }

    // Create cloned board
    const newBoard = await this.prisma.board.create({
      data: {
        workspaceId: sourceBoard.workspaceId,
        ownerId: userId,
        title: `${sourceBoard.title} (Copy)`,
        description: sourceBoard.description,
        backgroundType: sourceBoard.backgroundType,
        backgroundValue: sourceBoard.backgroundValue,
        isPublic: false,
        members: {
          create: { userId, role: BoardRole.ADMIN },
        },
      },
    });

    // Clone labels mapping
    const labelMap = new Map<string, string>();
    for (const label of sourceBoard.labels) {
      const newLabel = await this.prisma.label.create({
        data: {
          boardId: newBoard.id,
          name: label.name,
          color: label.color,
        },
      });
      labelMap.set(label.id, newLabel.id);
    }

    // Clone lists and cards
    for (const list of sourceBoard.lists) {
      const newList = await this.prisma.list.create({
        data: {
          boardId: newBoard.id,
          title: list.title,
          position: list.position,
        },
      });

      for (const card of list.cards) {
        const newCard = await this.prisma.card.create({
          data: {
            listId: newList.id,
            title: card.title,
            description: card.description,
            position: card.position,
            priority: card.priority,
            dueDate: card.dueDate,
            coverColor: card.coverColor,
            coverImage: card.coverImage,
            members: { create: [{ userId }] },
          },
        });

        // Clone labels
        for (const cl of card.labels) {
          const mappedLabelId = labelMap.get(cl.labelId);
          if (mappedLabelId) {
            await this.prisma.cardLabel.create({
              data: { cardId: newCard.id, labelId: mappedLabelId },
            });
          }
        }

        // Clone checklists
        for (const cl of card.checklists) {
          const newChecklist = await this.prisma.checklist.create({
            data: { cardId: newCard.id, title: cl.title, position: cl.position },
          });
          for (const item of cl.items) {
            await this.prisma.checklistItem.create({
              data: {
                checklistId: newChecklist.id,
                title: item.title,
                position: item.position,
                isCompleted: item.isCompleted,
              },
            });
          }
        }
      }
    }

    return newBoard;
  }

  async delete(boardId: string, userId: string) {
    await this.verifyBoardAdmin(boardId, userId);

    await this.prisma.board.delete({
      where: { id: boardId },
    });

    return { message: 'Board deleted successfully' };
  }

  async inviteMember(boardId: string, actorId: string, dto: InviteBoardMemberDto) {
    await this.verifyBoardAdmin(boardId, actorId);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId: user.id } },
    });

    if (existing) {
      throw new BadRequestException('User is already a member of this board');
    }

    const member = await this.prisma.boardMember.create({
      data: {
        boardId,
        userId: user.id,
        role: dto.role || BoardRole.NORMAL,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    const board = await this.prisma.board.findUnique({ where: { id: boardId } });

    await this.prisma.notification.create({
      data: {
        userId: user.id,
        actorId,
        type: NotificationType.BOARD_INVITATION,
        title: 'Board Invitation',
        message: `You were invited to board "${board?.title}"`,
        link: `/boards/${boardId}`,
      },
    });

    return member;
  }

  async removeMember(boardId: string, actorId: string, targetUserId: string) {
    await this.verifyBoardAdmin(boardId, actorId);

    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (board?.ownerId === targetUserId) {
      throw new BadRequestException('Cannot remove board owner');
    }

    await this.prisma.boardMember.delete({
      where: { boardId_userId: { boardId, userId: targetUserId } },
    });

    return { message: 'Member removed from board' };
  }

  private async verifyBoardAdmin(boardId: string, userId: string) {
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.ownerId === userId) return;

    const member = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });

    if (!member || member.role !== BoardRole.ADMIN) {
      throw new ForbiddenException('Board admin permissions required');
    }
  }
}
