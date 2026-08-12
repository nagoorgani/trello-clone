import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateChecklistDto,
  UpdateChecklistDto,
  CreateChecklistItemDto,
  UpdateChecklistItemDto,
} from './dto/checklist.dto';

@Injectable()
export class ChecklistsService {
  constructor(private readonly prisma: PrismaService) {}

  async createChecklist(userId: string, dto: CreateChecklistDto) {
    const last = await this.prisma.checklist.findFirst({
      where: { cardId: dto.cardId },
      orderBy: { position: 'desc' },
    });
    const position = last ? last.position + 1000 : 1000;

    return this.prisma.checklist.create({
      data: {
        cardId: dto.cardId,
        title: dto.title.trim(),
        position,
      },
      include: {
        items: true,
      },
    });
  }

  async updateChecklist(checklistId: string, dto: UpdateChecklistDto) {
    return this.prisma.checklist.update({
      where: { id: checklistId },
      data: { title: dto.title },
      include: { items: true },
    });
  }

  async deleteChecklist(checklistId: string) {
    await this.prisma.checklist.delete({ where: { id: checklistId } });
    return { message: 'Checklist deleted' };
  }

  async addItem(checklistId: string, dto: CreateChecklistItemDto) {
    let position = dto.position;
    if (position === undefined) {
      const last = await this.prisma.checklistItem.findFirst({
        where: { checklistId },
        orderBy: { position: 'desc' },
      });
      position = last ? last.position + 1000 : 1000;
    }

    return this.prisma.checklistItem.create({
      data: {
        checklistId,
        title: dto.title.trim(),
        position,
      },
    });
  }

  async updateItem(itemId: string, dto: UpdateChecklistItemDto) {
    return this.prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        title: dto.title,
        isCompleted: dto.isCompleted,
        position: dto.position,
      },
    });
  }

  async deleteItem(itemId: string) {
    await this.prisma.checklistItem.delete({ where: { id: itemId } });
    return { message: 'Checklist item deleted' };
  }
}
