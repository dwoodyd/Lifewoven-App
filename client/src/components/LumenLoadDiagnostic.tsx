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

export function LumenLoadDiagnostic({ readings, hasReading }: { readings: LumenDimension[]; hasReading: boolean }) {
  const coherence = hasReading
    ? Math.round(readings.reduce((sum, reading) => sum + (reading.value ?? 0), 0) / readings.length)
    : null;
  const videoId = hasReading ? "core_unfurls" : "crosses_face";

  return (
    <section className="instrument-panel relative isolate overflow-hidden px-4 py-6 sm:px-8 sm:py-10" aria-labelledby="lumen-diagnostic-title">
      <div className="relative mx-auto grid min-h-[430px] max-w-5xl grid-cols-1 items-center lg:grid-cols-[1fr_minmax(360px,0.95fr)]">
        <div className="relative z-20 max-w-md self-start pt-2 lg:self-center">
          <p className="instrument-label mb-3">Lumen / Structural reading</p>
          <h2 id="lumen-diagnostic-title" className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {hasReading ? "Your structure, in living form." : "Let’s take your first reading."}
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {hasReading
              ? "Each thread carries one load-bearing dimension. Her core reflects how coherently your system is holding together today."
              : "Lumen is waiting to be woken. A short survey gives each thread a real reading and reveals where your structure needs reinforcement."}
          </p>
          {!hasReading && <Button asChild className="mt-6 min-h-11"><Link href="/audit">Take first reading</Link></Button>}
          {hasReading && <Button asChild variant="outline" className="mt-6 min-h-11"><Link href="/audit">Re-run survey</Link></Button>}
        </div>

        <div className="relative mt-4 min-h-[360px] lg:mt-0" aria-label={hasReading ? `Lumen coherence ${coherence} out of 100` : "Lumen is waiting for a first structural reading"}>
          <LuminScene videoId={videoId} ambient loop={hasReading} ambientSize="min(58vw, 520px)" ambientPosition={{ position: "absolute", right: "-8%", top: "0" }} className={hasReading ? "opacity-100" : "opacity-45 saturate-50"} />
          <div className="pointer-events-none absolute right-[29%] top-[43%] z-20 flex h-20 w-20 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-primary/60 bg-background/80 font-mono text-xl text-primary shadow-[0_0_42px_color-mix(in_oklch,var(--primary)_40%,transparent)] backdrop-blur-sm">
            {coherence ?? "—"}<span className="ml-0.5 text-[10px]">{coherence === null ? "" : "%"}</span>
          </div>
          {readings.map((reading, index) => {
            const positions = [
              "right-[4%] top-[7%]", "right-[1%] top-[33%]", "right-[7%] bottom-[9%]", "right-[40%] bottom-[1%]", "left-[7%] top-[28%]",
            ];
            const complete = reading.value !== null;
            return (
              <Link
                key={reading.key}
                href={reading.href}
                className={`absolute z-30 min-h-11 max-w-[120px] border bg-background/90 px-2 py-1.5 text-left shadow-sm backdrop-blur-sm transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${positions[index]} ${complete ? "border-primary/50" : "border-border"}`}
                aria-label={`${reading.label}: ${complete ? `${reading.value} out of 100, ${reading.state}. Open ${reading.label}.` : `not measured. Open ${reading.label}.`}`}
              >
                <span className="block font-mono text-[9px] tracking-[0.14em] text-muted-foreground">THREAD {index + 1}</span>
                <span className="mt-0.5 block text-xs font-medium text-foreground">{reading.label}</span>
                <span className="block font-mono text-[10px]" style={{ color: complete ? reading.color : "var(--muted-foreground)" }}>{complete ? `${reading.value}/100 · ${reading.state}` : "awaiting reading"}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
