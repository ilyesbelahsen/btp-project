import { ChevronRight, Phone, UserRound } from "lucide-react";
import Link from "next/link";
import type { Ouvrier } from "@/features/ouvriers/types";

export function OuvrierRow({ ouvrier }: { ouvrier: Ouvrier }) {
  return (
    <Link
      href={`/dashboard/ouvriers/${ouvrier.id}`}
      className="flex items-center justify-between gap-4 rounded-lg border border-stone-200 bg-white px-4 py-3.5 shadow-sm transition-colors hover:border-orange-200 hover:bg-orange-50/30"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-700">
          <UserRound className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-stone-900">
            {ouvrier.lastName.toUpperCase()} {ouvrier.firstName}
          </p>
          {ouvrier.phone ? (
            <div className="flex items-center gap-1 text-xs text-stone-500">
              <Phone className="h-3 w-3 shrink-0" />
              <span>{ouvrier.phone}</span>
            </div>
          ) : (
            <p className="text-xs text-stone-400">Téléphone non renseigné</p>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" />
    </Link>
  );
}
