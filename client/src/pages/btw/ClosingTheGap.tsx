import { Button } from "@/components/ui/button";
import Nav from "@/components/Nav";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, RefreshCw, Lock } from "lucide-react";
import { Link } from "wouter";

export default function ClosingTheGap() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = trpc.btw.getStats.useQuery();
  const { data: weeklyReflection, refetch: refetchWeekly } = trpc.btw.getLatestWeeklyReflection.useQuery();
  const { data: memberStatus } = trpc.paypalOrders.getMembershipStatus.useQuery(undefined, { enabled: !!user });
  const canUseWeeklyReflection = memberStatus?.tier === "seeker" || memberStatus?.tier === "oracle";
  const generateMutation = trpc.btw.generateWeeklyReflection.useMutation({ onSuccess: () => refetchWeekly() });

  const METRIC_CARDS = stats ? [
    { label: "Sessions Completed", value: stats.totalSessions, sub: `${stats.morningCount} morning · ${stats.eveningCount} evening` },
    { label: "Returns Logged", value: stats.returnsCount, sub: "Times you found your way back" },
    { label: "Prayers Written", value: stats.prayersCount, sub: "Honest words offered" },
    { label: "Gratitude Entries", value: stats.gratitudeCount, sub: "Things named and received" },
  ] : [];

  const weeklyData = weeklyReflection?.summaryJson as Record<string, string> | null ?? null;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">The Ground</p>
          <h1 className="font-serif text-4xl font-light text-foreground mb-3">Closing the Gap</h1>
          <p className="text-muted-foreground font-light max-w-md mx-auto">
            Your congruence insights. Not a performance review — a mirror of your inner life over time.
          </p>
        </div>

        {/* Stats */}
        {statsLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-10">
            {METRIC_CARDS.map(card => (
              <div key={card.label} className="p-6 rounded-2xl border border-border bg-card text-center">
                <p className="font-serif text-4xl font-light text-foreground mb-1">{card.value}</p>
                <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-1">{card.label}</p>
                <p className="text-xs text-muted-foreground font-light">{card.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Weekly reflection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-light text-foreground">Weekly Reflection</h2>
            {canUseWeeklyReflection ? (
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                {generateMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                Generate
              </Button>
            ) : (
              <Link href="/pricing">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" /> Seeker only
                </Button>
              </Link>
            )}
          </div>

          {!canUseWeeklyReflection && (
            <div className="rounded-2xl border border-border bg-secondary/20 p-6 text-center mb-4">
              <p className="text-sm font-light text-muted-foreground">Weekly AI reflection is available on the <span className="text-foreground">Seeker</span> plan.</p>
            </div>
          )}
          {weeklyData ? (
            <div className="space-y-4">
              {[
                { key: "stateShowedUp", label: "State that showed up most" },
                { key: "driftedMost", label: "Where you drifted" },
                { key: "returnedBest", label: "How you returned" },
                { key: "helpedMost", label: "What helped most" },
                { key: "focusNextWeek", label: "Focus for next week" },
              ].map(({ key, label }) => weeklyData[key] && (
                <div key={key} className="p-5 rounded-2xl border border-border bg-card">
                  <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-2">{label}</p>
                  <p className="text-base text-foreground font-light leading-relaxed">{weeklyData[key]}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-border bg-card text-center">
              <p className="text-muted-foreground font-light mb-4 text-base">
                No weekly reflection yet. Generate one to see patterns across your practices this week.
              </p>
              <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="gap-2">
                {generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Generate Weekly Reflection
              </Button>
            </div>
          )}
        </div>

        {/* Encouragement */}
        <div className="p-6 rounded-2xl border border-border bg-secondary/30 text-center">
          <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-md mx-auto">
            The gap between your inner life and your outer expression closes slowly — through return, not perfection. Every practice here is a closing.
          </p>
        </div>
      </div>
    </div>
  );
}
