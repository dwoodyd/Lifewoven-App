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
  Star,
  ChevronRight,
  Brain,
  Heart,
  Zap,
} from "lucide-react";

const modules = [
  {
    id: "state",
    label: "State",
    icon: Waves,
    color: "text-state",
    bgColor: "bg-state-soft",
    borderColor: "border-l-[3px] border-l-[oklch(0.62_0.14_200)]",
    description: "Emotional alignment, vibrational practice, and nervous system regulation.",
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
  { slug: "vortex", label: "Vortex", desc: "Advanced vibrational and meditative practice", color: "bg-[oklch(0.55_0.18_290)]" },
  { slug: "uplift", label: "Uplift", desc: "Shift your emotional set-point upward", color: "bg-[oklch(0.70_0.15_50)]" },
  { slug: "flow", label: "Flow", desc: "Visualization and future-self activation", color: "bg-[oklch(0.62_0.14_175)]" },
  { slug: "stack", label: "Stack", desc: "Identity-based habit execution system", color: "bg-[oklch(0.55_0.16_140)]" },
  { slug: "why", label: "Why", desc: "Meaning, purpose, and deep resilience", color: "bg-[oklch(0.52_0.14_250)]" },
  { slug: "reset", label: "Reset After Setback", desc: "The flagship resilience protocol", color: "bg-[oklch(0.58_0.18_20)]" },
];

const testimonials = [
  {
    quote: "LifeOS gave me a framework that actually holds. I've tried every productivity app. This is the first one that addresses why I wasn't following through.",
    name: "Maya R.",
    role: "Founder & Coach",
  },
  {
    quote: "The Oracle noticed a pattern in my journals that I had missed for months. That single insight shifted something fundamental.",
    name: "James T.",
    role: "Executive",
  },
  {
    quote: "Reset After Setback is unlike anything I've used. It's not toxic positivity. It's structured, honest, and it actually works.",
    name: "Alicia M.",
    role: "Therapist & Practitioner",
  },
];

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    desc: "Begin your alignment journey",
    features: ["Alignment Audit", "7-Day Reset Challenge", "Daily Check-in", "Starter Journal", "Public Library Access"],
    cta: "Start Free",
    href: "/audit",
    highlight: false,
  },
  {
    name: "Core",
    price: "$29",
    period: "/month",
    desc: "The full 5S operating system",
    features: ["All 5 Modules", "All 7 Pathways", "Unlimited Journaling", "Habit & Scorecard Tracker", "Full Resource Library", "Community Access", "Course Discounts"],
    cta: "Start Core",
    href: getLoginUrl(),
    highlight: true,
  },
  {
    name: "Premium",
    price: "$79",
    period: "/month",
    desc: "AI Oracle + advanced intelligence",
    features: ["Everything in Core", "AI Oracle — Pattern Recognition", "Personalized Pathway Guidance", "Cross-Module Insights", "Priority Community Access", "Live Workshops Included", "All Courses Included"],
    cta: "Start Premium",
    href: getLoginUrl(),
    highlight: false,
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[oklch(0.62_0.14_200)]/5 blur-3xl -translate-x-1/4 translate-y-1/4" />
        </div>

        <div className="container relative">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-6 text-xs font-mono tracking-wider text-muted-foreground border-border">
              THE 5S PERSONAL TRANSFORMATION SYSTEM
            </Badge>

            <h1 className="font-serif text-5xl md:text-7xl font-light leading-[1.08] tracking-tight mb-6 text-foreground">
              One intelligent
              <br />
              <span className="italic text-accent">operating system</span>
              <br />
              for your whole life.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground font-sans font-light leading-relaxed mb-10 max-w-xl">
              LifeOS integrates emotional alignment, belief work, habit execution, strategic decision-making, and holistic stewardship into one beautiful, guided platform — rooted in timeless wisdom, powered by AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild className="gap-2 text-base">
                <Link href="/audit">
                  Take the Alignment Audit
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2 text-base">
                <Link href="/#modules">
                  Explore the 5S Framework
                </Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Free to start. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Trust Bar ─── */}
      <section className="border-y border-border py-8">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-muted-foreground">
            <div className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4" />
              <span>Ernest Holmes · Science of Mind</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4" />
              <span>Abraham-Hicks · Law of Attraction</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4" />
              <span>James Clear · Atomic Habits</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Viktor Frankl · Logotherapy</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Waves className="h-4 w-4" />
              <span>Summer McStravick · Flowdreaming</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5S Modules ─── */}
      <section id="modules" className="py-24">
        <div className="container">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">The Framework</p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">
              Five dimensions.<br />One coherent life.
            </h2>
            <p className="text-muted-foreground text-lg font-light">
              The 5S Framework organizes every tool, practice, and insight into five interconnected domains — each essential, each supporting the others.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{mod.description}</p>
                  <ul className="space-y-1">
                    {mod.tools.map((tool) => (
                      <li key={tool} className="flex items-center gap-2 text-xs text-muted-foreground">
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
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                The AI intelligence layer. Recognizes patterns across your journals, habits, and check-ins. Guides you to the right tool at the right moment.
              </p>
              <ul className="space-y-1">
                {["Pattern Recognition", "Cross-Module Guidance", "Personalized Pathways", "Gentle Nudges"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-accent/50" />
                    {f}
                  </li>
                ))}
              </ul>
              <Badge className="mt-4 text-xs bg-accent/20 text-accent border-accent/30">Premium Feature</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pathways ─── */}
      <section id="pathways" className="py-24 bg-secondary/30">
        <div className="container">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">Guided Experiences</p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">
              Enter through your<br />present need.
            </h2>
            <p className="text-muted-foreground text-lg font-light">
              Seven curated pathways, each a complete guided experience. Not just a feature — a transformation protocol.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pathways.map((p) => (
              <Link
                key={p.slug}
                href={`/pathway/${p.slug}`}
                className="group relative overflow-hidden rounded-xl p-6 bg-card border border-border hover:shadow-md transition-all duration-200"
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${p.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                <h3 className="font-serif text-xl font-light mb-2 text-foreground">{p.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
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
            <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-6">
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

      {/* ─── Testimonials ─── */}
      <section className="py-24 bg-secondary/30">
        <div className="container">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">Voices</p>
            <h2 className="font-serif text-4xl font-light text-foreground">What people are saying.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 rounded-xl bg-card border border-border">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-accent text-accent" />
                  ))}
                </div>
                <blockquote className="font-serif text-lg font-light leading-relaxed text-foreground mb-4 italic">
                  "{t.quote}"
                </blockquote>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-24">
        <div className="container">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">Membership</p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">
              Choose your level<br />of engagement.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
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
                <p className="text-sm text-muted-foreground mb-5">{tier.desc}</p>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
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
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-serif text-xs">L</span>
                </div>
                <span className="font-serif text-lg font-medium">Life<span className="text-accent">OS</span></span>
              </div>
              <p className="text-xs text-muted-foreground max-w-xs">
                A personal transformation operating system rooted in timeless wisdom and powered by intelligent design.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link href="/store" className="hover:text-foreground transition-colors">Store</Link>
              <Link href="/community" className="hover:text-foreground transition-colors">Community</Link>
              <Link href="/library" className="hover:text-foreground transition-colors">Library</Link>
              <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} LifeOS. Built on the wisdom of the ages. Designed for the present moment.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
