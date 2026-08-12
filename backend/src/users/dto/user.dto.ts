import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Alex Vance' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'Passionate full stack software engineer.' })
  @IsString()
  @IsOptional()
  bio?: string;
}

export class ChangePasswordDto {
  @ApiPropertyOptional({ example: 'OldPassword123!' })
  @IsString()
  currentPassword: string;

  @ApiPropertyOptional({ example: 'NewSecret123!' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
