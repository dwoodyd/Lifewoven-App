import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// ─── Day prompt data (mirrors server) ────────────────────────────────────────
const DAY_PROMPTS: Record<number, { prompt: string; subPrompt: string; completionMessage: string }> = {
  1: {
    prompt: "What are you actually working on right now?",
    subPrompt: "Not what you wish you were working on. Not what you tell people. What is actually consuming your attention, your energy, your worry?",
    completionMessage: "You named it. That's the first honest act.",
  },
  2: {
    prompt: "What have you been avoiding?",
    subPrompt: "The conversation you keep postponing. The decision you keep deferring. The thing you open and close without doing. Name it.",
    completionMessage: "Naming avoidance is not weakness. It's the beginning of motion.",
  },
  3: {
    prompt: "What do you actually believe about yourself right now?",
    subPrompt: "Not the affirmations. Not the aspirational self-talk. What is the quiet story you carry about who you are and what you deserve?",
    completionMessage: "You looked at the story. That's rarer than you think.",
  },
  4: {
    prompt: "What would you do if you weren't afraid of failing?",
    subPrompt: "Don't answer quickly. Sit with it. What is the thing that keeps not happening because you're protecting yourself from something?",
    completionMessage: "The answer you just wrote is a map. Keep it.",
  },
  5: {
    prompt: "Who are you becoming?",
    subPrompt: "Not who you want to be in some distant future. Based on your actual choices this week — your habits, your attention, your words — who is the person you are in the process of becoming?",
    completionMessage: "You can only change what you can see. You're seeing it now.",
  },
  6: {
    prompt: "What are you grateful for that you've never said out loud?",
    subPrompt: "Not the obvious things. The quiet ones. The things that have held you that you've never fully acknowledged.",
    completionMessage: "Gratitude that is spoken becomes a foundation. You just laid one.",
  },
  7: {
    prompt: "What do you want your life to mean?",
    subPrompt: "Not what you want to accomplish. Not what you want people to say at your funeral. What do you want the texture of your days to be? What do you want to have stood for?",
    completionMessage: "You've done the week. This last answer — return to it. It knows something.",
  },
};

// ─── Entry Screen ─────────────────────────────────────────────────────────────
function EntryScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal nav */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-border/40">
        <Link href="/" className="font-serif text-xl text-foreground tracking-tight">
          Lifewoven.
        </Link>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-[520px] w-full space-y-10 text-center">
          {/* Eyebrow */}
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-sans">
            A seven-day practice
          </p>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="font-serif text-4xl md:text-5xl text-foreground leading-tight">
              The First Honest Week
            </h1>
            <div className="w-10 h-px bg-[var(--color-gold)] mx-auto" />
          </div>

          {/* Body */}
          <div className="space-y-5 text-left">
            <p className="font-sans text-base text-foreground/80 leading-relaxed">
              Seven days. Seven questions. No performance required.
            </p>
            <p className="font-sans text-base text-foreground/80 leading-relaxed">
              This is not a journal prompt exercise. It is a structured encounter with what is actually true about your life right now — not the curated version, not the aspirational version. The real one.
            </p>
            <p className="font-sans text-base text-foreground/80 leading-relaxed">
              One question per day. Write until you hit something true. Then stop.
            </p>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed italic">
              You don't have to do all seven days consecutively. But the sequence matters. Don't skip ahead.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={onBegin}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background font-sans text-sm tracking-wide rounded-full hover:bg-foreground/90 transition-all duration-200"
          >
            Begin Day 1
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </button>
        </div>
      </main>
    </div>
  );
}

