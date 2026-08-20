import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLuminMoment } from "@/components/LuminMoment";
import { LuminScene } from "@/components/LuminScene";
import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Send, Loader2, RefreshCw, BookOpen, Brain, Heart, Zap,
  AlertCircle, TrendingUp, MessageSquare, BarChart3, Shield, ChevronRight,
  RotateCcw, PhoneCall, Calendar, Lock,
} from "lucide-react";
import { SkeletonTyping } from "@/components/ui/skeleton";
import { Streamdown } from "streamdown";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { AnimatePresence, motion } from "framer-motion";
import { formatLifewovenDate, formatLifewovenToday } from "@/lib/datetime";
import { buildOracleChatRequest } from "../../../shared/oracleConversation";

const ORACLE_STARTERS = [
  "I feel stuck and don't know where to start.",
  "Help me understand my emotional state right now.",
  "I want to rewrite a constraining belief I have about myself.",
  "What habits should I focus on building first?",
  "I'm facing a big decision and need clarity.",
  "How do I find meaning in what I'm going through?",
  "I want to get into alignment. Where do I begin?",
];

const UNSTUCK_STARTERS = [
  "I know what I should do but I can't make myself do it.",
  "I started strong and then completely stopped. Again.",
  "I feel overwhelmed and I don't know where to begin.",
  "I've been avoiding something important. Help me understand why.",
  "I feel like I'm going in circles. Nothing is changing.",
  "I'm exhausted and I don't know if I'm making progress.",
];

const WISDOM_SOURCES = [
  { icon: BookOpen, label: "Build a Life That Does Not Break You", desc: "The Soul Engineer Method — identifying and repairing the load-bearing structures of your interior life" },
  { icon: Brain, label: "Mind Science", desc: "The creative power of thought and interior state — how consciousness shapes experience" },
  { icon: Heart, label: "Interior Alignment", desc: "Emotional guidance and the art of allowing — State as the foundation of all other dimensions" },
  { icon: Zap, label: "Behavioral Science", desc: "Identity-based habit formation — systems over goals, Standards and Strategy in practice" },
];

// Crisis keywords — triggers a safety resource prompt instead of LLM call
const CRISIS_KEYWORDS = /\b(suicid|kill myself|end my life|don't want to be here|want to die|self.harm|hurt myself|no reason to live|can't go on)\b/i;

type Message = { role: "user" | "assistant"; content: string; error?: boolean; crisis?: boolean; tags?: string[] };
type OracleMode = "guide" | "unstuck" | "patterns" | "weekly";

