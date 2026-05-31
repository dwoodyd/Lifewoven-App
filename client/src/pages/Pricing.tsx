import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, Sparkles, Loader2, Lock, Library, Percent } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface SubStatus {
  tier: string;
  subscriptionId: string | null;
  status: string;
}

const TIERS = [
  {
    id: "explorer",
    name: "Explorer",
    badge: null as string | null,
    price: "$0",
    priceSub: "forever",
    retailPrice: null as string | null,
    annualPrice: null as string | null,
    annualRetail: null as string | null,
    annualSavings: null as string | null,
    description: "Lumin walks with you through the core tools. Begin the weave — no commitment required.",
    cta: "Start Free",
    highlight: false,
    libraryItems: null as string[] | null,
    features: [
      "Alignment Audit diagnostic",
      "Daily emotional check-in",
      "The Weave (up to 30 entries)",
      "Align & Uplift pathways",
      "5S Framework overview",
      "Public resource library",
    ],
  },
  {
    id: "seeker",
    name: "Seeker",
    badge: "Founding Rate" as string | null,
    price: "$9",
    priceSub: "/mo",
    retailPrice: "$19/mo retail" as string | null,
    annualPrice: "$89" as string | null,
    annualRetail: "$189/yr retail" as string | null,
    annualSavings: "save 53%" as string | null,
    description: "Lumin opens the full system to you. Every tool, every pathway, every module — fully unlocked.",
    cta: "Lock in Seeker",
    highlight: true,
    libraryItems: null as string[] | null,
    features: [
      "Everything in Explorer",
      "Unlimited Weave entries",
      "All 7 branded pathways",
      "Full 5S module suite",
      "Habit tracker & scorecard",
      "Decision journal & analysis",
      "Energy audit & trends",
      "Belief rewrite system",
      "The Ground full practice suite",
      "Priority support",
      "30% off all standalone store products",
    ],
  },
  {
    id: "oracle",
    name: "Oracle",
    badge: "Founding Rate · Most Popular" as string | null,
    price: "$25",
    priceSub: "/mo",
    retailPrice: "$49/mo retail" as string | null,
    annualPrice: "$249" as string | null,
    annualRetail: "$479/yr retail" as string | null,
    annualSavings: "save 48%" as string | null,
    description: "Lumin and the Oracle work continuously on your behalf — reading your patterns, naming what you cannot yet see. Plus the complete Lifewoven library.",
    cta: "Lock in Oracle",
    highlight: false,
    libraryItems: [
      "All 4 courses — Alignment Fundamentals · The Alignment Current · Identity in Motion · The Meaning Foundation",
      "Both workbooks — Belief Rewrite · Identity Stack",
      "All audio programs — Morning Alignment Series · Reset Audio",
      "Wisdom Card Deck",
    ] as string[] | null,
    features: [
      "Everything in Seeker",
      "Unlimited Oracle AI sessions (Guide / Unstuck / Pattern Mirror)",
      "AI-powered Weave reflections",
      "Cross-module pattern insights",
      "Personalized pathway recommendations",
      "Monthly Oracle deep-dive report",
      "Early access to new features",
      "1-on-1 onboarding call",
    ],
  },
];

const LIBRARY_ROWS: [string, string | boolean, string | boolean, string | boolean][] = [
  ["All 4 courses", false, "30% off", "Included"],
  ["Both workbooks", false, "30% off", "Included"],
  ["All audio programs", false, "30% off", "Included"],
  ["Wisdom Card Deck", false, "30% off", "Included"],
];

