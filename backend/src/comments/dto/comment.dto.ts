import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'card-uuid' })
  @IsString()
  @IsNotEmpty()
  cardId: string;

  @ApiProperty({ example: 'Great progress on this! Please double check on mobile layout.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdateCommentDto {
  @ApiProperty({ example: 'Updated comment text' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
