import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BoardRole } from '@prisma/client';

export class CreateBoardDto {
  @ApiProperty({ example: 'workspace-uuid' })
  @IsString()
  @IsNotEmpty()
  workspaceId: string;

  @ApiProperty({ example: 'Sprint 42 - Core Kanban' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Board description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'gradient', default: 'gradient' })
  @IsString()
  @IsOptional()
  backgroundType?: string;

  @ApiPropertyOptional({ example: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)' })
  @IsString()
  @IsOptional()
  backgroundValue?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateBoardDto {
  @ApiPropertyOptional({ example: 'Updated Board Title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'gradient' })
  @IsString()
  @IsOptional()
  backgroundType?: string;

  @ApiPropertyOptional({ example: '#1e293b' })
  @IsString()
  @IsOptional()
  backgroundValue?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}

export class InviteBoardMemberDto {
  @ApiProperty({ example: 'teammate@example.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ enum: BoardRole, default: BoardRole.NORMAL })
  @IsEnum(BoardRole)
  @IsOptional()
  role?: BoardRole;
}
