import { SetMetadata } from '@nestjs/common';
import { WorkspaceRole, BoardRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (WorkspaceRole | BoardRole | string)[]) =>
  SetMetadata(ROLES_KEY, roles);
