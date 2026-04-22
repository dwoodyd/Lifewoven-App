import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { User, BookOpen, Activity, Star, LogOut, ArrowRight, Flame } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

const DIM_LABELS: Record<string, string> = {
  state: "State", story: "Story", standards: "Standards",
  strategy: "Strategy", stewardship: "Stewardship",
};
const DIM_COLORS: Record<string, string> = {
  state: "bg-state", story: "bg-story", standards: "bg-standards",
  strategy: "bg-strategy", stewardship: "bg-stewardship",
};
const TIER_LABELS: Record<string, string> = {
  explorer: "Explorer", seeker: "Seeker", oracle: "Oracle",
};

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const { data: dashData } = trpc.profile.dashboard.useQuery(undefined, { enabled: isAuthenticated });
  const { data: latestAudit } = trpc.audit.latest.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="container pt-20 pb-24 max-w-xl mx-auto text-center px-4 sm:px-6">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-serif text-3xl font-light text-foreground mb-3">Your Profile</h1>
          <p className="text-muted-foreground mb-8">Sign in to view your profile, track your progress, and manage your account.</p>
          <Button asChild><a href={getLoginUrl()}>Sign In</a></Button>
        </div>
      </div>
    );
  }

  const tier = (user as any)?.membershipTier ?? "explorer";
  const pathway = user?.primaryPathway;
  const scores = latestAudit?.scores as Record<string, number> | null | undefined;

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
          <div className="flex items-center justify-center gap-2 mb-5">
            <Badge variant="secondary" className="capitalize">{TIER_LABELS[tier] ?? tier}</Badge>
            {pathway && (
              <Badge variant="outline" className="capitalize gap-1">
                <Flame className="h-3 w-3" /> {pathway} pathway
              </Badge>
            )}
          </div>
          {pathway && (
            <p className="text-sm text-muted-foreground italic max-w-xs mx-auto mb-5">
              "I am someone who shows up consistently for my {pathway} — and it is changing everything."
            </p>
          )}
          <Button variant="outline" size="sm" className="gap-2" onClick={() => logout()}>
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </Button>
        </div>

        {/* Stats row */}
        {dashData && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { icon: BookOpen, label: "Journals", value: dashData.recentJournals?.length ?? 0 },
              { icon: Activity, label: "Check-ins", value: dashData.recentCheckIns?.length ?? 0 },
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
              {Object.entries(scores)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([dim, pct]) => (
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
                ))}
            </div>
          </div>
        )}

        {/* Active pathways */}
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
              { href: "/journal", label: "Journal" },
              { href: "/audit", label: "Alignment Audit" },
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
