import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import PageSkeleton from "@/components/PageSkeleton";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Leaf, ArrowRight, Battery, Sun, Moon, Heart, DollarSign } from "lucide-react";

const ENERGY_DRAINS = ["Comparison scrolling", "News overconsumption", "Toxic relationships", "Unfinished tasks", "Clutter", "Poor sleep", "Processed food", "Negative self-talk"];
const ENERGY_SOURCES = ["Morning sunlight", "Movement", "Deep work", "Meaningful connection", "Nature", "Creative expression", "Gratitude practice", "Quality sleep"];
const WEALTH_AFFIRMATIONS = ["Money flows to me easily and freely.", "I am a wise and generous steward of abundance.", "My wealth grows as I grow.", "I deserve to be well compensated for the value I create.", "Abundance is my natural state."];

export default function StewardshipModule() {
  const { isAuthenticated } = useAuth();
  const [sleepHours, setSleepHours] = useState(7);
  const [movementMins, setMovementMins] = useState(30);
  const [energyScore, setEnergyScore] = useState(7);
  const [auditNote, setAuditNote] = useState("");
  const [wealthAffirmation] = useState(() => WEALTH_AFFIRMATIONS[Math.floor(Math.random() * WEALTH_AFFIRMATIONS.length)]);
  const { data: recentAudits, isLoading: moduleLoading } = trpc.energy.recent.useQuery({ limit: 7 }, { enabled: isAuthenticated });
  const createAudit = trpc.energy.create.useMutation({ onSuccess: () => { toast.success("Energy audit saved."); setAuditNote(""); } });
  if (isAuthenticated && moduleLoading) return <PageSkeleton rows={3} />;
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-start gap-4 mb-10">
          <div className="p-3 rounded-xl bg-stewardship/10 flex-shrink-0"><Leaf className="h-6 w-6 text-stewardship" /></div>
          <div>
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-1">5S Framework — Module 5</p>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-2">Stewardship</h1>
            <p className="text-muted-foreground text-base font-light max-w-xl">You cannot pour from an empty vessel. Stewardship is the art of managing your most precious resources — your energy, your body, your time, and your wealth — with wisdom and intention.</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-stewardship/20 bg-stewardship/5 mb-8">
          <p className="text-xs font-mono tracking-widest text-stewardship uppercase mb-3">Wealth Declaration</p>
          <p className="font-serif text-xl md:text-2xl font-light text-foreground italic leading-relaxed">"{wealthAffirmation}"</p>
          <p className="text-xs text-muted-foreground mt-3">— Lifewoven Framework</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-5"><Battery className="h-4 w-4 text-muted-foreground" /><h2 className="font-serif text-xl font-light text-foreground">Daily Energy Audit</h2></div>
              <div className="space-y-5">
                <div><div className="flex items-center justify-between mb-2"><label className="text-sm text-muted-foreground flex items-center gap-1.5"><Moon className="h-3.5 w-3.5" /> Sleep</label><span className="text-xs font-mono text-foreground">{sleepHours} hours</span></div><Slider min={3} max={12} step={0.5} value={[sleepHours]} onValueChange={([v]) => setSleepHours(v)} /></div>
                <div><div className="flex items-center justify-between mb-2"><label className="text-sm text-muted-foreground flex items-center gap-1.5"><Heart className="h-3.5 w-3.5" /> Movement</label><span className="text-xs font-mono text-foreground">{movementMins} min</span></div><Slider min={0} max={120} step={5} value={[movementMins]} onValueChange={([v]) => setMovementMins(v)} /></div>
                <div><div className="flex items-center justify-between mb-2"><label className="text-sm text-muted-foreground flex items-center gap-1.5"><Battery className="h-3.5 w-3.5" /> Overall Energy</label><span className="text-xs font-mono text-foreground">{energyScore}/10</span></div><Slider min={1} max={10} step={1} value={[energyScore]} onValueChange={([v]) => setEnergyScore(v)} /></div>
                <Textarea placeholder="Notes: What drained you? What energized you?" value={auditNote} onChange={e => setAuditNote(e.target.value)} className="resize-none text-sm" rows={2} />
                {isAuthenticated ? (<Button onClick={() => createAudit.mutate({ date: new Date().toISOString().split("T")[0], sleepHours, movementMinutes: movementMins, energyScore, notes: auditNote || undefined })} disabled={createAudit.isPending} className="gap-2"><Leaf className="h-4 w-4" /> Save Energy Audit</Button>) : (<Button asChild variant="outline"><Link href="/dashboard">Sign in to track energy</Link></Button>)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-border bg-card"><div className="flex items-center gap-2 mb-4"><Sun className="h-4 w-4 text-orange-400" /><h2 className="font-serif text-base font-light text-foreground">Energy Sources</h2></div><div className="space-y-1.5">{ENERGY_SOURCES.map(s => <div key={s} className="flex items-center gap-2 text-sm text-foreground"><span className="text-stewardship">+</span>{s}</div>)}</div></div>
              <div className="p-5 rounded-2xl border border-border bg-card"><div className="flex items-center gap-2 mb-4"><Moon className="h-4 w-4 text-muted-foreground" /><h2 className="font-serif text-base font-light text-foreground">Energy Drains</h2></div><div className="space-y-1.5">{ENERGY_DRAINS.map(d => <div key={d} className="flex items-center gap-2 text-sm text-foreground"><span className="text-destructive">−</span>{d}</div>)}</div></div>
            </div>
            <div className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><h2 className="font-serif text-xl font-light text-foreground">Wealth Consciousness</h2></div>
              <p className="text-base text-muted-foreground mb-4">The Lifewoven framework holds that prosperity is a mental state before it is a material reality. Your relationship with abundance begins in your mind.</p>
              <div className="space-y-2">{["What is my current story about money?", "Where am I blocking abundance in my life?", "What would I do with complete financial freedom?", "How can I create more value for others today?"].map(prompt => (<Link key={prompt} href={`/journal?module=stewardship&prompt=${encodeURIComponent(prompt)}`}><div className="p-3 rounded-lg border border-border hover:border-stewardship/40 hover:bg-stewardship/5 transition-all cursor-pointer flex items-center justify-between gap-2"><p className="text-base text-foreground">{prompt}</p><ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" /></div></Link>))}</div>
            </div>
          </div>
          <div className="space-y-6">
            {isAuthenticated && recentAudits && recentAudits.length > 0 && (<div className="p-5 rounded-2xl border border-border bg-card"><h2 className="font-serif text-base font-light text-foreground mb-4">Energy Trend</h2><div className="space-y-1.5">{recentAudits.slice(0, 7).map((audit: any) => (<div key={audit.id} className="flex items-center gap-2"><span className="text-xs text-muted-foreground w-16 flex-shrink-0">{new Date(audit.date).toLocaleDateString("en", { weekday: "short" })}</span><div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden"><div className="h-full rounded-full bg-stewardship/60 transition-all" style={{ width: `${(audit.energyScore / 10) * 100}%` }} /></div><span className="text-xs font-mono text-muted-foreground w-4">{audit.energyScore}</span></div>))}</div></div>)}
            <div className="p-5 rounded-2xl border border-border bg-card"><h2 className="font-serif text-base font-light text-foreground mb-4">Stewardship Pathways</h2><div className="space-y-2">{[{ href: "/pathway/align", label: "Align — Daily Grounding", desc: "Morning ritual practice" }, { href: "/pathway/reset", label: "Reset", desc: "Restore your energy" }].map(({ href, label, desc }) => (<Link key={href} href={href}><div className="p-3 rounded-lg border border-border hover:border-stewardship/40 hover:bg-stewardship/5 transition-all cursor-pointer"><p className="text-sm font-medium text-foreground">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div></Link>))}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
