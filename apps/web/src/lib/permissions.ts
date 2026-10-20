import type { UserRole } from "@/features/auth/types";

export const DESKTOP_ROLES: readonly UserRole[] = [
  "ADMIN",
  "PATRON",
  "COMPTABLE",
  "CONDUCTEUR",
];

export function hasRole(
  role: UserRole | null | undefined,
  allowedRoles: readonly UserRole[],
): boolean {
  return role !== undefined && role !== null && allowedRoles.includes(role);
}

export function canManageBusiness(role: UserRole | null | undefined): boolean {
  return hasRole(role, ["ADMIN", "PATRON"]);
}

export function canReadBusiness(role: UserRole | null | undefined): boolean {
  return hasRole(role, DESKTOP_ROLES);
}

export function canAccessDesktopPath(
  role: UserRole | null | undefined,
  pathname: string,
): boolean {
  if (!canReadBusiness(role)) return pathname.endsWith("/forbidden");
  if (
    role === "CONDUCTEUR" &&
    (pathname.includes("/ouvriers") ||
      pathname.includes("/indicateurs") ||
      pathname.includes("/nouveau") ||
      pathname.includes("/modifier") ||
      (!pathname.startsWith("/dashboard/chantiers") &&
        !pathname.endsWith("/forbidden")))
  ) {
    return false;
  }
  if (
    role === "COMPTABLE" &&
    (pathname.includes("/ouvriers") ||
      pathname.includes("/nouveau") ||
      pathname.includes("/modifier") ||
      pathname.includes("/ocr"))
  ) {
    return false;
  }
  if (pathname.startsWith("/dashboard/parametres")) {
    return role === "ADMIN" || role === "PATRON";
  }
  return true;
}
