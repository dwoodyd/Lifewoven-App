import { useState } from "react";
import { Button } from "@/components/ui/button";
import Nav from "@/components/Nav";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const STATES = [
  { id: "settled", label: "Settled", desc: "Calm, present, grounded. Ready to receive." },
  { id: "bracing", label: "Bracing", desc: "Tense, guarded, waiting for something to go wrong." },
  { id: "striving", label: "Striving", desc: "Pushing, performing, trying to make it happen." },
  { id: "drifting", label: "Drifting", desc: "Distracted, scattered, not fully present." },
  { id: "depleted", label: "Depleted", desc: "Empty, exhausted, running on fumes." },
  { id: "grieving", label: "Grieving", desc: "Carrying loss, disappointment, or sorrow." },
  { id: "grateful", label: "Grateful", desc: "Open, receiving, aware of what has been given." },
  { id: "uncertain", label: "Uncertain", desc: "Unsure, questioning, holding the unknown." },
];

const CONTEXTS = [
  "Before prayer", "Before a difficult conversation", "Before a decision",
  "Before a meeting", "Before worship", "Before a hard day", "Before sleep",
];

const REFLECTIONS: Record<string, string> = {
  settled: "You are in a good posture. Let this ground carry you into what's ahead.",
  bracing: "You're protecting yourself from something. That's understandable. You don't have to enter this from fear. Take one breath and soften slightly before you begin.",
  striving: "There's effort in you — real effort. The invitation is to let go of the outcome before you begin. You can't earn what you're about to enter.",
  drifting: "You've lost the thread. That's okay. Name where you are, take one breath, and return. You can begin again.",
  depleted: "You're running low. The most honest thing you can do is begin from here — not pretend you have more than you do. That honesty is its own form of prayer.",
  grieving: "You're carrying something real. You don't have to set it down to enter — bring it with you. Grief is not the opposite of faith.",
  grateful: "You're in a posture of receiving. Let that openness lead you in.",
  uncertain: "You don't have to resolve the uncertainty before you begin. Uncertainty held honestly is its own kind of trust.",
};

export default function StateYouEnter() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const upsertMutation = trpc.btw.upsertProfile.useMutation({
    onSuccess: () => setDone(true),
  });

  const handleComplete = () => {
    if (selectedState) {
      upsertMutation.mutate({ lastPrimaryState: selectedState });
    } else {
      setDone(true);
    }
  };

  if (done && selectedState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-lg px-6">
          <CheckCircle2 className="h-10 w-10 text-accent mx-auto mb-6" />
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">
            You are entering as: {STATES.find(s => s.id === selectedState)?.label}
          </p>
          <div className="p-8 rounded-2xl border border-border bg-card mb-8">
            <p className="font-serif text-lg font-light text-foreground leading-relaxed">
              {REFLECTIONS[selectedState]}
            </p>
          </div>
          {selectedContext && (
            <p className="text-sm text-muted-foreground mb-6 font-light">
              Context: {selectedContext}
            </p>
          )}
          <div className="flex flex-col gap-3">
            <Button asChild size="lg">
              <a href="/ground/enter-the-ground">Enter the Ground <ArrowRight className="h-4 w-4 ml-1" /></a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="/ground">Return to The Ground</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">The Ground</p>
          <h1 className="font-serif text-4xl font-light text-foreground mb-3">The State You Enter</h1>
          <p className="text-muted-foreground font-light max-w-md mx-auto">
            Notice what you're carrying before you speak, decide, or pray. You don't have to change it — just name it.
          </p>
        </div>

        <h2 className="font-serif text-lg font-light text-foreground mb-4">What state are you in right now?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {STATES.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedState(s.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${selectedState === s.id ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-secondary/40"}`}
            >
              <p className={`text-base font-light mb-1 ${selectedState === s.id ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </button>
          ))}
        </div>

        <h2 className="font-serif text-lg font-light text-foreground mb-4">What are you entering? <span className="text-muted-foreground text-sm font-sans">(optional)</span></h2>
        <div className="flex flex-wrap gap-2 mb-10">
          {CONTEXTS.map(c => (
            <button
              key={c}
              onClick={() => setSelectedContext(selectedContext === c ? null : c)}
              className={`px-4 py-2 rounded-full border text-sm font-light transition-all ${selectedContext === c ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-secondary/40"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <Button
          className="w-full gap-2"
          size="lg"
          onClick={handleComplete}
          disabled={!selectedState || upsertMutation.isPending}
        >
          Receive the Reflection <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
