import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Nav from "@/components/Nav";
import {
  ArrowRight,
  Waves,
  BookOpen,
  Target,
  Compass,
  Leaf,
  Sparkles,
  ChevronRight,
  Brain,
  Heart,
  Zap,
  CheckCircle2,
} from "lucide-react";

const modules = [
  {
    id: "state",
    label: "State",
    icon: Waves,
    color: "text-state",
    bgColor: "bg-state-soft",
    borderColor: "border-l-[3px] border-l-[oklch(0.62_0.14_200)]",
    description: "Emotional alignment, interior practice, and nervous system regulation.",
    tools: ["Emotional Guidance Scale", "Vortex Meditations", "Breathwork Timer", "Daily Check-in"],
  },
  {
    id: "story",
    label: "Story",
    icon: BookOpen,
    color: "text-story",
    bgColor: "bg-story-soft",
    borderColor: "border-l-[3px] border-l-[oklch(0.60_0.14_280)]",
    description: "Belief rewriting, identity building, and meaning-making through your narrative.",
    tools: ["Belief Rewrite Journal", "Identity Builder", "Meaning Journal", "Future-Self Letters"],
  },
  {
    id: "standards",
    label: "Standards",
    icon: Target,
    color: "text-standards",
    bgColor: "bg-standards-soft",
    borderColor: "border-l-[3px] border-l-[oklch(0.58_0.16_145)]",
    description: "Habit design, daily discipline, and the identity-based execution system.",
    tools: ["Habit Tracker", "Daily Scorecard", "Deep Work Planner", "Kept Promises"],
  },
  {
    id: "strategy",
    label: "Strategy",
    icon: Compass,
    color: "text-strategy",
    bgColor: "bg-strategy-soft",
    borderColor: "border-l-[3px] border-l-[oklch(0.52_0.14_240)]",
    description: "Decision quality, leverage thinking, and second-order consequence mapping.",
    tools: ["Decision Journal", "Leverage Mapper", "Second-Order Thinking", "Risk Planner"],
  },
  {
    id: "stewardship",
    label: "Stewardship",
    icon: Leaf,
    color: "text-stewardship",
    bgColor: "bg-stewardship-soft",
    borderColor: "border-l-[3px] border-l-[oklch(0.62_0.12_55)]",
    description: "Energy, body, time, and wealth managed as sacred resources.",
    tools: ["Energy Audit", "Dopamine Audit", "Wealth Dashboard", "Body Rituals"],
  },
];

const pathways = [
  { slug: "align", label: "Align", desc: "Daily grounding and morning alignment", color: "bg-[oklch(0.65_0.13_195)]" },
  { slug: "resonance", label: "Resonance", desc: "Advanced alignment and meditative practice", color: "bg-[oklch(0.55_0.18_290)]" },
  { slug: "uplift", label: "Uplift", desc: "Shift your emotional set-point upward", color: "bg-[oklch(0.70_0.15_50)]" },
  { slug: "flow", label: "Flow", desc: "Visualization and future-self activation", color: "bg-[oklch(0.62_0.14_175)]" },
  { slug: "rhythms", label: "Rhythms", desc: "Identity-based habit execution system", color: "bg-[oklch(0.55_0.16_140)]" },
  { slug: "purpose", label: "Purpose", desc: "Meaning, purpose, and deep resilience", color: "bg-[oklch(0.52_0.14_250)]" },
  { slug: "reset", label: "Reset", desc: "The flagship resilience protocol", color: "bg-[oklch(0.58_0.18_20)]" },
];

// Testimonials removed — replaced with canonical trust structure below

