import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LuminScene } from "@/components/LuminScene";

export type LumenDimension = {
  key: string;
  label: string;
  value: number | null;
  state: string;
  color: string;
  href: string;
};

const THREAD_PLACEMENT = [
  "right-1 top-[7%] sm:right-[8%]",
  "right-1 top-[27%] sm:right-[2%]",
  "right-1 top-[48%] sm:right-[7%]",
  "right-1 top-[69%] sm:right-[13%]",
  "right-1 top-[86%] sm:right-[22%]",
];

/**
 * Fix 1: Lumen is the dashboard. Her five tendrils are the five readings and
 * her core glow is overall coherence. Labels are deliberately docked beyond
 * her silhouette, never layered over the character.
 */
export function LumenLoadDiagnostic({ readings, hasReading }: { readings: LumenDimension[]; hasReading: boolean }) {
  const coherence = hasReading
    ? Math.round(readings.reduce((sum, reading) => sum + (reading.value ?? 0), 0) / readings.length)
    : null;
  const coreOpacity = coherence === null ? 0.1 : Math.min(0.8, Math.max(0.2, coherence / 125));

  return (
    <section className="blueprint-grid relative isolate overflow-hidden border-y border-primary/20 bg-background lg:min-h-[760px]" aria-labelledby="lumen-diagnostic-title">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_48%,color-mix(in_oklch,var(--primary)_11%,transparent),transparent_42%)]" aria-hidden="true" />

      {/* Mobile keeps Lumen prominent without creating a stranded half-screen before the reading copy. */}
      <div className="relative z-10 h-[44svh] min-h-[330px] sm:h-[52svh] sm:min-h-[420px] lg:absolute lg:inset-y-0 lg:left-[27%] lg:right-0 lg:h-auto" aria-label={hasReading ? `Lumen represents a ${coherence} percent structural coherence reading` : "Lumen is curled and dim, waiting for a first structural reading"}>
        <LuminScene
          videoId={hasReading ? "core_unfurls" : "nodding_gently"}
          ambient
          loop
          ambientSize="min(74vw, 980px)"
          ambientMaxWidth="min(86vw, 980px)"
          ambientMaskImage="linear-gradient(to right, transparent 0%, rgba(0,0,0,0.7) 18%, #000 42%, #000 100%)"
          ambientPosition={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
          ambientAspectRatio="16 / 9"
          ambientFit="contain"
          ambientBlendMode="normal"
          className={hasReading ? "opacity-100" : "opacity-80 saturate-75"}
        />

        {/* The core is a light state, not a number printed over her body. */}
        <div
          className="pointer-events-none absolute left-1/2 top-[48%] z-20 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary blur-xl transition-opacity duration-700"
          style={{ opacity: coreOpacity }}
          aria-hidden="true"
        />

        {hasReading && (
        <div className="absolute inset-0 z-30" aria-label="Open a structural dimension">
          {readings.map((reading, index) => {
            const measured = reading.value !== null;
            return (
              <Link
                key={reading.key}
                href={reading.href}
                className={`group absolute min-h-11 max-w-[156px] px-2 py-1.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${THREAD_PLACEMENT[index]}`}
                aria-label={`${reading.label}: ${measured ? `${reading.value} out of 100, ${reading.state}. Open ${reading.label}.` : `waiting for a reading. Open ${reading.label}.`}`}
              >
                <span className="absolute top-1/2 -z-10 h-px w-12 bg-primary/45 transition-all group-hover:w-20 group-focus-visible:w-20 sm:w-20" style={{ right: "100%" }} aria-hidden="true" />
                <span className="block font-mono text-xs tracking-[0.14em] text-muted-foreground">THREAD {index + 1}</span>
                <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-foreground">{reading.label}</span>
                <span className="block font-mono text-xs" style={{ color: measured ? reading.color : "var(--muted-foreground)" }}>
                  {measured ? `${reading.value}/100 · ${reading.state}` : "waiting to be read"}
                </span>
              </Link>
            );
          })}
        </div>
        )}
      </div>

      {/* Copy lives in the negative space, beneath Lumen on mobile and left of her on desktop. */}
      <header className="relative z-30 max-w-sm px-5 pb-8 pt-4 sm:px-8 lg:absolute lg:left-[6%] lg:top-[19%] lg:max-w-[24%] lg:pb-0 lg:pt-0">
        <p className="instrument-label mb-3">Live structural reading</p>
        <h2 id="lumen-diagnostic-title" className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {hasReading ? "Lumen is carrying your reading." : "Let’s take your first reading."}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {hasReading
            ? "Read the five threads to see what is tended, slack, or under strain. Her core brightens as the whole system holds together."
            : "Lumen is waiting to be woken. A short survey gives each thread a real reading and reveals where your structure needs reinforcement."}
        </p>
        <Button asChild className="mt-6 min-h-11">
          <Link href="/audit">{hasReading ? "Run survey again" : "Take first reading"}</Link>
        </Button>
      </header>
    </section>
  );
}
