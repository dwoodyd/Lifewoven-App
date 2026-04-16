import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import PageSkeleton from "@/components/PageSkeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BookOpen, Plus, Sparkles, ArrowRight, RefreshCw, CheckCircle2, Pencil } from "lucide-react";

const LIMITING_BELIEF_PROMPTS = [
  "I'm not good enough to...",
  "Money is hard to come by because...",
  "I don't deserve...",
  "People like me don't...",
  "I always struggle with...",
  "My past means I can't...",
];

const IDENTITY_STATEMENTS = [
  "I am someone who shows up consistently.",
  "I am a person who creates value in the world.",
  "I am worthy of love, abundance, and success.",
  "I am a deliberate creator of my experience.",
  "I am someone who finds meaning in every challenge.",
  "I am becoming the best version of myself every day.",
];

const MEANING_QUOTES = [
  { text: "He who has a why to live can bear almost any how.", source: "Viktor Frankl, \u2018Man\u2019s Search for Meaning\u2019" },
  { text: "Between stimulus and response there is a space. In that space is our power to choose our response.", source: "Viktor Frankl (as interpreted by Stephen Covey)" },
  { text: "When we are no longer able to change a situation, we are challenged to change ourselves.", source: "Viktor Frankl, \u2018Man\u2019s Search for Meaning\u2019" },
  { text: "Everything can be taken from a man but one thing: the last of the human freedoms — to choose one\u2019s attitude.", source: "Viktor Frankl, \u2018Man\u2019s Search for Meaning\u2019" },
];

