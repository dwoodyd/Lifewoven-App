import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Nav from "@/components/Nav";
import { trpc } from "@/lib/trpc";
import { Loader2, Sparkles, Trash2, Plus, Lock } from "lucide-react";
import { toast } from "sonner";

const TONE_TAGS = ["trust", "fear", "striving", "grief", "gratitude", "honest", "mixed"] as const;
const TOPIC_TAGS = ["long_wait", "fear", "provision", "relationship", "calling", "grief", "uncertainty", "gratitude", "not_yet", "answered", "still_carrying"] as const;
const STATUS_TAGS = ["carrying", "released", "answered", "returning"] as const;

const TONE_LABELS: Record<string, string> = { trust: "Trust", fear: "Fear", striving: "Striving", grief: "Grief", gratitude: "Gratitude", honest: "Honest", mixed: "Mixed" };
const TOPIC_LABELS: Record<string, string> = { long_wait: "Long Wait", fear: "Fear", provision: "Provision", relationship: "Relationship", calling: "Calling", grief: "Grief", uncertainty: "Uncertainty", gratitude: "Gratitude", not_yet: "Not Yet", answered: "Answered", still_carrying: "Still Carrying" };
const STATUS_LABELS: Record<string, string> = { carrying: "Carrying", released: "Released", answered: "Answered", returning: "Returning" };
const STATUS_COLORS: Record<string, string> = { carrying: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", released: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", answered: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", returning: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" };

const PROMPTS = [
  "What am I bringing to this moment that I haven't named yet?",
  "What am I asking for that I'm afraid to say out loud?",
  "What would I pray if I believed I was actually heard?",
  "What am I still carrying that I thought I'd released?",
  "What would trust look like in this specific situation?",
];

type Prayer = { id: number; title: string | null; body: string; toneTag: string; topicTag: string; statusTag: string; createdAt: Date };

