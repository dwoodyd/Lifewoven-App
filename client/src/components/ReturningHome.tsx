/**
 * ReturningHome — calm re-entry home for logged-in members with activity.
 * Spec: lifewoven-returning-member-home-spec.html
 *
 * Layout (centered single column, ~520px max, generous whitespace):
 *  Nav (full top nav, unchanged)
 *  01 · TUESDAY EVENING kicker
 *  02 · "Welcome back, DeWayne." heading
 *  03 · Personalized greeting line (time-aware, above the tagline)
 *  04 · "Come back to the whole — the practice meets you where you are."
 *  05 · Today's Practice card (pathway name, tagline, Begin → with hover transitions)
 *  06 · "Or — continue your last entry in The Weave" link
 *  07 · The Ground + Ask the Oracle (two side-by-side cards with hover transitions)
 *  08 · YOUR FIVE DIMENSIONS spine (colored dots + italic labels with hover transitions)
 */
import { Link, useLocation } from "wouter";
import { ArrowRight } from "lucide-react";
import Nav from "@/components/Nav";

interface Props {
  userName: string;
  lastPathway: string | null;
  lastJournalId: number | null;
  lastJournalTitle: string | null;
  lastJournalPathway: string | null;
}

// Pathway display metadata
const PATHWAY_META: Record<string, { label: string; tagline: string; duration: string }> = {
  align:     { label: "Align",     tagline: "Daily grounding practice",         duration: "10–20 min" },
  resonance: { label: "Resonance", tagline: "Advanced alignment work",           duration: "20–30 min" },
  uplift:    { label: "Uplift",    tagline: "Emotional set-point elevation",     duration: "15–25 min" },
  flow:      { label: "Flow",      tagline: "Future-self activation",            duration: "20–30 min" },
  rhythms:   { label: "Rhythms",   tagline: "Habit execution and identity",      duration: "15–20 min" },
  purpose:   { label: "Purpose",   tagline: "Meaning and resilience",            duration: "20–30 min" },
  reset:     { label: "Reset",     tagline: "Resilience after setback",          duration: "15–30 min" },
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

/** A brief, time-aware personal line shown between the heading and the tagline */
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

export default function ReturningHome({
  userName,
  lastPathway,
  lastJournalId,
  lastJournalTitle,
  lastJournalPathway,
}: Props) {
  const [, navigate] = useLocation();
  const focalSlug = lastPathway ?? "reset";
  const focalMeta = PATHWAY_META[focalSlug] ?? PATHWAY_META.reset;
  const firstName = userName.split(" ")[0];

  // Continuity copy — "You were in Resonance — pick it back up." or generic Weave link
  const continuityHref = lastJournalId ? `/weave/${lastJournalId}` : "/weave/new";
  const continuityLabel = lastJournalPathway
    ? `You were in ${lastJournalPathway.charAt(0).toUpperCase() + lastJournalPathway.slice(1)} — pick it back up.`
    : lastJournalTitle
      ? `continue "${lastJournalTitle}" in The Weave`
      : "continue your last entry in The Weave";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── NAV (unchanged, full top nav) ─── */}
      <Nav />

      {/* ─── MAIN CONTENT — single centered column ─── */}
      <main className="max-w-[520px] mx-auto px-6 pt-20 pb-24 flex flex-col items-center text-center">

        {/* 01 · TIME KICKER */}
        <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase mb-6">
          {getTimeKicker()}
        </p>

        {/* 02 · GREETING HEADING */}
        <h1
          className="leading-[1.06] mb-3 text-foreground"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(2.6rem, 7vw, 3.8rem)",
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          Welcome back, {firstName}.
        </h1>

        {/* 03 · PERSONALIZED GREETING LINE (time-aware, above tagline) */}
        <p
          className="text-foreground/70 leading-relaxed mb-2"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(1rem, 2.4vw, 1.15rem)",
          }}
        >
          {getPersonalGreeting(firstName)}
        </p>

        {/* 04 · TAGLINE */}
        <p
          className="text-muted-foreground leading-relaxed mb-10"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic",
            fontSize: "clamp(1.05rem, 2.6vw, 1.2rem)",
          }}
        >
          Come back to the whole — the practice meets you where you are.
        </p>

        {/* 05 · TODAY'S PRACTICE CARD */}
        <div
          className="w-full rounded-2xl border border-border bg-card shadow-sm px-8 py-7 mb-5
                     transition-all duration-300 ease-out
                     hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5"
        >
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-accent mb-4">
            Today's Practice
          </p>
          <h2
            className="text-foreground mb-2"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.9rem, 5vw, 2.4rem)",
              fontWeight: 600,
            }}
          >
            {focalMeta.label}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {focalMeta.tagline} · {focalMeta.duration}
          </p>
          <button
            onClick={() => navigate(`/pathway/${focalSlug}`)}
            className="group inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium
                       bg-foreground text-background
                       transition-all duration-200 ease-out
                       hover:opacity-85 hover:gap-3 active:scale-[0.97]"
          >
            Begin
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>

        {/* 06 · CONTINUITY LINE */}
        <p className="text-sm text-muted-foreground mb-10">
          Or —{" "}
          <Link
            href={continuityHref}
            className="transition-all duration-150 hover:underline underline-offset-2"
            style={{ color: "var(--color-accent, oklch(0.62 0.12 55))" }}
          >
            {continuityLabel}
          </Link>
        </p>

        {/* 07 · THE GROUND + ASK THE ORACLE */}
        <div className="w-full grid grid-cols-2 gap-3 mb-10">
          <Link href="/ground">
            <div
              className="rounded-xl border border-border bg-card px-5 py-5 text-left h-full
                         transition-all duration-250 ease-out
                         hover:border-accent/50 hover:shadow-sm hover:-translate-y-0.5
                         cursor-pointer"
            >
              <p
                className="text-foreground mb-1.5 transition-colors duration-150"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "1.1rem",
                  fontWeight: 500,
                }}
              >
                The Ground
              </p>
              <p className="text-xs text-muted-foreground leading-snug">Settle before the day.</p>
            </div>
          </Link>
          <Link href="/oracle">
            <div
              className="rounded-xl border border-border bg-card px-5 py-5 text-left h-full
                         transition-all duration-250 ease-out
                         hover:border-accent/50 hover:shadow-sm hover:-translate-y-0.5
                         cursor-pointer"
            >
              <p
                className="text-foreground mb-1.5 transition-colors duration-150"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "1.1rem",
                  fontWeight: 500,
                }}
              >
                Ask the Oracle
              </p>
              <p className="text-xs text-muted-foreground leading-snug">One question, anything.</p>
            </div>
          </Link>
        </div>

        {/* 08 · THE 5S SPINE */}
        <div className="w-full border-t border-border pt-8">
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-5">
            Your five dimensions
          </p>
          <div className="flex justify-center flex-wrap gap-x-6 gap-y-3">
            {FIVE_S.map((dim) => (
              <Link key={dim.key} href={`/${dim.key}`}>
                <span
                  className="flex items-center gap-2 text-muted-foreground
                             hover:text-foreground transition-colors duration-200 cursor-pointer
                             group"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: "italic",
                    fontSize: "1rem",
                  }}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0
                               transition-transform duration-200 group-hover:scale-125"
                    style={{ background: dim.color }}
                  />
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
