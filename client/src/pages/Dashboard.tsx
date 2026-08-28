import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Page } from "@/components/ui/page";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import LowBandwidthDashboard from "@/components/LowBandwidthDashboard";
import { useBetaAccess } from "@/hooks/useBetaAccess";
import ReentryFlow from "@/components/ReentryFlow";
import BetterMirror from "@/components/BetterMirror";
import PageSkeleton from "@/components/PageSkeleton";
import { LuminScene } from "@/components/LuminScene";
import { LumenLoadDiagnostic } from "@/components/LumenLoadDiagnostic";
import { formatLifewovenDate, formatLifewovenToday } from "@/lib/datetime";
import { REENTRY, LOW_BANDWIDTH } from "../../../shared/adaptive-language";
import {
  Waves, BookOpen, Target, Compass, Leaf, Sparkles,
  CheckCircle2, Circle, TrendingUp, MessageCircle,
  ArrowRight, Flame, Brain, Heart, Wind, Activity
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
  { key: "state", label: "State", icon: Waves, color: "text-state", bg: "bg-state/10", borderBase: "border-state/20", borderHover: "hover:border-state/50", href: "/state" },
  { key: "story", label: "Story", icon: BookOpen, color: "text-story", bg: "bg-story/10", borderBase: "border-story/20", borderHover: "hover:border-story/50", href: "/story" },
  { key: "standards", label: "Standards", icon: Target, color: "text-standards", bg: "bg-standards/10", borderBase: "border-standards/20", borderHover: "hover:border-standards/50", href: "/standards" },
  { key: "strategy", label: "Strategy", icon: Compass, color: "text-strategy", bg: "bg-strategy/10", borderBase: "border-strategy/20", borderHover: "hover:border-strategy/50", href: "/strategy" },
  { key: "stewardship", label: "Stewardship", icon: Leaf, color: "text-stewardship", bg: "bg-stewardship/10", borderBase: "border-stewardship/20", borderHover: "hover:border-stewardship/50", href: "/stewardship" },
];

import FoundingWelcomeCard from "@/components/FoundingWelcomeCard";
import PostActivationInvite from "@/components/PostActivationInvite";

