import * as React from "react";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: "positive" | "negative" | "neutral";
  subtitle?: string;
};

export function KpiCard({
  label,
  value,
  icon,
  trend = "neutral",
  subtitle,
}: KpiCardProps) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-[0_1px_2px_rgb(28_25_23/0.04)] transition-shadow hover:shadow-md">
      <div className="flex min-h-[116px] flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            {label}
          </p>
          <div className="rounded-md bg-orange-50 p-2 text-orange-700">
            {icon}
          </div>
        </div>
        <div className="space-y-1">
          <p
            className={cn(
              "break-words text-xl font-semibold tracking-tight tabular-nums sm:text-2xl",
              trend === "positive" && "text-emerald-700",
              trend === "negative" && "text-red-700",
              trend === "neutral" && "text-stone-950",
            )}
          >
            {value}
          </p>
          {subtitle ? (
            <p className="text-xs text-stone-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex min-h-[116px] flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="h-3 w-24 rounded bg-stone-200" />
          <div className="size-9 rounded-md bg-stone-200" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="h-7 w-36 rounded bg-stone-200" />
          <div className="h-3 w-28 rounded bg-stone-200" />
        </div>
      </div>
    </div>
  );
}
