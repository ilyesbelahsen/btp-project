export function OuvrierDetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6 lg:p-8">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-lg border border-stone-200 bg-stone-100"
        />
      ))}
    </div>
  );
}
