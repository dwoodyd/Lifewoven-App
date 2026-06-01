import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { REENTRY, BETTER_MIRROR } from "../../../shared/adaptive-language";
import { Sunrise, CheckCircle2, Clock, ArrowRight, Wind, Heart, Leaf } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type ReentryTrigger = "absence" | "overwhelm" | "shame" | "burnout";

interface ReentryFlowProps {
  daysSinceActive: number;
  onDismiss: () => void;
  trigger?: ReentryTrigger;
}

const STILL_MATTERS = [
  "Your daily check-in — just one honest answer about how you feel.",
  "The habit you care most about — even the tiny version counts.",
  "One journal entry — a sentence is enough.",
];

const CAN_WAIT = [
  "Catching up on everything you missed.",
  "Reviewing all your insights and notifications.",
  "Setting new goals or restructuring your habits.",
];

const TRIGGER_COPY: Record<ReentryTrigger, { icon: string; headline: string; sub: string; body: string }> = {
  absence: {
    icon: "sunrise",
    headline: "Welcome back.",
    sub: "You haven't been away long. You're still in it.",
    body: "The system holds your place. You don't need to catch up — you just need to begin.",
  },
  overwhelm: {
    icon: "wind",
    headline: "One thing at a time.",
    sub: "When everything feels urgent, nothing is.",
    body: "Your check-in score suggests you're carrying a lot right now. The Reset pathway was designed for exactly this — not to fix everything, but to help you find solid ground again.",
  },
  shame: {
    icon: "heart",
    headline: "You haven't failed. You paused.",
    sub: "Shame is the most expensive emotion. It costs more than the thing it's about.",
    body: "The Reset pathway is not a punishment — it's a doorway. It exists for moments exactly like this one.",
  },
  burnout: {
    icon: "leaf",
    headline: "Rest is part of the system.",
    sub: "Burnout is a signal, not a verdict.",
    body: "Your patterns suggest depletion. The Reset pathway starts with permission — to slow down, to stop performing recovery, and to let the system do its work.",
  },
};

export default function ReentryFlow({ daysSinceActive, onDismiss, trigger = "absence" }: ReentryFlowProps) {
  const [step, setStep] = useState<"welcome" | "next-step" | "done">("welcome");
  const [, navigate] = useLocation();

  const { data: habits } = trpc.habits.list.useQuery();
  const activeHabits = habits?.filter(h => h.isActive) ?? [];
  const topHabit = activeHabits[0];

  const handleBeginSmallWin = () => {
    setStep("next-step");
  };

  const handleJustCheckIn = () => {
    toast.success("Welcome back. One check-in is a real win.");
    navigate("/state");
    onDismiss();
  };

  const handleDone = () => {
    toast.success(BETTER_MIRROR.reentryIdentity);
    onDismiss();
  };

  if (step === "done") {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <h2 className="font-serif text-2xl text-foreground mb-3">
              {BETTER_MIRROR.reentryIdentity}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Every return is a kept promise to yourself. That's the only metric that matters.
            </p>
            <Button onClick={handleDone} className="w-full">
              Continue to my dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "next-step") {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8">
            <h2 className="font-serif text-2xl text-foreground mb-2">
              One small win.
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Choose the easiest possible entry point. It all counts.
            </p>

            <div className="space-y-3 mb-6">
              {topHabit && (
                <button
                  onClick={() => { toast.success("Great choice."); setStep("done"); }}
                  className="w-full text-left p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground text-sm">{topHabit.name}</p>
                      {topHabit.tinyVersion && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Tiny version: {topHabit.tinyVersion}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </button>
              )}

              <button
                onClick={handleJustCheckIn}
                className="w-full text-left p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">Do a quick check-in</p>
                    <p className="text-xs text-muted-foreground mt-0.5">One honest answer about how you feel right now</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>

              <button
                onClick={() => { navigate("/weave"); onDismiss(); }}
                className="w-full text-left p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">Write one sentence in my journal</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Just one thought. That's a real entry.</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
            </div>

            <Button variant="ghost" onClick={onDismiss} className="w-full text-muted-foreground text-sm">
              I'll find my own way in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Welcome step
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardContent className="p-8">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 ${
            trigger === "absence" ? "bg-amber-100" :
            trigger === "overwhelm" ? "bg-sky-100" :
            trigger === "shame" ? "bg-rose-100" :
            "bg-emerald-100"
          }`}>
            {trigger === "absence" && <Sunrise className="w-7 h-7 text-amber-600" />}
            {trigger === "overwhelm" && <Wind className="w-7 h-7 text-sky-600" />}
            {trigger === "shame" && <Heart className="w-7 h-7 text-rose-600" />}
            {trigger === "burnout" && <Leaf className="w-7 h-7 text-emerald-600" />}
          </div>

          {/* Headline */}
          <h2 className="font-serif text-3xl text-foreground mb-2">
            {TRIGGER_COPY[trigger].headline}
          </h2>
          <p className="text-lg text-muted-foreground mb-4">
            {TRIGGER_COPY[trigger].sub}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-7">
            {TRIGGER_COPY[trigger].body}
          </p>

          {/* What still matters / what can wait */}
          <div className="grid grid-cols-2 gap-4 mb-7">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">
                {REENTRY.stillMattersTitle}
              </p>
              <ul className="space-y-1.5">
                {STILL_MATTERS.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">
                {REENTRY.canWaitTitle}
              </p>
              <ul className="space-y-1.5">
                {CAN_WAIT.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-2">
            <Button onClick={handleBeginSmallWin} className="w-full">
              {REENTRY.ctaLabel}
            </Button>
            <Button variant="ghost" onClick={handleJustCheckIn} className="w-full text-muted-foreground">
              {REENTRY.ctaSecondary}
            </Button>
          </div>

          {/* Day count note */}
          {daysSinceActive > 1 && (
            <p className="text-center text-xs text-muted-foreground mt-5">
              {daysSinceActive === 1
                ? "You were away for a day."
                : `You were away for ${daysSinceActive} days. Life gets full. That's okay.`}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
