"use client";

import { useEffect } from "react";
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
  Settings2,
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

  const handleLogout = () => {
    clearAuth();
    void authService.logout().finally(() => router.push("/login"));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-zinc-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-orange-500 p-1.5">
              <HardHat className="size-5" />
            </div>
            <span className="font-bold tracking-tight">BTP Manager</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
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
        <div className="flex items-center gap-4">
          {user ? (
            <span className="text-sm text-zinc-400">
              {user.firstName} {user.lastName}
            </span>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-300 hover:text-white hover:bg-zinc-800"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Déconnexion
          </Button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