export default function LivingAsHeard() {
  const [writing, setWriting] = useState(false);
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [toneTag, setToneTag] = useState<typeof TONE_TAGS[number]>("honest");
  const [topicTag, setTopicTag] = useState<typeof TOPIC_TAGS[number]>("still_carrying");
  const [statusTag, setStatusTag] = useState<typeof STATUS_TAGS[number]>("carrying");
  const [reflection, setReflection] = useState<string | null>(null);
  const [reflectingId, setReflectingId] = useState<number | null>(null);

  const { data: subStatus } = trpc.stripe.status.useQuery();
  const canUseGroundGuide = subStatus?.tier === "seeker" || subStatus?.tier === "oracle";
  const checkoutMutation = trpc.stripe.createCheckout.useMutation({
    onSuccess: (d) => { if (d.url) { toast.info("Opening checkout…"); window.open(d.url, "_blank"); } },
  });

  const { data: prayers, refetch } = trpc.btw.getPrayers.useQuery();
  const saveMutation = trpc.btw.savePrayer.useMutation({ onSuccess: () => { refetch(); setWriting(false); setBody(""); setTitle(""); setReflection(null); } });
  const deleteMutation = trpc.btw.deletePrayer.useMutation({ onSuccess: () => refetch() });
  const reflectMutation = trpc.btw.reflectOnPrayer.useMutation({ onSuccess: (d) => setReflection(typeof d.reflection === 'string' ? d.reflection : null) });

  const handleSave = () => {
    if (!body.trim()) return;
    saveMutation.mutate({ title: title || undefined, body, toneTag, topicTag, statusTag });
  };

  const handleReflect = (prayer: Prayer) => {
    setReflectingId(prayer.id);
    setReflection(null);
    reflectMutation.mutate({ prayerBody: prayer.body }, { onSettled: () => setReflectingId(null) });
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-24 pb-20 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Before the Words</p>
          <h1 className="font-serif text-4xl font-light text-foreground mb-3">Living as Heard</h1>
          <p className="text-muted-foreground font-light max-w-md mx-auto">A prayer journal for moving from striving into trust. Write what's real. The Ground Guide will reflect it back.</p>
        </div>

        {!writing ? (
          <>
            <Button className="w-full gap-2 mb-8" size="lg" onClick={() => setWriting(true)}>
              <Plus className="h-4 w-4" /> Write a Prayer
            </Button>

            {/* Prompts */}
            <div className="p-5 rounded-2xl border border-border bg-card mb-8">
              <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">If you don't know where to start</p>
              <div className="space-y-2">
                {PROMPTS.map(p => (
                  <button key={p} onClick={() => { setBody(p + "\n\n"); setWriting(true); }}
                    className="w-full text-left text-sm text-muted-foreground font-light p-3 rounded-xl hover:bg-secondary/40 transition-colors">
                    ◦ {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Prayer list */}
            {prayers && prayers.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-serif text-lg font-light text-foreground">What you've carried</h2>
                {prayers.map((prayer: Prayer) => (
                  <div key={prayer.id} className="p-6 rounded-2xl border border-border bg-card">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        {prayer.title && <p className="text-sm font-light text-foreground mb-1">{prayer.title}</p>}
                        <div className="flex gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[prayer.statusTag]}`}>{STATUS_LABELS[prayer.statusTag]}</span>
                          <span className="text-xs text-muted-foreground">{TONE_LABELS[prayer.toneTag]}</span>
                          <span className="text-xs text-muted-foreground">· {TOPIC_LABELS[prayer.topicTag]}</span>
                        </div>
                      </div>
                      <button onClick={() => deleteMutation.mutate({ id: prayer.id })} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed whitespace-pre-wrap mb-4">{prayer.body}</p>

                    {reflectingId === prayer.id ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" /> Ground Guide is reflecting…
                      </div>
                    ) : canUseGroundGuide ? (
                      <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => handleReflect(prayer)}>
                        <Sparkles className="h-3 w-3" /> Ask the Ground Guide
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground" onClick={() => checkoutMutation.mutate({ plan: "seeker", origin: window.location.origin })}>
                        <Lock className="h-3 w-3" /> Ground Guide — Seeker only
                      </Button>
                    )}

                    {reflectingId !== prayer.id && reflection && (
                      <div className="mt-4 p-4 rounded-xl bg-secondary/40 border border-border">
                        <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-2">Ground Guide</p>
                        <p className="text-sm text-foreground font-light leading-relaxed whitespace-pre-wrap">{reflection}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {prayers && prayers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-serif text-lg font-light mb-2">Nothing written yet.</p>
                <p className="text-sm font-light">Your first prayer doesn't have to be polished. Just honest.</p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-mono tracking-widest text-muted-foreground uppercase block mb-2">Title (optional)</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What is this prayer about?"
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm font-light text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-mono tracking-widest text-muted-foreground uppercase block mb-2">Your prayer</label>
              <Textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write what's real. You don't have to get it right."
                className="min-h-40 font-light text-sm leading-relaxed resize-none"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-mono tracking-widest text-muted-foreground uppercase block mb-2">Tone</label>
                <div className="flex flex-wrap gap-1.5">
                  {TONE_TAGS.map(t => (
                    <button key={t} onClick={() => setToneTag(t)}
                      className={`px-3 py-1 rounded-full text-xs border transition-all ${toneTag === t ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-secondary/40"}`}>
                      {TONE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-mono tracking-widest text-muted-foreground uppercase block mb-2">Topic</label>
                <div className="flex flex-wrap gap-1.5">
                  {TOPIC_TAGS.map(t => (
                    <button key={t} onClick={() => setTopicTag(t)}
                      className={`px-3 py-1 rounded-full text-xs border transition-all ${topicTag === t ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-secondary/40"}`}>
                      {TOPIC_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-mono tracking-widest text-muted-foreground uppercase block mb-2">Status</label>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_TAGS.map(t => (
                    <button key={t} onClick={() => setStatusTag(t)}
                      className={`px-3 py-1 rounded-full text-xs border transition-all ${statusTag === t ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-secondary/40"}`}>
                      {STATUS_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setWriting(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave} disabled={!body.trim() || saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Prayer"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
