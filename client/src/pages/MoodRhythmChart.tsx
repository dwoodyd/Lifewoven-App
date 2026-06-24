/**
 * Mood Rhythm Chart — Emotional Cycle Tracker
 *
 * Based on the Hersey/Dewey research: the average human emotional cycle is ~5 weeks.
 * Users log a daily 1-10 mood score; the chart reveals their personal rhythm over time.
 */

import { useState, useMemo, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, Minus, Activity, Calendar, Info } from "lucide-react";
import Nav from "@/components/Nav";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

// ─── Score label helpers ──────────────────────────────────────────────────────

const SCORE_LABELS: Record<number, string> = {
  1: "Very low",
  2: "Low",
  3: "Below average",
  4: "Slightly low",
  5: "Neutral",
  6: "Slightly elevated",
  7: "Good",
  8: "High",
  9: "Very high",
  10: "Elated",
};

const SCORE_COLORS: Record<number, string> = {
  1: "#ef4444", 2: "#f97316", 3: "#f59e0b", 4: "#eab308",
  5: "#84cc16", 6: "#22c55e", 7: "#10b981", 8: "#06b6d4",
  9: "#6366f1", 10: "#a855f7",
};

function scoreColor(s: number) { return SCORE_COLORS[Math.max(1, Math.min(10, s))] ?? "#84cc16"; }

// ─── Phase icon ───────────────────────────────────────────────────────────────

