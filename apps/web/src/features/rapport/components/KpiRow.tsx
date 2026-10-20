import { cn } from "@/lib/utils";

export function KpiRow({
  label,
  value,
  variant = "default",
  sublabel,
}: {
  label: string;
  value: string;
  variant?: "default" | "positive" | "negative" | "neutral";
  sublabel?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-3 shadow-sm">
      <div>
        <p className="text-sm font-medium text-stone-700">{label}</p>
        {sublabel && <p className="text-xs text-stone-400">{sublabel}</p>}
      </div>
      <span
        className={cn("text-sm font-semibold tabular-nums", {
          "text-stone-950": variant === "default" || variant === "neutral",
          "text-emerald-700": variant === "positive",
          "text-red-700": variant === "negative",
        })}
      >
        {value}
      </span>
    </div>
  );
}
