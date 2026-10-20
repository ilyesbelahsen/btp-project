"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HardHat,
  LogOut,
  LayoutDashboard,
  Building2,
  Users,
  Clock,
  Euro,
  TrendingUp,
  Settings2,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import { authService } from "@/features/auth/services/auth.service";
import { canAccessDesktopPath, hasRole } from "@/lib/permissions";
import type { UserRole } from "@/features/auth/types";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "PATRON", "COMPTABLE"],
  },
  {
    href: "/dashboard/reporting",
    label: "Reporting",
    icon: TrendingUp,
    roles: ["ADMIN", "PATRON", "COMPTABLE"],
  },
  {
    href: "/dashboard/chantiers",
    label: "Chantiers",
    icon: Building2,
    roles: ["ADMIN", "PATRON", "COMPTABLE", "CONDUCTEUR"],
  },
  {
    href: "/dashboard/ouvriers",
    label: "Ouvriers",
    icon: Users,
    roles: ["ADMIN", "PATRON"],
  },
  {
    href: "/dashboard/pointages",
    label: "Pointages",
    icon: Clock,
    roles: ["ADMIN", "PATRON", "COMPTABLE"],
  },
  {
    href: "/dashboard/paie",
    label: "Paie",
    icon: Euro,
    roles: ["ADMIN", "PATRON", "COMPTABLE"],
  },
  {
    href: "/dashboard/paie/indemnites",
    label: "Indemnités",
    icon: Euro,
    roles: ["ADMIN", "PATRON", "COMPTABLE"],
  },
  {
    href: "/dashboard/parametres/zones",
    label: "Zones",
    icon: Settings2,
    roles: ["ADMIN", "PATRON"],
  },
] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const redirectToLogin = () => router.push("/login");
    window.addEventListener("auth:expired", redirectToLogin);
    return () => window.removeEventListener("auth:expired", redirectToLogin);
  }, [router]);

  useEffect(() => {
    if (user?.role === "CONDUCTEUR" && pathname === "/dashboard") {
      router.replace("/dashboard/chantiers");
      return;
    }
    if (user && !canAccessDesktopPath(user.role, pathname)) {
      router.replace("/dashboard/forbidden");
    }
  }, [pathname, router, user]);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    void authService.logout().finally(() => router.push("/login"));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="relative border-b bg-zinc-900 px-4 py-3 text-white sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-orange-500 p-1.5">
                <HardHat className="size-5" />
              </div>
              <span className="truncate font-bold tracking-tight">
                BTP Manager
              </span>
            </div>
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV_ITEMS.filter(({ roles }) =>
                hasRole(user?.role, roles as readonly UserRole[]),
              ).map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    pathname === href
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            {user ? (
              <span className="hidden max-w-40 truncate text-sm text-zinc-400 sm:block">
                {user.firstName} {user.lastName}
              </span>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-300 hover:bg-zinc-800 hover:text-white lg:hidden"
              aria-label={isMobileNavOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={isMobileNavOpen}
              onClick={() => setIsMobileNavOpen((open) => !open)}
            >
              {isMobileNavOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden text-zinc-300 hover:bg-zinc-800 hover:text-white sm:inline-flex"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              Déconnexion
            </Button>
          </div>
        </div>
        {isMobileNavOpen && (
          <div className="border-t border-zinc-800 pb-1 pt-3 lg:hidden">
            <nav className="grid gap-1" aria-label="Navigation principale">
              {NAV_ITEMS.filter(({ roles }) =>
                hasRole(user?.role, roles as readonly UserRole[]),
              ).map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                    pathname === href
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-300 hover:bg-zinc-800 hover:text-white",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              ))}
              <button
                type="button"
                className="flex min-h-11 items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                onClick={handleLogout}
              >
                <LogOut className="size-4" />
                Déconnexion
              </button>
            </nav>
          </div>
        )}
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
