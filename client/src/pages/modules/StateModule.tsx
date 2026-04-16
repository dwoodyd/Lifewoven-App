import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Waves, ArrowRight, Play, BookOpen, Heart, Sparkles, TrendingUp } from "lucide-react";

const EGS_SCALE = [
  { level: 22, name: "Joy / Appreciation / Freedom / Love / Empowerment" },
  { level: 21, name: "Passion" },
  { level: 20, name: "Enthusiasm / Eagerness / Happiness" },
  { level: 19, name: "Positive Expectation / Belief" },
  { level: 18, name: "Optimism" },
  { level: 17, name: "Hopefulness" },
  { level: 16, name: "Contentment" },
  { level: 15, name: "Boredom" },
  { level: 14, name: "Pessimism" },
  { level: 13, name: "Frustration / Irritation / Impatience" },
  { level: 12, name: "Overwhelm" },
  { level: 11, name: "Disappointment" },
  { level: 10, name: "Doubt" },
  { level: 9, name: "Worry" },
  { level: 8, name: "Blame" },
  { level: 7, name: "Discouragement" },
  { level: 6, name: "Anger" },
  { level: 5, name: "Revenge" },
  { level: 4, name: "Hatred / Rage" },
  { level: 3, name: "Jealousy" },
  { level: 2, name: "Insecurity / Guilt / Unworthiness" },
  { level: 1, name: "Fear / Grief / Depression / Despair / Powerlessness" },
];

const VORTEX_PRACTICES = [
  { id: "morning-alignment", title: "Morning Alignment", duration: "10 min", description: "Begin your day in alignment. A guided practice to set your interior tone before the world gets in.", pathway: "align", type: "meditation" },
  { id: "appreciation-flood", title: "Appreciation Flood", duration: "5 min", description: "The fastest path to alignment. Flood your awareness with genuine appreciation and watch your set-point shift.", pathway: "align", type: "practice" },
  { id: "segment-intending", title: "Segment Intending", duration: "3 min", description: "Before each new segment of your day, pause and set your intention. A powerful Lifewoven practice for staying in alignment throughout the day.", pathway: "align", type: "practice" },
  { id: "emotional-futures-session", title: "Emotional Futures Session", duration: "15 min", description: "Enter the flow of your desired life. Feel your way forward using the Lifewoven Emotional Futures visualization practice.", pathway: "flow", type: "meditation" },
  { id: "pivot-process", title: "The Pivot Process", duration: "5 min", description: "Notice what you don't want, then pivot to what you do want. A core Lifewoven tool for emotional navigation and set-point shifting.", pathway: "uplift", type: "practice" },
  { id: "rampage-appreciation", title: "Rampage of Appreciation", duration: "7 min", description: "A spoken or written cascade of appreciation that builds momentum toward alignment.", pathway: "align", type: "practice" },
];

const AFFIRMATIONS = [
  "I am the creator of my experience, and I choose to create from joy.",
  "My dominant intent is to feel good.",
  "The Universe is always conspiring in my favor.",
  "I am in the process of becoming everything I desire.",
  "I trust the unfolding of my life.",
  "I am someone whose inner state shapes outer experience, and I tend that state deliberately.",
  "Everything I want is already flowing toward me.",
  "I am worthy of all the good that life has to offer.",
];

