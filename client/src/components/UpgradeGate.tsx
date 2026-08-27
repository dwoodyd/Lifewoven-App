import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";
import { Link } from "wouter";

interface UpgradeGateProps {
  feature: string;
  description: string;
  requiredTier?: "seeker" | "oracle";
  children: React.ReactNode;
  isLocked: boolean;
}

export function UpgradeGate({ feature, description, requiredTier = "seeker", children, isLocked }: UpgradeGateProps) {
  if (!isLocked) return <>{children}</>;

  const planLabel = requiredTier === "oracle" ? "Oracle" : "Seeker";
  const planPrice = requiredTier === "oracle" ? "$49/mo" : "$19/mo";

  return (
    <div className="relative">
      {/* Blurred preview */}
      <div className="pointer-events-none select-none blur-sm opacity-40 overflow-hidden max-h-32">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl border border-border p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Lock className="h-4 w-4 text-primary" />
        </div>
        <p className="text-sm font-light text-foreground mb-1">{feature}</p>
        <p className="text-xs text-muted-foreground font-light mb-4 max-w-xs">{description} When you are ready, {planLabel} opens this part of your practice.</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link href={`/pricing?tier=${requiredTier}`}>
            <Button size="sm" className="gap-1.5">
            <Sparkles className="h-3 w-3" />
              Explore {planLabel} — {planPrice}
            </Button>
          </Link>
          <Link href="/dashboard" className="text-xs text-muted-foreground underline-offset-4 hover:underline">Not now</Link>
        </div>
      </div>
    </div>
  );
}

// Inline compact version for buttons
export function UpgradeButton({ requiredTier = "seeker" }: { requiredTier?: "seeker" | "oracle" }) {
  const planLabel = requiredTier === "oracle" ? "Oracle ($49/mo)" : "Seeker ($19/mo)";

  return (
    <Link href="/pricing">
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
      >
        <Lock className="h-3 w-3" />
        Upgrade to {planLabel}
      </Button>
    </Link>
  );
}
