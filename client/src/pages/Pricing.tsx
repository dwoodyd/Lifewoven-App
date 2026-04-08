import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, Sparkles, Star } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

const TIERS = [
  {
    name: "Explorer",
    price: "Free",
    period: "",
    description: "Begin your journey. Access the core tools that have transformed thousands of lives.",
    cta: "Start Free",
    href: getLoginUrl(),
    isExternal: true,
    highlight: false,
    features: [
      "Alignment Audit diagnostic",
      "Daily emotional check-in",
      "Journal (up to 30 entries)",
      "Align & Uplift pathways",
      "5S Framework overview",
      "Public resource library",
      "Community read access",
    ],
  },
  {
    name: "Seeker",
    price: "$19",
    period: "/month",
    description: "The full Lifewoven experience. Every tool, every pathway, every module — fully unlocked.",
    cta: "Begin Transformation",
    href: "/dashboard",
    isExternal: false,
    highlight: true,
    features: [
      "Everything in Explorer",
      "Unlimited journal entries",
      "All 7 branded pathways",
      "Full 5S module suite",
      "Habit tracker & scorecard",
      "Decision journal & analysis",
      "Energy audit & trends",
      "Belief rewrite system",
      "Community full access",
      "Course library access",
      "Priority support",
    ],
  },
  {
    name: "Oracle",
    price: "$49",
    period: "/month",
    description: "The premium AI-powered experience. The Oracle as your personal guide, available 24/7.",
    cta: "Unlock the Oracle",
    href: "/dashboard",
    isExternal: false,
    highlight: false,
    features: [
      "Everything in Seeker",
      "Unlimited Oracle AI chat",
      "AI-powered journal reflections",
      "AI decision analysis",
      "Cross-module pattern insights",
      "Personalized pathway recommendations",
      "Monthly Oracle deep-dive report",
      "Early access to new features",
      "1-on-1 onboarding call",
    ],
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const { data: subStatus } = trpc.stripe.status.useQuery(undefined, { enabled: !!user });
  const currentTier = subStatus?.tier ?? "explorer";

  const checkoutMutation = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Opening secure checkout…");
        window.open(data.url, "_blank");
      }
    },
    onError: (err) => toast.error(err.message),
  });

  function handleTierCta(tierName: string) {
    if (tierName === "Explorer") return;
    const plan = tierName.toLowerCase() as "seeker" | "oracle";
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    if (currentTier === plan) return;
    checkoutMutation.mutate({ plan, origin: window.location.origin });
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-24 pb-20 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Investment</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">Choose Your Path</h1>
          <p className="text-muted-foreground text-lg font-light max-w-xl mx-auto">Every tier is designed to create real transformation. Start free. Upgrade when you are ready.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {TIERS.map(tier => (
            <div key={tier.name} className={`p-6 rounded-2xl border flex flex-col ${tier.highlight ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`}>
              {tier.highlight && <div className="flex items-center gap-1.5 mb-4"><Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /><span className="text-xs font-mono tracking-widest uppercase opacity-70">Most Popular</span></div>}
              <h2 className={`font-serif text-2xl font-light mb-1 ${tier.highlight ? "text-background" : "text-foreground"}`}>{tier.name}</h2>
              <div className="flex items-baseline gap-1 mb-3">
                <span className={`text-3xl font-light ${tier.highlight ? "text-background" : "text-foreground"}`}>{tier.price}</span>
                <span className={`text-sm ${tier.highlight ? "opacity-60" : "text-muted-foreground"}`}>{tier.period}</span>
              </div>
              <p className={`text-sm font-light mb-6 ${tier.highlight ? "opacity-70" : "text-muted-foreground"}`}>{tier.description}</p>
              <div className="space-y-2 mb-8 flex-1">
                {tier.features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <Check className={`h-3.5 w-3.5 flex-shrink-0 ${tier.highlight ? "opacity-80" : "text-muted-foreground"}`} />
                    <span className={`text-sm ${tier.highlight ? "opacity-80" : "text-muted-foreground"}`}>{f}</span>
                  </div>
                ))}
              </div>
              {tier.name === "Explorer" ? (
                currentTier === "explorer" ? (
                  <div className="rounded-xl border border-border bg-secondary/40 py-2.5 text-center text-sm text-muted-foreground font-light">Current plan</div>
                ) : (
                  <Button asChild variant="outline" className="w-full"><a href={tier.href}>{tier.cta}</a></Button>
                )
              ) : currentTier === tier.name.toLowerCase() ? (
                <div className="rounded-xl border border-border bg-secondary/40 py-2.5 text-center text-sm text-muted-foreground font-light">Current plan</div>
              ) : (
                <Button
                  variant={tier.highlight ? "secondary" : "outline"}
                  className="w-full"
                  onClick={() => handleTierCta(tier.name)}
                  disabled={checkoutMutation.isPending && checkoutMutation.variables?.plan === tier.name.toLowerCase()}
                >
                  {checkoutMutation.isPending && checkoutMutation.variables?.plan === tier.name.toLowerCase() ? "Opening checkout…" : tier.cta}
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="text-center p-8 rounded-2xl border border-border bg-card">
          <Sparkles className="h-8 w-8 text-amber-400 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-light text-foreground mb-3">Not sure where to start?</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">Take the free Alignment Audit. In 5 minutes, you will know exactly which pathway and tier is right for you.</p>
          <Button asChild variant="outline"><Link href="/alignment-audit">Take the Alignment Audit</Link></Button>
        </div>
      </div>
    </div>
  );
}
