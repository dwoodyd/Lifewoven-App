import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Nav from "@/components/Nav";
import { LuminScene } from "@/components/LuminScene";
import { ArrowRight, Clock, Wind, BookOpen } from "lucide-react";
import { useState } from "react";

const QUICK_STATES = [
  { label: "I feel scattered", href: "/ground/ground-check?state=scattered", videoId: "crosses_face", response: "Let’s reduce the inputs first. You do not need to solve the whole day at once." },
  { label: "I feel burdened", href: "/ground/ground-check?state=burdened", videoId: "self_soothing", response: "You can put some of that weight down here. Start with one breath." },
  { label: "I feel ready to settle", href: "/ground/enter-the-ground", videoId: "floating_center", response: "Good. Lumen will stay with you while you settle into the practice." },
];

const SECTIONS = [
  { title: "Enter the Ground", desc: "A daily settling practice for morning, midday, and evening.", href: "/ground/enter-the-ground", time: "2–5 min" },
  { title: "Return to the Ground", desc: "A five-step reset when you've drifted, braced, or scattered.", href: "/ground/return", time: "30 sec – 2 min" },
  { title: "The State You Enter", desc: "Notice what you're carrying before you speak, decide, or pray.", href: "/ground/state", time: "3 min" },
  { title: "Living as Heard", desc: "A prayer journal for moving from striving into trust.", href: "/ground/prayers", time: "5–10 min" },
  { title: "Thanking From There", desc: "Gratitude grounded in posture, not performance.", href: "/ground/gratitude", time: "2 min" },
  { title: "Words With Weight", desc: "Spoken prayer, scripture, and declarations from settled ground.", href: "/ground/words", time: "5 min" },
  { title: "Closing the Gap", desc: "Your congruence insights — return rate, practices, patterns.", href: "/ground/insights", time: "Weekly" },
  { title: "The Ground Library", desc: "Teachings, reflections, and companion practices.", href: "/ground/library", time: "On demand" },
];

export default function BTWLanding() {
  const [selectedState, setSelectedState] = useState<(typeof QUICK_STATES)[number] | null>(null);
  return (
    <div className="structural-shell min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-3xl mx-auto px-4 sm:px-6">

        {/* Disclaimer badge */}
        <div className="flex justify-center mb-8">
          <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase border border-border rounded-full px-4 py-1.5">
            Contemplative · Faith-Rooted · Inner-Ground Practice
          </span>
        </div>

        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-5xl md:text-6xl font-light text-foreground mb-5 leading-tight">
            The Ground
          </h1>
          <p className="text-muted-foreground text-lg font-light max-w-xl mx-auto leading-relaxed">
            A contemplative practice for settling your inner posture before prayer, speech, and daily life.
          </p>
        </div>

        {/* Quick state routing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-border mb-4">
          {QUICK_STATES.map(s => (
            <button
              key={s.label}
              onClick={() => setSelectedState(s)}
              className={`min-h-14 border-b sm:border-b-0 sm:border-r last:border-0 border-border px-4 text-left transition-colors ${selectedState?.label === s.label ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"}`}
            >
              <span className="font-mono text-xs tracking-wide">{s.label}</span>
            </button>
          ))}
        </div>

        {selectedState && (
          <section className="instrument-panel mb-10 grid grid-cols-[88px_1fr] items-center gap-5 p-5" aria-live="polite">
            <LuminScene videoId={selectedState.videoId} ambient loop ambientSize="88px" ambientPosition={{ position: "relative" }} className="opacity-100" />
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary mb-2">Lumen sees the reading</p>
              <p className="text-sm leading-relaxed text-foreground">{selectedState.response}</p>
              <Button asChild size="sm" className="mt-4 gap-2"><Link href={selectedState.href}>Begin from here <ArrowRight className="h-4 w-4" /></Link></Button>
            </div>
          </section>
        )}

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <Button asChild size="lg" className="gap-2">
            <Link href="/ground/enter-the-ground">
              Begin Today's Practice <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/ground/ground-check">
              <Wind className="h-4 w-4" /> Ground Check
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <Link href="/ground/return?quick=true">
              <Clock className="h-3 w-3" /> I only have 2 minutes
            </Link>
          </Button>
        </div>

        {/* Who this is for */}
        <div className="p-8 rounded-2xl border border-border bg-card mb-12">
          <h2 className="font-serif text-xl font-light text-foreground mb-4">Who this is for</h2>
          <div className="space-y-3 text-base text-muted-foreground font-light leading-relaxed">
            <p>People who know the right words but still feel inwardly split when they say them.</p>
            <p>People who pray but wonder if they're praying from fear, habit, or genuine trust.</p>
            <p>People who want to close the gap between their inner life and their outer expression.</p>
            <p>People who need a repeatable way to return — not a performance, not a streak, just a ground.</p>
          </div>
        </div>

        {/* Pathway sections grid */}
        <h2 className="font-serif text-2xl font-light text-foreground mb-6">The Pathway</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {SECTIONS.map(s => (
            <Link key={s.title} href={s.href}>
              <div className="p-5 rounded-2xl border border-border bg-card hover:bg-secondary/40 transition-colors cursor-pointer h-full">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-serif text-base font-light text-foreground">{s.title}</h3>
                  <span className="text-xs text-muted-foreground ml-2 shrink-0">{s.time}</span>
                </div>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Faith language notice */}
        <div className="p-5 rounded-2xl border border-border bg-secondary/30 text-center">
          <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-lg mx-auto">
            <BookOpen className="h-3 w-3 inline mr-1.5 mb-0.5" />
            This pathway uses Christian contemplative language and prayer-centered reflection. It is offered as a formation practice, not a theological system. You are welcome to engage at whatever depth feels honest.
          </p>
        </div>

        {/* THE DEEPER PRACTICE — companion book reference */}
        <div className="mt-6 p-5 rounded-2xl border border-border bg-secondary/30 text-center">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">The Deeper Practice</p>
          <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-lg mx-auto">
            This pathway lives inside a larger philosophy.
          </p>
          <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-lg mx-auto mt-2">
            <em>Build a Life That Does Not Break You</em> by DeWayne Woods brings the practice forth in its full form &mdash; the deeper framework that The Ground operationalizes, day by day.
          </p>
          <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-lg mx-auto mt-2">
            The pathway is the practice. The book is the philosophy. Both come from the same place.
          </p>
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-sm font-semibold text-foreground">Build a Life That Does Not Break You</p>
            <p className="text-xs text-muted-foreground italic">The book behind this pathway. Available now.</p>
            <a href="https://soulengineer.online" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline mt-1">
              Get the Book →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
