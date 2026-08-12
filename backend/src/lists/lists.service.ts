import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListDto, UpdateListDto, ReorderListDto } from './dto/list.dto';
import { ActivityAction } from '@prisma/client';

@Injectable()
export class ListsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateListDto) {
    let position = dto.position;

    if (position === undefined) {
      const lastList = await this.prisma.list.findFirst({
        where: { boardId: dto.boardId, isArchived: false },
        orderBy: { position: 'desc' },
      });
      position = lastList ? lastList.position + 1000 : 1000;
    }

    const list = await this.prisma.list.create({
      data: {
        boardId: dto.boardId,
        title: dto.title.trim(),
        position,
      },
      include: {
        cards: true,
      },
    });

    await this.prisma.activity.create({
      data: {
        boardId: dto.boardId,
        userId,
        action: ActivityAction.LIST_CREATED,
        metadata: JSON.stringify({ title: list.title }),
      },
    });

    return list;
  }

  async update(listId: string, userId: string, dto: UpdateListDto) {
    const list = await this.prisma.list.findUnique({ where: { id: listId } });
    if (!list) throw new NotFoundException('List not found');

    const updated = await this.prisma.list.update({
      where: { id: listId },
      data: {
        title: dto.title,
        position: dto.position,
        isArchived: dto.isArchived,
      },
      include: {
        cards: {
          where: { isArchived: false },
          orderBy: { position: 'asc' },
          include: {
            members: { include: { user: true } },
            labels: { include: { label: true } },
            checklists: { include: { items: true } },
            _count: { select: { comments: true, attachments: true } },
          },
        },
      },
    });

    await this.prisma.activity.create({
      data: {
        boardId: list.boardId,
        userId,
        action: dto.isArchived ? ActivityAction.LIST_ARCHIVED : ActivityAction.LIST_UPDATED,
        metadata: JSON.stringify({ title: updated.title }),
      },
    });

    return updated;
  }

  async reorder(listId: string, userId: string, dto: ReorderListDto) {
    const list = await this.prisma.list.findUnique({ where: { id: listId } });
    if (!list) throw new NotFoundException('List not found');

    const updated = await this.prisma.list.update({
      where: { id: listId },
      data: { position: dto.position },
    });

    await this.prisma.activity.create({
      data: {
        boardId: list.boardId,
        userId,
        action: ActivityAction.LIST_MOVED,
        metadata: JSON.stringify({ title: list.title, newPosition: dto.position }),
      },
    });

    return updated;
  }

  async delete(listId: string, userId: string) {
    const list = await this.prisma.list.findUnique({ where: { id: listId } });
    if (!list) throw new NotFoundException('List not found');

    await this.prisma.list.delete({ where: { id: listId } });
    return { message: 'List deleted successfully' };
  }
}
