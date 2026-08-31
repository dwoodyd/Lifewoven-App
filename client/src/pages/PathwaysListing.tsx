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
    scene: "pathway_align_clean",
    staticPoster: "/manus-storage/align-clean-still_4d19f9c4.jpg",
    mediaAspect: "16 / 9",
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
    scene: "pathway_resonance_clean",
    mediaAspect: "16 / 9",
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
    scene: "pathway_uplift_clean",
    mediaAspect: "16 / 9",
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
    mediaAspect: "16 / 9",
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
    mediaAspect: "16 / 9",
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
    mediaAspect: "16 / 9",
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
    scene: "pathway_reset_clean",
    mediaAspect: "16 / 9",
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
            <div key={pathway.slug} className="mb-10 overflow-hidden border border-primary/60 bg-card lg:grid lg:grid-cols-[minmax(0,1fr)_520px] lg:items-center">
              <div className="order-2 relative flex min-h-[410px] flex-col justify-end p-5 sm:p-8 lg:order-1">
                <div className="mb-auto flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-primary/55 bg-background text-foreground text-xs font-mono tracking-wider">{pathway.dimension}</Badge>
                  <Badge className="bg-primary text-primary-foreground text-xs font-mono tracking-wider">Flagship · Reset Protocol</Badge>
                </div>
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
              <div className="order-1 relative overflow-hidden bg-[oklch(0.12_0.015_260)] lg:order-2" style={{ aspectRatio: pathway.mediaAspect }}>
                <LuminScene videoId={pathway.scene} ambient loop ambientSize="100%" ambientPosition={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} ambientFit="cover" ambientAspectRatio={pathway.mediaAspect} ambientBlendMode="normal" className="opacity-100" />
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
                <div className="group overflow-hidden border border-border bg-card transition-all duration-200 hover:border-primary/70">
                  <div className="relative overflow-hidden bg-[oklch(0.12_0.015_260)]" style={{ aspectRatio: pathway.mediaAspect }}>
                    {pathway.staticPoster ? (
                      <>
                        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,oklch(0.74_0.11_76_/_0.22),transparent_52%),oklch(0.12_0.015_260)]" aria-hidden="true">
                          <Compass className="h-12 w-12 text-primary/70" />
                        </div>
                        <img
                          src={pathway.staticPoster}
                          alt="Lumen in a calm, attentive moment"
                          onError={(event) => { event.currentTarget.style.display = "none"; }}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      </>
                    ) : (
                      <LuminScene videoId={pathway.scene} ambient loop ambientSize="100%" ambientPosition={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} ambientFit="cover" ambientAspectRatio={pathway.mediaAspect} ambientBlendMode="normal" className="opacity-100" />
                    )}
                  </div>
                  <div className="relative z-10 p-4 sm:p-6">
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
