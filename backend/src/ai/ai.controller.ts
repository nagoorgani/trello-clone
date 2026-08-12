import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateChecklistDto, GenerateDescriptionDto, SummarizeCardDto } from './dto/ai.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('AI Assistant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-checklist')
  @ApiOperation({ summary: 'Generate intelligent task checklist from title and context' })
  generateChecklist(@Body() dto: GenerateChecklistDto) {
    return this.aiService.generateChecklist(dto);
  }

  @Post('generate-description')
  @ApiOperation({ summary: 'Generate structured markdown task description' })
  generateDescription(@Body() dto: GenerateDescriptionDto) {
    return this.aiService.generateDescription(dto);
  }

  @Post('summarize')
  @ApiOperation({ summary: 'Summarize card state, comments and next steps' })
  summarizeCard(@Body() dto: SummarizeCardDto) {
    return this.aiService.summarizeCard(dto);
  }
}
