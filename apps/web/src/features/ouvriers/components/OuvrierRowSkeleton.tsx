export function OuvrierRowSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3.5">
      <div className="h-10 w-10 shrink-0 rounded-full bg-stone-200" />
      <div className="flex-1 space-y-1.5">
        <div className="h-4 w-36 rounded bg-stone-200" />
        <div className="h-3 w-24 rounded bg-stone-200" />
      </div>
    </div>
  );
}
