export function IndicateursSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="h-14 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}