export default function Pricing() {
  const { user } = useAuth();
  const [subStatus, setSubStatus] = useState<SubStatus | null>(null);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [annual, setAnnual] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/paypal/subscription/status", { credentials: "include" })
      .then(r => r.json())
      .then((d: SubStatus) => setSubStatus(d))
      .catch(() => {});
  }, [user]);

  const currentTier = subStatus?.tier ?? "explorer";

  async function handleTierCta(tierId: string) {
    if (tierId === "explorer") return;
    const plan = tierId as "seeker" | "oracle";
    if (!user) {
      window.location.href = getLoginUrl(window.location.pathname + window.location.search);
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
          annual,
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

  const COMPARISON_ROWS: [string, string | boolean, string | boolean, string | boolean][] = [
    ["Alignment Audit", true, true, true],
    ["Daily check-in & The Weave", true, true, true],
    ["5S Framework tools", "Overview", "Full suite", "Full suite"],
    ["Habit tracker & scorecard", false, true, true],
    ["Belief rewrite system", false, true, true],
    ["Decision journal", false, true, true],
    ["Energy audit", false, true, true],
    ["All 7 pathways", false, true, true],
    ["Community access", "Read only", "Full", "Full"],
    ["Oracle AI chat", false, false, "Unlimited"],
    ["AI Weave reflections", false, false, true],
    ["AI decision analysis", false, false, true],
    ["Pattern insights", false, false, true],
    ["1-on-1 onboarding call", false, false, true],
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs tracking-[0.2em] uppercase text-amber-400/80 mb-4 font-light">Investment</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-foreground mb-5">Choose Your Path</h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Founding rates available now. Lifewoven is in closed beta. Founding members lock in at the rates below — for life, even as retail rises.
          </p>
        </div>

        {/* Annual / Monthly toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className={`text-sm font-light transition-colors ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
          <button
            onClick={() => setAnnual(v => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${annual ? "bg-amber-500" : "bg-secondary"}`}
            aria-label="Toggle annual billing"
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${annual ? "translate-x-6" : "translate-x-1"}`} />
          </button>
          <span className={`text-sm font-light transition-colors ${annual ? "text-foreground" : "text-muted-foreground"}`}>
            Annual <span className="text-amber-400 text-xs ml-1">save up to 48%</span>
          </span>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {TIERS.map(tier => {
            const isCurrent = currentTier === tier.id;
            const displayPrice = annual && tier.annualPrice ? tier.annualPrice : tier.price;
            const displaySub = annual && tier.annualPrice ? "/yr" : tier.priceSub;
            const displayRetail = annual ? tier.annualRetail : tier.retailPrice;
            const displaySavings = annual ? tier.annualSavings : null;

            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl border p-6 flex flex-col gap-5 transition-all ${
                  tier.highlight
                    ? "border-amber-400/50 bg-amber-400/5 shadow-lg shadow-amber-400/10"
                    : tier.id === "oracle"
                    ? "border-violet-400/30 bg-violet-400/5"
                    : "border-border bg-card"
                }`}
              >
                {tier.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    tier.id === "oracle" ? "bg-violet-500/20 text-violet-300 border border-violet-400/30" : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                  }`}>
                    {tier.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {tier.id === "seeker" && <Percent className="h-4 w-4 text-amber-400" />}
                    {tier.id === "oracle" && <Library className="h-4 w-4 text-violet-400" />}
                    <h2 className="font-serif text-xl font-light text-foreground">{tier.name}</h2>
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-light text-foreground">{displayPrice}</span>
                    <span className="text-muted-foreground text-sm">{displaySub}</span>
                  </div>
                  {displayRetail && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground/60 line-through">{displayRetail}</span>
                      {displaySavings && <span className="text-xs text-emerald-400">({displaySavings})</span>}
                    </div>
                  )}
                  {tier.retailPrice && !annual && (
                    <p className="text-xs text-amber-400/70 mt-1 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Locked at founding rate for life
                    </p>
                  )}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">{tier.description}</p>

                {/* CTA */}
                {isCurrent ? (
                  <div className="rounded-xl border border-border bg-secondary/40 py-2.5 text-center text-sm text-muted-foreground font-light">
                    Current plan
                  </div>
                ) : tier.id === "explorer" ? (
                  <Button asChild variant="outline" className="w-full">
                    <a href={getLoginUrl('/pricing')}>Start Free</a>
                  </Button>
                ) : (
                  <Button
                    variant={tier.highlight ? "default" : "outline"}
                    className={`w-full ${tier.id === "oracle" ? "border-violet-400/40 text-violet-300 hover:bg-violet-400/10" : ""}`}
                    onClick={() => handleTierCta(tier.id)}
                    disabled={pendingPlan === tier.id}
                  >
                    {pendingPlan === tier.id ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Opening PayPal…
                      </span>
                    ) : tier.cta}
                  </Button>
                )}

                {/* Features */}
                <div className="flex flex-col gap-2 pt-1 border-t border-border/50">
                  {tier.features.map(f => (
                    <div key={f} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-emerald-500" />
                      <span className="text-sm text-muted-foreground leading-snug">{f}</span>
                    </div>
                  ))}
                </div>

                {/* Oracle library items */}
                {tier.libraryItems && (
                  <div className="rounded-xl border border-violet-400/20 bg-violet-400/5 p-4 flex flex-col gap-2">
                    <p className="text-xs font-medium text-violet-300 uppercase tracking-wide mb-1">Complete library included</p>
                    {tier.libraryItems.map(item => (
                      <div key={item} className="flex items-start gap-2">
                        <Library className="h-3 w-3 flex-shrink-0 mt-0.5 text-violet-400" />
                        <span className="text-xs text-muted-foreground leading-snug">{item}</span>
                      </div>
                    ))}
                    <p className="text-xs text-violet-300/70 mt-1">Combined retail: $607. Yours with Oracle.</p>
                  </div>
                )}

                {/* Founding Access CTA — shown below Oracle card for non-current-plan users */}
                {tier.id === "oracle" && !isCurrent && (
                  <div className="rounded-xl border border-violet-400/25 bg-violet-500/8 p-4 text-center">
                    <p className="text-xs text-violet-300/80 leading-relaxed mb-3">
                      Founding Members lock Oracle at{" "}
                      <strong className="text-violet-300">$25/mo</strong> — rate held for life.
                    </p>
                    <Button asChild size="sm" variant="outline" className="w-full border-violet-400/40 text-violet-300 hover:bg-violet-400/10">
                      <Link href="/apply">Apply for Founding Access</Link>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Locked-for-life callout */}
        <div className="mb-14 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6 sm:p-8 text-center">
          <Lock className="h-6 w-6 text-amber-400 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-light text-foreground mb-2">What "locked for life" means</h3>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
            When the beta closes, founding members keep their rate forever — even when public pricing rises. As long as your subscription remains active without interruption, the rate you locked in today is the rate you'll pay in five years.
          </p>
        </div>

        {/* Comparison table */}
        <div className="mb-10 sm:mb-14 overflow-x-auto">
          <h3 className="font-serif text-xl font-light text-foreground mb-5 text-center">Full feature comparison</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 font-light text-muted-foreground w-1/2">Feature</th>
                <th className="text-center py-3 px-2 font-light text-muted-foreground">Explorer</th>
                <th className="text-center py-3 px-2 font-light text-amber-300">Seeker</th>
                <th className="text-center py-3 px-2 font-light text-violet-300">Oracle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {COMPARISON_ROWS.map(([feature, explorer, seeker, oracle]) => (
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
              {/* Library section */}
              <tr className="border-t-2 border-border">
                <td colSpan={4} className="py-3 text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">
                  Complete Library Access
                </td>
              </tr>
              {LIBRARY_ROWS.map(([feature, explorer, seeker, oracle]) => (
                <tr key={String(feature)} className="hover:bg-secondary/20 transition-colors">
                  <td className="py-2.5 pr-4 text-muted-foreground font-light">{feature}</td>
                  {[explorer, seeker, oracle].map((val, i) => (
                    <td key={i} className="text-center py-2.5 px-2">
                      {val === true ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500 mx-auto" />
                      ) : val === false ? (
                        <span className="text-muted-foreground/30">—</span>
                      ) : val === "Included" ? (
                        <span className="text-xs text-violet-300 font-medium">Included</span>
                      ) : (
                        <span className="text-xs text-amber-300">{val}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom CTA */}
        <div className="text-center p-6 sm:p-8 rounded-2xl border border-border bg-card">
          <Sparkles className="h-8 w-8 text-amber-400 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-light text-foreground mb-3">Not sure where to start?</h2>
          <p className="text-muted-foreground text-base mb-6 max-w-md mx-auto">
            Take the free Alignment Audit. In 5 minutes, you'll know exactly which pathway and tier is right for you.
          </p>
          <Button asChild variant="outline">
            <Link href="/audit">Take the Alignment Audit</Link>
          </Button>
        </div>

      </div>
    </div>
  );
}