const pricingTiers = [
  {
    name: "Explorer",
    price: "$0",
    desc: "Begin your alignment journey. No credit card, no commitment.",
    features: [
      "Alignment Audit diagnostic",
      "Daily emotional check-in",
      "Journal (up to 30 entries)",
      "Align & Uplift pathways",
      "5S Framework overview",
      "Public resource library",
      "Community read access",
    ],
    cta: "Start Free",
    href: "/audit",
    highlight: false,
  },
  {
    name: "Seeker",
    price: "$19",
    period: "/month",
    desc: "The full Lifewoven experience. Every tool, every pathway, every module — fully unlocked.",
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
    ],
    cta: "Begin Transformation",
    href: getLoginUrl(),
    highlight: true,
  },
  {
    name: "Oracle",
    price: "$49",
    period: "/month",
    desc: "The premium AI-powered experience. The Oracle as your personal guide, available 24/7.",
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
    cta: "Unlock the Oracle",
    href: getLoginUrl(),
    highlight: false,
  },
];

// Hero right-panel: a visual representation of the dashboard/system
function HeroDashboardPreview() {
  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-2xl bg-accent/10 blur-2xl scale-110 pointer-events-none" />
      <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Mini header */}
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <span className="font-serif text-sm font-light text-foreground">Your Lifewoven</span>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[oklch(0.62_0.14_200)]/60" />
            <div className="w-2 h-2 rounded-full bg-[oklch(0.60_0.14_280)]/60" />
            <div className="w-2 h-2 rounded-full bg-[oklch(0.58_0.16_145)]/60" />
          </div>
        </div>
        {/* 5S mini grid */}
        <div className="p-4 grid grid-cols-5 gap-2 border-b border-border">
          {[
            { label: "State", color: "text-state", bg: "bg-state-soft" },
            { label: "Story", color: "text-story", bg: "bg-story-soft" },
            { label: "Standards", color: "text-standards", bg: "bg-standards-soft" },
            { label: "Strategy", color: "text-strategy", bg: "bg-strategy-soft" },
            { label: "Stewardship", color: "text-stewardship", bg: "bg-stewardship-soft" },
          ].map((m) => (
            <div key={m.label} className={`${m.bg} rounded-lg p-2 text-center`}>
              <p className={`text-[9px] font-medium ${m.color} leading-tight`}>{m.label}</p>
            </div>
          ))}
        </div>
        {/* Oracle insight */}
        <div className="p-4 border-b border-border">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="h-3 w-3 text-accent" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Oracle Insight</p>
              <p className="text-xs text-foreground leading-relaxed font-light">
                "Your journal entries this week show a recurring theme around worthiness. The Belief Rewrite tool in Story is your next step."
              </p>
            </div>
          </div>
        </div>
        {/* Today's pathway */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Today's Pathway</p>
            <p className="text-sm font-serif text-foreground font-light">Align — Daily Grounding</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">15 min · 6 steps</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[oklch(0.65_0.13_195)]/20 flex items-center justify-center">
            <ArrowRight className="h-3.5 w-3.5 text-[oklch(0.65_0.13_195)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* ─── Hero ─── */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[oklch(0.62_0.14_200)]/5 blur-3xl -translate-x-1/4 translate-y-1/4" />
        </div>

        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div>
              <Badge variant="outline" className="mb-5 text-xs font-mono tracking-wider text-muted-foreground border-border">
                THE 5S PERSONAL TRANSFORMATION SYSTEM
              </Badge>

              {/* Emotional problem statement */}
              <p className="text-sm font-sans text-muted-foreground mb-4 font-light tracking-wide">
                You have the vision. You have the books. Something still isn't clicking.
              </p>

              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light leading-[1.1] tracking-tight mb-6 text-foreground">
                One intelligent
                <br />
                <span className="italic text-accent">operating system</span>
                <br />
                for your whole life.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground font-sans font-light leading-relaxed mb-8 max-w-lg">
                Lifewoven brings together emotional alignment, belief work, habit execution, strategic clarity, and holistic stewardship — in one guided, intelligent platform rooted in timeless wisdom.
              </p>

              <div className="flex flex-col xs:flex-row gap-3 mb-6">
                <Button size="lg" asChild className="gap-2 text-base">
                  <Link href="/audit">
                    Take the Alignment Audit
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="gap-2 text-base">
                  <a href="#where-to-begin">
                    Where do I begin?
                  </a>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Free to start. No credit card required.
              </p>
            </div>

            {/* Right: Dashboard preview */}
            <div className="hidden lg:block">
              <HeroDashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust Bar ─── */}
      <section className="border-y border-border py-7">
        <div className="container">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase text-center mb-4">Informed by wisdom traditions including</p>
          <div className="flex flex-wrap items-center justify-center gap-5 md:gap-10 text-muted-foreground">
            <div className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4" />
              <span>Mind Science</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4" />
              <span>Lifewoven Framework</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4" />
              <span>Behavioral Science & Habit Theory</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Meaning-Centered Philosophy</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Waves className="h-4 w-4" />
              <span>Conscious Creation & Emotional Immersion</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Where Do I Begin ─── */}
      <section id="where-to-begin" className="py-20 bg-secondary/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">Your Starting Point</p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foreground mb-4">
              Overwhelmed? Start here.
            </h2>
            <p className="text-muted-foreground text-lg font-light">
              You don't need to understand the whole system to begin. Every path leads to the same place: a life that feels like yours.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Take the Alignment Audit",
                desc: "A 10-question diagnostic that identifies where you are and recommends your exact starting pathway. Takes 3 minutes.",
                cta: "Begin the Audit",
                href: "/audit",
                color: "text-state",
              },
              {
                step: "02",
                title: "Enter Your First Pathway",
                desc: "Follow the guided protocol recommended for you. Each pathway is a complete, step-by-step experience — not a list of features.",
                cta: "See All Pathways",
                href: "/pathways",
                color: "text-story",
              },
              {
                step: "03",
                title: "Let the Oracle Guide You",
                desc: "As you journal and check in, the Oracle recognizes patterns and tells you exactly what to work on next. You are never alone in this.",
                cta: "Meet the Oracle",
                href: "/oracle",
                color: "text-accent",
              },
            ].map((item) => (
              <div key={item.step} className="p-6 rounded-xl border border-border bg-card">
                <p className={`font-mono text-xs ${item.color} mb-3 tracking-wider`}>{item.step}</p>
                <h3 className="font-serif text-xl font-light text-foreground mb-3">{item.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed mb-5">{item.desc}</p>
                <Link href={item.href} className={`text-sm font-medium ${item.color} flex items-center gap-1 hover:gap-2 transition-all`}>
                  {item.cta} <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5S Modules ─── */}
      <section id="modules" className="py-24">
        <div className="container">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">The Framework</p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foreground mb-4">
              Five dimensions. One coherent life.
            </h2>
            <p className="text-muted-foreground text-lg font-light">
              The 5S Framework organizes every tool, practice, and insight into five interconnected domains — each essential, each supporting the others.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.id}
                  href={`/${mod.id}`}
                  className={`group p-6 rounded-xl border border-border bg-card hover:shadow-md transition-all duration-200 ${mod.borderColor}`}
                >
                  <div className={`inline-flex p-2 rounded-lg ${mod.bgColor} mb-4`}>
                    <Icon className={`h-5 w-5 ${mod.color}`} />
                  </div>
                  <h3 className={`font-serif text-2xl font-light mb-2 ${mod.color}`}>{mod.label}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed mb-4">{mod.description}</p>
                  <ul className="space-y-1">
                    {mod.tools.map((tool) => (
                      <li key={tool} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                        {tool}
                      </li>
                    ))}
                  </ul>
                  <div className={`mt-4 flex items-center gap-1 text-xs font-medium ${mod.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    Enter module <ChevronRight className="h-3 w-3" />
                  </div>
                </Link>
              );
            })}

            {/* Oracle Card */}
            <div className="p-6 rounded-xl border border-accent/30 bg-accent/5 glow-gold">
              <div className="inline-flex p-2 rounded-lg bg-accent/10 mb-4">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-serif text-2xl font-light mb-2 text-accent">Oracle</h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                The AI intelligence layer. Recognizes patterns across your journals, habits, and check-ins. Guides you to the right tool at the right moment.
              </p>
              <ul className="space-y-1">
                {["Pattern Recognition", "Cross-Module Guidance", "Personalized Pathways", "Gentle Nudges"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-accent/50" />
                    {f}
                  </li>
                ))}
              </ul>
              <Badge className="mt-4 text-xs bg-accent/20 text-accent border-accent/30">Oracle Tier Feature</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pathways ─── */}
      <section id="pathways" className="py-24 bg-secondary/30">
        <div className="container">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">Guided Experiences</p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foreground mb-4">
              Enter through your present need.
            </h2>
            <p className="text-muted-foreground text-lg font-light">
              Seven curated pathways, each a complete guided experience. Not just a feature — a transformation protocol.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {pathways.map((p) => (
              <Link
                key={p.slug}
                href={`/pathway/${p.slug}`}
                className="group relative overflow-hidden rounded-xl p-6 bg-card border border-border hover:shadow-md transition-all duration-200"
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${p.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                <h3 className="font-serif text-xl font-light mb-2 text-foreground">{p.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                <ChevronRight className="h-4 w-4 text-muted-foreground mt-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Alignment Audit CTA ─── */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Start Here</p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foreground mb-6">
              Take the Alignment Audit.
            </h2>
            <p className="text-lg text-muted-foreground font-light mb-10 max-w-xl mx-auto">
              A 10-question diagnostic that identifies where you are across the 5S dimensions and recommends your starting pathway. Takes 3 minutes. Changes everything.
            </p>
            <Button size="lg" asChild className="gap-2 text-base">
              <Link href="/audit">
                Begin the Audit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Why Lifewoven Exists ─── */}
      <section className="py-24 bg-secondary/30">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-5xl">
            <div>
              <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Why This Exists</p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foreground mb-6">
              Most systems are built for{" "}
              <span className="italic text-accent">the best version of you.</span>
            </h2>
              <p className="text-muted-foreground font-light leading-relaxed mb-5">
                Lifewoven was built for the real version. The one who starts and stops. The one who has the books and the knowledge but still feels stuck. The one whose mind works differently on different days.
              </p>
              <p className="text-muted-foreground font-light leading-relaxed mb-5">
                The wisdom traditions we draw from have been helping people transform their lives for over a century. What was missing was a single, intelligent container that brought them together.
              </p>
              <p className="text-muted-foreground font-light leading-relaxed">
                Lifewoven is that container. Not a content library. Not a habit app. A living operating system for a whole, aligned life.
              </p>
            </div>
            <div className="space-y-5">
              {[
                { label: "Built for Real Minds", desc: "Designed for interruption, return, and inconsistency — not just peak performance. Low Bandwidth Mode, Re-entry Flow, and flexible tracking built in from the start." },
                { label: "Rooted in Timeless Wisdom", desc: "Every tool, pathway, and practice is grounded in wisdom traditions that have been tested across generations — not trending frameworks." },
                { label: "One System, Not Many Apps", desc: "Your emotional state, your beliefs, your habits, your decisions, your energy — all connected. The Oracle sees the whole picture so you don't have to." },
              ].map((item) => (
                <div key={item.label} className="p-5 rounded-xl border border-border bg-card">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-base text-foreground mb-1">{item.label}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Before the Words Banner ─── */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/5 via-background to-secondary/20 p-6 sm:p-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            <div className="flex-1">
              <p className="text-xs font-mono tracking-widest text-accent uppercase mb-3">Companion Practice</p>
              <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-4">
                Before the Words
              </h2>
              <p className="text-muted-foreground font-light leading-relaxed mb-6 max-w-md">
                A contemplative formation practice for people who know the right words — but want to be grounded before they say them. A companion to the book. A practice for the space before prayer, conversation, and decision.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/btw">
                  <Button className="gap-2">
                    Enter the Practice <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/btw/ground-check">
                  <Button variant="outline" className="gap-2 bg-transparent">
                    Take the Ground Check
                  </Button>
                </Link>
              </div>
            </div>
            <div className="shrink-0 text-center">
              <div className="w-24 h-24 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
                <span className="font-serif text-4xl text-accent font-light">BTW</span>
              </div>
              <p className="text-sm text-muted-foreground font-light">Available now</p>
              <p className="text-sm text-muted-foreground">Free with Explorer</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-24">
        <div className="container">
          <div className="max-w-2xl mb-4">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">Investment</p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foreground mb-4">
              Choose your path.
            </h2>
            <p className="text-muted-foreground text-lg font-light">
              Every tier is designed to create real transformation. Start free. Upgrade when you are ready.
            </p>
          </div>

          {/* Plain-language comparison */}
          <div className="mb-12 p-5 rounded-xl border border-border bg-secondary/30 max-w-2xl">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">What's the difference?</p>
            <div className="space-y-2 text-sm text-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span><strong>Explorer (Free)</strong> — Try the core tools. Take the Audit. Start a journal. No time limit.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <span><strong>Seeker ($19/mo)</strong> — Unlock everything: all 5 modules, all 7 pathways, unlimited journaling, habits, community. The full operating system.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <span><strong>Oracle ($49/mo)</strong> — Add the AI layer. The Oracle reads your patterns and tells you exactly what to work on next. Includes all courses and a 1-on-1 onboarding call.</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-4xl">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`p-6 rounded-xl border ${
                  tier.highlight
                    ? "border-accent bg-accent/5 glow-gold"
                    : "border-border bg-card"
                }`}
              >
                {tier.highlight && (
                  <Badge className="mb-3 text-xs bg-accent text-accent-foreground">Most Popular</Badge>
                )}
                <h3 className="font-serif text-2xl font-light text-foreground mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-sans font-light text-foreground">{tier.price}</span>
                  {tier.period && <span className="text-sm text-muted-foreground">{tier.period}</span>}
                </div>
                <p className="text-base text-muted-foreground mb-5">{tier.desc}</p>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-base text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={tier.highlight ? "default" : "outline"}
                  asChild
                >
                  <a href={tier.href}>{tier.cta}</a>
                </Button>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-muted-foreground max-w-xl">
            Not sure which tier is right for you? Take the free Alignment Audit first — it will tell you exactly where to start.{" "}
            <Link href="/audit" className="text-accent hover:underline">Take the Audit →</Link>
          </p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-10">
            <div className="col-span-2 md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663270045694/kRrwoPFbyNWaiJXLmscJ4t/app-icon_e26b6bab.png"
                  alt="Lifewoven"
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <span className="font-sans text-xl font-semibold tracking-tight text-foreground">Lifewoven</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                A personal transformation operating system rooted in timeless wisdom and powered by intelligent design.
              </p>
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Platform</p>
              <div className="space-y-2">
                {[
                  { label: "About", href: "/about" },
                  { label: "Pathways", href: "/pathways" },
                  { label: "Library", href: "/library" },
                  { label: "Community", href: "/community" },
                  { label: "Store", href: "/store" },
                  { label: "Pricing", href: "/pricing" },
                ].map((l) => (
                  <div key={l.label}>
                    <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Legal & Support</p>
              <div className="space-y-2">
                {[
                  { label: "Terms of Service", href: "/legal/terms" },
                  { label: "Privacy Policy", href: "/legal/privacy" },
                  { label: "Refund Policy", href: "/legal/refunds" },
                  { label: "Contact & Support", href: "/support" },
                ].map((l) => (
                  <div key={l.label}>
                    <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Lifewoven. Built on the wisdom of the ages. Designed for the present moment.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
