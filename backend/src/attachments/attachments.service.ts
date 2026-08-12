import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityAction } from '@prisma/client';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, cardId: string, file: Express.Multer.File) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { list: true },
    });

    if (!card) throw new NotFoundException('Card not found');

    const fileUrl = `/uploads/${file.filename}`;

    const attachment = await this.prisma.attachment.create({
      data: {
        cardId,
        userId,
        fileName: file.originalname,
        fileUrl,
        fileType: file.mimetype,
        fileSize: file.size,
      },
    });

    await this.prisma.activity.create({
      data: {
        boardId: card.list.boardId,
        cardId: card.id,
        userId,
        action: ActivityAction.ATTACHMENT_ADDED,
        metadata: JSON.stringify({ fileName: file.originalname }),
      },
    });

    return attachment;
  }

  async delete(attachmentId: string) {
    const attachment = await this.prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) throw new NotFoundException('Attachment not found');

    await this.prisma.attachment.delete({ where: { id: attachmentId } });
    return { message: 'Attachment deleted' };
  }
}
