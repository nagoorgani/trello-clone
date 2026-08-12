import { Injectable } from '@nestjs/common';
import { GenerateChecklistDto, GenerateDescriptionDto, SummarizeCardDto } from './dto/ai.dto';

@Injectable()
export class AiService {
  async generateChecklist(dto: GenerateChecklistDto) {
    const title = dto.title.toLowerCase();

    // Smart contextual checklist generator
    let items = [
      'Define requirements and scope',
      'Design technical architecture & contracts',
      'Implement core logic & tests',
      'Perform security and edge-case review',
      'Deploy and verify in staging',
    ];

    if (title.includes('auth') || title.includes('login') || title.includes('security')) {
      items = [
        'Define token expiration & rotation policy',
        'Implement password hashing with bcrypt/argon2',
        'Setup CSRF & CORS security headers',
        'Write rate limiting protection on endpoint',
        'Test invalid credential and brute-force scenarios',
      ];
    } else if (title.includes('api') || title.includes('backend') || title.includes('database')) {
      items = [
        'Design Prisma schema & database migration',
        'Create DTO validation classes with class-validator',
        'Implement NestJS Service business logic',
        'Add Swagger API documentation decorators',
        'Write unit & integration test coverage',
      ];
    } else if (title.includes('ui') || title.includes('frontend') || title.includes('design') || title.includes('component')) {
      items = [
        'Create responsive layout in Tailwind CSS',
        'Implement Dark / Light mode CSS tokens',
        'Add keyboard accessibility and ARIA roles',
        'Hook up state with Zustand / TanStack Query',
        'Add loading skeletons and smooth Framer Motion transitions',
      ];
    } else if (title.includes('bug') || title.includes('fix') || title.includes('error')) {
      items = [
        'Reproduce issue in isolated environment',
        'Identify root cause in stack trace',
        'Apply patch with regression test',
        'Verify across all supported browsers/platforms',
      ];
    }

    return {
      checklistTitle: `AI Checklist: ${dto.title}`,
      items,
    };
  }

  async generateDescription(dto: GenerateDescriptionDto) {
    return {
      description: `### 🎯 Objective\nImplement **${dto.title}** to enhance platform capabilities, reliability, and user experience.\n\n### 📋 User Story\n> **As a** workspace collaborator\n> **I want** to easily utilize ${dto.title}\n> **So that** my productivity and project workflow are seamless.\n\n### ✅ Acceptance Criteria\n- [ ] Clean and intuitive UX matching Linear / Trello aesthetic\n- [ ] Comprehensive validation and error feedback\n- [ ] Real-time updates reflected across all active sessions\n- [ ] Full responsiveness across desktop and mobile devices\n\n### 🛠️ Technical Notes\n- Follow clean architecture principles with decoupled state handlers\n- Ensure optimistic UI updates with automatic rollback on network failures`,
    };
  }

  async summarizeCard(dto: SummarizeCardDto) {
    const commentCount = dto.comments?.length || 0;
    return {
      summary: `**${dto.title}** is currently being tracked. It has ${commentCount} discussion ${commentCount === 1 ? 'comment' : 'comments'}. Recommended next action: review checklist progress and assign due dates for next sprint delivery.`,
    };
  }
}
