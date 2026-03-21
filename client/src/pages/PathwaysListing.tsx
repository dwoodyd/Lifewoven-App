import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Zap, Waves, TrendingUp, Eye, Layers, Compass, RefreshCw } from "lucide-react";

const PATHWAYS = [
  {
    slug: "align",
    name: "Align",
    subtitle: "Daily Grounding",
    description: "Begin each day anchored in your values and intentions. A short, repeatable morning practice that sets the tone for everything that follows.",
    duration: "10–15 min",
    icon: Compass,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    tag: "Daily Practice",
  },
  {
    slug: "resonance",
    name: "Resonance",
    subtitle: "Advanced Vibrational Practice",
    description: "A deeper practice for emotional and energetic alignment. Work with the Emotional Compass, guided visualization, and intentional state-setting.",
    duration: "20–30 min",
    icon: Waves,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    tag: "Vibrational Work",
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
    featured: true,
  },
];

export default function PathwaysListing() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-24 pb-16 max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Guided Experiences</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">Pathways</h1>
          <p className="text-muted-foreground font-light text-lg max-w-xl leading-relaxed">
            Seven guided practice experiences, each designed for a specific moment in your life. Choose the one that meets you where you are.
          </p>
        </div>

        {/* Featured: Reset */}
        {PATHWAYS.filter(p => p.featured).map(pathway => {
          const Icon = pathway.icon;
          return (
            <div key={pathway.slug} className={`rounded-2xl border-2 border-teal-200/60 bg-teal-50/30 p-7 mb-8 relative overflow-hidden`}>
              <div className="absolute top-4 right-4">
                <Badge className="bg-teal-600 text-white text-xs font-mono tracking-wider">Flagship</Badge>
              </div>
              <div className="flex items-start gap-5">
                <div className={`p-4 rounded-xl ${pathway.bg} flex-shrink-0`}>
                  <Icon className={`h-7 w-7 ${pathway.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-serif text-2xl font-light text-foreground">{pathway.name}</h2>
                    <span className="text-sm text-muted-foreground">— {pathway.subtitle}</span>
                  </div>
                  <p className="text-muted-foreground font-light leading-relaxed mb-5 max-w-xl">{pathway.description}</p>
                  <div className="flex items-center gap-4">
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
        <div className="grid md:grid-cols-2 gap-5">
          {PATHWAYS.filter(p => !p.featured).map(pathway => {
            const Icon = pathway.icon;
            return (
              <Link key={pathway.slug} href={`/pathway/${pathway.slug}`}>
                <div className={`group rounded-xl border ${pathway.border} bg-card hover:shadow-md transition-all duration-200 p-6 cursor-pointer h-full`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-lg ${pathway.bg} flex-shrink-0`}>
                      <Icon className={`h-5 w-5 ${pathway.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-serif text-xl font-light text-foreground">{pathway.name}</h3>
                        <Badge variant="outline" className="text-xs font-mono hidden sm:inline-flex">{pathway.tag}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{pathway.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed mb-4">{pathway.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-mono">{pathway.duration}</span>
                    <span className={`text-xs font-medium ${pathway.color} flex items-center gap-1 group-hover:gap-2 transition-all`}>
                      Begin <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground font-light">
            Not sure where to start?{" "}
            <Link href="/audit" className="text-accent hover:underline">
              Take the Alignment Audit
            </Link>{" "}
            and receive a personalized pathway recommendation.
          </p>
        </div>
      </div>
    </div>
  );
}
