import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Compass, Plus, Sparkles, ArrowRight, RefreshCw, Lightbulb } from "lucide-react";
import { Streamdown } from "streamdown";

const LEVERAGE_QUESTIONS = [
  "What is the ONE thing I can do such that by doing it, everything else becomes easier or unnecessary?",
  "Where am I spending 80% of my effort for only 20% of my results?",
  "What would I do if I could only work 4 hours per week?",
  "What am I tolerating that is costing me energy, time, or money?",
  "If I doubled down on my strengths, what would change?",
];

const SECOND_ORDER_PROMPTS = [
  "What are the consequences of the consequences of this decision?",
  "Who else will be affected by this choice, and how?",
  "What does this decision look like in 10 minutes, 10 months, 10 years?",
  "What am I optimizing for, and is that actually what I want?",
];

export default function StrategyModule() {
  const { isAuthenticated } = useAuth();
  const [showAddDecision, setShowAddDecision] = useState(false);
  const [decisionTitle, setDecisionTitle] = useState("");
  const [decisionContext, setDecisionContext] = useState("");
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [analysisResult, setAnalysisResult] = useState<Record<number, any>>({});

  const { data: decisions, refetch } = trpc.decisions.list.useQuery(undefined, { enabled: isAuthenticated });
  const createDecision = trpc.decisions.create.useMutation({ onSuccess: () => { toast.success("Decision captured."); setDecisionTitle(""); setDecisionContext(""); setShowAddDecision(false); refetch(); } });
  const analyzeDecision = trpc.decisions.analyze.useMutation({
    onSuccess: (data: any, vars: any) => { setAnalysisResult(prev => ({ ...prev, [vars.id]: data })); setAnalyzingId(null); toast.success("Oracle analysis complete."); },
  });

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-24 pb-20 max-w-5xl mx-auto">
        <div className="flex items-start gap-4 mb-10">
          <div className="p-3 rounded-xl bg-strategy/10 flex-shrink-0"><Compass className="h-6 w-6 text-strategy" /></div>
          <div>
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-1">5S Framework — Module 4</p>
            <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-2">Strategy</h1>
            <p className="text-muted-foreground text-base font-light max-w-xl">Most people are busy being busy. Strategy is about finding the leverage points — the decisions and actions that produce disproportionate results.</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-strategy/20 bg-strategy/5 mb-8">
          <p className="text-xs font-mono tracking-widest text-strategy uppercase mb-3">Strategic Lens</p>
          <p className="font-serif text-xl md:text-2xl font-light text-foreground italic leading-relaxed">"Strategy without tactics is the slowest route to victory. Tactics without strategy is the noise before defeat."</p>
          <p className="text-xs text-muted-foreground mt-3">— Sun Tzu</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-xl font-light text-foreground">Decision Journal</h2>
                {isAuthenticated && <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setShowAddDecision(!showAddDecision)}><Plus className="h-3.5 w-3.5" /> Add Decision</Button>}
              </div>
              {showAddDecision && (
                <div className="mb-5 p-4 rounded-xl bg-secondary/50 space-y-3">
                  <Input placeholder="What decision are you facing?" value={decisionTitle} onChange={e => setDecisionTitle(e.target.value)} className="text-sm" />
                  <Textarea placeholder="Context: What do you know? What are the options? What's at stake?" value={decisionContext} onChange={e => setDecisionContext(e.target.value)} className="resize-none text-sm" rows={3} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => createDecision.mutate({ title: decisionTitle, context: decisionContext || undefined })} disabled={!decisionTitle || createDecision.isPending} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Capture</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowAddDecision(false)}>Cancel</Button>
                  </div>
                </div>
              )}
              {!isAuthenticated ? (
                <div className="text-center py-8"><Compass className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground mb-4">Sign in to use the Decision Journal.</p><Button asChild variant="outline"><Link href="/dashboard">Get Started</Link></Button></div>
              ) : decisions && decisions.length > 0 ? (
                <div className="space-y-3">
                  {decisions.map((decision: any) => (
                    <div key={decision.id} className="p-4 rounded-xl border border-border bg-background">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-medium text-foreground text-sm">{decision.title}</h3>
                        <span className="text-xs text-muted-foreground flex-shrink-0">{new Date(decision.createdAt).toLocaleDateString()}</span>
                      </div>
                      {decision.context && <p className="text-xs text-muted-foreground mb-3">{decision.context}</p>}
                      {analysisResult[decision.id] ? (
                        <div className="mt-2 pt-2 border-t border-strategy/20 space-y-2">
                          <p className="text-xs font-medium text-strategy">Oracle Analysis:</p>
                          <Streamdown className="text-xs text-foreground leading-relaxed">{analysisResult[decision.id].analysis}</Streamdown>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => { setAnalyzingId(decision.id); analyzeDecision.mutate({ id: decision.id, title: decision.title, context: decision.context, options: [] }); }} disabled={analyzingId === decision.id && analyzeDecision.isPending}>
                          {analyzingId === decision.id && analyzeDecision.isPending ? <><RefreshCw className="h-3 w-3 animate-spin" /> Analyzing...</> : <><Sparkles className="h-3 w-3" /> Oracle Analysis</>}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : <div className="text-center py-8"><p className="text-sm text-muted-foreground">No decisions captured yet.</p></div>}
            </div>
            <div className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-2"><Lightbulb className="h-4 w-4 text-muted-foreground" /><h2 className="font-serif text-xl font-light text-foreground">Leverage Mapper</h2></div>
              <p className="text-base text-muted-foreground mb-5">Find the highest-leverage questions to ask yourself right now.</p>
              <div className="space-y-2">
                {LEVERAGE_QUESTIONS.map(q => (
                  <Link key={q} href={`/journal?module=strategy&prompt=${encodeURIComponent(q)}`}>
                    <div className="p-3 rounded-lg border border-border hover:border-strategy/40 hover:bg-strategy/5 transition-all cursor-pointer flex items-center justify-between gap-2">
                      <p className="text-base text-foreground">{q}</p>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-border bg-card">
              <h2 className="font-serif text-xl font-light text-foreground mb-2">Second-Order Thinking</h2>
              <p className="text-base text-muted-foreground mb-4">Most people stop at first-order consequences. Great strategists think two and three steps ahead.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SECOND_ORDER_PROMPTS.map(p => (
                  <Link key={p} href={`/journal?module=strategy&prompt=${encodeURIComponent(p)}`}>
                    <div className="p-3 rounded-lg bg-secondary/50 hover:bg-strategy/5 transition-all cursor-pointer"><p className="text-sm text-foreground leading-relaxed">{p}</p></div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border border-border bg-card">
              <h2 className="font-serif text-base font-light text-foreground mb-4">Strategy Pathways</h2>
              <div className="space-y-2">
                {[{ href: "/pathway/purpose", label: "Why — Purpose Alignment", desc: "Align strategy with meaning" }, { href: "/pathway/flow", label: "Flow — Visualization", desc: "See your desired future" }].map(({ href, label, desc }) => (
                  <Link key={href} href={href}><div className="p-3 rounded-lg border border-border hover:border-strategy/40 hover:bg-strategy/5 transition-all cursor-pointer"><p className="text-sm font-medium text-foreground">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div></Link>
                ))}
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-card">
              <h2 className="font-serif text-base font-light text-foreground mb-3">Strategy Journal</h2>
              <p className="text-xs text-muted-foreground mb-3">Think on paper. Clarity comes through writing.</p>
              <Button asChild size="sm" variant="outline" className="w-full gap-2"><Link href="/journal?module=strategy"><ArrowRight className="h-3.5 w-3.5" /> Open Strategy Journal</Link></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