export default function Oracle() {
  const { isAuthenticated, user } = useAuth();
  // Tier detection: oracle tier = full access; seeker = partial; explorer/null = threshold view
  const membershipTier = (user as any)?.membershipTier as string | null | undefined;
  const hasOracleAccess = membershipTier === "oracle";
  const hasSeekerAccess = membershipTier === "seeker" || hasOracleAccess;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [cachedInsights, setCachedInsights] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem("lifewoven_oracle_insights") ?? "[]"); } catch { return []; }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [hasConsented, setHasConsented] = useState(() => {
    const stored = localStorage.getItem("oracle_consent");
    // Default ON — only OFF if user has explicitly disabled it
    return stored === null ? true : stored === "true";
  });
  const [mode, setMode] = useState<OracleMode>("guide");
  const [luminPulse, setLoomPulse] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const { triggerMoment } = useLuminMoment();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    const settle = window.setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }), 120);
    return () => { window.cancelAnimationFrame(frame); window.clearTimeout(settle); };
  }, []);

  const insights = trpc.oracle.insights.useQuery(undefined, { enabled: isAuthenticated && hasConsented });
  useEffect(() => {
    if (insights.data?.length) {
      localStorage.setItem("lifewoven_oracle_insights", JSON.stringify(insights.data));
      setCachedInsights(insights.data);
    }
  }, [insights.data]);
  const visibleInsights = insights.data?.length ? insights.data : (!isOnline ? cachedInsights : []);
  const weeklyReflection = trpc.btw.getLatestWeeklyReflection.useQuery(undefined, { enabled: isAuthenticated && hasSeekerAccess });
  const weeklyEligibility = trpc.btw.getWeeklyReflectionEligibility.useQuery(undefined, { enabled: isAuthenticated && hasSeekerAccess });
  const dailyIntention = trpc.btw.getTodayDailyIntention.useQuery(undefined, { enabled: isAuthenticated });
  const generateWeekly = trpc.btw.generateWeeklyReflection.useMutation({
    onSuccess: () => weeklyReflection.refetch(),
    onError: () => { /* error shown inline in weekly tab */ },
  });
  const weeklyData = weeklyReflection.data?.summaryJson as Record<string, string> | null ?? null;
  const hasWeeklyData = weeklyEligibility.data?.hasSufficientData ?? false;
  const monthlyUsage = trpc.oracle.getMonthlyUsage.useQuery(undefined, { enabled: isAuthenticated && !hasOracleAccess });
  const { data: rbStatusOracle } = trpc.readingBridge.getStatus.useQuery(undefined, { enabled: isAuthenticated });
  // Weekly reading check-in: show once per week when user has a chapter set and no messages yet
  const [readingPromptDismissed, setReadingPromptDismissed] = useState(() => {
    // Dismissed for this week ("Not now")
    const stored = localStorage.getItem("oracle_reading_prompt_week");
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    if (stored === weekStart.toISOString()) return true;
    // Snoozed until tomorrow ("Remind me tomorrow")
    const snoozed = localStorage.getItem("oracle_reading_prompt_snooze");
    if (snoozed) {
      const snoozeUntil = new Date(snoozed);
      if (new Date() < snoozeUntil) return true;
      // Snooze expired — clear it so the prompt reappears
      localStorage.removeItem("oracle_reading_prompt_snooze");
    }
    return false;
  });
  const showReadingPrompt = !readingPromptDismissed && !!rbStatusOracle?.chapter && messages.length === 0;
  const dismissReadingPrompt = () => {
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    localStorage.setItem("oracle_reading_prompt_week", weekStart.toISOString());
    setReadingPromptDismissed(true);
  };
  const snoozeReadingPromptTomorrow = () => {
    // Snooze until midnight tonight — prompt reappears tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem("oracle_reading_prompt_snooze", tomorrow.toISOString());
    setReadingPromptDismissed(true);
  };

  const chat = trpc.oracle.chat.useMutation({
    onSuccess: (data: any) => {
      setMessages(prev => [...prev.filter(m => !m.error), { role: "assistant", content: data.reply, tags: data.tags ?? [] }]);
      setConversationId(typeof data.conversationId === "number" ? data.conversationId : null);
      setIsLoading(false);
      setLoomPulse(true);
      setTimeout(() => setLoomPulse(false), 800);
      // Oracle response arrived — Lumin nods gently
      triggerMoment("nodding_gently");
    },
    onError: (err: any) => {
      const isTierGate = err?.data?.code === "FORBIDDEN" || err?.message?.includes("Oracle membership tier");
      setMessages(prev => [
        ...prev.filter(m => !m.error),
        {
          role: "assistant",
          content: isTierGate
            ? "__UPGRADE__"
            : "The Oracle couldn't reach you just now. Please try again in a moment.",
          error: true,
        },
      ]);
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (messages.length > 0) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleConsent = () => {
    localStorage.setItem("oracle_consent", "true");
    setHasConsented(true);
  };

  const sendMessage = (content: string) => {
    if (!isOnline) return;
    if (!content.trim() || isLoading) return;

    // Crisis safety check — route to human resources, do not call LLM
    if (CRISIS_KEYWORDS.test(content)) {
      setMessages(prev => [
        ...prev,
        { role: "user", content },
        {
          role: "assistant",
          content: "crisis",
          crisis: true,
        },
      ]);
      setInput("");
      return;
    }

    const modePrefix = mode === "unstuck"
      ? "[UNSTUCK MODE] The user is feeling stuck. Respond with compassionate, practical guidance that helps them identify what is blocking them and one small next step. Do not lecture. Do not overwhelm. "
      : "";
    const cleanMessages = messages.filter(m => !m.error);
    const newMessages: Message[] = [...cleanMessages, { role: "user", content }];
    setMessages(newMessages);
    setLastUserMessage(content);
    setInput("");
    setIsLoading(true);
    // Lumin thinks while Oracle processes the question
    triggerMoment("taps_chin");
    chat.mutate(buildOracleChatRequest(modePrefix + content, conversationId));
  };

  const retryLastMessage = () => {
    if (!lastUserMessage || isLoading) return;
    setMessages(prev => prev.filter(m => !m.error));
    setIsLoading(true);
    const modePrefix = mode === "unstuck"
      ? "[UNSTUCK MODE] The user is feeling stuck. Respond with compassionate, practical guidance that helps them identify what is blocking them and one small next step. Do not lecture. Do not overwhelm. "
      : "";
    chat.mutate(buildOracleChatRequest(modePrefix + lastUserMessage, conversationId));
  };


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Nav />
        <div className="container pt-20 pb-6 max-w-3xl mx-auto flex flex-col flex-1 items-center justify-center text-center py-12 px-4 sm:px-6">
          <Sparkles className="h-16 w-16 text-accent mb-6" />
          <h2 className="font-serif text-2xl font-light text-foreground mb-3" style={{fontFamily:'"Playfair Display",Georgia,serif'}}>The Oracle awaits you.</h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-sm">Sign in to access your personal AI guide, powered by the wisdom of the ages.</p>
          <Button asChild><a href={getLoginUrl('/oracle')}>Begin Your Journey</a></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Nav />
      <div className="container pt-20 pb-6 max-w-3xl mx-auto flex flex-col flex-1 px-4 sm:px-6">

        {/* Oracle is one of Lumen's immersive surfaces: she is who the member addresses. */}
        <section className="blueprint-grid relative -mx-4 mb-6 min-h-[46svh] overflow-hidden border-y border-primary/20 sm:mx-0 sm:min-h-[430px]" aria-labelledby="oracle-title">
          <LuminScene
            videoId={luminPulse ? "core_unfurls" : "nodding_gently"}
            ambient
            loop
            ambientSize="min(52vw, 560px)"
            ambientPosition={{ position: "absolute", right: "-4%", top: "50%", transform: "translateY(-50%)" }}
            ambientAspectRatio="16 / 9"
            ambientFit="contain"
            ambientBlendMode="normal"
            ambientMaskImage="linear-gradient(to right, transparent 0%, rgba(0,0,0,0.68) 20%, #000 44%, #000 100%)"
            className="opacity-100"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_4%,color-mix(in_oklch,var(--background)_78%,transparent)_48%,transparent_75%)]" aria-hidden="true" />
          <div className="relative z-20 flex min-h-[46svh] max-w-sm flex-col justify-center px-5 py-10 sm:min-h-[430px] sm:px-9">
            <p className="instrument-label mb-3">The Oracle / live guidance</p>
            <h1 id="oracle-title" className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Ask, and we will read.</h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Lumen holds the shape of your five dimensions while the Oracle helps you find the next honest move.
            </p>
          </div>
        </section>

        {/* Oracle Sampler Counter — shown to Explorer/Seeker users with remaining questions */}
        {!hasOracleAccess && monthlyUsage.data && !monthlyUsage.data.hasFullAccess && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-accent/5 border border-accent/15 mb-4 text-sm">
            <span className="text-muted-foreground">
              <span className="text-foreground font-medium">{Math.max(0, 3 - (monthlyUsage.data.used ?? 0))}</span> of 3 free Oracle questions remaining this month
            </span>
            {(monthlyUsage.data.used ?? 0) >= 3 ? (
              <Link href="/pricing"><Button size="sm" variant="outline" className="text-xs h-7 border-accent/30 text-accent hover:bg-accent/10"><Sparkles className="h-3 w-3 mr-1" />Upgrade</Button></Link>
            ) : (
              <span className="text-xs text-muted-foreground/60 italic">Resets monthly</span>
            )}
          </div>
        )}

        {/* Oracle Threshold View — shown to free-tier (explorer) users when sampler exhausted */}
        {!hasOracleAccess && monthlyUsage.data && (monthlyUsage.data.used ?? 0) >= 3 && (
          <div
            style={{
              position: "relative",
              borderRadius: "1rem",
              overflow: "hidden",
              marginBottom: "1.5rem",
              background: "linear-gradient(135deg, rgba(216,184,120,0.04) 0%, rgba(111,143,196,0.06) 100%)",
              border: "1px solid rgba(216,184,120,0.18)",
              padding: "2.5rem 2rem",
              textAlign: "center",
            }}
          >
            {/* Dimmed deeper weave background */}
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse at 70% 40%, rgba(216,184,120,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <p style={{
                fontFamily: "Georgia, serif",
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                fontWeight: 400,
                color: "var(--foreground)",
                marginBottom: "0.75rem",
                lineHeight: 1.3,
              }}>
                The weave runs deeper here.
              </p>
              <p style={{
                color: "var(--muted-foreground)",
                fontSize: "0.95rem",
                lineHeight: 1.7,
                maxWidth: 420,
                margin: "0 auto 1.5rem",
              }}>
                The Oracle reads your patterns across all five dimensions — state, story, standards, systems, and soul — and offers the next right step.
              </p>
              <p style={{
                color: "rgba(216,184,120,0.7)",
                fontSize: "0.8rem",
                fontStyle: "italic",
                marginBottom: "1.5rem",
              }}>
                Available on the Oracle plan.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/pricing">
                  <Button
                    style={{
                      background: "linear-gradient(135deg, #d8b878, #c9a55a)",
                      color: "#1a1610",
                      border: "none",
                      fontWeight: 600,
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Unlock the Oracle
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="ghost" size="sm" style={{ color: "var(--muted-foreground)", fontStyle: "italic" }}>
                    See all plans
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Mode Tabs */}
        <div className="sticky top-14 z-20 -mx-4 mb-5 flex gap-1.5 overflow-x-auto border-b border-border bg-background/95 px-4 pb-4 pt-2 backdrop-blur-sm sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:pt-0">
          {[
            { id: "guide" as OracleMode, label: "Guide", icon: MessageSquare, desc: "Open conversation" },
            { id: "unstuck" as OracleMode, label: "Unstuck", icon: AlertCircle, desc: "When you're blocked" },
            { id: "patterns" as OracleMode, label: "Pattern Mirror", icon: BarChart3, desc: "Your insights" },
            { id: "weekly" as OracleMode, label: "Weekly Summary", icon: Calendar, desc: "7-day reflection" },
          ].map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`min-h-11 shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                mode === id
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="font-medium">{label}</span>
              <span className="hidden sm:inline text-xs opacity-60">— {desc}</span>
            </button>
          ))}
        </div>

        {/* Pattern Mirror Tab */}
        {mode === "patterns" && (
          <div className="flex-1">
            <div className="mb-5">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Pattern Mirror</p>
              <p className="text-sm text-muted-foreground font-light">
                The Oracle has been watching. Here is what it has noticed across your journal entries and check-ins.
              </p>
            </div>
            {insights.isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-8">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Scanning your patterns...</span>
              </div>
            ) : visibleInsights.length > 0 ? (
              <div className="space-y-4">
                {!isOnline && <p className="text-xs text-muted-foreground">Showing your last saved Pattern Mirror insights while offline.</p>}
                {visibleInsights.map((insight: any) => (
                    <div key={insight.id} className="p-5 rounded-xl border border-border bg-card">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="h-4 w-4 text-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs font-mono">
                            {insight.insightType?.replace(/_/g, " ") || "Pattern"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatLifewovenDate(insight.createdAt)}
                          </span>
                        </div>
                        <p className="text-base text-foreground font-light leading-relaxed">{insight.content}</p>
                        {insight.recommendedAction && (
                          <div className="mt-3 flex items-center gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-accent shrink-0" />
                            <p className="text-xs text-accent font-medium">{insight.recommendedAction}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border rounded-xl">
                <TrendingUp className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-serif text-lg font-light text-foreground mb-2">No patterns yet</p>
                <p className="text-base text-muted-foreground max-w-xs mx-auto">
                  The Oracle needs a few journal entries and check-ins before it can recognize patterns. Start there.
                </p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href="/weave">Open The Weave</Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Weekly Reflection Tab */}
        {mode === "weekly" && (
          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Weekly Summary</p>
                <p className="text-sm text-muted-foreground font-light">
                  The Oracle's synthesis of your week — where you drifted, how you returned, and what to carry forward.
                </p>
              </div>
              {hasSeekerAccess && hasWeeklyData && (
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => generateWeekly.mutate()} disabled={generateWeekly.isPending}>
                  {generateWeekly.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  Generate
                </Button>
              )}
            </div>
            {!hasSeekerAccess ? (
              <div className="rounded-2xl border border-border bg-secondary/20 p-8 text-center">
                <Lock className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-base font-light text-foreground mb-2">Weekly AI Reflection</p>
                <p className="text-sm text-muted-foreground mb-4">Available on the Seeker plan and above.</p>
                <Button size="sm" asChild><Link href="/pricing">Upgrade to Seeker</Link></Button>
              </div>
            ) : weeklyReflection.isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-8">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading your weekly reflection...</span>
              </div>
            ) : weeklyReflection.isError ? (
              <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/5 text-center">
                <p className="text-sm text-destructive mb-3">Could not load your weekly reflection.</p>
                <Button variant="outline" size="sm" onClick={() => weeklyReflection.refetch()}>Try again</Button>
              </div>
            ) : weeklyEligibility.isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-8">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Checking this week&apos;s reflections...</span>
              </div>
            ) : !hasWeeklyData ? (
              <div className="p-8 rounded-2xl border border-border bg-card text-center">
                <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-serif text-lg font-light text-foreground mb-2">No reflection yet</p>
                <p className="text-base text-muted-foreground max-w-md mx-auto">
                  The Oracle builds your weekly synthesis from your check-ins and journal entries. Complete a few this week and come back on Sunday — there will be something real here.
                </p>
                <Button variant="outline" size="sm" className="mt-5" asChild>
                  <Link href="/weave">Open The Weave</Link>
                </Button>
              </div>
            ) : weeklyData ? (
              <div className="space-y-4">
                {([
                  { key: "stateShowedUp", label: "State that showed up most" },
                  { key: "driftedMost", label: "Where you drifted" },
                  { key: "returnedBest", label: "How you returned" },
                  { key: "helpedMost", label: "What helped most" },
                  { key: "focusNextWeek", label: "Focus for next week" },
                ] as { key: string; label: string }[]).map(({ key, label }) => weeklyData[key] && (
                  <div key={key} className="p-5 rounded-xl border border-border bg-card">
                    <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-2">{label}</p>
                    <p className="text-base text-foreground font-light leading-relaxed">{weeklyData[key]}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-border bg-card text-center">
                <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-base font-light text-muted-foreground mb-4">
                  No weekly reflection yet. Generate one to see the Oracle's synthesis of your week.
                </p>
                <Button onClick={() => generateWeekly.mutate()} disabled={generateWeekly.isPending} className="gap-2">
                  {generateWeekly.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Generate Weekly Reflection
                </Button>
                {generateWeekly.isError && (
                  <p className="text-xs text-destructive mt-2">Generation failed. Please try again in a moment.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Chat Area (Guide + Unstuck modes) */}
        {mode !== "patterns" && mode !== "weekly" && (
          <div className="flex flex-col flex-1 min-h-0 gap-4">

            {!isOnline && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
                You&apos;re offline. Your draft will stay here until you reconnect; Oracle guidance and live insights need a connection.
              </div>
            )}

            {mode === "guide" && dailyIntention.data?.intention && (
              <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">This morning you wrote:</span>{" "}
                <span className="italic">&ldquo;{dailyIntention.data.intention}&rdquo;</span>{" "}
                I&apos;ll keep that in mind.
              </div>
            )}

            {/* Unstuck mode banner */}
            {mode === "unstuck" && (
              <div className="rounded-xl border border-orange-200/40 bg-orange-50/5 p-4">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Unstuck Mode</p>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed">
                      You are not broken. You are not failing. You are a person whose system needs a different kind of input right now. The Oracle will respond with compassion and one small, concrete next step — nothing more.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Orientation panel — shown only before first message in guide mode */}
            {messages.length === 0 && mode === "guide" && (
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-base font-light text-foreground leading-relaxed mb-4">
                  The Oracle is not a search engine. It is a reflective guide — trained in the Soul Engineer Method and the five load-bearing dimensions of a well-built life. It meets you where you are, draws connections across your 5S dimensions, and offers wisdom that is both timeless and personally relevant to your situation.
                </p>
                <p className="text-base font-light text-muted-foreground leading-relaxed mb-4">
                  You can ask anything: a question you are wrestling with, a feeling you cannot name, a decision you are avoiding, or simply "where do I begin?"
                </p>
                <button
                  onClick={() => setShowSources(s => !s)}
                  className="text-xs font-mono text-accent hover:underline tracking-wider uppercase flex items-center gap-1"
                >
                  <BookOpen className="h-3 w-3" />
                  {showSources ? "Hide" : "See"} the wisdom sources
                </button>
                {showSources && (
                  <div className="mt-4 grid sm:grid-cols-2 gap-3">
                    {WISDOM_SOURCES.map(({ icon: Icon, label, desc }) => (
                      <div key={label} className="flex items-start gap-2.5 p-3 rounded-lg bg-secondary/40">
                        <Icon className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-2 min-h-[200px] max-h-[45vh] sm:max-h-[50vh]">
              {messages.length === 0 ? (
                <div className="pt-8 pb-4 flex flex-col items-center justify-center text-center">
                  <p className="font-serif text-xl font-light text-foreground mb-2" style={{ letterSpacing: "0.01em" }}>
                    Ask, and we will read.
                  </p>
                  <p className="text-sm text-muted-foreground font-light max-w-xs" style={{ lineHeight: 1.7 }}>
                    {mode === "unstuck"
                      ? "Describe what is blocking you. The Oracle will meet you there."
                      : "The Oracle reads across all five dimensions. Begin anywhere."}
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isUser = msg.role === "user";
                  const animVariants = {
                    initial: { opacity: 0, y: 8, scale: 0.97 },
                    animate: { opacity: 1, y: 0, scale: 1 },
                    exit: { opacity: 0, y: -4, scale: 0.97 },
                  };
                  const animTransition = { type: "spring" as const, stiffness: 380, damping: 28 };
                  // Crisis safety card
                  if (msg.crisis) {
                    return (
                      <motion.div key={i} className="flex justify-start"
                        variants={animVariants} initial="initial" animate="animate" exit="exit" transition={animTransition}>
                        <div className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                          <PhoneCall className="h-3.5 w-3.5 text-red-400" />
                        </div>
                        <div className="max-w-[85%] p-4 rounded-2xl rounded-bl-sm bg-red-50/10 border border-red-300/20 text-sm leading-relaxed space-y-3">
                          <p className="font-medium text-foreground">I hear you. What you're feeling matters deeply.</p>
                          <p className="text-muted-foreground font-light">
                            The Oracle is not equipped to provide crisis support — but real, caring humans are available right now.
                          </p>
                          <div className="space-y-1.5">
                            <p className="text-sm font-medium text-foreground">If you're in the US:</p>
                            <p className="text-sm text-muted-foreground">Call or text <strong className="text-foreground">988</strong> — Suicide &amp; Crisis Lifeline, available 24/7.</p>
                            <p className="text-sm text-muted-foreground">Crisis Text Line: Text <strong className="text-foreground">HOME</strong> to <strong className="text-foreground">741741</strong>.</p>
                          </div>
                          <p className="text-xs text-muted-foreground/70 italic">Please reach out to one of these resources. You deserve real support.</p>
                        </div>
                      </motion.div>
                    );
                  }
                  // Error card with retry or upgrade CTA
                  if (msg.error) {
                    const isUpgradePrompt = msg.content === "__UPGRADE__";
                    return (
                      <motion.div key={i} className="flex justify-start"
                        variants={animVariants} initial="initial" animate="animate" exit="exit" transition={animTransition}>
                        <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                          <Sparkles className="h-3.5 w-3.5 text-accent" />
                        </div>
                        <div className="max-w-[80%] p-4 rounded-2xl rounded-bl-sm bg-card border border-border text-sm space-y-3">
                          {isUpgradePrompt ? (
                            <>
                              <p className="font-medium text-foreground">Oracle AI is available on the Oracle plan.</p>
                              <p className="text-muted-foreground text-xs">Upgrade to unlock unlimited Oracle AI sessions — your personal guide rooted in the full 5S Framework.</p>
                              <Link href="/pricing">
                                <Button size="sm" className="gap-1.5 h-7 text-xs bg-accent text-accent-foreground hover:bg-accent/90">
                                  <Sparkles className="h-3 w-3" />
                                  Upgrade to Oracle
                                </Button>
                              </Link>
                            </>
                          ) : (
                            <>
                              <p className="text-muted-foreground italic">{msg.content}</p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 h-7 text-xs"
                                onClick={retryLastMessage}
                                disabled={isLoading}
                              >
                                <RotateCcw className="h-3 w-3" />
                                Try again
                              </Button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  }
                  // Normal message
                  return (
                    <motion.div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      variants={animVariants} initial="initial" animate="animate" exit="exit" transition={animTransition}>
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                          <Sparkles className="h-3.5 w-3.5 text-accent" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-foreground text-background rounded-br-sm p-4 font-normal" : "bg-card/90 border border-border/60 shadow-sm text-card-foreground rounded-bl-sm"}`}>
                        {msg.role === "assistant" ? (
                          <>
                            <div className="p-4 text-card-foreground">
                              <Streamdown>{msg.content}</Streamdown>
                            </div>
                            {msg.tags && msg.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 px-4 pb-3 pt-0 border-t border-border/40 mt-1">
                                {msg.tags.map(tag => (
                                  <span
                                    key={tag}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase ${
                                      tag === "State" ? "bg-state/15 text-state border border-state/25" :
                                      tag === "Story" ? "bg-story/15 text-story border border-story/25" :
                                      tag === "Standards" ? "bg-standards/15 text-standards border border-standards/25" :
                                      tag === "Strategy" ? "bg-strategy/15 text-strategy border border-strategy/25" :
                                      "bg-stewardship/15 text-stewardship border border-stewardship/25"
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            {/* Oracle response footer */}
                            <div className="px-4 pb-3 pt-0 flex items-center gap-1.5">
                              <span className="text-[10px] text-muted-foreground/50 font-mono tracking-wider italic">
                                From the Oracle · {formatLifewovenToday({ year: undefined, month: "short", day: "numeric" })}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="p-4">{msg.content}</div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
              {isLoading && (
                <div className="flex justify-start items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-bl-sm">
                    <SkeletonTyping />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Weekly reading bridge prompt — shown once per week when chapter is set */}
            {showReadingPrompt && (
              <div className="mb-3 flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <BookOpen className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-snug mb-1.5">
                    {rbStatusOracle?.isFinished
                      ? "You've finished the book. How is what you read showing up in your life this week?"
                      : rbStatusOracle?.section
                      ? `You're reading the ${rbStatusOracle.section} section. What is landing for you — or what is resisting?`
                      : "How is your reading connecting to what you're working on right now?"}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const q = rbStatusOracle?.isFinished
                          ? "I've finished Build a Life That Does Not Break You. How is what I read showing up in my life this week?"
                          : rbStatusOracle?.section
                          ? `I'm reading the ${rbStatusOracle.section} section of Build a Life That Does Not Break You. What is landing for me — or what is resisting?`
                          : "How is my reading connecting to what I'm working on right now?";
                        dismissReadingPrompt();
                        sendMessage(q);
                      }}
                      className="text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline"
                    >
                      Ask this now
                    </button>
                    <span className="text-amber-300 dark:text-amber-700">·</span>
                    <button
                      onClick={snoozeReadingPromptTomorrow}
                      className="text-xs text-amber-600/60 dark:text-amber-500/60 hover:text-amber-700 dark:hover:text-amber-400"
                    >
                      Remind me tomorrow
                    </button>
                    <span className="text-amber-300 dark:text-amber-700">·</span>
                    <button
                      onClick={dismissReadingPrompt}
                      className="text-xs text-amber-600/60 dark:text-amber-500/60 hover:text-amber-700 dark:hover:text-amber-400"
                    >
                      Not this week
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="sticky bottom-0 z-10 grid grid-cols-[minmax(0,1fr)_52px] gap-2 bg-background/95 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
              <Textarea
                placeholder={mode === "unstuck" ? "Describe what is blocking you..." : "What are you carrying right now?"}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (isOnline && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                className="resize-none text-sm min-h-[52px] max-h-[120px] scroll-mb-[45vh]"
                rows={2}
              />
              <div className="flex flex-col justify-end gap-2">
                {messages.length > 0 && (
                  <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => { setMessages([]); setLastUserMessage(""); setConversationId(null); }} aria-label="New conversation" title="New conversation">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading || !isOnline} size="icon" className="h-[52px] w-[52px] flex-shrink-0" aria-label="Send message">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              The Oracle draws from the Lifewoven 5S Framework and the wisdom traditions that inform it.{" "}
              Not a substitute for professional mental health advice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