export default function StoryModule() {
  const { isAuthenticated } = useAuth();
  const [newBelief, setNewBelief] = useState("");
  const [newBeliefPrompt, setNewBeliefPrompt] = useState("");
  const [showAddBelief, setShowAddBelief] = useState(false);
  const [rewritingId, setRewritingId] = useState<number | null>(null);
  const [dailyQuote] = useState(() => MEANING_QUOTES[Math.floor(Math.random() * MEANING_QUOTES.length)]);

  const { data: beliefs, refetch: refetchBeliefs, isLoading: moduleLoading } = trpc.beliefs.list.useQuery(undefined, { enabled: isAuthenticated });
  const createBelief = trpc.beliefs.create.useMutation({
    onSuccess: () => { toast.success("Belief captured. Now we can work with it."); setNewBelief(""); setNewBeliefPrompt(""); setShowAddBelief(false); refetchBeliefs(); },
  });
  const rewriteBelief = trpc.beliefs.rewrite.useMutation({
    onSuccess: () => { toast.success("The Oracle has rewritten this belief."); setRewritingId(null); refetchBeliefs(); },
  });

  if (isAuthenticated && moduleLoading) return <PageSkeleton rows={3} />;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-start gap-4 mb-10">
          <div className="p-3 rounded-xl bg-story/10 flex-shrink-0"><BookOpen className="h-6 w-6 text-story" /></div>
          <div>
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-1">5S Framework — Module 2</p>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-2">Story</h1>
            <p className="text-muted-foreground text-base font-light max-w-xl">The narrative you carry about yourself determines what you allow into your life. Surface constraining beliefs, rewrite your identity, and find meaning in your journey.</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-story/20 bg-story/5 mb-8">
          <p className="text-xs font-mono tracking-widest text-story uppercase mb-3">Wisdom on Meaning</p>
          <p className="font-serif text-xl md:text-2xl font-light text-foreground italic leading-relaxed">"{dailyQuote.text}"</p>
          <p className="text-xs text-muted-foreground mt-3">— {dailyQuote.source}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-xl font-light text-foreground">Belief Rewrite Lab</h2>
                {isAuthenticated && <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setShowAddBelief(!showAddBelief)}><Plus className="h-3.5 w-3.5" /> Add Belief</Button>}
              </div>
              {showAddBelief && (
                <div className="mb-5 p-4 rounded-xl bg-secondary/50 space-y-3">
                  <p className="text-xs text-muted-foreground">What constraining belief is holding you back?</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {LIMITING_BELIEF_PROMPTS.map(p => (
                      <button key={p} onClick={() => setNewBeliefPrompt(p)} className="text-xs px-2 py-1 rounded-md bg-background border border-border hover:border-muted-foreground transition-colors text-muted-foreground">{p}</button>
                    ))}
                  </div>
                  {newBeliefPrompt && <p className="text-xs font-medium text-foreground">{newBeliefPrompt}</p>}
                  <Textarea placeholder="Write the constraining belief as you currently hold it..." value={newBelief} onChange={e => setNewBelief(e.target.value)} className="resize-none text-sm" rows={2} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => createBelief.mutate({ limitingBelief: (newBeliefPrompt ? newBeliefPrompt + " " : "") + newBelief })} disabled={!newBelief || createBelief.isPending} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Capture</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowAddBelief(false)}>Cancel</Button>
                  </div>
                </div>
              )}
              {!isAuthenticated ? (
                <div className="text-center py-8"><BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground mb-4">Sign in to begin your belief work.</p><Button asChild variant="outline"><Link href="/dashboard">Get Started</Link></Button></div>
              ) : beliefs && beliefs.length > 0 ? (
                <div className="space-y-3">
                  {beliefs.map((belief: any) => (
                    <div key={belief.id} className={`p-4 rounded-xl border transition-all ${belief.isRewritten ? "border-story/30 bg-story/5" : "border-border bg-background"}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm text-muted-foreground italic">"{belief.limitingBelief}"</p>
                        <Badge variant={belief.isRewritten ? "default" : "secondary"} className="text-xs flex-shrink-0">{belief.isRewritten ? "Rewritten" : "Pending"}</Badge>
                      </div>
                      {belief.isRewritten && belief.empoweringBelief && (
                        <div className="mt-2 pt-2 border-t border-story/20">
                          <p className="text-xs text-muted-foreground mb-1">Empowering Belief:</p>
                          <p className="text-sm font-medium text-foreground">"{belief.empoweringBelief}"</p>
                          {belief.declaration && <p className="text-xs text-story mt-1 italic">Declaration: {belief.declaration}</p>}
                        </div>
                      )}
                      {!belief.isRewritten && (
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs mt-2" onClick={() => { setRewritingId(belief.id); rewriteBelief.mutate({ id: belief.id, limitingBelief: belief.limitingBelief }); }} disabled={rewritingId === belief.id && rewriteBelief.isPending}>
                          {rewritingId === belief.id && rewriteBelief.isPending ? <><RefreshCw className="h-3 w-3 animate-spin" /> Rewriting...</> : <><Sparkles className="h-3 w-3" /> Oracle Rewrite</>}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8"><p className="text-sm text-muted-foreground">No beliefs captured yet. Start by adding one above.</p></div>
              )}
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card">
              <h2 className="font-serif text-xl font-light text-foreground mb-2">Identity Builder</h2>
              <p className="text-base text-muted-foreground mb-5">Every action you take is a vote for the type of person you wish to become. <span className="text-xs text-muted-foreground/70">(James Clear, <em>Atomic Habits</em>)</span> Identity-based change begins with small, consistent acts of becoming.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                {IDENTITY_STATEMENTS.map((stmt, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50">
                    <CheckCircle2 className="h-4 w-4 text-story flex-shrink-0 mt-0.5" />
                    <p className="text-base text-foreground">{stmt}</p>
                  </div>
                ))}
              </div>
              <Button asChild size="sm" variant="outline" className="gap-2"><Link href="/journal?module=story&prompt=identity"><Pencil className="h-3.5 w-3.5" /> Write Your Identity Statement</Link></Button>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card">
              <h2 className="font-serif text-xl font-light text-foreground mb-2">Meaning & Why Journal</h2>
              <p className="text-base text-muted-foreground mb-4">Meaning-centered philosophy teaches that meaning can be found through work and creation, through love and connection, and through the attitude we take toward unavoidable suffering.</p>
              <div className="space-y-2">
                {[
                  "What work or creation gives your life the deepest meaning?",
                  "Who or what do you love so deeply it gives you a reason to keep going?",
                  "What difficult experience has given you the most growth?",
                  "If you knew you couldn't fail, what would you create?",
                ].map(prompt => (
                  <Link key={prompt} href={`/journal?module=story&prompt=${encodeURIComponent(prompt)}`}>
                    <div className="p-3 rounded-lg border border-border hover:border-story/40 hover:bg-story/5 transition-all cursor-pointer flex items-center justify-between gap-2">
                      <p className="text-base text-foreground">{prompt}</p>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-5 rounded-2xl border border-border bg-card">
              <h2 className="font-serif text-base font-light text-foreground mb-4">Story Pathways</h2>
              <div className="space-y-2">
                {[
                  { href: "/pathway/purpose", label: "Why — Meaning & Resilience", desc: "Find your deepest purpose" },
                  { href: "/pathway/reset", label: "Reset", desc: "Reframe and rebuild" },
                  { href: "/pathway/flow", label: "Flow — Visualization", desc: "See your desired future" },
                ].map(({ href, label, desc }) => (
                  <Link key={href} href={href}>
                    <div className="p-3 rounded-lg border border-border hover:border-story/40 hover:bg-story/5 transition-all cursor-pointer">
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-card">
              <h2 className="font-serif text-base font-light text-foreground mb-3">From the Texts</h2>
              <blockquote className="border-l-2 border-story/40 pl-3 space-y-1">
                <p className="font-serif text-sm font-light text-foreground italic leading-relaxed">"The mind, once stretched by a new idea, never returns to its original dimensions."</p>
                <footer className="text-xs text-muted-foreground">— Lifewoven Framework</footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