function PhaseIcon({ phase }: { phase: string }) {
  if (phase === "rising") return <TrendingUp className="w-4 h-4 text-emerald-400" />;
  if (phase === "falling") return <TrendingDown className="w-4 h-4 text-rose-400" />;
  if (phase === "peak") return <TrendingUp className="w-4 h-4 text-amber-400" />;
  if (phase === "trough") return <TrendingDown className="w-4 h-4 text-violet-400" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

// ─── SVG Dot-Plot Chart ───────────────────────────────────────────────────────

interface ChartPoint { date: string; score: number; }

function DotPlot({
  points,
  peakIndices,
  troughIndices,
  width = 700,
  height = 200,
}: {
  points: ChartPoint[];
  peakIndices: number[];
  troughIndices: number[];
  width?: number;
  height?: number;
}) {
  const PAD = { top: 16, right: 16, bottom: 32, left: 32 };
  const W = width - PAD.left - PAD.right;
  const H = height - PAD.top - PAD.bottom;

  if (points.length === 0) return null;

  const xScale = (i: number) => PAD.left + (i / Math.max(points.length - 1, 1)) * W;
  const yScale = (s: number) => PAD.top + H - ((s - 1) / 9) * H;

  // Build SVG polyline path
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(p.score).toFixed(1)}`)
    .join(" ");

  // Y-axis gridlines at 1, 5, 10
  const gridLines = [1, 5, 10].map(v => ({
    y: yScale(v),
    label: String(v),
  }));

  // X-axis: show first, middle, last date labels
  const xLabels = [0, Math.floor(points.length / 2), points.length - 1]
    .filter((v, i, a) => a.indexOf(v) === i && v < points.length)
    .map(i => ({ x: xScale(i), label: points[i].date.slice(5) })); // MM-DD

  const peakSet = new Set(peakIndices);
  const troughSet = new Set(troughIndices);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height }}
      aria-label="Mood rhythm chart"
    >
      {/* Grid lines */}
      {gridLines.map(g => (
        <g key={g.label}>
          <line
            x1={PAD.left} y1={g.y} x2={PAD.left + W} y2={g.y}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1"
          />
          <text x={PAD.left - 4} y={g.y + 4} fontSize="10" fill="rgba(255,255,255,0.35)" textAnchor="end">
            {g.label}
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {xLabels.map(l => (
        <text key={l.label} x={l.x} y={height - 4} fontSize="10" fill="rgba(255,255,255,0.35)" textAnchor="middle">
          {l.label}
        </text>
      ))}

      {/* Line */}
      <path d={linePath} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

      {/* Dots */}
      {points.map((p, i) => {
        const cx = xScale(i);
        const cy = yScale(p.score);
        const isPeak = peakSet.has(i);
        const isTrough = troughSet.has(i);
        const r = isPeak || isTrough ? 6 : 4;
        return (
          <g key={p.date}>
            {(isPeak || isTrough) && (
              <circle cx={cx} cy={cy} r={r + 4} fill={isPeak ? "rgba(251,191,36,0.15)" : "rgba(167,139,250,0.15)"} />
            )}
            <circle
              cx={cx} cy={cy} r={r}
              fill={scoreColor(p.score)}
              stroke={isPeak ? "#fbbf24" : isTrough ? "#a78bfa" : "rgba(0,0,0,0.3)"}
              strokeWidth={isPeak || isTrough ? 2 : 1}
            />
          </g>
        );
      })}
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MoodRhythmChart() {
  const today = new Date().toISOString().slice(0, 10);
  const [score, setScore] = useState(5);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  const { data: history = [], refetch: refetchHistory } = trpc.moodLog.getMoodHistory.useQuery({ days: 90 });
  const { data: todayMood, refetch: refetchToday } = trpc.moodLog.getTodayMood.useQuery();
  const { data: analysis } = trpc.moodLog.getCycleAnalysis.useQuery();

  const logMood = trpc.moodLog.logMood.useMutation({
    onSuccess: (result) => {
      toast.success(result.action === "updated" ? "Mood updated" : "Mood logged", {
        description: `Score ${result.score}/10 saved for ${result.date}.`,
      });
      refetchHistory();
      refetchToday();
      setNote("");
      setShowNote(false);
    },
    onError: (e) => toast.error(e.message),
  });

  // Initialise slider to today's existing score if available
  const initialised = useRef(false);
  if (todayMood && !initialised.current) {
    setScore(todayMood.score);
    initialised.current = true;
  }

  const chartPoints = useMemo(() =>
    history.map(h => ({ date: h.date, score: h.score })),
    [history]
  );

  const confidenceColor = {
    high: "text-emerald-400",
    medium: "text-amber-400",
    low: "text-orange-400",
    insufficient: "text-muted-foreground",
  }[analysis?.confidence ?? "insufficient"];

  const phaseLabel = {
    rising: "Rising — energy building",
    peak: "Peak — high period",
    falling: "Falling — energy releasing",
    trough: "Trough — rest period",
    unknown: "Observing…",
  }[analysis?.currentPhase ?? "unknown"];

  return (
    <>
    <Nav />
    <div className="container max-w-3xl py-8 space-y-6">
      {/* Back navigation */}
      <div>
        <Link href="/">
          <a className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Home
          </a>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Mood Rhythm Chart</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your daily mood to reveal your personal emotional cycle — and predict your next high and low.
        </p>
        <p className="text-sm text-muted-foreground/70 mt-2 italic">
          Your emotional state is a signal. Tracking it over time reveals what your body knows before your mind catches up.
        </p>
      </div>

      {/* Today's Log Card */}
      <Card className="border-border/50 bg-card/60 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            Today's Mood — {today}
            {todayMood && (
              <Badge variant="secondary" className="ml-auto text-xs">
                Logged: {todayMood.score}/10
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Score slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">How was your day overall?</span>
              <span className="text-lg font-semibold" style={{ color: scoreColor(score) }}>
                {score} — {SCORE_LABELS[score]}
              </span>
            </div>
            <Slider
              min={1} max={10} step={1}
              value={[score]}
              onValueChange={([v]) => setScore(v)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 · Very low</span>
              <span>5 · Neutral</span>
              <span>10 · Elated</span>
            </div>
          </div>

          {/* Optional note */}
          {showNote ? (
            <Textarea
              placeholder="What shaped today's mood? (optional)"
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              className="text-sm resize-none"
            />
          ) : (
            <button
              onClick={() => setShowNote(true)}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              + Add a note
            </button>
          )}

          <Button
            onClick={() => logMood.mutate({ date: today, score, note: note || undefined })}
            disabled={logMood.isPending}
            className="w-full"
          >
            {logMood.isPending ? "Saving…" : todayMood ? "Update Today's Mood" : "Log Today's Mood"}
          </Button>
        </CardContent>
      </Card>

      {/* Chart Card */}
      {history.length > 0 && (
        <Card className="border-border/50 bg-card/60 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              Your Rhythm — Last 90 Days
              <span className="ml-auto text-xs text-muted-foreground font-normal">
                {history.length} entries
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DotPlot
              points={chartPoints}
              peakIndices={analysis?.peakIndices ?? []}
              troughIndices={analysis?.troughIndices ?? []}
              height={200}
            />
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                Peak
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
                Trough
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                Score 7–10
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cycle Analysis Card */}
      {analysis && (
        <Card className="border-border/50 bg-card/60 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              Cycle Analysis
              <Badge variant="outline" className={`ml-auto text-xs ${confidenceColor}`}>
                {analysis.confidence === "insufficient"
                  ? `${analysis.totalEntries}/14 days`
                  : `${analysis.confidence} confidence`}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Message */}
            <p className="text-sm text-muted-foreground leading-relaxed">{analysis.message}</p>

            {analysis.cycleLengthDays && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {/* Cycle length */}
                <div className="rounded-lg bg-muted/40 p-3 text-center">
                  <div className="text-2xl font-semibold text-amber-400">{analysis.cycleLengthDays}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">day cycle</div>
                </div>

                {/* Current phase */}
                <div className="rounded-lg bg-muted/40 p-3 text-center col-span-1">
                  <div className="flex items-center justify-center gap-1 text-sm font-medium">
                    <PhaseIcon phase={analysis.currentPhase} />
                    <span className="capitalize">{analysis.currentPhase}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">current phase</div>
                </div>

                {/* Next peak */}
                {analysis.daysUntilNextPeak !== null && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-center">
                    <div className="text-2xl font-semibold text-amber-400">{analysis.daysUntilNextPeak}d</div>
                    <div className="text-xs text-muted-foreground mt-0.5">until next high</div>
                  </div>
                )}

                {/* Next trough */}
                {analysis.daysUntilNextTrough !== null && (
                  <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3 text-center">
                    <div className="text-2xl font-semibold text-violet-400">{analysis.daysUntilNextTrough}d</div>
                    <div className="text-xs text-muted-foreground mt-0.5">until next low</div>
                  </div>
                )}
              </div>
            )}

            {/* Research note */}
            <div className="rounded-lg bg-muted/20 border border-border/40 p-3 text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground/70">About this chart:</strong> Based on research by Professor Rex Hersey (University of Pennsylvania) and Professor Edward R. Dewey (Foundation for the Study of Cycles). The average human emotional cycle is approximately 5 weeks — but yours may be longer or shorter. With enough data, this chart will reveal your personal rhythm so you can plan around your highs and prepare for your lows.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {history.length === 0 && (
        <Card className="border-border/50 bg-card/60 backdrop-blur">
          <CardContent className="py-10 text-center">
            <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">
              Log your mood each evening for 14 days and your emotional rhythm will begin to emerge.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
}
