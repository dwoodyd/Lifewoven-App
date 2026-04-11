import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Target, Plus, CheckCircle2, Circle, Flame, ArrowRight, BarChart3 } from "lucide-react";

const HABIT_CATEGORIES = ["morning", "health", "mind", "work", "evening", "social", "creative"];
const ATOMIC_HABITS_LAWS = [
  { law: "Make It Obvious", description: "Design your environment so cues for good habits are visible and prominent.", icon: "👁️" },
  { law: "Make It Attractive", description: "Bundle habits with things you enjoy. Use temptation bundling.", icon: "✨" },
  { law: "Make It Easy", description: "Reduce friction. Use the 2-minute rule to start any habit.", icon: "🎯" },
  { law: "Make It Satisfying", description: "Reward yourself immediately. Track your habit completion.", icon: "🏆" },
];

export default function StandardsModule() {
  const { isAuthenticated } = useAuth();
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [habitIdentity, setHabitIdentity] = useState("");
  const [habitCategory, setHabitCategory] = useState("morning");
  const [habitFrequency, setHabitFrequency] = useState<"daily" | "weekly">("daily");

  const { data: habits, refetch } = trpc.habits.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: todayLogs } = trpc.habits.todayLogs.useQuery(undefined, { enabled: isAuthenticated });
  const createHabit = trpc.habits.create.useMutation({ onSuccess: () => { toast.success("Habit added to your Stack."); setHabitName(""); setHabitIdentity(""); setShowAddHabit(false); refetch(); } });
  const logHabit = trpc.habits.logCompletion.useMutation({ onSuccess: () => { toast.success("1% better. Keep going."); refetch(); } });
  const archiveHabit = trpc.habits.delete.useMutation({ onSuccess: () => { toast.success("Habit archived."); refetch(); } });

  const completedHabitIds = new Set((todayLogs ?? []).map((l: any) => l.habitId));
  const completionRate = habits && habits.length > 0 ? Math.round((completedHabitIds.size / habits.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-24 pb-20 max-w-5xl mx-auto">
        <div className="flex items-start gap-4 mb-10">
          <div className="p-3 rounded-xl bg-standards/10 flex-shrink-0"><Target className="h-6 w-6 text-standards" /></div>
          <div>
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-1">5S Framework — Module 3</p>
            <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-2">Standards</h1>
            <p className="text-muted-foreground text-base font-light max-w-xl">You don't rise to the level of your goals — you fall to the level of your systems. This module is your habit execution engine, daily scorecard, and deep work architecture.</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-standards/20 bg-standards/5 mb-8">
          <p className="text-xs font-mono tracking-widest text-standards uppercase mb-3">Today's Standard</p>
          <p className="font-serif text-xl md:text-2xl font-light text-foreground italic leading-relaxed">"You do not rise to the level of your goals. You fall to the level of your systems."</p>
          <p className="text-xs text-muted-foreground mt-3">— Behavioral Science Principle</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-serif text-xl font-light text-foreground">Your Habit Stack</h2>
                  {habits && habits.length > 0 && <p className="text-xs text-muted-foreground mt-0.5">{completedHabitIds.size}/{habits.length} complete today</p>}
                </div>
                {isAuthenticated && <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setShowAddHabit(!showAddHabit)}><Plus className="h-3.5 w-3.5" /> Add Habit</Button>}
              </div>
              {habits && habits.length > 0 && <div className="mb-4"><Progress value={completionRate} className="h-1.5" /><p className="text-xs text-muted-foreground mt-1">{completionRate}% complete</p></div>}
              {showAddHabit && (
                <div className="mb-5 p-4 rounded-xl bg-secondary/50 space-y-3">
                  <Input placeholder="Habit name" value={habitName} onChange={e => setHabitName(e.target.value)} className="text-sm" />
                  <Input placeholder="Identity statement (I am someone who...)" value={habitIdentity} onChange={e => setHabitIdentity(e.target.value)} className="text-sm" />
                  <div className="flex gap-2 flex-wrap">
                    {HABIT_CATEGORIES.map(cat => <button key={cat} onClick={() => setHabitCategory(cat)} className={`text-xs px-2.5 py-1 rounded-full border transition-colors capitalize ${habitCategory === cat ? "border-standards bg-standards/10 text-standards" : "border-border text-muted-foreground"}`}>{cat}</button>)}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setHabitFrequency("daily")} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${habitFrequency === "daily" ? "border-standards bg-standards/10 text-standards" : "border-border text-muted-foreground"}`}>Daily</button>
                    <button onClick={() => setHabitFrequency("weekly")} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${habitFrequency === "weekly" ? "border-standards bg-standards/10 text-standards" : "border-border text-muted-foreground"}`}>Weekly</button>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => createHabit.mutate({ name: habitName, identityStatement: habitIdentity || undefined, frequency: habitFrequency })} disabled={!habitName || createHabit.isPending} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add to Stack</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowAddHabit(false)}>Cancel</Button>
                  </div>
                </div>
              )}
              {!isAuthenticated ? (
                <div className="text-center py-8"><Target className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground mb-4">Sign in to build your habit stack.</p><Button asChild variant="outline"><Link href="/dashboard">Get Started</Link></Button></div>
              ) : habits && habits.length > 0 ? (
                <div className="space-y-2">
                  {habits.map((habit: any) => {
                    const done = completedHabitIds.has(habit.id);
                    return (
                      <div key={habit.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${done ? "border-standards/30 bg-standards/5" : "border-border bg-background hover:border-muted-foreground"}`}>
                        <button onClick={() => !done && logHabit.mutate({ habitId: habit.id })} disabled={done} className="flex-shrink-0" aria-label={done ? `${habit.name} — completed` : `Mark ${habit.name} as complete`}>
                          {done ? <CheckCircle2 className="h-5 w-5 text-standards" /> : <Circle className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>{habit.name}</p>
                          {habit.identityStatement && <p className="text-xs text-muted-foreground truncate">{habit.identityStatement}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="secondary" className="text-xs capitalize hidden sm:flex">{habit.category}</Badge>
                          <div className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-orange-400" /><span className="text-xs font-mono text-muted-foreground">{habit.streak}</span></div>
                          <button onClick={() => archiveHabit.mutate({ id: habit.id })} className="opacity-0 group-hover:opacity-100 text-xs text-muted-foreground hover:text-destructive transition-all" aria-label={`Archive ${habit.name}`}>✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <div className="text-center py-8"><p className="text-sm text-muted-foreground">No habits yet. Build your Stack above.</p></div>}
            </div>
            <div className="p-6 rounded-2xl border border-border bg-card">
              <h2 className="font-serif text-xl font-light text-foreground mb-2">The Four Laws of Behavior Change</h2>
              <p className="text-sm text-muted-foreground mb-5">The Lifewoven Identity Stack is built on four behavioral science laws that make habits inevitable rather than aspirational.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ATOMIC_HABITS_LAWS.map(law => (
                  <div key={law.law} className="p-4 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-2 mb-2"><span className="text-lg">{law.icon}</span><h3 className="font-medium text-foreground text-sm">{law.law}</h3></div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{law.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {isAuthenticated && habits && habits.length > 0 && (
              <div className="p-5 rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-4"><BarChart3 className="h-4 w-4 text-muted-foreground" /><h2 className="font-serif text-base font-light text-foreground">Stack Stats</h2></div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Total habits</span><span className="text-sm font-mono font-medium text-foreground">{habits.length}</span></div>
                  <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Completed today</span><span className="text-sm font-mono font-medium text-foreground">{completedHabitIds.size}</span></div>
                  <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Best streak</span><span className="text-sm font-mono font-medium text-foreground">{habits.reduce((max: number, h: any) => Math.max(max, h.streak), 0)} days</span></div>
                </div>
              </div>
            )}
            <div className="p-5 rounded-2xl border border-border bg-card">
              <h2 className="font-serif text-base font-light text-foreground mb-4">Standards Pathways</h2>
              <div className="space-y-2">
                {[{ href: "/pathway/rhythms", label: "Stack — Habit Execution", desc: "Build your daily system" }, { href: "/pathway/align", label: "Align — Daily Grounding", desc: "Start each day right" }].map(({ href, label, desc }) => (
                  <Link key={href} href={href}><div className="p-3 rounded-lg border border-border hover:border-standards/40 hover:bg-standards/5 transition-all cursor-pointer"><p className="text-sm font-medium text-foreground">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div></Link>
                ))}
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-card">
              <h2 className="font-serif text-base font-light text-foreground mb-3">Standards Journal</h2>
              <p className="text-xs text-muted-foreground mb-3">Reflect on your systems and what's working.</p>
              <Button asChild size="sm" variant="outline" className="w-full gap-2"><Link href="/journal?module=standards"><ArrowRight className="h-3.5 w-3.5" /> Open Standards Journal</Link></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
