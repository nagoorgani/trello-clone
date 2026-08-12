import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CardPriority } from '@prisma/client';

export class CreateCardDto {
  @ApiProperty({ example: 'list-uuid' })
  @IsString()
  @IsNotEmpty()
  listId: string;

  @ApiProperty({ example: 'Implement Drag and Drop' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Card detailed description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1000 })
  @IsNumber()
  @IsOptional()
  position?: number;

  @ApiPropertyOptional({ enum: CardPriority, default: CardPriority.MEDIUM })
  @IsEnum(CardPriority)
  @IsOptional()
  priority?: CardPriority;

  @ApiPropertyOptional({ example: '2026-08-30T12:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ example: '#3b82f6' })
  @IsString()
  @IsOptional()
  coverColor?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  @IsString()
  @IsOptional()
  coverImage?: string;
}

export class UpdateCardDto {
  @ApiPropertyOptional({ example: 'Updated title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: CardPriority })
  @IsEnum(CardPriority)
  @IsOptional()
  priority?: CardPriority;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverColor?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverImage?: string;
}

export class MoveCardDto {
  @ApiProperty({ example: 'target-list-uuid' })
  @IsString()
  @IsNotEmpty()
  targetListId: string;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  @IsNotEmpty()
  position: number;
}

export class AssignMemberDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class ToggleLabelDto {
  @ApiProperty({ example: 'label-uuid' })
  @IsString()
  @IsNotEmpty()
  labelId: string;
}
