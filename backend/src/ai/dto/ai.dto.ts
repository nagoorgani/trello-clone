import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateChecklistDto {
  @ApiProperty({ example: 'Implement Stripe Checkout Integration' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Handle webhooks, one-off payments, and invoices.' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class GenerateDescriptionDto {
  @ApiProperty({ example: 'Refactor Auth middleware for OAuth2' })
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class SummarizeCardDto {
  @ApiProperty({ example: 'Fix memory leak on WebSocket gateway' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  comments?: string[];
}
