import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, UserRole } from '../decorators/roles.decorator';

type AuthenticatedRequest = {
  user?: { role?: string };
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!allowedRoles) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const currentRole = request.user?.role;

    if (
      currentRole === 'ADMIN' ||
      (currentRole && allowedRoles.includes(currentRole as UserRole))
    ) {
      return true;
    }

    throw new ForbiddenException('Votre rôle ne permet pas cette action');
  }
}
