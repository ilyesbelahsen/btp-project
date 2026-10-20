import { SetMetadata } from '@nestjs/common';

export const USER_ROLES = [
  'ADMIN',
  'PATRON',
  'COMPTABLE',
  'CONDUCTEUR',
  'OUVRIER',
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
