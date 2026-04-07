import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface UpgradeGateProps {
  feature: string;
  description: string;
  requiredTier?: "seeker" | "oracle";
  children: React.ReactNode;
  isLocked: boolean;
}

export function UpgradeGate({ feature, description, requiredTier = "seeker", children, isLocked }: UpgradeGateProps) {
  const checkoutMutation = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Opening Stripe checkout…");
        window.open(data.url, "_blank");
      }
    },
    onError: (err) => toast.error(err.message),
  });

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
        <p className="text-xs text-muted-foreground font-light mb-4 max-w-xs">{description}</p>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => checkoutMutation.mutate({ plan: requiredTier, origin: window.location.origin })}
          disabled={checkoutMutation.isPending}
        >
          <Sparkles className="h-3 w-3" />
          Unlock with {planLabel} — {planPrice}
        </Button>
      </div>
    </div>
  );
}

// Inline compact version for buttons
export function UpgradeButton({ requiredTier = "seeker" }: { requiredTier?: "seeker" | "oracle" }) {
  const checkoutMutation = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Opening Stripe checkout…");
        window.open(data.url, "_blank");
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const planLabel = requiredTier === "oracle" ? "Oracle ($49/mo)" : "Seeker ($19/mo)";

  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
      onClick={() => checkoutMutation.mutate({ plan: requiredTier, origin: window.location.origin })}
      disabled={checkoutMutation.isPending}
    >
      <Lock className="h-3 w-3" />
      Upgrade to {planLabel}
    </Button>
  );
}
