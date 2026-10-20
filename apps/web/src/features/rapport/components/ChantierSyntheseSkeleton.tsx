export function ChantierSyntheseSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-l-4 border-l-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-48 rounded bg-stone-200" />
          <div className="h-2 w-full rounded-full bg-stone-200" />
        </div>
        <div className="space-y-1">
          <div className="h-6 w-20 rounded bg-stone-200" />
          <div className="h-3 w-16 rounded bg-stone-200" />
        </div>
      </div>
    </div>
  );
}
