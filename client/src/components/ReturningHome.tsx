/**
 * ReturningHome — the calm re-entry home for logged-in members with activity.
 * Spec: lifewoven-returning-member-home-spec.html
 *
 * Layout (in order):
 *  01 · Greeting — time-aware kicker + name + quiet tagline
 *  02 · One focal action — last/recommended pathway with Begin →
 *  03 · Continuity — quiet link to last journal entry
 *  04 · The Ground + Ask the Oracle — two calm doorways side by side
 *  05 · The 5S spine — orientation row, no metrics
 */
import { Link, useLocation } from "wouter";
import { ArrowRight } from "lucide-react";

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
  { key: "state",       label: "State",       cssVar: "var(--color-state)" },
  { key: "story",       label: "Story",       cssVar: "var(--color-story)" },
  { key: "standards",   label: "Standards",   cssVar: "var(--color-standards)" },
  { key: "strategy",    label: "Strategy",    cssVar: "var(--color-strategy)" },
  { key: "stewardship", label: "Stewardship", cssVar: "var(--color-stewardship)" },
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

export default function ReturningHome({ userName, lastPathway, lastJournalId, lastJournalTitle, lastJournalPathway }: Props) {
  const [, navigate] = useLocation();
  const focalSlug = lastPathway ?? "reset";
  const focalMeta = PATHWAY_META[focalSlug] ?? PATHWAY_META.reset;
  const firstName = userName.split(" ")[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── 01 · GREETING ─── */}
      <section className="max-w-2xl mx-auto px-6 pt-20 pb-10 text-center">
        <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase mb-5">
          {getTimeKicker()}
        </p>
        <h1
          className="leading-[1.08] mb-4"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.4rem, 6vw, 4rem)", fontWeight: 500 }}
        >
          Welcome back, {firstName}.
        </h1>
        <p
          className="text-muted-foreground leading-relaxed"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)" }}
        >
          Pick the thread back up where you left it. Nothing here is urgent.
        </p>
      </section>

      {/* ─── 02 · ONE FOCAL ACTION ─── */}
      <section className="max-w-md mx-auto px-6 pb-4">
        <div className="rounded-2xl border border-border bg-card px-7 py-6 shadow-sm">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-accent mb-3">
            Today's Practice
          </p>
          <h2
            className="text-foreground mb-1"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.7rem", fontWeight: 600 }}
          >
            {focalMeta.label}
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            {focalMeta.tagline} · {focalMeta.duration}
          </p>
          <button
            onClick={() => navigate(`/pathway/${focalSlug}`)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            Begin <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      {/* ─── 03 · CONTINUITY ─── */}
      <section className="max-w-md mx-auto px-6 pb-8 text-center">
        {lastJournalId ? (
          <p className="text-sm text-muted-foreground">
            Or —{" "}
            <Link
              href={`/weave/${lastJournalId}`}
              className="text-accent hover:underline underline-offset-2"
            >
              {lastJournalTitle
                ? `continue "${lastJournalTitle}" in The Weave`
                : lastJournalPathway
                  ? `continue your ${lastJournalPathway} entry in The Weave`
                  : "continue your last entry in The Weave"}
            </Link>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Or —{" "}
            <Link href="/weave/new" className="text-accent hover:underline underline-offset-2">
              open The Weave and begin a new entry
            </Link>
          </p>
        )}
      </section>

      {/* ─── 04 · THE GROUND + ORACLE ─── */}
      <section className="max-w-md mx-auto px-6 pb-10">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/ground">
            <div className="rounded-xl border border-border bg-card px-4 py-4 hover:border-accent/40 transition-colors cursor-pointer">
              <p
                className="text-foreground mb-1"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: "1.05rem" }}
              >
                The Ground
              </p>
              <p className="text-xs text-muted-foreground">Settle before the day.</p>
            </div>
          </Link>
          <Link href="/oracle">
            <div className="rounded-xl border border-border bg-card px-4 py-4 hover:border-accent/40 transition-colors cursor-pointer">
              <p
                className="text-foreground mb-1"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: "1.05rem" }}
              >
                Ask the Oracle
              </p>
              <p className="text-xs text-muted-foreground">One question, anything.</p>
            </div>
          </Link>
        </div>
      </section>

      {/* ─── 05 · THE 5S SPINE ─── */}
      <section className="max-w-md mx-auto px-6 pb-20 pt-2 border-t border-border">
        <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground text-center mt-5 mb-4">
          Your five dimensions
        </p>
        <div className="flex justify-center flex-wrap gap-5">
          {FIVE_S.map((dim) => (
            <Link key={dim.key} href={`/${dim.key}`}>
              <span className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: "0.95rem" }}>
                <span
                  className="inline-block w-2 h-2 rounded-full shrink-0"
                  style={{ background: dim.cssVar }}
                />
                {dim.label}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
