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
    scene: "settling",
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
    scene: "waves_sparkles",
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
    scene: "starburst_pose",
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
    scene: "pointing_energy",
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
    scene: "turning_dial",
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
    scene: "self_hug",
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
    scene: "burst_joy",
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
        </div>

        {/* Featured: Reset */}
        {PATHWAYS.filter(p => p.featured).map(pathway => {
          const Icon = pathway.icon;
          return (
            <div key={pathway.slug} className="relative mb-10 min-h-[430px] overflow-hidden border border-primary/60 bg-card">
              <LuminScene videoId={pathway.scene} ambient loop ambientSize="min(72vw, 760px)" ambientPosition={{ position: "absolute", right: "-3%", top: "50%", transform: "translateY(-50%)" }} className="opacity-100" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--card)_0%,color-mix(in_oklch,var(--card)_87%,transparent)_44%,transparent_76%)]" aria-hidden="true" />
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <Badge variant="outline" className="border-primary/55 bg-background/90 text-foreground text-xs font-mono tracking-wider">{pathway.dimension}</Badge>
                <Badge className="bg-primary text-primary-foreground text-xs font-mono tracking-wider">Flagship · Reset Protocol</Badge>
              </div>
              <div className="relative z-10 flex min-h-[430px] max-w-lg flex-col justify-end p-5 sm:p-8">
                <div>
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
                <div className="group relative min-h-[350px] overflow-hidden border border-border bg-card transition-all duration-200 hover:border-primary/70">
                  <LuminScene videoId={pathway.scene} ambient loop ambientSize="min(63vw, 420px)" ambientPosition={{ position: "absolute", left: "50%", top: "42%", transform: "translate(-50%, -50%)" }} className="opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 h-[54%] bg-[linear-gradient(180deg,transparent_0%,color-mix(in_oklch,var(--card)_82%,transparent)_28%,var(--card)_84%)]" aria-hidden="true" />
                  <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h3 className="font-sans text-xl font-semibold text-foreground">{pathway.name}</h3>
                      <span className="font-mono text-xs tracking-[0.12em] text-primary">{pathway.tag}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{pathway.subtitle}</p>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed mb-4">{pathway.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-mono">{pathway.duration} / {pathway.dimension}</span>
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
              Take the Load-Bearing Survey
            </Link>{" "}
            and receive a personalized pathway recommendation.
          </p>
        </div>
      </div>
    </div>
  );
}
