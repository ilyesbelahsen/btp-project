export const USER_ROLES = [
  "ADMIN",
  "PATRON",
  "COMPTABLE",
  "CONDUCTEUR",
  "OUVRIER",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: string;
};

export type AuthResponse = {
  user: AuthUser;
};
