import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChecklistDto {
  @ApiProperty({ example: 'card-uuid' })
  @IsString()
  @IsNotEmpty()
  cardId: string;

  @ApiProperty({ example: 'Acceptance Criteria' })
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class UpdateChecklistDto {
  @ApiPropertyOptional({ example: 'Updated Checklist Title' })
  @IsString()
  @IsOptional()
  title?: string;
}

export class CreateChecklistItemDto {
  @ApiProperty({ example: 'Review PR changes' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 1000 })
  @IsNumber()
  @IsOptional()
  position?: number;
}

export class UpdateChecklistItemDto {
  @ApiPropertyOptional({ example: 'Review PR changes (Done)' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @ApiPropertyOptional({ example: 2000 })
  @IsNumber()
  @IsOptional()
  position?: number;
}
