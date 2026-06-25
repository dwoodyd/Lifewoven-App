/**
 * ReturningHome — daily dashboard for logged-in members (post-Soul Engineer Assessment).
 *
 * Layout (centered single column, ~600px max):
 *  Nav
 *  01 · TIME KICKER + greeting
 *  02 · Daily Capacity Check-In (inline sliders or today's scores)
 *  03 · Today's Lumin Prompt (rotating, day-keyed from 12 SE prompts)
 *  04 · First Honest Week Progress (7-day progress bar)
 *  05 · Recommended Pathway card
 *  06 · Recent Weave Activity (last 3 entries)
 *  07 · The Ground + Ask the Oracle (2-up)
 *  08 · Your Five Dimensions spine
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, CheckCircle2, Circle, BookOpen, Flame } from "lucide-react";
import Nav from "@/components/Nav";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Props {
  userName: string;
  lastPathway: string | null;
  lastJournalId: number | null;
  lastJournalTitle: string | null;
  lastJournalPathway: string | null;
  recommendedPathway: string | null;
  recentJournals: Array<{ id: number; title: string | null; pathway: string | null; createdAt: Date }>;
  todayCheckIn: { id: number; emotionalScore: number; energyLevel: number; clarityLevel: number } | null;
  fhwDaysCompleted: number;
}

// ─── Soul Engineer 12 Prompts (rotating daily) ────────────────────────────────
const SE_PROMPTS = [
  { prompt: "What is the load-bearing belief I am carrying into today — and is it true?", dimension: "Story" },
  { prompt: "Where in my life am I building on an unstable foundation? What would honest repair look like?", dimension: "Standards" },
  { prompt: "What is my emotional set-point right now? What moved me here, and what would move me higher?", dimension: "State" },
  { prompt: "What is the honest step — not the perfect step — I can take today?", dimension: "Strategy" },
  { prompt: "What am I stewarding well? What am I neglecting?", dimension: "Stewardship" },
  { prompt: "What story am I telling about why this isn't working — and what story would a Soul Engineer tell instead?", dimension: "Story" },
  { prompt: "Where is my energy going that is not aligned with who I am becoming?", dimension: "State" },
  { prompt: "What standard have I let slip? What would it look like to return to it today?", dimension: "Standards" },
  { prompt: "What decision am I avoiding, and what does that avoidance cost me?", dimension: "Strategy" },
  { prompt: "What does the best version of me do in the next two hours?", dimension: "State" },
  { prompt: "What am I grateful for that I have not yet named?", dimension: "Stewardship" },
  { prompt: "What is one thing I know to be true about myself that I have not yet acted on?", dimension: "Story" },
];

// ─── Pathway display metadata ──────────────────────────────────────────────────
const PATHWAY_META: Record<string, { label: string; tagline: string; duration: string; dimension: string }> = {
  align:     { label: "Align",     tagline: "Daily grounding practice",         duration: "10–20 min", dimension: "State" },
  resonance: { label: "Resonance", tagline: "Advanced alignment work",           duration: "20–30 min", dimension: "State" },
  uplift:    { label: "Uplift",    tagline: "Emotional set-point elevation",     duration: "15–25 min", dimension: "State" },
  flow:      { label: "Flow",      tagline: "Future-self activation",            duration: "20–30 min", dimension: "Story" },
  rhythms:   { label: "Rhythms",   tagline: "Habit execution and identity",      duration: "15–20 min", dimension: "Standards" },
  purpose:   { label: "Purpose",   tagline: "Meaning and resilience",            duration: "20–30 min", dimension: "Stewardship" },
  reset:     { label: "Reset",     tagline: "Resilience after setback",          duration: "15–30 min", dimension: "Strategy" },
};

const FIVE_S = [
  { key: "state",       label: "State",       color: "oklch(0.48 0.12 195)" },
  { key: "story",       label: "Story",       color: "oklch(0.44 0.12 290)" },
  { key: "standards",   label: "Standards",   color: "oklch(0.46 0.12 148)" },
  { key: "strategy",    label: "Strategy",    color: "oklch(0.40 0.10 248)" },
  { key: "stewardship", label: "Stewardship", color: "oklch(0.58 0.12 48)"  },
];

function getTimeKicker(): string {
  const h = new Date().getHours();
  const day = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  if (h < 5)  return `${day} NIGHT`;
  if (h < 12) return `${day} MORNING`;
  if (h < 17) return `${day} AFTERNOON`;
  if (h < 21) return `${day} EVENING`;
  return `${day} NIGHT`;
}

function getPersonalGreeting(firstName: string): string {
  const h = new Date().getHours();
  if (h < 5)  return `Still here, ${firstName}. The practice holds.`;
  if (h < 9)  return `The morning is yours, ${firstName}.`;
  if (h < 12) return `A good morning to tend the whole, ${firstName}.`;
  if (h < 14) return `Midday. A moment to come back to yourself, ${firstName}.`;
  if (h < 17) return `The afternoon is a good time to check in, ${firstName}.`;
  if (h < 20) return `The day is winding down, ${firstName}. Come back to the whole.`;
  return `The evening belongs to you, ${firstName}.`;
}

function getDailyPrompt() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return SE_PROMPTS[dayOfYear % SE_PROMPTS.length];
}

// ─── Daily Capacity Check-In Card ─────────────────────────────────────────────
function CheckInCard({ todayCheckIn }: { todayCheckIn: Props["todayCheckIn"] }) {
  const utils = trpc.useUtils();
  const [emotional, setEmotional] = useState(todayCheckIn?.emotionalScore ?? 11);
  const [energy, setEnergy] = useState(todayCheckIn?.energyLevel ?? 5);
  const [clarity, setClarity] = useState(todayCheckIn?.clarityLevel ?? 5);
  const [submitted, setSubmitted] = useState(!!todayCheckIn);

  const createCheckIn = trpc.checkIn.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      utils.profile.homeContext.invalidate();
      toast.success("Check-in recorded.");
    },
    onError: () => toast.error("Could not save check-in."),
  });

  const emotionalLabel = (v: number) => {
    if (v <= 4) return "Low";
    if (v <= 8) return "Neutral";
    if (v <= 14) return "Positive";
    if (v <= 18) return "Elevated";
    return "Peak";
  };

  if (submitted) {
    const scores = todayCheckIn ?? { emotionalScore: emotional, energyLevel: energy, clarityLevel: clarity };
    return (
      <div className="w-full rounded-2xl border border-border bg-card px-7 py-6 mb-5">
        <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-accent mb-3">
          Daily Capacity Check-In · Today
        </p>
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-2xl font-semibold text-foreground" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{scores.emotionalScore}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Emotional</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-foreground" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{scores.energyLevel}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Energy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-foreground" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{scores.clarityLevel}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Clarity</p>
          </div>
          <div className="ml-auto flex items-center">
            <CheckCircle2 className="h-5 w-5 text-accent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-border bg-card px-7 py-6 mb-5">
      <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-accent mb-4">
        Daily Capacity Check-In
      </p>
      <div className="space-y-4 mb-5">
        <div>
          <div className="flex justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Emotional</span>
            <span className="text-xs text-foreground font-medium">{emotional} — {emotionalLabel(emotional)}</span>
          </div>
          <input type="range" min={1} max={22} value={emotional}
            onChange={e => setEmotional(Number(e.target.value))}
            className="w-full accent-[oklch(0.62_0.12_55)]" />
        </div>
        <div>
          <div className="flex justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Energy</span>
            <span className="text-xs text-foreground font-medium">{energy}/10</span>
          </div>
          <input type="range" min={1} max={10} value={energy}
            onChange={e => setEnergy(Number(e.target.value))}
            className="w-full accent-[oklch(0.62_0.12_55)]" />
        </div>
        <div>
          <div className="flex justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Clarity</span>
            <span className="text-xs text-foreground font-medium">{clarity}/10</span>
          </div>
          <input type="range" min={1} max={10} value={clarity}
            onChange={e => setClarity(Number(e.target.value))}
            className="w-full accent-[oklch(0.62_0.12_55)]" />
        </div>
      </div>
      <button
        onClick={() => createCheckIn.mutate({ emotionalScore: emotional, energyLevel: energy, clarityLevel: clarity })}
        disabled={createCheckIn.isPending}
        className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium
                   bg-foreground text-background transition-all duration-200 hover:opacity-85 active:scale-[0.97]
                   disabled:opacity-50"
      >
        {createCheckIn.isPending ? "Saving…" : "Record Check-In"}
      </button>
    </div>
  );
}

// ─── Today's Lumin Prompt Card ─────────────────────────────────────────────────
function LuminPromptCard() {
  const [, navigate] = useLocation();
  const daily = getDailyPrompt();
  const encoded = encodeURIComponent(daily.prompt);
  return (
    <div className="w-full rounded-2xl border border-border bg-card px-7 py-6 mb-5">
      <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-accent mb-3">
        Today's Lumin Prompt · {daily.dimension}
      </p>
      <p
        className="text-foreground leading-relaxed mb-5"
        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.15rem", fontStyle: "italic" }}
      >
        "{daily.prompt}"
      </p>
      <button
        onClick={() => navigate(`/weave/new?prompt=${encoded}`)}
        className="group inline-flex items-center gap-2 text-sm font-medium transition-colors duration-150"
        style={{ color: "var(--color-accent, oklch(0.62 0.12 55))" }}
      >
        Write in The Weave
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
      </button>
    </div>
  );
}

// ─── First Honest Week Progress Card ──────────────────────────────────────────
function FHWCard({ daysCompleted }: { daysCompleted: number }) {
  const isComplete = daysCompleted >= 7;
  const currentDay = Math.min(daysCompleted + 1, 7);
  return (
    <div className="w-full rounded-2xl border border-border bg-card px-7 py-6 mb-5">
      <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-accent mb-3">
        First Honest Week {isComplete ? "· Complete" : `· Day ${currentDay} of 7`}
      </p>
      <div className="flex gap-2 mb-4">
        {Array.from({ length: 7 }, (_, i) => {
          const done = i < daysCompleted;
          const current = i === daysCompleted && !isComplete;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-accent" />
              ) : current ? (
                <Flame className="h-5 w-5 text-amber-500" />
              ) : (
                <Circle className="h-5 w-5 text-border" />
              )}
              <span className="text-[9px] text-muted-foreground">{i + 1}</span>
            </div>
          );
        })}
      </div>
      {isComplete ? (
        <p className="text-sm text-muted-foreground">You did the work. The foundation is set.</p>
      ) : (
        <Link
          href="/first-honest-week"
          className="group inline-flex items-center gap-2 text-sm font-medium transition-colors duration-150"
          style={{ color: "var(--color-accent, oklch(0.62 0.12 55))" }}
        >
          {daysCompleted === 0 ? "Begin the week" : `Continue Day ${currentDay}`}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

// ─── Recommended Pathway Card ──────────────────────────────────────────────────
function RecommendedPathwayCard({ pathway }: { pathway: string }) {
  const [, navigate] = useLocation();
  const meta = PATHWAY_META[pathway] ?? PATHWAY_META.reset;
  return (
    <div
      className="w-full rounded-2xl border border-border bg-card shadow-sm px-8 py-7 mb-5
                 transition-all duration-300 ease-out hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5"
    >
      <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-accent mb-4">
        Recommended Pathway · {meta.dimension}
      </p>
      <h2
        className="text-foreground mb-2"
        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.9rem, 5vw, 2.4rem)", fontWeight: 600 }}
      >
        {meta.label}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {meta.tagline} · {meta.duration}
      </p>
      <button
        onClick={() => navigate(`/pathway/${pathway}`)}
        className="group inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium
                   bg-foreground text-background transition-all duration-200 ease-out
                   hover:opacity-85 hover:gap-3 active:scale-[0.97]"
      >
        Begin
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
      </button>
    </div>
  );
}

// ─── Recent Weave Activity ─────────────────────────────────────────────────────
function RecentWeaveCard({ journals }: { journals: Props["recentJournals"] }) {
  if (!journals.length) return null;
  return (
    <div className="w-full rounded-2xl border border-border bg-card px-7 py-6 mb-5">
      <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-accent mb-4">
        Recent Weave Activity
      </p>
      <div className="space-y-3">
        {journals.map((j) => (
          <Link key={j.id} href={`/weave/${j.id}`}>
            <div className="flex items-start gap-3 group cursor-pointer">
              <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0 group-hover:text-accent transition-colors" />
              <div className="min-w-0">
                <p className="text-sm text-foreground group-hover:text-accent transition-colors truncate">
                  {j.title ?? "Untitled entry"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {j.pathway ? `${j.pathway.charAt(0).toUpperCase() + j.pathway.slice(1)} · ` : ""}
                  {new Date(j.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Link
        href="/weave"
        className="group inline-flex items-center gap-2 text-sm font-medium mt-4 transition-colors duration-150"
        style={{ color: "var(--color-accent, oklch(0.62 0.12 55))" }}
      >
        Open The Weave
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ReturningHome({
  userName,
  lastPathway,
  lastJournalId,
  lastJournalTitle,
  lastJournalPathway,
  recommendedPathway,
  recentJournals,
  todayCheckIn,
  fhwDaysCompleted,
}: Props) {
  const firstName = userName.split(" ")[0];
  const focalSlug = recommendedPathway ?? lastPathway ?? "reset";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="max-w-[600px] mx-auto px-6 pt-20 pb-24 flex flex-col items-center text-center">

        {/* 01 · TIME KICKER */}
        <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase mb-6">
          {getTimeKicker()}
        </p>

        {/* 02 · GREETING */}
        <h1
          className="leading-[1.06] mb-3 text-foreground"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.6rem, 7vw, 3.8rem)", fontWeight: 500, letterSpacing: "-0.01em" }}
        >
          Welcome back, {firstName}.
        </h1>
        <p
          className="text-foreground/70 leading-relaxed mb-2"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1rem, 2.4vw, 1.15rem)" }}
        >
          {getPersonalGreeting(firstName)}
        </p>
        <p
          className="text-muted-foreground leading-relaxed mb-10"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: "clamp(1.05rem, 2.6vw, 1.2rem)" }}
        >
          Come back to the whole — the practice meets you where you are.
        </p>

        {/* 03 · DAILY CAPACITY CHECK-IN */}
        <div className="w-full text-left">
          <CheckInCard todayCheckIn={todayCheckIn} />
        </div>

        {/* 04 · TODAY'S LUMIN PROMPT */}
        <div className="w-full text-left">
          <LuminPromptCard />
        </div>

        {/* 05 · FIRST HONEST WEEK PROGRESS */}
        <div className="w-full text-left">
          <FHWCard daysCompleted={fhwDaysCompleted} />
        </div>

        {/* 06 · RECOMMENDED PATHWAY */}
        <div className="w-full text-left">
          <RecommendedPathwayCard pathway={focalSlug} />
        </div>

        {/* 07 · RECENT WEAVE ACTIVITY */}
        <div className="w-full text-left">
          <RecentWeaveCard journals={recentJournals} />
        </div>

        {/* 08 · THE GROUND + ASK THE ORACLE */}
        <div className="w-full grid grid-cols-2 gap-3 mb-10">
          <Link href="/ground">
            <div className="rounded-xl border border-border bg-card px-5 py-5 text-left h-full
                           transition-all duration-250 ease-out hover:border-accent/50 hover:shadow-sm hover:-translate-y-0.5 cursor-pointer">
              <p className="text-foreground mb-1.5 transition-colors duration-150"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: "1.1rem", fontWeight: 500 }}>
                The Ground
              </p>
              <p className="text-xs text-muted-foreground leading-snug">Settle before the day.</p>
            </div>
          </Link>
          <Link href="/oracle">
            <div className="rounded-xl border border-border bg-card px-5 py-5 text-left h-full
                           transition-all duration-250 ease-out hover:border-accent/50 hover:shadow-sm hover:-translate-y-0.5 cursor-pointer">
              <p className="text-foreground mb-1.5 transition-colors duration-150"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: "1.1rem", fontWeight: 500 }}>
                Ask the Oracle
              </p>
              <p className="text-xs text-muted-foreground leading-snug">One question, anything.</p>
            </div>
          </Link>
        </div>

        {/* 09 · JUST FINISHED THE BOOK? */}
        {fhwDaysCompleted === 0 && (
          <div className="w-full rounded-2xl border border-border/60 bg-card/60 px-7 py-6 mb-8 text-left
                         transition-all duration-300 ease-out hover:border-accent/40 hover:shadow-sm hover:-translate-y-0.5">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground mb-3">
              Just finished the book?
            </p>
            <p className="text-foreground mb-1"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.2rem", fontWeight: 500 }}>
              Start The First Honest Week
            </p>
            <p className="text-xs text-muted-foreground leading-snug mb-4">
              Seven questions. Seven honest answers. The foundation the practice builds on.
            </p>
            <Link href="/first-honest-week"
              className="group inline-flex items-center gap-2 text-sm font-medium transition-colors duration-150"
              style={{ color: "var(--color-accent, oklch(0.62 0.12 55))" }}>
              Begin the week
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        )}

        {/* 10 · THE 5S SPINE */}
        <div className="w-full border-t border-border pt-8">
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-5">
            Your five dimensions
          </p>
          <div className="flex justify-center flex-wrap gap-x-6 gap-y-3">
            {FIVE_S.map((dim) => (
              <Link key={dim.key} href={`/${dim.key}`}>
                <span
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer group"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: "1rem" }}
                >
                  <span className="inline-block w-2 h-2 rounded-full shrink-0 transition-transform duration-200 group-hover:scale-125"
                    style={{ background: dim.color }} />
                  {dim.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
