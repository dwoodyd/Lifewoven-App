/**
 * Mood Rhythm Chart — a reflective, non-predictive view of Daily Check-ins.
 */

import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Calendar, ArrowLeft } from "lucide-react";
import Nav from "@/components/Nav";
import { Link } from "wouter";
import { formatLifewovenDate } from "@/lib/datetime";

const SCORE_COLORS: Record<number, string> = {
  1: "#e2564a", 2: "#e2564a", 3: "#e2564a",
  4: "#d2a44a", 5: "#d2a44a", 6: "#d2a44a",
  7: "#73c99b", 8: "#73c99b", 9: "#73c99b", 10: "#73c99b",
};

function scoreColor(score: number) {
  return SCORE_COLORS[Math.max(1, Math.min(10, score))] ?? "#d2a44a";
}

interface ChartPoint { date: string; score: number; }

function DotPlot({ points, width = 700, height = 200 }: { points: ChartPoint[]; width?: number; height?: number }) {
  const PAD = { top: 16, right: 16, bottom: 32, left: 32 };
  const W = width - PAD.left - PAD.right;
  const H = height - PAD.top - PAD.bottom;
  if (points.length === 0) return null;

  const xScale = (index: number) => PAD.left + (index / Math.max(points.length - 1, 1)) * W;
  const yScale = (score: number) => PAD.top + H - ((score - 1) / 9) * H;
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${xScale(index).toFixed(1)},${yScale(point.score).toFixed(1)}`).join(" ");
  const xLabels = [0, Math.floor(points.length / 2), points.length - 1]
    .filter((value, index, values) => values.indexOf(value) === index && value < points.length)
    .map(index => ({ x: xScale(index), label: points[index].date.slice(5) }));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} aria-label="Daily check-in rhythm chart">
      {[1, 5, 10].map(value => (
        <g key={value}>
          <line x1={PAD.left} y1={yScale(value)} x2={PAD.left + W} y2={yScale(value)} stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
          <text x={PAD.left - 4} y={yScale(value) + 4} fontSize="10" fill="currentColor" opacity="0.55" textAnchor="end">{value}</text>
        </g>
      ))}
      {xLabels.map(label => <text key={label.label} x={label.x} y={height - 4} fontSize="10" fill="currentColor" opacity="0.55" textAnchor="middle">{label.label}</text>)}
      <path d={linePath} fill="none" stroke="currentColor" strokeOpacity="0.32" strokeWidth="1.5" />
      {points.map((point, index) => <circle key={point.date} cx={xScale(index)} cy={yScale(point.score)} r="4" fill={scoreColor(point.score)} stroke="var(--card)" strokeWidth="1" />)}
    </svg>
  );
}

export default function MoodRhythmChart() {
  const { data: checkIns = [] } = trpc.checkIn.recent.useQuery({ limit: 90 });
  const chartPoints = useMemo(() => [...checkIns].reverse().map((checkIn: any) => ({
    date: formatLifewovenDate(checkIn.createdAt, { month: "2-digit", day: "2-digit" }),
    // EGS is 1 = Joy through 22 = Fear; normalize it only for this visual trend line.
    score: Math.max(1, Math.min(10, Math.round(10 - ((Number(checkIn.emotionalScore) - 1) / 21) * 9))),
  })), [checkIns]);

  return (
    <>
      <Nav />
      <div className="container max-w-3xl py-8 space-y-6">
        <div>
          <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Mood Rhythm</h1>
          <p className="mt-1 text-sm text-muted-foreground">A reflective view of the state, energy, and clarity you record in Daily Check-ins.</p>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base"><Calendar className="h-4 w-4 text-accent" />Daily Check-in Rhythm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">One Daily Check-in gives the app a grounded record of your state, energy, and clarity without asking you to log the same feeling twice.</p>
            <Button asChild className="w-full"><Link href="/dashboard">Complete Daily Check-in</Link></Button>
          </CardContent>
        </Card>

        {chartPoints.length > 0 ? (
          <Card className="border-border/50 bg-card/60 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4 text-accent" />Your Rhythm <span className="ml-auto text-xs font-normal text-muted-foreground">{chartPoints.length} check-ins</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-foreground"><DotPlot points={chartPoints} height={200} /></div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#73c99b]" />More resourced</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#d2a44a]" />Mixed</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#e2564a]" />Under strain</span>
              </div>
              <div className="mt-4 rounded-lg border border-border/40 bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground"><strong className="text-foreground/70">About this chart:</strong> It reflects recorded Daily Check-ins. It is not a medical measure and does not predict future emotional states.</div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50 bg-card/60 backdrop-blur"><CardContent className="py-8 text-center"><Activity className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" /><p className="text-sm text-muted-foreground">Complete your first Daily Check-in and this chart will begin to reflect your recorded rhythm.</p></CardContent></Card>
        )}
      </div>
    </>
  );
}
