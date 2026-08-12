import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { ActivityAction } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateCommentDto) {
    const card = await this.prisma.card.findUnique({
      where: { id: dto.cardId },
      include: { list: true },
    });

    if (!card) throw new NotFoundException('Card not found');

    const comment = await this.prisma.comment.create({
      data: {
        cardId: dto.cardId,
        userId,
        content: dto.content.trim(),
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    await this.prisma.activity.create({
      data: {
        boardId: card.list.boardId,
        cardId: card.id,
        userId,
        action: ActivityAction.COMMENT_ADDED,
        metadata: JSON.stringify({ snippet: dto.content.slice(0, 50) }),
      },
    });

    return comment;
  }

  async update(commentId: string, userId: string, dto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) throw new ForbiddenException('Cannot edit another user comment');

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content: dto.content.trim() },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
  }

  async delete(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) throw new ForbiddenException('Cannot delete another user comment');

    await this.prisma.comment.delete({ where: { id: commentId } });
    return { message: 'Comment deleted' };
  }
}
