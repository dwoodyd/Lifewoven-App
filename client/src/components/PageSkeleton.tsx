import { Skeleton } from "@/components/ui/skeleton";

/** Full-page skeleton that matches the general page layout: nav + content blocks */
export default function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav placeholder */}
      <div className="h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center px-6 gap-4">
        <Skeleton className="h-6 w-28 rounded" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      <div className="container pt-10 pb-20 max-w-5xl mx-auto px-4 sm:px-6">
        {/* Page header */}
        <div className="flex items-start gap-4 mb-8">
          <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-48 rounded" />
            <Skeleton className="h-4 w-72 rounded" />
          </div>
        </div>

        {/* Content rows */}
        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-4/5 rounded" />
              {i % 2 === 0 && <Skeleton className="h-4 w-3/5 rounded" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Compact skeleton for cards/sections within a page */
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <Skeleton className="h-5 w-36 rounded" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 rounded ${i === lines - 1 ? "w-3/5" : "w-full"}`} />
      ))}
    </div>
  );
}
