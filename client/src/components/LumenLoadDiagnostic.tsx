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
  "right-3 top-[10%] sm:right-[7%]",
  "right-3 top-[29%] sm:right-[2%]",
  "right-3 top-[48%] sm:right-[6%]",
  "right-3 top-[67%] sm:right-[12%]",
  "left-3 top-[38%] sm:left-[7%]",
];

/** The primary dashboard diagnostic: Lumen's five tendrils carry the five dimensions. */
export function LumenLoadDiagnostic({ readings, hasReading }: { readings: LumenDimension[]; hasReading: boolean }) {
  const coherence = hasReading
    ? Math.round(readings.reduce((sum, reading) => sum + (reading.value ?? 0), 0) / readings.length)
    : null;

  return (
    <section className="blueprint-grid relative isolate min-h-[600px] overflow-hidden border-y border-primary/20 bg-background" aria-labelledby="lumen-diagnostic-title">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_59%_48%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_36%)]" aria-hidden="true" />
      <header className="relative z-30 max-w-sm px-5 pb-3 pt-8 sm:px-8 lg:absolute lg:left-[6%] lg:top-[16%] lg:pt-0">
        <p className="instrument-label mb-3">Live structural reading</p>
        <h2 id="lumen-diagnostic-title" className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {hasReading ? "Lumen is carrying your reading." : "Let’s take your first reading."}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {hasReading
            ? "Five threads hold your load-bearing dimensions. Her core brightness reflects the coherence of the whole system."
            : "She is curled and dim until you give the system something real to measure. Start with the five threads."}
        </p>
        <Button asChild className="mt-6 min-h-11">
          <Link href="/audit">{hasReading ? "Run survey again" : "Take first reading"}</Link>
        </Button>
      </header>

      <div className="absolute inset-x-0 bottom-0 top-[132px] sm:top-[88px] lg:inset-y-0 lg:left-[23%] lg:right-0" aria-label={hasReading ? `Lumen core coherence ${coherence} percent` : "Lumen is waiting for a first structural reading"}>
        <LuminScene
          videoId={hasReading ? "core_unfurls" : "crosses_face"}
          ambient
          loop={hasReading}
          ambientSize="min(60vw, 780px)"
          ambientPosition={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
          className={hasReading ? "opacity-100" : "opacity-40 saturate-50"}
        />
        <div className="pointer-events-none absolute left-[50%] top-[48%] z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/50 bg-background/70 font-mono text-base text-primary shadow-[0_0_54px_color-mix(in_oklch,var(--primary)_46%,transparent)] backdrop-blur-sm" aria-hidden="true">
          {coherence ?? "—"}{coherence !== null && <span className="ml-0.5 text-[9px]">%</span>}
        </div>
      </div>

      <div className="absolute inset-0 z-30" aria-label="Open a structural dimension">
        {readings.map((reading, index) => {
          const measured = reading.value !== null;
          return (
            <Link
              key={reading.key}
              href={reading.href}
              className={`group absolute min-h-11 max-w-[154px] px-2 py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${THREAD_PLACEMENT[index]}`}
              aria-label={`${reading.label}: ${measured ? `${reading.value} out of 100, ${reading.state}. Open ${reading.label}.` : `waiting for a reading. Open ${reading.label}.`}`}
            >
              <span className="absolute top-1/2 -z-10 h-px w-14 bg-primary/45 transition-all group-hover:w-20 group-focus-visible:w-20 sm:w-20" style={index === 4 ? { left: "100%" } : { right: "100%" }} aria-hidden="true" />
              <span className="block font-mono text-[9px] tracking-[0.16em] text-muted-foreground">THREAD {index + 1}</span>
              <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-foreground">{reading.label}</span>
              <span className="block font-mono text-[10px]" style={{ color: measured ? reading.color : "var(--muted-foreground)" }}>
                {measured ? `${reading.value}/100 · ${reading.state}` : "awaiting reading"}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
