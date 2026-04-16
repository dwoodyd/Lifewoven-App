import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Nav from "@/components/Nav";
import { trpc } from "@/lib/trpc";
import { useSearch } from "wouter";
import { CheckCircle2, ArrowRight } from "lucide-react";

type ReturnType = "30sec" | "2min" | "fear" | "discouragement" | "depletion";

const RETURNS: Record<ReturnType, { label: string; duration: string; steps: string[]; closing: string }> = {
  "30sec": {
    label: "30-Second Return",
    duration: "30 sec",
    steps: [
      "Stop. Breathe in slowly. Breathe out fully.",
      "Name where you are: 'I am here. I am not lost.'",
      "Return to what's in front of you.",
    ],
    closing: "You returned. That is the whole practice.",
  },
  "2min": {
    label: "2-Minute Return",
    duration: "2 min",
    steps: [
      "Pause everything. Sit or stand still.",
      "Take three slow breaths — in through the nose, out through the mouth.",
      "Name what pulled you away: distraction, fear, busyness, or drift.",
      "Speak one true thing: 'I am held. I can return.'",
      "Choose one small next action and take it.",
    ],
    closing: "You found your way back. That is enough.",
  },
  fear: {
    label: "Return from Fear",
    duration: "3–5 min",
    steps: [
      "Name the fear without judgment. Say it quietly: 'I am afraid of ___.'",
      "Notice where it lives in your body. Don't fight it — observe it.",
      "Take three slow breaths. Let the body soften even slightly.",
      "Ask: Is this fear about now, or about what might happen?",
      "Speak one truth that holds regardless of the outcome: 'I am not alone in this.'",
      "Choose to take one small step from this ground, not from the fear.",
    ],
    closing: "Fear is not your ground. You found the ground beneath it.",
  },
  discouragement: {
    label: "Return from Discouragement",
    duration: "3–5 min",
    steps: [
      "Let yourself feel it without rushing past it. Discouragement is real.",
      "Name what you hoped for that hasn't happened yet.",
      "Ask: Is this the end, or is this the middle?",
      "Find one thing that is still true — one mercy that is still present.",
      "Speak it aloud or write it: 'Even now, ___.'",
      "Return to the next small thing with your hands, not your whole future.",
    ],
    closing: "You didn't give up. You returned. That is the whole story.",
  },
  depletion: {
    label: "Return from Depletion",
    duration: "5 min",
    steps: [
      "Stop trying to push through. The first practice is permission to rest.",
      "Sit or lie down. Close your eyes if you can.",
      "Take five slow breaths. Let each exhale be longer than the inhale.",
      "Ask: What is the smallest possible thing I can do right now?",
      "Give yourself permission to do only that — and nothing more.",
      "Rest in this: you are not behind. You are exactly where you are.",
    ],
    closing: "Depletion is not failure. Rest is a form of faithfulness.",
  },
};

export default function ReturnToGround() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const typeParam = params.get("type") as ReturnType | null;
  const quickParam = params.get("quick");

  const [selected, setSelected] = useState<ReturnType>(typeParam || (quickParam ? "2min" : "2min"));
  const [active, setActive] = useState(!!quickParam);
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);

  const logMutation = trpc.btw.logReturn.useMutation();

  const practice = RETURNS[selected];

  const handleStart = () => {
    setActive(true);
    setStepIndex(0);
    setDone(false);
  };

  const handleNext = () => {
    if (stepIndex < practice.steps.length - 1) {
      setStepIndex(i => i + 1);
    } else {
      logMutation.mutate({ returnType: selected });
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <CheckCircle2 className="h-10 w-10 text-accent mx-auto mb-6" />
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-foreground mb-4">You returned.</h2>
          <p className="text-muted-foreground font-light mb-2 leading-relaxed">{practice.closing}</p>
          <p className="text-xs text-muted-foreground mb-8">Every return is a practice. You just practiced.</p>
          <div className="flex flex-col gap-3">
            <Button asChild size="lg">
              <a href="/btw">Return to Before the Words</a>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setActive(false); setDone(false); }}>
              Do another return
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (active) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-lg w-full px-6">
          <div className="flex gap-1 mb-10">
            {practice.steps.map((_, i) => (
              <div key={i} className={`h-0.5 flex-1 rounded-full transition-colors ${i <= stepIndex ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-6 text-center">
            {practice.label} · {stepIndex + 1} of {practice.steps.length}
          </p>
          <div className="p-10 rounded-2xl border border-border bg-card mb-8 text-center min-h-48 flex items-center justify-center">
            <p className="font-serif text-xl font-light text-foreground leading-relaxed">
              {practice.steps[stepIndex]}
            </p>
          </div>
          <Button className="w-full gap-2" size="lg" onClick={handleNext}>
            {stepIndex < practice.steps.length - 1 ? "Continue" : "Complete"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Before the Words</p>
          <h1 className="font-serif text-4xl font-light text-foreground mb-3">Return to the Ground</h1>
          <p className="text-muted-foreground font-light">Choose the return that meets where you are.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {(Object.entries(RETURNS) as [ReturnType, typeof RETURNS[ReturnType]][]).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`p-5 rounded-2xl border text-left transition-all ${selected === key ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-secondary/40"}`}
            >
              <p className={`text-sm font-light mb-1 ${selected === key ? "text-foreground" : "text-muted-foreground"}`}>{val.label}</p>
              <p className="text-xs text-muted-foreground">{val.duration}</p>
            </button>
          ))}
        </div>

        <Button className="w-full gap-2" size="lg" onClick={handleStart}>
          Begin {practice.label} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