export default function StateModule() {
  const { isAuthenticated } = useAuth();
  const [egsLevel, setEgsLevel] = useState(14);
  const [note, setNote] = useState("");
  const [showEGS, setShowEGS] = useState(false);
  const [dailyAffirmation] = useState(() => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);

  const { data: recentCheckIns } = trpc.checkIn.recent.useQuery({ limit: 7 }, { enabled: isAuthenticated });
  const createCheckIn = trpc.checkIn.create.useMutation({
    onSuccess: () => { toast.success("State recorded. Keep reaching for better-feeling thoughts."); setNote(""); },
  });

  const currentEmotion = EGS_SCALE.find(e => e.level === egsLevel) ?? EGS_SCALE[7];
  const avgScore = recentCheckIns && recentCheckIns.length > 0
    ? Math.round(recentCheckIns.reduce((a: number, c: any) => a + c.emotionalScore, 0) / recentCheckIns.length)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-start gap-4 mb-10">
          <div className="p-3 rounded-xl bg-state/10 flex-shrink-0"><Waves className="h-6 w-6 text-state" /></div>
          <div>
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-1">5S Framework — Module 1</p>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-2">State</h1>
            <p className="text-muted-foreground text-base font-light max-w-xl">Your emotional state is the foundation of everything. Before strategy, before habits, before action — you must be in alignment. This module is your daily practice of returning to alignment.</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-state/20 bg-state/5 mb-8">
          <p className="text-xs font-mono tracking-widest text-state uppercase mb-3">Today's Declaration</p>
          <p className="font-serif text-lg sm:text-xl md:text-2xl font-light text-foreground italic leading-relaxed">"{dailyAffirmation}"</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-xl font-light text-foreground">Emotional Guidance Scale</h2>
                <button onClick={() => setShowEGS(!showEGS)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{showEGS ? "Hide scale" : "View full scale"}</button>
              </div>
              {showEGS && (
                <div className="mb-5 p-4 rounded-xl bg-secondary/50 space-y-1 max-h-48 overflow-y-auto">
                  {EGS_SCALE.map(e => (
                    <div key={e.level} className={`flex items-center gap-2 text-xs py-0.5 ${e.level === egsLevel ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      <span className="font-mono w-4 text-right flex-shrink-0">{e.level}</span>
                      <span>{e.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-muted-foreground">Where are you right now?</label>
                    <Badge variant="secondary" className="text-xs">{currentEmotion?.name.split(" / ")[0]} — Level {egsLevel}</Badge>
                  </div>
                  <Slider min={1} max={22} step={1} value={[egsLevel]} onValueChange={([v]) => setEgsLevel(v)} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>Powerlessness</span><span>Joy</span></div>
                </div>
                <Textarea placeholder="What's present for you right now? What thoughts are running? (optional)" value={note} onChange={e => setNote(e.target.value)} className="resize-none text-sm" rows={2} />
                {isAuthenticated ? (
                  <Button onClick={() => createCheckIn.mutate({ emotionalScore: egsLevel, energyLevel: 5, clarityLevel: 5, note: note || undefined, module: "state" })} disabled={createCheckIn.isPending} className="gap-2">
                    <Heart className="h-4 w-4" /> Record State
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="gap-2"><Link href="/dashboard">Sign in to track your state</Link></Button>
                )}
              </div>
            </div>

            <div>
              <h2 className="font-serif text-xl font-light text-foreground mb-4">Vortex Practices</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {VORTEX_PRACTICES.map(practice => (
                  <div key={practice.id} className="p-4 rounded-xl border border-border bg-card hover:border-muted-foreground transition-all group">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-state/10">
                          {practice.type === "meditation" ? <Waves className="h-3.5 w-3.5 text-state" /> : <Sparkles className="h-3.5 w-3.5 text-state" />}
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">{practice.duration}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs capitalize">{practice.type}</Badge>
                    </div>
                    <h3 className="font-medium text-foreground text-base mb-1">{practice.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{practice.description}</p>
                    <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs w-full">
                      <Link href={`/pathway/${practice.pathway}`}><Play className="h-3 w-3" /> Begin Practice</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-4"><BookOpen className="h-4 w-4 text-muted-foreground" /><h2 className="font-serif text-base font-light text-foreground">From the Source Texts</h2></div>
              <blockquote className="border-l-2 border-state/40 pl-4 space-y-1 mb-4">
                <p className="font-serif text-base font-light text-foreground italic leading-relaxed">"There is a Power in the universe that makes for righteousness, and it is available to all who will use it."</p>
                <footer className="text-xs text-muted-foreground">— Lifewoven Framework</footer>
              </blockquote>
              <blockquote className="border-l-2 border-state/40 pl-4 space-y-1">
                <p className="font-serif text-base font-light text-foreground italic leading-relaxed">"The better you feel, the more you are allowing the fulfillment of anything you desire."</p>
                <footer className="text-xs text-muted-foreground">— Lifewoven Framework</footer>
              </blockquote>
            </div>
          </div>

          <div className="space-y-6">
            {isAuthenticated && recentCheckIns && recentCheckIns.length > 0 && (
              <div className="p-5 rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-4 w-4 text-muted-foreground" /><h2 className="font-serif text-base font-light text-foreground">Your State Trend</h2></div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-3xl font-serif font-light text-foreground">{avgScore}</div>
                  <div><p className="text-xs text-muted-foreground">7-day average</p><p className="text-xs font-medium text-foreground">{EGS_SCALE.find(e => e.level === avgScore)?.name.split(" / ")[0] ?? ""}</p></div>
                </div>
                <div className="space-y-1.5">
                  {recentCheckIns.slice(0, 7).map((ci: any) => (
                    <div key={ci.id} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-16 flex-shrink-0">{new Date(ci.createdAt).toLocaleDateString("en", { weekday: "short" })}</span>
                      <div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div className="h-full rounded-full bg-state/60 transition-all" style={{ width: `${(ci.emotionalScore / 22) * 100}%` }} />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-4">{ci.emotionalScore}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-5 rounded-2xl border border-border bg-card">
              <h2 className="font-serif text-base font-light text-foreground mb-4">State Pathways</h2>
              <div className="space-y-2">
                {[
                  { href: "/pathway/align", label: "Align — Daily Grounding", desc: "7-day foundation practice" },
                  { href: "/pathway/resonance", label: "Alignment — Advanced Practice", desc: "Alignment mastery" },
                  { href: "/pathway/uplift", label: "Uplift — Set-Point Shift", desc: "Raise your baseline" },
                  { href: "/pathway/reset", label: "Reset", desc: "Resilience protocol" },
                ].map(({ href, label, desc }) => (
                  <Link key={href} href={href}>
                    <div className="p-3 rounded-lg border border-border hover:border-state/40 hover:bg-state/5 transition-all cursor-pointer">
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card">
              <h2 className="font-serif text-base font-light text-foreground mb-3">State Journal</h2>
              <p className="text-xs text-muted-foreground mb-3">Capture your emotional landscape in writing.</p>
              <Button asChild size="sm" variant="outline" className="w-full gap-2">
                <Link href="/journal?module=state"><ArrowRight className="h-3.5 w-3.5" /> Open State Journal</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
