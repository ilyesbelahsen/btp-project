import { ArrowLeft, UserRound } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { OuvrierDetail } from "@/features/ouvriers/types";

type OuvrierDetailHeaderProps = {
  ouvrier: OuvrierDetail;
};

export function OuvrierDetailHeader({ ouvrier }: OuvrierDetailHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Link href="/dashboard/ouvriers">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 border-stone-200 bg-white text-stone-600 shadow-sm hover:bg-stone-50 hover:text-stone-950"
          aria-label="Retour à la liste des ouvriers"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700 ring-1 ring-orange-200">
          <UserRound className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
            Fiche ouvrier
          </p>
          <h1 className="truncate text-2xl font-semibold tracking-tight text-stone-950">
            {ouvrier.lastName.toUpperCase()} {ouvrier.firstName}
          </h1>
          <p className="truncate text-sm text-stone-500">{ouvrier.email}</p>
        </div>
      </div>
    </div>
  );
}
