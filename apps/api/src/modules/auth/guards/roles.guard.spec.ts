import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

type RoleMetadataReader = {
  getAllAndOverride: jest.Mock;
};

function createContext(role?: string): ExecutionContext {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('allows a role declared by the route', () => {
    const reflector: RoleMetadataReader = {
      getAllAndOverride: jest.fn().mockReturnValue(['PATRON', 'ADMIN']),
    };
    const guard = new RolesGuard(reflector as never);

    expect(guard.canActivate(createContext('PATRON'))).toBe(true);
  });

  it('allows ADMIN on every protected route', () => {
    const reflector: RoleMetadataReader = {
      getAllAndOverride: jest.fn().mockReturnValue(['OUVRIER']),
    };
    const guard = new RolesGuard(reflector as never);

    expect(guard.canActivate(createContext('ADMIN'))).toBe(true);
  });

  it('rejects a role outside the route permission set with 403', () => {
    const reflector: RoleMetadataReader = {
      getAllAndOverride: jest.fn().mockReturnValue(['PATRON']),
    };
    const guard = new RolesGuard(reflector as never);

    expect(() => guard.canActivate(createContext('COMPTABLE'))).toThrow(
      ForbiddenException,
    );
  });

  it('rejects a request without an authenticated role', () => {
    const reflector: RoleMetadataReader = {
      getAllAndOverride: jest.fn().mockReturnValue(['OUVRIER']),
    };
    const guard = new RolesGuard(reflector as never);

    expect(() => guard.canActivate(createContext())).toThrow(
      ForbiddenException,
    );
  });
});
