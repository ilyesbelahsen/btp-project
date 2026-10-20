import { Clock } from "lucide-react";

export function PointageRowSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-4 rounded-lg border border-stone-200 bg-white px-4 py-4">
      <div className="h-4 flex-1 rounded bg-stone-200" />
      <div className="h-4 flex-1 rounded bg-stone-200" />
      <div className="h-4 w-32 rounded bg-stone-200" />
      <div className="h-5 w-16 rounded-full bg-stone-200" />
    </div>
  );
}

export function PointageErrorState() {
  return (
    <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      Impossible de charger les pointages.
    </p>
  );
}

export function PointageEmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-stone-300 bg-white p-12 text-center">
      <div className="rounded-full bg-orange-50 p-3 text-orange-700">
        <Clock className="h-7 w-7" />
      </div>
      <p className="text-sm text-stone-500">
        Aucun pointage ne correspond aux filtres sélectionnés.
      </p>
    </div>
  );
}
