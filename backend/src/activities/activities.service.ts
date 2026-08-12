import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async getBoardActivities(boardId: string, limit = 50) {
    return this.prisma.activity.findMany({
      where: { boardId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  async getCardActivities(cardId: string, limit = 50) {
    return this.prisma.activity.findMany({
      where: { cardId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }
}
