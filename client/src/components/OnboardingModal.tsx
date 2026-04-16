import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { ArrowRight, Compass, Waves, TrendingUp, Eye, Layers, Zap, RefreshCw, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const STORAGE_KEY = "lifewoven_onboarded_v2";

const PATHWAYS = [
  { slug: "align", name: "Align", subtitle: "Daily Grounding", icon: Compass, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  { slug: "resonance", name: "Resonance", subtitle: "Alignment Practice", icon: Waves, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800" },
  { slug: "uplift", name: "Uplift", subtitle: "Emotional Shift", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800" },
  { slug: "flow", name: "Flow", subtitle: "Visualization", icon: Eye, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950/30", border: "border-sky-200 dark:border-sky-800" },
  { slug: "rhythms", name: "Rhythms", subtitle: "Habit Design", icon: Layers, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800" },
  { slug: "purpose", name: "Purpose", subtitle: "Meaning & Why", icon: Zap, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800" },
  { slug: "reset", name: "Reset", subtitle: "Resilience Protocol", icon: RefreshCw, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-950/30", border: "border-teal-200 dark:border-teal-800" },
];

interface Props {
  userId?: number | null;
}

export default function OnboardingModal({ userId }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0); // 0=welcome, 1=pathway, 2=habit
  const [selectedPathway, setSelectedPathway] = useState<string>("align");
  const [habitName, setHabitName] = useState("");
  const [, navigate] = useLocation();

  const completeOnboarding = trpc.profile.completeOnboarding.useMutation({
    onSuccess: () => {
      toast.success("You're all set. Welcome to Lifewoven.");
    },
  });
  const createHabit = trpc.habits.create.useMutation();

  useEffect(() => {
    if (!userId) return;
    const key = `${STORAGE_KEY}_${userId}`;
    const seen = localStorage.getItem(key);
    if (!seen) setOpen(true);
  }, [userId]);

  function dismiss(skipNav = false) {
    if (userId) localStorage.setItem(`${STORAGE_KEY}_${userId}`, "1");
    setOpen(false);
    if (!skipNav) navigate("/dashboard");
  }

  async function finish() {
    if (habitName.trim()) {
      await createHabit.mutateAsync({ name: habitName.trim(), frequency: "daily" });
    }
    await completeOnboarding.mutateAsync({ recommendedPathway: selectedPathway });
    dismiss(true);
    navigate(`/pathway/${selectedPathway}`);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-6 pb-2">
          {[0, 1, 2].map(i => (
            <div key={i} className={`rounded-full transition-all duration-300 ${i === step ? "w-6 h-2 bg-foreground" : i < step ? "w-2 h-2 bg-foreground/40" : "w-2 h-2 bg-border"}`} />
          ))}
        </div>

        {/* ── Screen 0: Welcome ── */}
        {step === 0 && (
          <div className="p-8">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Welcome to Lifewoven</p>
            <h2 className="font-serif text-3xl font-light text-foreground mb-3">You've arrived.</h2>
            <p className="text-base text-muted-foreground font-light leading-relaxed mb-8">
              Lifewoven is a personal transformation platform built around the 5S Framework — a five-dimensional system for living in alignment. This takes 60 seconds to set up.
            </p>
            <div className="grid grid-cols-5 gap-2 mb-8">
              {[
                { label: "State", color: "text-[oklch(0.62_0.14_200)]", bg: "bg-[oklch(0.62_0.14_200)]/10" },
                { label: "Story", color: "text-[oklch(0.60_0.14_280)]", bg: "bg-[oklch(0.60_0.14_280)]/10" },
                { label: "Standards", color: "text-[oklch(0.58_0.16_145)]", bg: "bg-[oklch(0.58_0.16_145)]/10" },
                { label: "Strategy", color: "text-[oklch(0.52_0.14_240)]", bg: "bg-[oklch(0.52_0.14_240)]/10" },
                { label: "Stewardship", color: "text-[oklch(0.62_0.12_55)]", bg: "bg-[oklch(0.62_0.12_55)]/10" },
              ].map(m => (
                <div key={m.label} className={`${m.bg} rounded-xl p-3 text-center`}>
                  <p className={`text-[9px] font-medium ${m.color} leading-tight`}>{m.label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 gap-2" onClick={() => setStep(1)}>
                Let's begin <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" onClick={() => dismiss(false)} className="text-muted-foreground text-sm">
                Skip
              </Button>
            </div>
          </div>
        )}

        {/* ── Screen 1: Choose pathway ── */}
        {step === 1 && (
          <div className="p-8">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-2">Step 1 of 2</p>
            <h2 className="font-serif text-2xl font-light text-foreground mb-1">Choose your first pathway.</h2>
            <p className="text-sm text-muted-foreground mb-5 font-light">Pick the one that meets you where you are right now. You can always change this.</p>
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1 mb-6">
              {PATHWAYS.map(p => {
                const Icon = p.icon;
                const selected = selectedPathway === p.slug;
                return (
                  <button
                    key={p.slug}
                    onClick={() => setSelectedPathway(p.slug)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selected ? `${p.border} ${p.bg}` : "border-border hover:border-muted-foreground"}`}
                  >
                    <div className={`p-2 rounded-lg ${p.bg} flex-shrink-0`}>
                      <Icon className={`h-4 w-4 ${p.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.subtitle}</p>
                    </div>
                    {selected && <CheckCircle2 className={`h-4 w-4 ${p.color} flex-shrink-0`} />}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)} className="shrink-0">Back</Button>
              <Button className="flex-1 gap-2" onClick={() => setStep(2)}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Screen 2: First habit ── */}
        {step === 2 && (
          <div className="p-8">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-2">Step 2 of 2</p>
            <h2 className="font-serif text-2xl font-light text-foreground mb-1">Name one small habit.</h2>
            <p className="text-sm text-muted-foreground mb-6 font-light">
              The smallest version counts. "Drink water before coffee." "Read one page." One vote for the person you're becoming.
            </p>
            <Input
              placeholder="e.g. Meditate for 5 minutes"
              value={habitName}
              onChange={e => setHabitName(e.target.value)}
              className="mb-2"
              onKeyDown={e => e.key === "Enter" && finish()}
              autoFocus
            />
            <p className="text-xs text-muted-foreground mb-6">You can skip this and add habits later.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="shrink-0">Back</Button>
              <Button
                className="flex-1 gap-2"
                onClick={finish}
                disabled={completeOnboarding.isPending || createHabit.isPending}
              >
                {completeOnboarding.isPending ? "Setting up…" : "Begin my journey"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
