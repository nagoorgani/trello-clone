import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabelDto, UpdateLabelDto } from './dto/label.dto';

@Injectable()
export class LabelsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLabelDto) {
    return this.prisma.label.create({
      data: {
        boardId: dto.boardId,
        name: dto.name.trim(),
        color: dto.color.trim(),
      },
    });
  }

  async update(id: string, dto: UpdateLabelDto) {
    const label = await this.prisma.label.findUnique({ where: { id } });
    if (!label) throw new NotFoundException('Label not found');

    return this.prisma.label.update({
      where: { id },
      data: {
        name: dto.name,
        color: dto.color,
      },
    });
  }

  async delete(id: string) {
    const label = await this.prisma.label.findUnique({ where: { id } });
    if (!label) throw new NotFoundException('Label not found');

    await this.prisma.label.delete({ where: { id } });
    return { message: 'Label deleted' };
  }
}
