import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLabelDto {
  @ApiProperty({ example: 'board-uuid' })
  @IsString()
  @IsNotEmpty()
  boardId: string;

  @ApiProperty({ example: 'Urgent' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '#ef4444' })
  @IsString()
  @IsNotEmpty()
  color: string;
}

export class UpdateLabelDto {
  @ApiPropertyOptional({ example: 'Critical' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '#dc2626' })
  @IsString()
  @IsOptional()
  color?: string;
}
