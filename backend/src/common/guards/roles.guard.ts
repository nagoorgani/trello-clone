import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    const workspaceId = request.params.workspaceId || request.body?.workspaceId;
    const boardId = request.params.boardId || request.body?.boardId;

    if (workspaceId) {
      const member = await this.prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: user.id } },
      });
      if (member && requiredRoles.includes(member.role)) {
        return true;
      }
    }

    if (boardId) {
      const boardMember = await this.prisma.boardMember.findUnique({
        where: { boardId_userId: { boardId, userId: user.id } },
      });
      if (boardMember && requiredRoles.includes(boardMember.role)) {
        return true;
      }
    }

    // Default allow if user is super admin or no restrictive context
    return false;
  }
}
