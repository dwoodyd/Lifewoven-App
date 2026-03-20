import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LOW_BANDWIDTH, SHAME_INTERRUPT } from "../../../shared/adaptive-language";
import { Wind, Leaf, Circle, RotateCcw, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface LowBandwidthDashboardProps {
  onExit: () => void;
}

const GROUNDING_PROMPTS = [
  "Take three slow breaths. You're here. That's enough.",
  "Name one thing you can see right now. Stay with it for a moment.",
  "Place one hand on your chest. Feel it rise and fall.",
  "What is one small thing that is actually okay right now?",
  "You don't have to do everything. What is the one thing that matters most today?",
];

export default function LowBandwidthDashboard({ onExit }: LowBandwidthDashboardProps) {
  const [groundingIndex] = useState(() => Math.floor(Math.random() * GROUNDING_PROMPTS.length));
  const [shameInterruptOpen, setShameInterruptOpen] = useState(false);

  const { data: habits } = trpc.habits.list.useQuery();
  const { data: insights } = trpc.oracle.insights.useQuery();

  const activeHabits = habits?.filter(h => h.isActive) ?? [];
  const topHabit = activeHabits[0];
  const unreadInsight = insights?.find(i => !i.isRead);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      {/* Header */}
      <div className="w-full max-w-md mb-10 text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-mono">
          Low Bandwidth Mode
        </p>
        <h1 className="font-serif text-3xl text-foreground mb-2">
          {LOW_BANDWIDTH.headline}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {LOW_BANDWIDTH.subheadline}
        </p>
      </div>

      <div className="w-full max-w-md space-y-4">

        {/* One Next Step */}
        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-amber-700" />
              </div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
                {LOW_BANDWIDTH.nextStepLabel}
              </p>
            </div>
            {topHabit ? (
              <div>
                <p className="text-foreground font-medium mb-1">{topHabit.name}</p>
                {topHabit.tinyVersion && (
                  <p className="text-sm text-muted-foreground">
                    Tiny version: {topHabit.tinyVersion}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-foreground">Take the Alignment Audit to find your starting point.</p>
            )}
          </CardContent>
        </Card>

        {/* Grounding Prompt */}
        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-emerald-700" />
              </div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
                {LOW_BANDWIDTH.groundingLabel}
              </p>
            </div>
            <p className="text-foreground leading-relaxed italic">
              "{GROUNDING_PROMPTS[groundingIndex]}"
            </p>
          </CardContent>
        </Card>

        {/* One Unfinished Priority */}
        {unreadInsight && (
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                  <Circle className="w-4 h-4 text-violet-700" />
                </div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
                  {LOW_BANDWIDTH.unfinishedLabel}
                </p>
              </div>
              <p className="text-foreground text-sm leading-relaxed line-clamp-3">
                {unreadInsight.content}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Reset Option */}
        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                <RotateCcw className="w-4 h-4 text-rose-700" />
              </div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
                {LOW_BANDWIDTH.resetLabel}
              </p>
            </div>
            {!shameInterruptOpen ? (
              <Button
                variant="ghost"
                className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto"
                onClick={() => setShameInterruptOpen(true)}
              >
                I'm feeling behind or overwhelmed →
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-foreground font-medium">{SHAME_INTERRUPT.headline}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{SHAME_INTERRUPT.body}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SHAME_INTERRUPT.reframes.map((r, i) => (
                    <span
                      key={i}
                      className="text-xs bg-muted px-3 py-1.5 rounded-full text-muted-foreground"
                    >
                      {r}
                    </span>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    toast.success("One small step is enough.");
                    setShameInterruptOpen(false);
                  }}
                >
                  {SHAME_INTERRUPT.ctaLabel}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Clear */}
        {!topHabit && !unreadInsight && (
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-6 text-center">
              <Wind className="w-6 h-6 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm leading-relaxed">
                {LOW_BANDWIDTH.allClearMessage}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Exit */}
      <div className="mt-10">
        <Button variant="ghost" onClick={onExit} className="text-muted-foreground text-sm">
          {LOW_BANDWIDTH.exitLabel}
        </Button>
      </div>
    </div>
  );
}