function LumenEmpty({ title, body, href, onAction, cta, videoId = "peaceful_idle" }: { title: string; body: string; href?: string; onAction?: () => void; cta: string; videoId?: string }) {
  return (
    <div className="overflow-hidden border border-primary/20 bg-card text-left">
      <div className="relative h-44 overflow-hidden border-b border-primary/15 bg-background sm:h-48" aria-hidden="true">
        <LuminScene videoId={videoId} ambient loop ambientSize="min(100%, 340px)" ambientPosition={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} ambientAspectRatio="16 / 9" ambientFit="contain" ambientBlendMode="normal" className="opacity-100" />
      </div>
      <div className="max-w-sm px-5 py-5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
        {href ? (
          <Button asChild size="sm" variant="outline" className="mt-3 text-xs"><Link href={href}>{cta}</Link></Button>
        ) : (
          <Button size="sm" variant="outline" className="mt-3 text-xs" onClick={onAction}>{cta}</Button>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { data: activation } = trpc.system.activationStatus.useQuery(undefined, { enabled: isAuthenticated });
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [trialBannerDismissed, setTrialBannerDismissed] = useState(
    () => sessionStorage.getItem("lifeos_trial_banner_dismissed") === "true"
  );
  const [emotionalScore, setEmotionalScore] = useState(14);
  const [energyLevel, setEnergyLevel] = useState(7);
  const [clarityLevel, setClarityLevel] = useState(7);
  const [checkInNote, setCheckInNote] = useState("");
  const [lowBandwidthMode, setLowBandwidthMode] = useState(() => {
    // Initialize from localStorage immediately to avoid flash
    return localStorage.getItem("lifeos_low_bandwidth") === "true";
  });
  const [showReentry, setShowReentry] = useState(false);
  const [daysSinceActive, setDaysSinceActive] = useState(0);
  const [reentryTrigger, setReentryTrigger] = useState<"absence" | "overwhelm" | "shame" | "burnout">("absence");
  const [comparisonWindow, setComparisonWindow] = useState<30 | 90 | 180>(30);

  useEffect(() => {
    if (!isAuthenticated) return;
    const lastVisit = localStorage.getItem("lifeos_last_visit");
    const now = Date.now();
    if (lastVisit) {
      const days = Math.floor((now - parseInt(lastVisit)) / (1000 * 60 * 60 * 24));
      if (days >= 2) {
        setDaysSinceActive(days);
        setReentryTrigger("absence");
        setShowReentry(true);
      }
    }
    localStorage.setItem("lifeos_last_visit", String(now));
  }, [isAuthenticated]);

  const syncAccess = trpc.store.syncAccess.useMutation();
  useEffect(() => {
    if (isAuthenticated) syncAccess.mutate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const { data: dashData, refetch, isLoading: dashLoading } = trpc.profile.dashboard.useQuery(undefined, { enabled: isAuthenticated });
  const { data: habits } = trpc.habits.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: todayLogs } = trpc.habits.todayLogs.useQuery(undefined, { enabled: isAuthenticated });
  const { data: oracleInsights } = trpc.oracle.insights.useQuery(undefined, { enabled: isAuthenticated });
  const { data: lastPracticed } = trpc.pathways.lastPracticed.useQuery(undefined, { enabled: isAuthenticated });
  const { data: streakData } = trpc.pathways.practiceStreak.useQuery(undefined, { enabled: isAuthenticated });
  const { data: goalStats } = trpc.goals.stats.useQuery(undefined, { enabled: isAuthenticated });
  const { data: rbStatus } = trpc.readingBridge.getStatus.useQuery(undefined, { enabled: isAuthenticated });
  const recentCheckIns = (dashData as any)?.recentCheckIns ?? [];
  const hasRecordedCheckIns = recentCheckIns.length > 0;
  const dateKeyOptions = { year: "numeric", month: "2-digit", day: "2-digit" } as const;
  const hasDailyCheckInToday = recentCheckIns.some((checkIn: any) =>
    formatLifewovenDate(checkIn.createdAt, dateKeyOptions) === formatLifewovenToday(dateKeyOptions)
  );
  // Evening nudge: show after 5pm local time when no Daily Check-in is recorded today.
  const isEvening = new Date().getHours() >= 17;
  const showMoodNudge = isEvening && !hasDailyCheckInToday;

  // Wire Reset surfacing to check-in score < 4 and audit friction tags
  useEffect(() => {
    if (!dashData || showReentry) return; // don't override absence trigger
    const latestCheckIn = recentCheckIns[0];
    if (latestCheckIn) {
      const score = latestCheckIn.emotionalScore ?? latestCheckIn.score ?? 10;
      if (score <= 4) {
        // Low check-in score — overwhelm or burnout
        const trigger = score <= 2 ? "burnout" : "overwhelm";
        setReentryTrigger(trigger);
        setShowReentry(true);
        return;
      }
    }
    // Audit friction tags: shame after interruption or burnout
    const auditFrictionTags = (user as any)?.auditFrictionTags as string[] | null | undefined;
    if (auditFrictionTags?.includes("shame after interruption")) {
      setReentryTrigger("shame");
      setShowReentry(true);
    } else if (auditFrictionTags?.includes("burnout")) {
      setReentryTrigger("burnout");
      setShowReentry(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashData]);

  const utils = trpc.useUtils();
  const createCheckIn = trpc.checkIn.create.useMutation({
    onSuccess: () => { toast.success("Check-in saved. The Oracle is listening."); setShowCheckIn(false); refetch(); },
  });
  const logHabit = trpc.habits.logCompletion.useMutation({
    onMutate: async ({ habitId }) => {
      await utils.habits.todayLogs.cancel();
      const prev = utils.habits.todayLogs.getData();
      utils.habits.todayLogs.setData(undefined, (old) => [
        ...(old ?? []),
        { habitId, userId: 0, id: -Date.now(), note: null, quality: null, completedAt: new Date() },
      ]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) utils.habits.todayLogs.setData(undefined, ctx.prev);
    },
    onSettled: () => {
      utils.habits.todayLogs.invalidate();
      refetch();
    },
    onSuccess: () => { toast.success("You showed up. That's who you are."); },
  });
  const markInsightRead = trpc.oracle.markRead.useMutation({ onSuccess: () => refetch() });

  const completedHabitIds = new Set((todayLogs ?? []).map((l: any) => l.habitId));
  const currentEmotion = EGS_EMOTIONS.find(e => e.level <= emotionalScore) ?? EGS_EMOTIONS[EGS_EMOTIONS.length - 1];
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };
  const { hasAccess, daysLeft } = useBetaAccess();
  const { data: myReferral } = trpc.referral.myTrialCode.useQuery(undefined, { retry: false });

  const hasHabits = habits && habits.length > 0;
  const hasJournal = dashData?.recentJournals && dashData.recentJournals.length > 0;
  const primaryPathway = (user as any)?.primaryPathway as string | null | undefined;
  const onboardingCompleted = (user as any)?.onboardingCompleted as boolean | undefined;

  // Pathway-to-route mapping for audit-based routing
  const PATHWAY_ROUTES: Record<string, { href: string; label: string; sub: string; cta: string }> = {
    align: { href: "/pathway/align", label: "Begin your Align practice", sub: "Your Load-Bearing Survey recommends starting with Align — a daily grounding sequence.", cta: "Start Align" },
    reset: { href: "/pathway/reset", label: "Begin your Reset practice", sub: "Your Load-Bearing Survey recommends starting with Reset — a resilience protocol for re-entry.", cta: "Start Reset" },
    uplift: { href: "/pathway/uplift", label: "Begin your Uplift practice", sub: "Your Load-Bearing Survey recommends starting with Uplift — emotional set-point shifting.", cta: "Start Uplift" },
    rhythms: { href: "/standards", label: "Build your Rhythms", sub: "Your Load-Bearing Survey recommends starting with Rhythms — identity-based habit design.", cta: "Build My Rhythms" },
    purpose: { href: "/pathway/purpose", label: "Begin your Purpose practice", sub: "Your Load-Bearing Survey recommends starting with Purpose — meaning and direction work.", cta: "Start Purpose" },
    strategy: { href: "/strategy", label: "Open your Strategy module", sub: "Your Load-Bearing Survey recommends starting with Strategy — decision and direction clarity.", cta: "Open Strategy" },
    stewardship: { href: "/stewardship", label: "Open your Stewardship module", sub: "Your Load-Bearing Survey recommends starting with Stewardship — energy and rhythm repair.", cta: "Open Stewardship" },
  };

  const auditNextStep = primaryPathway ? PATHWAY_ROUTES[primaryPathway.toLowerCase()] : null;

  // Adaptive Intelligence: read mind patterns from user profile
  const mindPatterns = ((user as any)?.mindPatterns as string[] | null) ?? [];
  const isScattered = mindPatterns.includes("scattered") || mindPatterns.includes("open_loops");
  const hasInitiationDifficulty = mindPatterns.includes("initiation");
  const hasShameSpiralPattern = mindPatterns.includes("shame_spirals");

  // Adapt "Your Next Step" sub-text based on mind patterns
  const adaptNextStepSub = (sub: string): string => {
    if (hasInitiationDifficulty) return sub + " Start with the smallest possible first move — even 30 seconds counts.";
    if (isScattered) return sub + " One thing only. Everything else can wait.";
    return sub;
  };

  const latestScores = ((dashData as any)?.latestSurvey?.scores ?? {}) as Record<string, number>;
  const hasSurveyReading = Object.keys(latestScores).length > 0;
  const isFirstRun = isAuthenticated && !hasSurveyReading && !hasRecordedCheckIns && !hasHabits && !hasJournal;

  useEffect(() => {
    // Wait for the authoritative dashboard response; its initial undefined state
    // looks empty and must never be mistaken for a returning account's first run.
    if (dashData && isFirstRun) window.dispatchEvent(new Event("lifewoven:first-run-onboarding"));
  }, [dashData, isFirstRun]);

  const nextStep = (() => {
    const base = !hasSurveyReading
      ? { label: "Let’s take your first reading", sub: "Start with a short structural survey. It gives the app something real to support instead of asking you to interpret an empty dashboard.", href: "/audit", cta: "Take first reading" }
      : auditNextStep && !hasHabits
      ? auditNextStep
      : !hasHabits
      ? { label: "Build your first habit", sub: "Your Rhythms are empty. Start with one small identity-based habit.", href: "/standards", cta: "Build My Rhythms" }
      : !hasJournal
      ? { label: "Add your first entry to The Weave", sub: "Reflection is where transformation begins. Take 5 minutes to write.", href: "/weave", cta: "Open The Weave" }
      : auditNextStep
      ? auditNextStep
      : { label: "Begin today's check-in", sub: "How you feel right now is data. Check in and let the Oracle listen.", href: null as string | null, cta: "Start Check-in", action: () => setShowCheckIn(true) };
    return { ...base, sub: adaptNextStepSub(base.sub) };
  })();

  const surveyHistory = ((dashData as any)?.surveyHistory ?? []) as Array<{ scores: Record<string, number>; createdAt: Date | string }>;
  const baselineCutoff = Date.now() - comparisonWindow * 24 * 60 * 60 * 1000;
  const comparisonSurvey = surveyHistory.find((survey, index) => index > 0 && new Date(survey.createdAt).getTime() <= baselineCutoff) ?? surveyHistory[1];
  const priorScores = (comparisonSurvey?.scores ?? {}) as Record<string, number>;
  const structuralReadings = MODULE_CONFIG.map((dimension) => {
    const raw = Number(latestScores[dimension.key]);
    const value = Number.isFinite(raw) ? Math.max(0, Math.min(100, Math.round(raw))) : null;
    const state = value === null ? "UNMEASURED" : value >= 70 ? "WITHIN TOLERANCE" : value >= 45 ? "LOADED" : "OVER CAPACITY";
    const color = value === null ? "#8FA3B8" : value >= 70 ? "#73C99B" : value >= 45 ? "#D2A44A" : "#E2564A";
    const prior = Number(priorScores[dimension.key]);
    const delta = value !== null && Number.isFinite(prior) ? value - prior : null;
    return { ...dimension, value, state, color, delta };
  });

  const setLowBandwidthModeMutation = trpc.profile.setLowBandwidthMode.useMutation();

  // Hydrate from user profile when auth resolves
  useEffect(() => {
    if (!user) return;
    const serverPref = (user as any).lowBandwidthMode as boolean | null | undefined;
    if (serverPref != null) {
      setLowBandwidthMode(serverPref);
      localStorage.setItem("lifeos_low_bandwidth", String(serverPref));
    }
  }, [user]);

  const toggleLowBandwidth = () => {
    const next = !lowBandwidthMode;
    setLowBandwidthMode(next);
    localStorage.setItem("lifeos_low_bandwidth", String(next));
    setLowBandwidthModeMutation.mutate({ enabled: next });
    if (next) toast("Simplified view on. One thing at a time.", { icon: "🌿" });
  };

  if (lowBandwidthMode) {
    return <LowBandwidthDashboard onExit={toggleLowBandwidth} />;
  }

  if (isFirstRun) {
    return <LowBandwidthDashboard onExit={toggleLowBandwidth} firstRun />;
  }

  if (isAuthenticated && dashLoading) {
    return <PageSkeleton rows={3} />;
  }

  return (
    <>
    <div className="structural-shell min-h-screen bg-background">
      {showReentry && (
        <ReentryFlow
          daysSinceActive={daysSinceActive}
          trigger={reentryTrigger}
          onDismiss={() => setShowReentry(false)}
        />
      )}
      <Nav />
      <Page className="flex flex-col pt-20 pb-24 max-w-5xl px-4 sm:px-6 font-sans">
        {/* Adaptive top bar */}
        <div className="flex items-center justify-end mb-3">
          <button
            onClick={toggleLowBandwidth}
            aria-pressed={lowBandwidthMode}
            aria-label={lowBandwidthMode ? "Exit simplified view" : "Simplify view"}
            className="group flex items-center gap-2.5 select-none"
          >
            {/* Label */}
            <span className="text-[11px] tracking-widest uppercase font-mono text-muted-foreground group-hover:text-foreground transition-colors hidden sm:inline">
              {lowBandwidthMode ? "Simplified" : "Simplify"}
            </span>
            {/* Mechanical switch track */}
            <span
              className={`
                relative inline-flex h-5 w-9 items-center rounded-full
                border transition-all duration-300 ease-in-out
                ${lowBandwidthMode
                  ? "bg-accent/20 border-border shadow-inner"
                  : "bg-muted border-border shadow-inner"}
              `}
            >
              {/* Thumb — machined knob */}
              <span
                className={`
                  absolute top-0.5 h-4 w-4 rounded-full
                  transition-all duration-300 ease-in-out
                  shadow-sm
                  ${lowBandwidthMode
                    ? "left-[calc(100%-1.25rem)] bg-accent"
                    : "left-0.5 bg-muted-foreground/40"}
                `}
              />
            </span>
          </button>
        </div>

        {/* Founding Member welcome card — shown once when needsIntro is true */}
        {user?.needsIntro && user?.foundingMember && (
          <FoundingWelcomeCard
            tier={user.foundingTier ?? null}
            onDismiss={() => {}}
          />
        )}

        {activation?.isActivated && <PostActivationInvite />}

        {/* Trial-state banner — shown for founding members in trialing_no_card state */}
        {!trialBannerDismissed && (user as any)?.billingStatus === "trialing_no_card" && (user as any)?.foundingMember && (
          <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-violet-500/30 bg-violet-500/8">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="h-4 w-4 text-violet-400 shrink-0" />
              <span className="text-sm text-violet-300">
                <strong>Founding Member beta access</strong> — your full library is unlocked at no charge during the beta period.
                {(user as any)?.betaEndDate && (
                  <> Access continues until <strong>{new Date((user as any).betaEndDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>.</>
                )}
              </span>
            </div>
            <button
              onClick={() => { sessionStorage.setItem("lifeos_trial_banner_dismissed", "true"); setTrialBannerDismissed(true); }}
              className="text-violet-400/60 hover:text-violet-300 transition-colors shrink-0 ml-2"
              aria-label="Dismiss banner"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {/* Explorer-waiting banner — founding member post-beta, dropped to Explorer */}
        {!trialBannerDismissed && (user as any)?.billingStatus === "explorer_tier_founding_rate_waiting" && (
          <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/8">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-sm text-amber-300">
                Your beta window has closed. Your <strong>Explorer</strong> tools remain here whenever you need them. When you are ready for deeper practice, Seeker and Oracle are available.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/pricing">
                <button className="text-xs font-semibold text-amber-400 border border-amber-500/40 rounded-full px-3 py-1 hover:bg-amber-500/15 transition-colors">See plans</button>
              </Link>
              <button
                onClick={() => { sessionStorage.setItem("lifeos_trial_banner_dismissed", "true"); setTrialBannerDismissed(true); }}
                className="text-amber-400/60 hover:text-amber-300 transition-colors"
                aria-label="Dismiss banner"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* 7-day expiry warning banner */}
        {hasAccess && daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
          <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/8">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-red-400 shrink-0" />
              <span className="text-sm text-red-300">Your beta window closes in <strong>{daysLeft} day{daysLeft !== 1 ? "s" : ""}</strong>. Keep your practice going at the depth that serves you.</span>
            </div>
            <Link href="/pricing">
              <button className="text-xs font-semibold text-red-400 border border-red-500/40 rounded-full px-3 py-1 hover:bg-red-500/15 transition-colors shrink-0">See plans</button>
            </Link>
          </div>
        )}

        {/* The primary Lumen reading belongs in the daily opening, immediately after the greeting. */}
        <div className="order-[15] -mx-4 mb-8 sm:mx-0 sm:mb-10">
          <LumenLoadDiagnostic readings={structuralReadings} hasReading={hasSurveyReading} />
        </div>
        {false && hasSurveyReading && <section className="instrument-panel order-40 mb-6 sm:mb-8 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
            <div>
              <p className="instrument-label mb-2">Load-Bearing Survey / Live Readings</p>
              <h1 className="font-sans text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Load-bearing dimensions</h1>
            </div>
            <div className="dimension-rule w-full sm:w-64">Survey reading · {((dashData as any)?.latestSurvey?.createdAt ? new Date((dashData as any).latestSurvey.createdAt).toLocaleDateString() : "Run survey")}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-border border border-border">
            {structuralReadings.map((reading) => (
              <Link key={reading.key} href={reading.href} className="bg-card p-4 min-h-40 transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring">
                <div className="flex items-center justify-between gap-2 mb-5">
                  <span className="instrument-label">{reading.label}</span>
                  <reading.icon className="h-4 w-4" style={{ color: reading.color }} />
                </div>
                <div className="flex items-end justify-between gap-2">
                  <span className="font-mono text-3xl tabular-nums text-foreground">{reading.value === null ? "—" : reading.value}</span>
                  <span className="font-mono text-[10px]" style={{ color: reading.color }}>{reading.value === null ? "NO DATA" : "/100"}</span>
                </div>
                <div className="load-track mt-4 h-1 w-full overflow-hidden">
                  <div className="h-full transition-all duration-700" style={{ width: `${reading.value ?? 0}%`, backgroundColor: reading.color }} />
                </div>
                <p className="mt-3 font-mono text-[10px] tracking-[0.1em]" style={{ color: reading.color }}>{reading.state}</p>
                {reading.delta !== null && <p className="mt-1 font-mono text-[10px] text-muted-foreground">{reading.delta >= 0 ? "+" : ""}{reading.delta} since prior survey</p>}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Readings reveal where your structure is carrying load — and where to reinforce it.</p>
            <div className="flex items-center gap-2">
              <div className="flex border border-border" aria-label="Comparison window">
                {([30, 90, 180] as const).map((days) => <button key={days} onClick={() => setComparisonWindow(days)} className={`min-h-11 px-3 font-mono text-xs ${comparisonWindow === days ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>{days}D</button>)}
              </div>
              <Button variant="outline" size="sm" asChild><Link href="/audit">Run survey</Link></Button>
            </div>
          </div>
        </section>}

        {/* Greeting + check-in */}
        <div className="order-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
          <div className="flex min-w-0 items-center gap-4">
            <LuminScene videoId="nodding_gently" ambient loop ambientSize="68px" ambientPosition={{ position: "relative" }} ambientAspectRatio="16 / 9" ambientFit="contain" ambientBlendMode="normal" className="hidden sm:block opacity-100" />
            <div>
            <p className="text-xs font-mono tracking-[0.18em] text-[oklch(0.65_0.08_60)] uppercase mb-1">
              {hasShameSpiralPattern ? "You came back. That's the whole practice." : "Welcome back to your Lifewoven"}
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light text-foreground leading-tight">
              {greeting()}, {user?.name?.split(" ")[0] ?? "friend"}.
            </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start">
            {hasAccess && daysLeft !== null && daysLeft <= 45 && (
              <Link href="/pricing">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                    daysLeft <= 7
                      ? "bg-red-500/10 border-red-500/20 hover:bg-red-500/15"
                      : "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15"
                  }`}
                  title={`${daysLeft} day${daysLeft !== 1 ? 's' : ''} remain in your beta window. Explore the plans whenever you are ready to continue more deeply.`}
                >
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 cursor-default">
                      <Flame className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-medium text-orange-400">{streakData.streak}</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">days returning</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-center">
                    <p className="text-sm font-medium">{streakData.streak}-day practice run</p>
                    <p className="text-xs text-muted-foreground mt-0.5">You've shown up for {streakData.streak} day{streakData.streak !== 1 ? 's' : ''} in a row. The return is the practice.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {(user as any)?.foundingMember && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 bg-violet-500/15 border border-violet-500/30 text-violet-600 dark:text-violet-300"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Founding Member
              </span>
            )}
            <Button size="sm" className="gap-2" onClick={() => setShowCheckIn(!showCheckIn)}>
              <Heart className="h-4 w-4" />
              <span>Daily Check-in</span>
            </Button>
          </div>
        </div>

        {/* Next Step Hero Card */}
        {!showCheckIn && (
          <div className="order-20 p-4 sm:p-5 rounded-2xl border border-accent/30 bg-accent/5 mb-6 sm:mb-8">
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
                <Button size="sm" className="shrink-0 gap-1.5 self-start sm:self-center" onClick={(nextStep as any).action}>
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
        <div className="order-30 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: 5S, habits, journal */}
          <div className="lg:col-span-2 space-y-6">
            {/* 5S Grid */}
            <div>
              <h2 className="text-xs font-mono tracking-[0.18em] text-muted-foreground uppercase mb-3">Your 5S Framework</h2>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {MODULE_CONFIG.map(({ key, label, icon: Icon, color, bg, borderBase, borderHover, href }) => (
                  <Link key={key} href={href}>
                    <div className={`p-2 sm:p-3 rounded-xl border ${borderBase} ${borderHover} bg-card hover:bg-muted shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer text-center group overflow-hidden`}>
                      <Icon className={`h-3.5 w-3.5 sm:h-5 sm:w-5 ${color} mx-auto mb-1 sm:mb-1.5 group-hover:scale-110 transition-transform`} />
                      <p className="text-[9px] sm:text-xs font-medium text-foreground leading-tight truncate">{label}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Habits */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-serif text-lg font-light text-foreground" style={{fontFamily:'"Playfair Display",Georgia,serif'}}>Today's Rhythms</h2>
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
                        <div className="flex items-center gap-1 flex-shrink-0" title={`${habit.streak} day${habit.streak !== 1 ? 's' : ''} streak`}>
                          <Flame className="h-3.5 w-3.5 text-orange-400" />
                          <span className="text-xs font-mono text-muted-foreground">{habit.streak}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <LumenEmpty title="Your Rhythms are waiting." body="Start with one habit that reflects the person you are becoming." href="/standards" cta="Build my first habit" videoId="taps_chin" />
              )}
            </div>

            {/* Goals Widget */}
            <div className="p-4 rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-500" />
                  <h2 className="font-serif text-base font-light text-foreground">Goals</h2>
                </div>
                <Link href="/goals"><Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground h-8 px-2">View all <ArrowRight className="h-3 w-3" /></Button></Link>
              </div>
              {goalStats && (goalStats.active > 0 || goalStats.completed > 0) ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-muted/50 text-center">
                      <p className="text-2xl font-light text-foreground">{goalStats.active}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Active</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50 text-center">
                      <p className="text-2xl font-light text-foreground">{goalStats.completed}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
                    </div>
                  </div>
                  {(goalStats as any).totalMilestones > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Milestones</span>
                        <span>{(goalStats as any).completedMilestones}/{(goalStats as any).totalMilestones}</span>
                      </div>
                      <Progress value={Math.round(((goalStats as any).completedMilestones / (goalStats as any).totalMilestones) * 100)} className="h-1.5" />
                    </div>
                  )}
                </div>
              ) : (
                <LumenEmpty title="No goals yet." body="Choose one intention worth carrying into the week." href="/goals" cta="Set an intention" videoId="nodding_gently" />
              )}
            </div>

            {/* Journal */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-serif text-lg font-light text-foreground" style={{fontFamily:'"Playfair Display",Georgia,serif'}}>The Weave</h2>
                <Link href="/weave"><Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground h-8 px-2">All entries <ArrowRight className="h-3 w-3" /></Button></Link>
              </div>
              {dashData?.recentJournals && dashData.recentJournals.length > 0 ? (
                <div className="space-y-2">
                  {dashData.recentJournals.map((entry: any) => (
                    <Link key={entry.id} href={`/weave/${entry.id}`}>
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
                <LumenEmpty title="The Weave is waiting for your first entry." body="Five minutes of honest writing can reveal more than hours of thinking." href="/weave" cta="Begin writing" videoId="tilting_listening" />
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
                <LumenEmpty
                  title={hasRecordedCheckIns ? "Your check-ins are ready for reflection." : "Oracle is gathering signal."}
                  body={hasRecordedCheckIns
                    ? `${recentCheckIns.length} recent check-in${recentCheckIns.length === 1 ? " is" : "s are"} available. Bring one into the Oracle when you want a grounded reflection.`
                    : "A check-in or a few honest lines give the Oracle something real to reflect."}
                  href="/oracle"
                  cta="Talk to Oracle"
                  videoId="core_unfurls"
                />
              )}
            </div>

            {/* Active Pathways */}
            <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-secondary"><TrendingUp className="h-4 w-4 text-foreground" /></div>
                <h2 className="font-serif text-base font-light text-foreground">Active Pathways</h2>
              </div>
              {/* Reading Bridge contextual line */}
              {rbStatus?.chapter && !rbStatus.dismissed && (
                <Link href="/reading-bridge">
                  <div className="mb-3 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                      <p className="text-xs text-amber-800 dark:text-amber-300 leading-snug flex-1">
                        {rbStatus.isFinished
                          ? "Reading complete — all sections unlocked"
                          : rbStatus.section
                          ? <>Reading: <span className="font-medium">{rbStatus.section}</span> section</>
                          : "Reading bridge active"}
                      </p>
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-400 shrink-0">{rbStatus.progress ?? 0}%</span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-amber-200 dark:bg-amber-800/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500 dark:bg-amber-400 transition-all duration-500"
                        style={{ width: `${rbStatus.progress ?? 0}%` }}
                      />
                    </div>
                  </div>
                </Link>
              )}
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
                <LumenEmpty title="No active pathways." body="Choose one practice that matches the load you are carrying today." href="/pathways" cta="Choose a pathway" videoId="floating_center" />
              )}
            </div>

            {/* Reset — persistent action, visible when re-entering or after absence */}
            {(showReentry || daysSinceActive >= 2) && (
              <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5">
                <div className="flex items-start gap-2.5">
                  <Wind className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-0.5">Need a reset?</p>
                    <p className="text-xs text-muted-foreground font-light leading-relaxed mb-2">When re-entry feels heavy, the Reset pathway is designed for exactly this moment. No pressure. Just one honest step.</p>
                    <Button asChild size="sm" variant="outline" className="text-xs h-7 border-rose-500/30 hover:border-rose-500/60">
                      <Link href="/pathway/reset">Start Reset <ArrowRight className="h-3 w-3 ml-1" /></Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Evening mood nudge */}
            {showMoodNudge && (
              <LumenEmpty
                title="You haven’t completed a Daily Check-in today."
                body="A brief reading helps you notice the load before the day closes."
                cta="Complete Daily Check-in"
                onAction={() => {
                  setShowCheckIn(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                videoId="self_soothing"
              />
            )}

            {/* Quick Actions */}
            <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card">
              <h2 className="text-xs font-mono tracking-[0.18em] text-muted-foreground uppercase mb-3">Quick Actions</h2>
              <div className="space-y-1">
                {[
                  { href: "/ground", icon: Leaf, label: "The Ground" },
                  { href: "/weave", icon: Brain, label: "Add to The Weave" },
                  { href: "/mood-rhythm", icon: Activity, label: "Mood Rhythm Chart" },
                  { href: "/oracle", icon: Sparkles, label: "Ask the Oracle" },
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
      </Page>
    </div>
    </>
  );
}
