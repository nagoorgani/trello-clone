import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCardDto,
  UpdateCardDto,
  MoveCardDto,
  AssignMemberDto,
  ToggleLabelDto,
} from './dto/card.dto';
import { ActivityAction, NotificationType } from '@prisma/client';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateCardDto) {
    const list = await this.prisma.list.findUnique({
      where: { id: dto.listId },
      include: { board: true },
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    let position = dto.position;
    if (position === undefined) {
      const lastCard = await this.prisma.card.findFirst({
        where: { listId: dto.listId, isArchived: false },
        orderBy: { position: 'desc' },
      });
      position = lastCard ? lastCard.position + 1000 : 1000;
    }

    const card = await this.prisma.card.create({
      data: {
        listId: dto.listId,
        title: dto.title.trim(),
        description: dto.description?.trim(),
        position,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        coverColor: dto.coverColor,
        coverImage: dto.coverImage,
      },
      include: {
        members: { include: { user: true } },
        labels: { include: { label: true } },
        checklists: { include: { items: true } },
        comments: { include: { user: true } },
        attachments: true,
      },
    });

    await this.prisma.activity.create({
      data: {
        boardId: list.boardId,
        cardId: card.id,
        userId,
        action: ActivityAction.CARD_CREATED,
        metadata: JSON.stringify({ title: card.title, list: list.title }),
      },
    });

    return card;
  }

  async findOne(cardId: string) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: {
        list: {
          include: { board: true },
        },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
        labels: {
          include: { label: true },
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
        attachments: {
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return card;
  }

  async update(cardId: string, userId: string, dto: UpdateCardDto) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { list: true },
    });

    if (!card) throw new NotFoundException('Card not found');

    const updated = await this.prisma.card.update({
      where: { id: cardId },
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        dueDate: dto.dueDate !== undefined ? (dto.dueDate ? new Date(dto.dueDate) : null) : undefined,
        isCompleted: dto.isCompleted,
        isArchived: dto.isArchived,
        coverColor: dto.coverColor,
        coverImage: dto.coverImage,
      },
      include: {
        members: { include: { user: true } },
        labels: { include: { label: true } },
        checklists: { include: { items: true } },
        comments: { include: { user: true } },
        attachments: true,
      },
    });

    await this.prisma.activity.create({
      data: {
        boardId: card.list.boardId,
        cardId: card.id,
        userId,
        action: dto.isArchived ? ActivityAction.CARD_ARCHIVED : ActivityAction.CARD_UPDATED,
        metadata: JSON.stringify({ title: updated.title }),
      },
    });

    return updated;
  }

  async move(cardId: string, userId: string, dto: MoveCardDto) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { list: true },
    });

    if (!card) throw new NotFoundException('Card not found');

    const targetList = await this.prisma.list.findUnique({
      where: { id: dto.targetListId },
    });

    if (!targetList) throw new NotFoundException('Target list not found');

    const isCrossList = card.listId !== dto.targetListId;

    const updated = await this.prisma.card.update({
      where: { id: cardId },
      data: {
        listId: dto.targetListId,
        position: dto.position,
      },
      include: {
        members: { include: { user: true } },
        labels: { include: { label: true } },
        checklists: { include: { items: true } },
        comments: { include: { user: true } },
        attachments: true,
      },
    });

    if (isCrossList) {
      await this.prisma.activity.create({
        data: {
          boardId: targetList.boardId,
          cardId: card.id,
          userId,
          action: ActivityAction.CARD_MOVED,
          metadata: JSON.stringify({
            title: card.title,
            fromList: card.list.title,
            toList: targetList.title,
          }),
        },
      });
    }

    return updated;
  }

  async assignMember(cardId: string, actorId: string, dto: AssignMemberDto) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { list: { include: { board: true } } },
    });

    if (!card) throw new NotFoundException('Card not found');

    const existing = await this.prisma.cardMember.findUnique({
      where: { cardId_userId: { cardId, userId: dto.userId } },
    });

    if (existing) {
      throw new BadRequestException('Member is already assigned to this card');
    }

    const assignment = await this.prisma.cardMember.create({
      data: { cardId, userId: dto.userId },
      include: { user: true },
    });

    await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        actorId,
        type: NotificationType.CARD_ASSIGNED,
        title: 'Assigned to Card',
        message: `You were assigned to card "${card.title}"`,
        link: `/boards/${card.list.boardId}?cardId=${card.id}`,
      },
    });

    return assignment;
  }

  async removeMember(cardId: string, targetUserId: string) {
    await this.prisma.cardMember.delete({
      where: { cardId_userId: { cardId, userId: targetUserId } },
    });
    return { message: 'Member unassigned' };
  }

  async toggleLabel(cardId: string, dto: ToggleLabelDto) {
    const existing = await this.prisma.cardLabel.findUnique({
      where: { cardId_labelId: { cardId, labelId: dto.labelId } },
    });

    if (existing) {
      await this.prisma.cardLabel.delete({
        where: { cardId_labelId: { cardId, labelId: dto.labelId } },
      });
      return { attached: false, labelId: dto.labelId };
    } else {
      const added = await this.prisma.cardLabel.create({
        data: { cardId, labelId: dto.labelId },
        include: { label: true },
      });
      return { attached: true, label: added.label };
    }
  }

  async delete(cardId: string, userId: string) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { list: true },
    });

    if (!card) throw new NotFoundException('Card not found');

    await this.prisma.activity.create({
      data: {
        boardId: card.list.boardId,
        userId,
        action: ActivityAction.CARD_DELETED,
        metadata: JSON.stringify({ title: card.title }),
      },
    });

    await this.prisma.card.delete({ where: { id: cardId } });
    return { message: 'Card deleted successfully' };
  }
}
