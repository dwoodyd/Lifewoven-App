import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { User, BookOpen, Activity, Star, LogOut, ArrowRight, Flame, Lock, Sparkles, RefreshCw, Quote } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

const DIM_LABELS: Record<string, string> = {
  state: "State", story: "Story", standards: "Standards",
  strategy: "Strategy", stewardship: "Stewardship",
};
const DIM_COLORS: Record<string, string> = {
  state: "bg-state", story: "bg-story", standards: "bg-standards",
  strategy: "bg-strategy", stewardship: "bg-stewardship",
};
const CANONICAL_DIMENSIONS = ["state", "story", "standards", "strategy", "stewardship"] as const;
const TIER_LABELS: Record<string, string> = {
  explorer: "Explorer", seeker: "Seeker", oracle: "Oracle",
};

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const utils = trpc.useUtils();
  const { data: dashData } = trpc.profile.dashboard.useQuery(undefined, { enabled: isAuthenticated });
  const { data: latestAudit } = trpc.audit.latest.useQuery(undefined, { enabled: isAuthenticated });
  const { data: identityData, isLoading: identityLoading } = trpc.profile.getIdentitySentence.useQuery(undefined, { enabled: isAuthenticated });

  const generateIdentity = trpc.profile.generateIdentitySentence.useMutation({
    onSuccess: (data) => {
      toast.success("Identity Sentence generated.");
      utils.profile.getIdentitySentence.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="container pt-20 pb-24 max-w-xl mx-auto text-center px-4 sm:px-6">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-serif text-3xl font-light text-foreground mb-3">Your Profile</h1>
          <p className="text-muted-foreground mb-8">Sign in to view your profile, track your progress, and manage your account.</p>
          <Button asChild><a href={getLoginUrl('/profile')}>Sign In</a></Button>
        </div>
      </div>
    );
  }

  const tier = (user as any)?.membershipTier ?? "explorer";
  const pathway = user?.primaryPathway;
  const scores = latestAudit?.scores as Record<string, number> | null | undefined;
  const isFoundingMember = (user as any)?.foundingMember === true;
  const foundingTier = (user as any)?.foundingTier as string | null | undefined;

  // Last pathway completed — from activePathways, pick the one with highest progress
  const lastPathway = dashData?.activePathways?.[0];

  // Identity sentence — from DB or fallback
  const identitySentence = identityData?.identitySentence;
  const identityGeneratedAt = identityData?.identitySentenceGeneratedAt;
  const daysSinceGenerated = identityGeneratedAt
    ? Math.floor((Date.now() - new Date(identityGeneratedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const canRegenerate = daysSinceGenerated === null || daysSinceGenerated >= 28;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-2xl mx-auto px-4 sm:px-6 space-y-5">

        {/* Identity card */}
        <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card text-center">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-2xl font-light text-foreground mb-1">{user?.name || "Seeker"}</h1>
          <p className="text-sm text-muted-foreground mb-3">{user?.email || ""}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            <Badge variant="secondary" className="capitalize">{TIER_LABELS[tier] ?? tier}</Badge>
            {pathway && (
              <Badge variant="outline" className="capitalize gap-1">
                <Flame className="h-3 w-3" /> {pathway} pathway
              </Badge>
            )}
            {isFoundingMember && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-500/15 border border-violet-500/30 text-violet-600 dark:text-violet-300"
              >
                <Sparkles className="h-3 w-3" />
                Founding Member
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => logout()}>
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </Button>
        </div>

        {/* Identity Sentence card */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Quote className="h-4 w-4 text-accent" />
              <h2 className="font-serif text-lg font-light text-foreground">Identity Sentence</h2>
            </div>
            {identityGeneratedAt && (
              <span className="text-xs text-muted-foreground">
                {canRegenerate ? "Ready to refresh" : `Refresh in ${28 - (daysSinceGenerated ?? 0)}d`}
              </span>
            )}
          </div>
          {identityLoading ? (
            <div className="h-10 bg-secondary/50 rounded-lg animate-pulse" />
          ) : identitySentence ? (
            <div className="space-y-3">
              <p className="font-serif text-xl font-light text-foreground italic leading-relaxed">
                "{identitySentence}"
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground"
                disabled={!canRegenerate || generateIdentity.isPending}
                onClick={() => generateIdentity.mutate()}
              >
                <RefreshCw className={`h-3 w-3 ${generateIdentity.isPending ? "animate-spin" : ""}`} />
                {generateIdentity.isPending ? "Generating…" : canRegenerate ? "Regenerate" : `Refresh in ${28 - (daysSinceGenerated ?? 0)} days`}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your Identity Sentence is a one-line reflection of who you are becoming — generated from your behavior data. It updates monthly as you grow.
              </p>
              <Button
                size="sm"
                className="gap-2"
                disabled={generateIdentity.isPending}
                onClick={() => generateIdentity.mutate()}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {generateIdentity.isPending ? "Generating…" : "Generate My Identity Sentence"}
              </Button>
            </div>
          )}
        </div>

        {/* Founding member rate-lock card */}
        {isFoundingMember && (
          <div
            className="p-5 rounded-2xl flex items-start gap-4 bg-violet-500/10 border border-violet-500/25 shadow-sm"
          >
            <div
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5 bg-violet-500/20 border border-violet-500/30"
            >
              <Lock className="h-4 w-4 text-violet-500 dark:text-violet-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium mb-0.5 text-violet-700 dark:text-violet-200">
                Founding Member · {TIER_LABELS[foundingTier ?? ""] ?? foundingTier ?? "Oracle"}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Your founding rate is <strong className="text-violet-600 dark:text-violet-300">locked for life</strong>. As long as your subscription stays active, you'll never pay more than your founding price — even as retail pricing rises.
              </p>
            </div>
          </div>
        )}

        {/* Stats row */}
        {dashData && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { icon: BookOpen, label: "Journals", value: dashData.recentJournals?.length ?? 0 },
              { icon: Activity, label: "Check-ins", value: dashData.checkInCount ?? 0 },
              { icon: Star, label: "Habits", value: dashData.activeHabits?.length ?? 0 },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="p-3 sm:p-5 rounded-2xl border border-border bg-card text-center">
                <Icon className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-xl sm:text-2xl font-light text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* 5S Alignment snapshot */}
        {scores && Object.keys(scores).length > 0 && (
          <div className="p-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-light text-foreground">5S Alignment</h2>
              <Link href="/audit"><span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Retake audit →</span></Link>
            </div>
            <div className="space-y-3">
              {CANONICAL_DIMENSIONS
                .filter((dim) => typeof scores[dim] === "number")
                .map((dim) => {
                  const pct = scores[dim];
                  return (
                  <div key={dim}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground capitalize">{DIM_LABELS[dim] ?? dim}</span>
                      <span className="text-xs font-mono text-muted-foreground">{Math.round(pct as number)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full ${DIM_COLORS[dim] ?? "bg-accent"} opacity-80`}
                        style={{ width: `${Math.round(pct as number)}%` }}
                      />
                    </div>
                  </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Active pathways + last completed */}
        {dashData?.activePathways && dashData.activePathways.length > 0 && (
          <div className="p-6 rounded-2xl border border-border bg-card">
            <h2 className="font-serif text-xl font-light text-foreground mb-4">Active Pathways</h2>
            <div className="space-y-2">
              {dashData.activePathways.map((p: any) => (
                <Link key={p.id} href={`/pathway/${p.pathwayId}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-accent/40 hover:bg-accent/5 transition-all cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">{p.pathwayId?.replace(/-/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">Step {p.currentStep ?? 1}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-serif text-xl font-light text-foreground mb-4">Quick Links</h2>
          <div className="space-y-2">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/weave", label: "The Weave" },
              { href: "/audit", label: "Load-Bearing Survey" },
              { href: "/pricing", label: "Upgrade Plan" },
              { href: "/store", label: "Store" },
            ].map(({ href, label }) => (
              <Link key={href} href={href}>
                <div className="p-3 rounded-lg hover:bg-secondary transition-colors cursor-pointer text-sm text-foreground">{label}</div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
