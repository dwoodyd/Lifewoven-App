import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Nav from "@/components/Nav";
import PostActivationInvite from "@/components/PostActivationInvite";
import { trpc } from "@/lib/trpc";
import { ArrowRight, ArrowLeft } from "lucide-react";

const QUESTIONS = [
  { id: 0, text: "How settled does your body feel right now?", low: "Very unsettled", high: "Completely at rest" },
  { id: 1, text: "How much fear or anxiety is present?", low: "None", high: "Overwhelming" },
  { id: 2, text: "Are you striving — pushing to make something happen?", low: "Not at all", high: "Intensely" },
  { id: 3, text: "How burdened do you feel by what you're carrying?", low: "Light", high: "Very heavy" },
  { id: 4, text: "How present are you — or are you mentally elsewhere?", low: "Fully here", high: "Completely elsewhere" },
  { id: 5, text: "How much pressure do you feel to perform or get it right?", low: "None", high: "Intense pressure" },
  { id: 6, text: "How depleted is your energy right now?", low: "Full", high: "Completely empty" },
];

const STATE_LABELS: Record<string, { label: string; desc: string; route: string; color: string }> = {
  bracing: { label: "Bracing", desc: "You're tense and guarded. Fear is close. The ground is still here.", route: "/ground/return?type=fear", color: "text-accent" },
  striving: { label: "Striving", desc: "You're pushing hard. The effort is real. There's another way to move.", route: "/ground/prayers", color: "text-foreground" },
  drifting: { label: "Drifting", desc: "You've lost the thread. That's okay. You can return.", route: "/ground/return?type=2min", color: "text-slate-600 dark:text-slate-300" },
  depleted: { label: "Depleted", desc: "You're running on empty. The first practice is rest, not effort.", route: "/ground/return?type=depletion", color: "text-destructive" },
  settled: { label: "Settled", desc: "You're in a good place to enter the ground or give thanks.", route: "/ground/enter-the-ground", color: "text-primary" },
};

export default function GroundCheck() {
  const [location, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>(Array(7).fill(null));
  const [result, setResult] = useState<{ state: string; practice: string } | null>(null);
  const declaredState = new URLSearchParams(window.location.search).get("state");
  const validDeclaredState = declaredState === "scattered" || declaredState === "burdened" || declaredState === "settled"
    ? declaredState
    : undefined;

  const submitMutation = trpc.btw.submitGroundCheck.useMutation({
    onSuccess: (data) => setResult(data),
  });

  const handleSelect = (value: number) => {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
  };

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) setStep(s => s + 1);
    else if (answers.every((answer): answer is number => answer !== null)) {
      submitMutation.mutate({ answers, declaredState: validDeclaredState });
    }
  };

  const q = QUESTIONS[step];
  const stateInfo = result ? STATE_LABELS[result.state] : null;

  if (result && stateInfo) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="container pt-20 pb-24 max-w-xl mx-auto text-center px-4 sm:px-6">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-6">Your Ground Check</p>
          <div className="p-10 rounded-2xl border border-border bg-card mb-8">
            <p className="text-xs text-muted-foreground mb-3">Your current posture</p>
            <h2 className={`font-serif text-4xl font-light mb-4 ${stateInfo.color}`}>{stateInfo.label}</h2>
            <p className="text-muted-foreground font-light leading-relaxed">{stateInfo.desc}</p>
          </div>
          <p className="text-sm text-muted-foreground mb-6 font-light">
            You are not evaluated. You are seen. The recommended practice meets you exactly here.
          </p>
          <PostActivationInvite />
          <div className="flex flex-col gap-3">
            <Button asChild size="lg" className="gap-2">
              <a href={stateInfo.route}>Begin Recommended Practice <ArrowRight className="h-4 w-4" /></a>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/ground")}>
              Return to The Ground
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Ground Check</p>
          <h1 className="font-serif text-3xl font-light text-foreground mb-3">Where are you right now?</h1>
          <p className="text-base text-muted-foreground font-light">Seven honest questions. No score. No judgment. Just a reading of where you are.</p>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-10">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`h-0.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>

        <div className="p-8 rounded-2xl border border-border bg-card mb-6">
          <p className="text-xs text-muted-foreground mb-4">{step + 1} of {QUESTIONS.length}</p>
          <h2 className="font-serif text-xl font-light text-foreground mb-8">{q.text}</h2>

          {/* Scale */}
          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5].map(v => (
              <button
                key={v}
                onClick={() => handleSelect(v)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  answers[step] === v
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background hover:bg-secondary/40 text-muted-foreground"
                }`}
              >
                <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono shrink-0 ${answers[step] === v ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{v}</span>
                <span className="text-base font-light">
                  {v === 0 ? q.low : v === 5 ? q.high : ""}
                </span>
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">{q.low}</span>
            <span className="text-xs text-muted-foreground">{q.high}</span>
          </div>
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Button className="flex-1 gap-2" onClick={handleNext} disabled={submitMutation.isPending || answers[step] === null}>
            {step < QUESTIONS.length - 1 ? "Next" : submitMutation.isPending ? "Reading…" : "See My Ground"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
