import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import LowBandwidthDashboard from "@/components/LowBandwidthDashboard";
import { useBetaAccess } from "@/hooks/useBetaAccess";
import ReentryFlow from "@/components/ReentryFlow";
import BetterMirror from "@/components/BetterMirror";
import PageSkeleton from "@/components/PageSkeleton";
import { REENTRY, LOW_BANDWIDTH } from "../../../shared/adaptive-language";
import {
  Waves, BookOpen, Target, Compass, Leaf, Sparkles,
  CheckCircle2, Circle, TrendingUp, MessageCircle,
  ArrowRight, Flame, Brain, Heart, Wind
} from "lucide-react";

const EGS_EMOTIONS = [
  { level: 22, name: "Joy / Appreciation / Love" },
  { level: 20, name: "Passion / Enthusiasm" },
  { level: 18, name: "Positive Expectation / Belief" },
  { level: 16, name: "Optimism" },
  { level: 14, name: "Hopefulness" },
  { level: 12, name: "Contentment" },
  { level: 10, name: "Boredom" },
  { level: 8, name: "Frustration / Irritation" },
  { level: 6, name: "Worry / Doubt" },
  { level: 4, name: "Anger / Blame" },
  { level: 2, name: "Fear / Grief / Powerlessness" },
];

const MODULE_CONFIG = [
  { key: "state", label: "State", icon: Waves, color: "text-state", bg: "bg-state/10", href: "/state" },
  { key: "story", label: "Story", icon: BookOpen, color: "text-story", bg: "bg-story/10", href: "/story" },
  { key: "standards", label: "Standards", icon: Target, color: "text-standards", bg: "bg-standards/10", href: "/standards" },
  { key: "strategy", label: "Strategy", icon: Compass, color: "text-strategy", bg: "bg-strategy/10", href: "/strategy" },
  { key: "stewardship", label: "Stewardship", icon: Leaf, color: "text-stewardship", bg: "bg-stewardship/10", href: "/stewardship" },
];

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [emotionalScore, setEmotionalScore] = useState(14);
  const [energyLevel, setEnergyLevel] = useState(7);
  const [clarityLevel, setClarityLevel] = useState(7);
  const [checkInNote, setCheckInNote] = useState("");
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);
  const [showReentry, setShowReentry] = useState(false);
  const [daysSinceActive, setDaysSinceActive] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    const lastVisit = localStorage.getItem("lifeos_last_visit");
    const now = Date.now();
    if (lastVisit) {
      const days = Math.floor((now - parseInt(lastVisit)) / (1000 * 60 * 60 * 24));
      if (days >= 2) {
        setDaysSinceActive(days);
        setShowReentry(true);
      }
    }
    localStorage.setItem("lifeos_last_visit", String(now));
  }, [isAuthenticated]);

  const { data: dashData, refetch, isLoading: dashLoading } = trpc.profile.dashboard.useQuery(undefined, { enabled: isAuthenticated });
  const { data: habits } = trpc.habits.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: todayLogs } = trpc.habits.todayLogs.useQuery(undefined, { enabled: isAuthenticated });
  const { data: oracleInsights } = trpc.oracle.insights.useQuery(undefined, { enabled: isAuthenticated });
  const { data: lastPracticed } = trpc.pathways.lastPracticed.useQuery(undefined, { enabled: isAuthenticated });
  const { data: streakData } = trpc.pathways.practiceStreak.useQuery(undefined, { enabled: isAuthenticated });

  const createCheckIn = trpc.checkIn.create.useMutation({
    onSuccess: () => { toast.success("Check-in saved. The Oracle is listening."); setShowCheckIn(false); refetch(); },
  });
  const logHabit = trpc.habits.logCompletion.useMutation({
    onSuccess: () => {
      toast.success("Habit logged. 1% better.");
      utils.habits.todayLogs.invalidate();
      refetch();
    },
  });
  const utils = trpc.useUtils();
  const markInsightRead = trpc.oracle.markRead.useMutation({ onSuccess: () => refetch() });

  const completedHabitIds = new Set((todayLogs ?? []).map((l: any) => l.habitId));
  const currentEmotion = EGS_EMOTIONS.find(e => e.level <= emotionalScore) ?? EGS_EMOTIONS[EGS_EMOTIONS.length - 1];
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };
  const { hasAccess, daysLeft } = useBetaAccess();
  const { data: myReferral } = trpc.referral.myTrialCode.useQuery(undefined, { retry: false });

  const hasHabits = habits && habits.length > 0;
  const hasJournal = dashData?.recentJournals && dashData.recentJournals.length > 0;

  const nextStep = !hasHabits
    ? { label: "Build your first habit", sub: "Your Rhythms are empty. Start with one small identity-based habit.", href: "/standards", cta: "Build My Rhythms" }
    : !hasJournal
    ? { label: "Write your first journal entry", sub: "Reflection is where transformation begins. Take 5 minutes to write.", href: "/journal", cta: "Open Journal" }
    : { label: "Begin today's check-in", sub: "How you feel right now is data. Check in and let the Oracle listen.", href: null, cta: "Start Check-in", action: () => setShowCheckIn(true) };

  useEffect(() => {
    const stored = localStorage.getItem("lifeos_low_bandwidth");
    if (stored === "true") setLowBandwidthMode(true);
  }, []);

  const toggleLowBandwidth = () => {
    const next = !lowBandwidthMode;
    setLowBandwidthMode(next);
    localStorage.setItem("lifeos_low_bandwidth", String(next));
    if (next) toast("Simplified view on. One thing at a time.", { icon: "🌿" });
  };

  if (lowBandwidthMode) {
    return <LowBandwidthDashboard onExit={toggleLowBandwidth} />;
  }

  if (isAuthenticated && dashLoading) {
    return <PageSkeleton rows={3} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {showReentry && (
        <ReentryFlow
          daysSinceActive={daysSinceActive}
          onDismiss={() => setShowReentry(false)}
        />
      )}
      <Nav />
      <div className="container pt-20 pb-24 max-w-5xl mx-auto px-4 sm:px-6">
        {/* Adaptive top bar */}
        <div className="flex items-center justify-end mb-3">
          <button
            onClick={toggleLowBandwidth}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full border border-border hover:border-primary/30"
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{LOW_BANDWIDTH.toggleLabel}</span>
            <span className="sm:hidden">Simplify</span>
          </button>
        </div>

        {/* 7-day expiry warning banner */}
        {hasAccess && daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
          <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/8">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-red-400 shrink-0" />
              <span className="text-sm text-red-300">Your beta trial ends in <strong>{daysLeft} day{daysLeft !== 1 ? "s" : ""}</strong>. Upgrade to keep full access.</span>
            </div>
            <Link href="/pricing">
              <button className="text-xs font-semibold text-red-400 border border-red-500/40 rounded-full px-3 py-1 hover:bg-red-500/15 transition-colors shrink-0">Upgrade</button>
            </Link>
          </div>
        )}

        {/* Greeting + check-in */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
          <div className="min-w-0">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-1">Welcome back to your Lifewoven</p>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light text-foreground leading-tight">
              {greeting()}, {user?.name?.split(" ")[0] ?? "friend"}.
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start">
            {hasAccess && daysLeft !== null && daysLeft <= 45 && (
              <Link href="/pricing">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                  daysLeft <= 7
                    ? "bg-red-500/10 border-red-500/20 hover:bg-red-500/15"
                    : "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15"
                }`}>
                  <Sparkles className={`h-3.5 w-3.5 ${daysLeft <= 7 ? "text-red-400" : "text-amber-400"}`} />
                  <span className={`text-xs font-medium ${daysLeft <= 7 ? "text-red-400" : "text-amber-400"}`}>
                    {daysLeft}d beta
                  </span>
                </div>
              </Link>
            )}
            {myReferral?.eligible && myReferral.redeemedCount > 0 && (
              <Link href="/referrals">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors cursor-pointer">
                  <Heart className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">{myReferral.redeemedCount} gifted</span>
                </div>
              </Link>
            )}
            {streakData && streakData.streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                <Flame className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">{streakData.streak}</span>
                <span className="text-xs text-muted-foreground hidden sm:inline">day streak</span>
              </div>
            )}
            <Button size="sm" className="gap-2" onClick={() => setShowCheckIn(!showCheckIn)}>
              <Heart className="h-4 w-4" />
              <span>Daily Check-in</span>
            </Button>
          </div>
        </div>

        {/* Next Step Hero Card */}
        {!showCheckIn && (
          <div className="p-4 sm:p-5 rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/5 to-transparent mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <ArrowRight className="h-4 w-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-mono text-accent uppercase tracking-wider mb-0.5">Your Next Step</p>
                  <p className="font-serif text-base font-light text-foreground">{nextStep.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{nextStep.sub}</p>
                </div>
              </div>
              {nextStep.href ? (
                <Button asChild size="sm" className="shrink-0 gap-1.5 self-start sm:self-center">
                  <Link href={nextStep.href}>{nextStep.cta} <ArrowRight className="h-3.5 w-3.5" /></Link>
                </Button>
              ) : (
                <Button size="sm" className="shrink-0 gap-1.5 self-start sm:self-center" onClick={nextStep.action}>
                  {nextStep.cta} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Check-in panel */}
        {showCheckIn && (
          <div className="p-4 sm:p-6 rounded-2xl border border-border bg-card mb-6 sm:mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
            <h2 className="font-serif text-xl font-light text-foreground mb-5">How are you right now?</h2>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2 gap-2">
                  <label className="text-sm text-muted-foreground">Emotional State</label>
                  <span className="text-xs font-mono text-foreground text-right max-w-[160px] truncate">{currentEmotion?.name}</span>
                </div>
                <Slider min={1} max={22} step={1} value={[emotionalScore]} onValueChange={([v]) => setEmotionalScore(v)} className="mb-1" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>Fear / Grief</span><span>Joy / Love</span></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Energy: {energyLevel}/10</label>
                  <Slider min={1} max={10} step={1} value={[energyLevel]} onValueChange={([v]) => setEnergyLevel(v)} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Clarity: {clarityLevel}/10</label>
                  <Slider min={1} max={10} step={1} value={[clarityLevel]} onValueChange={([v]) => setClarityLevel(v)} />
                </div>
              </div>
              <Textarea placeholder="What's alive in you right now? (optional)" value={checkInNote} onChange={e => setCheckInNote(e.target.value)} className="resize-none text-sm" rows={2} />
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => createCheckIn.mutate({ emotionalScore, energyLevel, clarityLevel, note: checkInNote || undefined })} disabled={createCheckIn.isPending} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Save Check-in
                </Button>
                <Button variant="ghost" onClick={() => setShowCheckIn(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: 5S, habits, journal */}
          <div className="lg:col-span-2 space-y-6">
            {/* 5S Grid */}
            <div>
              <h2 className="font-serif text-lg font-light text-foreground mb-3">Your 5S Framework</h2>
              <div className="grid grid-cols-5 gap-2">
                {MODULE_CONFIG.map(({ key, label, icon: Icon, color, bg, href }) => (
                  <Link key={key} href={href}>
                    <div className={`p-2 sm:p-3 rounded-xl border border-border ${bg} hover:border-muted-foreground transition-all cursor-pointer text-center group`}>
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color} mx-auto mb-1 sm:mb-1.5 group-hover:scale-110 transition-transform`} />
                      <p className="text-[10px] sm:text-xs font-medium text-foreground leading-tight">{label}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Habits */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-serif text-lg font-light text-foreground">Today's Rhythms</h2>
                <Link href="/standards"><Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground h-8 px-2">Manage <ArrowRight className="h-3 w-3" /></Button></Link>
              </div>
              {habits && habits.length > 0 ? (
                <div className="space-y-2">
                  {habits.slice(0, 5).map((habit: any) => {
                    const done = completedHabitIds.has(habit.id);
                    return (
                      <div key={habit.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${done ? "border-accent/30 bg-accent/5" : "border-border bg-card hover:border-muted-foreground"}`}>
                        <button
                          onClick={() => !done && logHabit.mutate({ habitId: habit.id })}
                          disabled={done}
                          className="flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2"
                          aria-label={done ? "Habit completed" : "Mark habit complete"}
                        >
                          {done ? <CheckCircle2 className="h-5 w-5 text-accent" /> : <Circle className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm sm:text-base font-medium truncate ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>{habit.name}</p>
                          {habit.identityStatement && <p className="text-xs text-muted-foreground truncate">{habit.identityStatement}</p>}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Flame className="h-3.5 w-3.5 text-orange-400" />
                          <span className="text-xs font-mono text-muted-foreground">{habit.streak}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-5 rounded-2xl border border-dashed border-accent/20 bg-accent/3 text-center">
                  <Target className="h-7 w-7 text-accent/40 mx-auto mb-3" />
                  <p className="font-serif text-base font-light text-foreground mb-1">Your Rhythms are waiting.</p>
                  <p className="text-sm text-muted-foreground mb-4">Habits are not about discipline — they are about identity. Who do you want to become? Start with one habit that reflects that person.</p>
                  <Button asChild size="sm"><Link href="/standards">Build My First Habit</Link></Button>
                </div>
              )}
            </div>

            {/* Journal */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-serif text-lg font-light text-foreground">Recent Journal</h2>
                <Link href="/journal"><Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground h-8 px-2">All entries <ArrowRight className="h-3 w-3" /></Button></Link>
              </div>
              {dashData?.recentJournals && dashData.recentJournals.length > 0 ? (
                <div className="space-y-2">
                  {dashData.recentJournals.map((entry: any) => (
                    <Link key={entry.id} href={`/journal/${entry.id}`}>
                      <div className="p-3 rounded-xl border border-border bg-card hover:border-muted-foreground transition-all cursor-pointer">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm sm:text-base font-medium text-foreground truncate">{entry.title || entry.content.slice(0, 60) + "..."}</p>
                          <Badge variant="secondary" className="text-xs flex-shrink-0 capitalize">{entry.module}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(entry.createdAt).toLocaleDateString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-5 rounded-2xl border border-dashed border-story/30 bg-story/3 text-center">
                  <Brain className="h-7 w-7 text-story/40 mx-auto mb-3" />
                  <p className="font-serif text-base font-light text-foreground mb-1">Your journal is a blank canvas.</p>
                  <p className="text-sm text-muted-foreground mb-4">Five minutes of honest writing can reveal more than five hours of thinking. What is alive in you right now?</p>
                  <Button asChild size="sm"><Link href="/journal">Begin Writing</Link></Button>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Oracle, Pathways, Quick Actions */}
          <div className="space-y-6">
            {/* Oracle Insights */}
            <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-accent/10"><Sparkles className="h-4 w-4 text-accent" /></div>
                <h2 className="font-serif text-base font-light text-foreground">Oracle Insights</h2>
              </div>
              {oracleInsights && oracleInsights.length > 0 ? (
                <div className="space-y-3">
                  {oracleInsights.map((insight: any) => (
                    <div key={insight.id} className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                      <p className="text-xs text-muted-foreground capitalize mb-1">{insight.type}</p>
                      <p className="text-sm text-foreground leading-relaxed">{insight.content}</p>
                      <button onClick={() => markInsightRead.mutate({ id: insight.id })} className="text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors">Dismiss</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3">
                  <p className="text-sm text-muted-foreground mb-3">Complete check-ins and journal entries to receive Oracle insights.</p>
                  <Button asChild size="sm" variant="outline" className="gap-2 text-xs">
                    <Link href="/oracle"><MessageCircle className="h-3 w-3" /> Talk to Oracle</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Active Pathways */}
            <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-secondary"><TrendingUp className="h-4 w-4 text-foreground" /></div>
                <h2 className="font-serif text-base font-light text-foreground">Active Pathways</h2>
              </div>
              {lastPracticed && (
                <div className="mb-3 px-3 py-2 rounded-lg bg-accent/5 border border-accent/20">
                  <p className="text-xs text-muted-foreground">Last practiced</p>
                  <p className="text-sm font-medium text-foreground capitalize">{lastPracticed.pathway} <span className="text-xs font-normal text-muted-foreground">— {lastPracticed.stepsCompleted}/{lastPracticed.totalSteps} steps · {new Date(lastPracticed.completedAt).toLocaleDateString()}</span></p>
                </div>
              )}
              {dashData?.activePathways && dashData.activePathways.length > 0 ? (
                <div className="space-y-3">
                  {dashData.activePathways.map((p: any) => (
                    <div key={p.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground capitalize truncate">{p.pathway}</p>
                        <span className="text-xs font-mono text-muted-foreground shrink-0">{p.currentStep}/{p.totalSteps}</span>
                      </div>
                      <Progress value={(p.currentStep / p.totalSteps) * 100} className="h-1" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-xs text-muted-foreground mb-3">No active pathways.</p>
                  <Button asChild size="sm" variant="outline" className="text-xs"><Link href="/audit">Take Alignment Audit</Link></Button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card">
              <h2 className="font-serif text-base font-light text-foreground mb-3">Quick Actions</h2>
              <div className="space-y-1">
                {[
                  { href: "/btw", icon: Leaf, label: "Before the Words" },
                  { href: "/journal", icon: Brain, label: "New Journal Entry" },
                  { href: "/oracle", icon: Sparkles, label: "Ask the Oracle" },
                  { href: "/community", icon: MessageCircle, label: "Community" },
                  { href: "/library", icon: BookOpen, label: "Resource Library" },
                ].map(({ href, icon: Icon, label }) => (
                  <Button key={href} asChild variant="ghost" size="sm" className="w-full justify-start gap-2 text-sm h-10">
                    <Link href={href}><Icon className="h-4 w-4 text-muted-foreground" />{label}</Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
