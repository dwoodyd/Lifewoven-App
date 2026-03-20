import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BETTER_MIRROR } from "../../../shared/adaptive-language";
import { TrendingUp, RotateCcw, Heart, Waves } from "lucide-react";

interface BetterMirrorProps {
  compact?: boolean;
}

function ScoreRing({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
      <circle
        cx="28" cy="28" r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
      />
      <text x="28" y="33" textAnchor="middle" fontSize="12" fontWeight="600" fill="currentColor" className="text-foreground">
        {Math.round(pct)}
      </text>
    </svg>
  );
}

export default function BetterMirror({ compact = false }: BetterMirrorProps) {
  const { data: user } = trpc.auth.me.useQuery();

  if (!user) return null;

  const returnCount = (user as any).returnCount ?? 0;
  const keptPromises = (user as any).keptPromisesCount ?? 0;
  const avgResetDays = (user as any).avgResetSpeedDays ?? null;
  const consistencyScore = (user as any).gentleConsistencyScore ?? 0;

  const metrics = [
    {
      label: BETTER_MIRROR.returnRateLabel,
      description: BETTER_MIRROR.returnRateDescription,
      value: returnCount,
      display: BETTER_MIRROR.consistencyLabel(returnCount),
      icon: TrendingUp,
      color: "#6366f1",
      ringValue: Math.min(returnCount * 10, 100),
    },
    {
      label: BETTER_MIRROR.resetSpeedLabel,
      description: BETTER_MIRROR.resetSpeedDescription,
      value: avgResetDays,
      display: avgResetDays ? `${avgResetDays}d avg` : "No gaps yet",
      icon: RotateCcw,
      color: "#10b981",
      ringValue: avgResetDays ? Math.max(0, 100 - (Number(avgResetDays) * 10)) : 100,
    },
    {
      label: BETTER_MIRROR.keptPromisesLabel,
      description: BETTER_MIRROR.keptPromisesDescription,
      value: keptPromises,
      display: `${keptPromises} kept`,
      icon: Heart,
      color: "#f59e0b",
      ringValue: Math.min(keptPromises * 5, 100),
    },
    {
      label: BETTER_MIRROR.gentleConsistencyLabel,
      description: BETTER_MIRROR.gentleConsistencyDescription,
      value: consistencyScore,
      display: `${consistencyScore}%`,
      icon: Waves,
      color: "#8b5cf6",
      ringValue: consistencyScore,
    },
  ];

  // Motivational message
  let message = "";
  if (returnCount >= 3) message = BETTER_MIRROR.highReturnRateMessage;
  else if (avgResetDays && Number(avgResetDays) < 2) message = BETTER_MIRROR.improvingResetSpeedMessage;
  else if (keptPromises > 0) message = BETTER_MIRROR.habitCompletionIdentity;

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
        {metrics.slice(0, 2).map((m) => (
          <div key={m.label} className="flex items-center gap-2">
            <m.icon className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-sm font-medium text-foreground">{m.display}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-serif font-normal text-foreground">
          {BETTER_MIRROR.sectionTitle}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{BETTER_MIRROR.sectionSubtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <ScoreRing value={m.ringValue} color={m.color} />
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{m.label}</p>
                <p className="text-lg font-semibold text-foreground">{m.display}</p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                  {m.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {message && (
          <div className="mt-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-sm text-foreground italic leading-relaxed">"{message}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
