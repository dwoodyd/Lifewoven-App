import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Nav from "@/components/Nav";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Sun, Sunset, Moon, ArrowRight, CheckCircle2 } from "lucide-react";

type Mode = "morning" | "midday" | "evening";

const PRACTICES: Record<Mode, { icon: React.ReactNode; label: string; duration: string; steps: string[] }> = {
  morning: {
    icon: <Sun className="h-5 w-5" />,
    label: "Morning Settling",
    duration: "3–5 min",
    steps: [
      "Take three guided breaths. Breathe in slowly through your nose. Hold for a moment. Release fully.",
      "Soften your body. Let your shoulders drop. Unclench your jaw. Open your hands.",
      "Ask yourself quietly: What ground am I standing on today?",
      "Hold one remembrance — something true that does not change regardless of what today holds.",
      "Speak or sit with one short prayer. Let it be honest, not polished.",
      "Close with a daily intention. Not a goal. A posture. How do you want to move through today?",
    ],
  },
  midday: {
    icon: <Sunset className="h-5 w-5" />,
    label: "Midday Return",
    duration: "60–90 sec",
    steps: [
      "Pause. Stop what you're doing for 60 seconds.",
      "Scan. Where has your body tensed? Where has your mind gone?",
      "Adjust. Take one breath. Name where you are.",
      "Continue. Return to what's in front of you — from here.",
    ],
  },
  evening: {
    icon: <Moon className="h-5 w-5" />,
    label: "Evening Release",
    duration: "3 min",
    steps: [
      "Review the day without judgment. What happened? What did you carry?",
      "Name one grace. One specific thing — small or large — that was given, not earned.",
      "Release the day. You don't have to carry it into sleep. Set it down.",
      "Close with a rest-oriented prayer. Let it end with trust, not a to-do list.",
    ],
  },
};

export default function EnterTheGround() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<Mode>("morning");
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const startTime = useRef<number>(0);

  const startMutation = trpc.btw.startSession.useMutation({
    onSuccess: (data) => setSessionId(data?.id ?? null),
  });
  const completeMutation = trpc.btw.completeSession.useMutation();

  const practice = PRACTICES[mode];

  const handleStart = () => {
    startTime.current = Date.now();
    startMutation.mutate({ sessionType: mode });
    setActive(true);
    setStepIndex(0);
    setDone(false);
  };

  const handleNext = () => {
    if (stepIndex < practice.steps.length - 1) {
      setStepIndex(i => i + 1);
    } else {
      const dur = Math.round((Date.now() - startTime.current) / 1000);
      if (sessionId) completeMutation.mutate({ sessionId, durationSeconds: dur });
      setDone(true);
    }
  };

  // Auto-detect mode by time of day
  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) setMode("morning");
    else if (h >= 12 && h < 17) setMode("midday");
    else setMode("evening");
  }, []);

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <CheckCircle2 className="h-10 w-10 text-accent mx-auto mb-6" />
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-foreground mb-4">You settled.</h2>
          <p className="text-muted-foreground font-light mb-8">That is the practice. Not perfection — presence.</p>
          <div className="flex flex-col gap-3">
            <Button asChild size="lg">
              <a href="/btw">Return to Before the Words</a>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setActive(false); setDone(false); }}>
              Practice again
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
          {/* Progress */}
          <div className="flex gap-1 mb-10">
            {practice.steps.map((_, i) => (
              <div key={i} className={`h-0.5 flex-1 rounded-full transition-colors ${i <= stepIndex ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>

          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-6 text-center">
            {practice.label} · Step {stepIndex + 1} of {practice.steps.length}
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
          <h1 className="font-serif text-4xl font-light text-foreground mb-3">Enter the Ground</h1>
          <p className="text-muted-foreground font-light">Choose the practice that meets you where you are.</p>
        </div>

        {/* Mode selector */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {(["morning", "midday", "evening"] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`p-5 rounded-2xl border text-center transition-all ${mode === m ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-secondary/40"}`}
            >
              <div className={`flex justify-center mb-2 ${mode === m ? "text-primary" : "text-muted-foreground"}`}>
                {PRACTICES[m].icon}
              </div>
              <p className={`text-sm font-light ${mode === m ? "text-foreground" : "text-muted-foreground"}`}>
                {PRACTICES[m].label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{PRACTICES[m].duration}</p>
            </button>
          ))}
        </div>

        {/* Practice preview */}
        <div className="p-8 rounded-2xl border border-border bg-card mb-8">
          <h2 className="font-serif text-xl font-light text-foreground mb-4">{practice.label}</h2>
          <div className="space-y-3">
            {practice.steps.map((step, i) => (
              <div key={i} className="flex gap-3 text-base text-muted-foreground font-light">
                <span className="text-accent font-mono shrink-0">{i + 1}.</span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full gap-2" size="lg" onClick={handleStart}>
          Begin {practice.label} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