// ─── Day Screen ───────────────────────────────────────────────────────────────
function DayScreen({
  dayNumber,
  onComplete,
}: {
  dayNumber: number;
  onComplete: (message: string, isLast: boolean) => void;
}) {
  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [completionMsg, setCompletionMsg] = useState("");
  const utils = trpc.useUtils();

  const submitMutation = trpc.firstHonestWeek.submitDay.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      setCompletionMsg(data.completionMessage);
      utils.firstHonestWeek.getProgress.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const day = DAY_PROMPTS[dayNumber];
  if (!day) return null;

  const handleSubmit = () => {
    if (response.trim().length < 10) {
      toast.error("Write a little more before submitting.");
      return;
    }
    submitMutation.mutate({ dayNumber, response: response.trim() });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="px-6 py-5 flex items-center justify-between border-b border-border/40">
          <Link href="/" className="font-serif text-xl text-foreground tracking-tight">Lifewoven.</Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-[520px] w-full space-y-8 text-center">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Day {dayNumber} of 7</p>
            <div className="w-10 h-px bg-[var(--color-gold)] mx-auto" />
            <p className="font-serif text-2xl md:text-3xl text-foreground leading-snug italic">
              "{completionMsg}"
            </p>
            <div className="w-10 h-px bg-[var(--color-gold)] mx-auto" />
            {dayNumber < 7 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Come back tomorrow for Day {dayNumber + 1}.</p>
                <button
                  onClick={() => onComplete(completionMsg, false)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-sans text-sm rounded-full hover:bg-foreground/90 transition-all"
                >
                  Continue to Day {dayNumber + 1} now →
                </button>
              </div>
            ) : (
              <button
                onClick={() => onComplete(completionMsg, true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-sans text-sm rounded-full hover:bg-foreground/90 transition-all"
              >
                See your week →
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between border-b border-border/40">
        <Link href="/" className="font-serif text-xl text-foreground tracking-tight">Lifewoven.</Link>
        <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Day {dayNumber} of 7</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-[560px] w-full space-y-8">
          {/* Progress dots */}
          <div className="flex gap-2 justify-center">
            {[1,2,3,4,5,6,7].map((d) => (
              <div
                key={d}
                className={`w-2 h-2 rounded-full transition-all ${
                  d < dayNumber ? "bg-[var(--color-gold)]" :
                  d === dayNumber ? "bg-foreground scale-125" :
                  "bg-border"
                }`}
              />
            ))}
          </div>

          {/* Prompt */}
          <div className="space-y-3">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground leading-snug">
              {day.prompt}
            </h2>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              {day.subPrompt}
            </p>
          </div>

          {/* Textarea */}
          <Textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Write here..."
            className="min-h-[200px] resize-none bg-card border-border/60 font-sans text-base text-foreground placeholder:text-muted-foreground/50 focus:border-[var(--color-gold)] transition-colors"
            autoFocus
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground/60">{response.length} characters</span>
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending || response.trim().length < 10}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-sans text-sm rounded-full hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {submitMutation.isPending ? "Saving..." : "Submit"}
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Completion Screen ────────────────────────────────────────────────────────
function CompletionScreen({ entries }: { entries: Array<{ dayNumber: number; response: string; prompt: string }> }) {
  // Show 3 most significant entries (days 3, 5, 7 — the identity, becoming, meaning prompts)
  const featured = entries.filter((e) => [3, 5, 7].includes(e.dayNumber));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between border-b border-border/40">
        <Link href="/" className="font-serif text-xl text-foreground tracking-tight">Lifewoven.</Link>
      </header>

      <main className="flex-1 px-6 py-16">
        <div className="max-w-[560px] mx-auto space-y-12">
          {/* Heading */}
          <div className="text-center space-y-4">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">The First Honest Week</p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground">You did the work.</h1>
            <div className="w-10 h-px bg-[var(--color-gold)] mx-auto" />
            <p className="font-sans text-base text-foreground/70 leading-relaxed max-w-[400px] mx-auto">
              Seven questions. Seven honest answers. This is the foundation the practice builds on.
            </p>
          </div>

          {/* Featured entries */}
          {featured.length > 0 && (
            <div className="space-y-6">
              <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground text-center">Three answers worth returning to</p>
              {featured.map((entry) => (
                <div key={entry.dayNumber} className="bg-card border border-border/50 rounded-xl p-6 space-y-3">
                  <p className="text-xs tracking-[0.1em] uppercase text-[var(--color-gold)]">Day {entry.dayNumber}</p>
                  <p className="font-serif text-lg text-foreground leading-snug">{entry.prompt}</p>
                  <p className="font-sans text-sm text-foreground/70 leading-relaxed line-clamp-4">{entry.response}</p>
                </div>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/weave"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-foreground text-background font-sans text-sm rounded-full hover:bg-foreground/90 transition-all"
            >
              Open The Weave →
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-border text-foreground font-sans text-sm rounded-full hover:bg-muted transition-all"
            >
              Return home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FirstHonestWeekPage() {
  const { data: progress, isLoading } = trpc.firstHonestWeek.getProgress.useQuery();
  const [view, setView] = useState<"entry" | "day" | "complete">("entry");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  // Determine initial view from server state
  const currentDay = progress?.currentDay ?? 1;
  const isComplete = progress?.isComplete ?? false;

  // If complete and not overridden by local state
  if (isComplete && view !== "day") {
    return <CompletionScreen entries={progress?.entries ?? []} />;
  }

  if (view === "entry" && !isComplete && currentDay === 1 && (progress?.completedDays?.length ?? 0) === 0) {
    return <EntryScreen onBegin={() => setView("day")} />;
  }

  if (view === "entry" || view === "day") {
    return (
      <DayScreen
        dayNumber={currentDay}
        onComplete={(_msg, isLast) => {
          if (isLast) setView("complete");
          // For non-last days, the progress query will re-fetch and update currentDay
        }}
      />
    );
  }

  return <CompletionScreen entries={progress?.entries ?? []} />;
}
