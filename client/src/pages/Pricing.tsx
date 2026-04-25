import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, Sparkles, Star, Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useState, useEffect } from "react";

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

interface SubStatus {
  tier: string;
  subscriptionId: string | null;
  status: string;
}

export default function Pricing() {
  const { user } = useAuth();
  const [subStatus, setSubStatus] = useState<SubStatus | null>(null);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);

  // Fetch current subscription status via PayPal endpoint
  useEffect(() => {
    if (!user) return;
    fetch("/api/paypal/subscription/status", { credentials: "include" })
      .then(r => r.json())
      .then((d: SubStatus) => setSubStatus(d))
      .catch(() => {});
  }, [user]);

  const currentTier = subStatus?.tier ?? "explorer";

  async function handleTierCta(tierName: string) {
    if (tierName === "Explorer") return;
    const plan = tierName.toLowerCase() as "seeker" | "oracle";
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    if (currentTier === plan) return;

    setPendingPlan(plan);
    try {
      const origin = window.location.origin;
      const res = await fetch("/api/paypal/subscription/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          returnUrl: `${origin}/subscription/success?plan=${plan}`,
          cancelUrl: `${origin}/pricing`,
        }),
      });
      const data = await res.json() as { approvalUrl?: string; error?: string };
      if (!data.approvalUrl) {
        toast.error(data.error ?? "Could not start checkout. Please try again.");
        return;
      }
      toast.info("Redirecting to PayPal…");
      window.open(data.approvalUrl, "_blank");
    } catch {
      toast.error("Checkout failed. Please try again.");
    } finally {
      setPendingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Investment</p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foreground mb-4">Choose Your Path</h1>
          <p className="text-muted-foreground text-lg font-light max-w-xl mx-auto">Every tier is designed to create real transformation. Start free. Upgrade when you are ready.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-10 sm:mb-16">
          {TIERS.map(tier => (
            <div key={tier.name} className={`p-6 rounded-2xl border flex flex-col ${tier.highlight ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`}>
              {tier.highlight && (
                <div className="flex items-center gap-1.5 mb-4">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-mono tracking-widest uppercase opacity-70">Most Popular</span>
                </div>
              )}
              <h2 className={`font-serif text-2xl font-light mb-1 ${tier.highlight ? "text-background" : "text-foreground"}`}>{tier.name}</h2>
              <div className="flex items-baseline gap-1 mb-3">
                <span className={`text-3xl font-light ${tier.highlight ? "text-background" : "text-foreground"}`}>{tier.price}</span>
                <span className={`text-sm ${tier.highlight ? "opacity-60" : "text-muted-foreground"}`}>{tier.period}</span>
              </div>
              <p className={`text-base font-light mb-6 ${tier.highlight ? "opacity-70" : "text-muted-foreground"}`}>{tier.description}</p>
              <div className="space-y-2 mb-8 flex-1">
                {tier.features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <Check className={`h-3.5 w-3.5 flex-shrink-0 ${tier.highlight ? "opacity-80" : "text-muted-foreground"}`} />
                    <span className={`text-base ${tier.highlight ? "opacity-80" : "text-muted-foreground"}`}>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA button */}
              {tier.name === "Explorer" ? (
                currentTier === "explorer" ? (
                  <div className="rounded-xl border border-border bg-secondary/40 py-2.5 text-center text-sm text-muted-foreground font-light">Current plan</div>
                ) : (
                  <Button asChild variant="outline" className="w-full">
                    <a href={getLoginUrl()}>{tier.cta}</a>
                  </Button>
                )
              ) : currentTier === tier.name.toLowerCase() ? (
                <div className="rounded-xl border border-border bg-secondary/40 py-2.5 text-center text-sm text-muted-foreground font-light">Current plan</div>
              ) : (
                <Button
                  variant={tier.highlight ? "secondary" : "outline"}
                  className="w-full"
                  onClick={() => handleTierCta(tier.name)}
                  disabled={pendingPlan === tier.name.toLowerCase()}
                >
                  {pendingPlan === tier.name.toLowerCase() ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Opening PayPal…
                    </span>
                  ) : tier.cta}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="mb-10 sm:mb-16 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 font-light text-muted-foreground w-1/2">Feature</th>
                <th className="text-center py-3 px-2 font-light text-muted-foreground">Explorer</th>
                <th className="text-center py-3 px-2 font-light text-foreground">Seeker</th>
                <th className="text-center py-3 px-2 font-light text-amber-400">Oracle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[
                ["Alignment Audit", true, true, true],
                ["Daily check-in & journal", true, true, true],
                ["5S Framework tools", "Overview", "Full suite", "Full suite"],
                ["Habit tracker & scorecard", false, true, true],
                ["Belief rewrite system", false, true, true],
                ["Decision journal", false, true, true],
                ["Energy audit", false, true, true],
                ["All 7 pathways", false, true, true],
                ["Community access", "Read only", "Full", "Full"],
                ["Course library", false, true, true],
                ["Oracle AI chat", false, false, "Unlimited"],
                ["AI journal reflections", false, false, true],
                ["AI decision analysis", false, false, true],
                ["Pattern insights", false, false, true],
                ["1-on-1 onboarding call", false, false, true],
              ].map(([feature, explorer, seeker, oracle]) => (
                <tr key={String(feature)} className="hover:bg-secondary/20 transition-colors">
                  <td className="py-2.5 pr-4 text-muted-foreground font-light">{feature}</td>
                  {[explorer, seeker, oracle].map((val, i) => (
                    <td key={i} className="text-center py-2.5 px-2">
                      {val === true ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500 mx-auto" />
                      ) : val === false ? (
                        <span className="text-muted-foreground/30">—</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">{val}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center p-6 sm:p-8 rounded-2xl border border-border bg-card">
          <Sparkles className="h-8 w-8 text-amber-400 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-light text-foreground mb-3">Not sure where to start?</h2>
          <p className="text-muted-foreground text-base mb-6 max-w-md mx-auto">Take the free Alignment Audit. In 5 minutes, you will know exactly which pathway and tier is right for you.</p>
          <Button asChild variant="outline"><Link href="/audit">Take the Alignment Audit</Link></Button>
        </div>
      </div>
    </div>
  );
}
