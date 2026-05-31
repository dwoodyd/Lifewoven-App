import { cn } from "@/lib/utils";

/**
 * Base Skeleton — pulsing shimmer placeholder.
 * Use for any loading state where content shape is known.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted/70 animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

/** One or more lines of text */
function SkeletonText({ className, lines = 1 }: { className?: string; lines?: number }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 && lines > 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}

/** Card with avatar header + body lines */
function SkeletonCard({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={cn("rounded-xl border p-4 space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={lines} />
    </div>
  );
}

/** Circular avatar */
function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14" }[size];
  return <Skeleton className={cn("rounded-full shrink-0", sizeClass)} />;
}

/** Hero section */
function SkeletonHero({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4 py-8", className)}>
      <Skeleton className="h-3 w-24 mx-auto" />
      <Skeleton className="h-10 w-3/4 mx-auto" />
      <Skeleton className="h-10 w-2/3 mx-auto" />
      <SkeletonText lines={2} className="max-w-md mx-auto" />
      <div className="flex gap-3 justify-center pt-2">
        <Skeleton className="h-10 w-32 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
    </div>
  );
}

/** List rows — journal entries, habits, etc. */
function SkeletonList({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
          <Skeleton className="h-5 w-5 rounded mt-0.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className={cn("h-3", i % 2 === 0 ? "w-2/3" : "w-1/2")} />
          </div>
          <Skeleton className="h-6 w-16 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** 5S module grid */
function SkeletonModuleGrid({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 gap-3", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-4 space-y-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/** Oracle typing indicator — three-dot bounce */
function SkeletonTyping({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1 px-4 py-3", className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
        />
      ))}
    </div>
  );
}

/** Full-page loading skeleton for dashboard-style pages */
function SkeletonPage({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 space-y-6 max-w-4xl mx-auto", className)}>
      <div className="flex items-center gap-4">
        <SkeletonAvatar size="lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <SkeletonModuleGrid />
      <SkeletonList count={3} />
    </div>
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonHero,
  SkeletonList,
  SkeletonModuleGrid,
  SkeletonTyping,
  SkeletonPage,
};
