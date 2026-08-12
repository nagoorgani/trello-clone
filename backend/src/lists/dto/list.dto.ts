import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateListDto {
  @ApiProperty({ example: 'board-uuid' })
  @IsString()
  @IsNotEmpty()
  boardId: string;

  @ApiProperty({ example: 'In Progress' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 65535 })
  @IsNumber()
  @IsOptional()
  position?: number;
}

export class UpdateListDto {
  @ApiPropertyOptional({ example: 'QA & Review' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 131070 })
  @IsNumber()
  @IsOptional()
  position?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}

export class ReorderListDto {
  @ApiProperty({ example: 1000 })
  @IsNumber()
  @IsNotEmpty()
  position: number;
}
