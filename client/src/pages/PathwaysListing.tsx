import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Zap, Waves, TrendingUp, Eye, Layers, Compass, RefreshCw } from "lucide-react";
import { LuminScene } from "@/components/LuminScene";

const PATHWAYS = [
  {
    slug: "align",
    name: "Align",
    subtitle: "Daily Grounding",
    description: "Begin each day anchored in your values and intentions. A short, repeatable morning practice that sets the tone for everything that follows.",
    duration: "7–10 min",
    icon: Compass,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    tag: "Daily Practice",
    dimension: "State",
  },
  {
    slug: "resonance",
    name: "Resonance",
    subtitle: "Advanced Alignment Practice",
    description: "A deeper practice for emotional and energetic alignment. Work with the Emotional Compass, guided visualization, and intentional state-setting.",
    duration: "20–30 min",
    icon: Waves,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    tag: "Alignment Work",
    dimension: "State",
  },
  {
    slug: "uplift",
    name: "Uplift",
    subtitle: "Emotional Set-Point Shifting",
    description: "Identify where you are on the Emotional Compass and use targeted practices to move deliberately toward higher-feeling states.",
    duration: "15–20 min",
    icon: TrendingUp,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    tag: "Emotional Intelligence",
    dimension: "State",
  },
  {
    slug: "flow",
    name: "Flow",
    subtitle: "Visualization & Creative Imagination",
    description: "Use the power of mental rehearsal and emotional futures to clarify what you want and begin living it from the inside out.",
    duration: "20–25 min",
    icon: Eye,
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-100",
    tag: "Visualization",
    dimension: "Story",
  },
  {
    slug: "rhythms",
    name: "Rhythms",
    subtitle: "Habit Execution & Identity Stacking",
    description: "Build the behavioral architecture of the person you are becoming. Minimum viable habits, identity anchors, and the art of consistent return.",
    duration: "15–20 min",
    icon: Layers,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
    tag: "Habit Design",
    dimension: "Standards",
  },
  {
    slug: "purpose",
    name: "Purpose",
    subtitle: "Meaning & Resilience",
    description: "Reconnect with your deepest why. Explore the sources of meaning in your life and build the resilience that comes from knowing what you are living for.",
    duration: "25–30 min",
    icon: Zap,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    tag: "Meaning Work",
    dimension: "Stewardship",
  },
  {
    slug: "reset",
    name: "Reset",
    subtitle: "Resilience After Setback",
    description: "The flagship resilience protocol. When life interrupts — when you fall, stop, or lose your footing — this pathway guides you back without shame.",
    duration: "20–30 min",
    icon: RefreshCw,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
    tag: "Flagship Protocol",
    dimension: "State",
    featured: true,
  },
];

export default function PathwaysListing() {
  return (
    <div className="structural-shell min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-20 max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-5">
          <div>
            <p className="instrument-label mb-3">Practice selection / current load</p>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foreground mb-4">Pathways</h1>
            <p className="text-muted-foreground font-light text-lg max-w-xl leading-relaxed">
              Seven guided practice experiences, each designed for a specific moment in your life. Choose the one that meets you where you are.
            </p>
          </div>
          <div className="hidden sm:block border border-border bg-card p-2" aria-label="Lumen at rest beside pathway selection">
            <LuminScene videoId="floating_center" ambient loop ambientSize="84px" ambientPosition={{ position: "relative" }} className="opacity-100" />
          </div>
        </div>

        {/* Featured: Reset */}
        {PATHWAYS.filter(p => p.featured).map(pathway => {
          const Icon = pathway.icon;
          return (
            <div key={pathway.slug} className="relative mb-10 overflow-hidden border border-primary/60 bg-card shadow-[inset_4px_0_0_hsl(var(--primary))]">
              <div className="absolute top-4 right-4 flex gap-2">
                <Badge variant="outline" className="border-border bg-background/90 text-foreground text-xs font-mono tracking-wider">{pathway.dimension}</Badge>
                <Badge className="bg-primary text-primary-foreground text-xs font-mono tracking-wider">Flagship · Reset Protocol</Badge>
              </div>
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 p-5 sm:p-8">
                <div className="border border-primary/50 bg-primary/10 p-4 flex-shrink-0">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="instrument-label mb-3">Load interruption / recovery sequence</p>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="font-serif text-xl sm:text-2xl font-light text-foreground">{pathway.name}</h2>
                    <span className="text-sm text-muted-foreground">{pathway.subtitle}</span>
                  </div>
                  <p className="text-muted-foreground font-light leading-relaxed mb-5 max-w-xl">{pathway.description}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button asChild>
                      <Link href={`/pathway/${pathway.slug}`}>
                        Begin Reset <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Link>
                    </Button>
                    <span className="text-xs text-muted-foreground font-mono">{pathway.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* All other pathways */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {PATHWAYS.filter(p => !p.featured).map(pathway => {
            const Icon = pathway.icon;
            return (
              <Link key={pathway.slug} href={`/pathway/${pathway.slug}`}>
                <div className="group h-full border border-border bg-card transition-all duration-200 hover:border-primary/70 hover:bg-secondary/30">
                  <div className="border-l-2 border-transparent p-4 sm:p-6 transition-colors group-hover:border-primary">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="border border-primary/30 bg-primary/10 p-3 flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h3 className="font-serif text-xl font-light text-foreground">{pathway.name}</h3>
                        <span className="hidden sm:inline-flex font-mono text-[10px] tracking-[0.12em] text-primary">{pathway.tag}</span>
                        <span className="hidden sm:inline-flex font-mono text-[10px] tracking-[0.12em] text-muted-foreground">/{pathway.dimension}</span>
                      </div>
                      <p className="text-base text-muted-foreground">{pathway.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-base text-muted-foreground font-light leading-relaxed mb-4">{pathway.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-mono">{pathway.duration}</span>
                    <span className="flex items-center gap-1 text-xs font-medium text-primary transition-all group-hover:gap-2">
                      Begin <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center">
          <p className="text-base text-muted-foreground font-light">
            Not sure where to start?{" "}
            <Link href="/audit" className="text-accent hover:underline">
              Take the Soul Engineer Assessment
            </Link>{" "}
            and receive a personalized pathway recommendation.
          </p>
        </div>
      </div>
    </div>
  );
}
