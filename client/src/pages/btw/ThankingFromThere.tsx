import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Nav from "@/components/Nav";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus } from "lucide-react";

const GRATITUDE_TYPES = [
  { id: "morning", label: "Morning", desc: "Before the day begins" },
  { id: "evening", label: "Evening", desc: "At the end of the day" },
  { id: "sparse_table", label: "Sparse Table", desc: "When there isn't much to name" },
  { id: "hard_day", label: "Hard Day", desc: "When gratitude feels forced" },
  { id: "specific_mercy", label: "Specific Mercy", desc: "One particular thing given" },
] as const;

const REALNESS = [
  { id: "real", label: "It felt real", desc: "Genuine, not performed" },
  { id: "forced", label: "It felt forced", desc: "I said it but didn't feel it" },
  { id: "mixed", label: "Mixed", desc: "Somewhere in between" },
] as const;

const PROMPTS: Record<string, string[]> = {
  morning: ["What do I have today that I didn't earn?", "What is already present that I might overlook?"],
  evening: ["What was given today that I almost missed?", "What held even when things were hard?"],
  sparse_table: ["Even in scarcity, what is still here?", "What small thing is still true?"],
  hard_day: ["What didn't collapse today?", "What mercy was present even in the difficulty?"],
  specific_mercy: ["Name one specific thing. Be precise. Don't generalize.", "What happened that you didn't deserve but received anyway?"],
};

type GratitudeType = typeof GRATITUDE_TYPES[number]["id"];
type Realness = typeof REALNESS[number]["id"];
type Entry = { id: number; entryText: string; gratitudeType: string; feltRealness: string; createdAt: Date };

export default function ThankingFromThere() {
  const [writing, setWriting] = useState(false);
  const [entryText, setEntryText] = useState("");
  const [gratitudeType, setGratitudeType] = useState<GratitudeType>("evening");
  const [feltRealness, setFeltRealness] = useState<Realness>("real");

  const { data: entries, refetch } = trpc.btw.getGratitudeEntries.useQuery();
  const saveMutation = trpc.btw.saveGratitude.useMutation({
    onSuccess: () => { refetch(); setWriting(false); setEntryText(""); },
  });

  const currentPrompts = PROMPTS[gratitudeType] || [];

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">The Ground</p>
          <h1 className="font-serif text-4xl font-light text-foreground mb-3">Thanking From There</h1>
          <p className="text-muted-foreground font-light max-w-md mx-auto">
            Gratitude grounded in posture, not performance. You don't have to feel it fully to name it honestly.
          </p>
        </div>

        {!writing ? (
          <>
            <Button className="w-full gap-2 mb-8" size="lg" onClick={() => setWriting(true)}>
              <Plus className="h-4 w-4" /> Add a Gratitude Entry
            </Button>

            {/* Entries */}
            {entries && entries.length > 0 ? (
              <div className="space-y-4">
                <h2 className="font-serif text-lg font-light text-foreground">What you've named</h2>
                {entries.map((entry: Entry) => (
                  <div key={entry.id} className="p-5 rounded-2xl border border-border bg-card">
                    <div className="flex gap-2 mb-3">
                      <span className="text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">
                        {GRATITUDE_TYPES.find(t => t.id === entry.gratitudeType)?.label}
                      </span>
                      <span className="text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">
                        {REALNESS.find(r => r.id === entry.feltRealness)?.label}
                      </span>
                    </div>
                    <p className="text-base text-foreground font-light leading-relaxed whitespace-pre-wrap">{entry.entryText}</p>
                    <p className="text-xs text-muted-foreground mt-3">{new Date(entry.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-serif text-lg font-light mb-2">Nothing named yet.</p>
                <p className="text-base font-light">Even one honest line is enough to begin.</p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            {/* Type */}
            <div>
              <label className="text-xs font-mono tracking-widest text-muted-foreground uppercase block mb-3">What kind of gratitude is this?</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GRATITUDE_TYPES.map(t => (
                  <button key={t.id} onClick={() => setGratitudeType(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${gratitudeType === t.id ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-secondary/40"}`}>
                    <p className={`text-xs font-light ${gratitudeType === t.id ? "text-foreground" : "text-muted-foreground"}`}>{t.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompts */}
            {currentPrompts.length > 0 && (
              <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                <p className="text-xs text-muted-foreground mb-2">Prompts if you need them:</p>
                {currentPrompts.map(p => (
                  <button key={p} onClick={() => setEntryText(p + "\n\n")}
                    className="block text-xs text-muted-foreground font-light hover:text-foreground transition-colors mb-1 text-left">
                    ◦ {p}
                  </button>
                ))}
              </div>
            )}

            {/* Text */}
            <div>
              <label className="text-xs font-mono tracking-widest text-muted-foreground uppercase block mb-2">Name it</label>
              <Textarea
                value={entryText}
                onChange={e => setEntryText(e.target.value)}
                placeholder="Write what you're grateful for. Be specific. One thing is enough."
                className="min-h-32 font-light text-sm leading-relaxed resize-none"
                autoFocus
              />
            </div>

            {/* Realness */}
            <div>
              <label className="text-xs font-mono tracking-widest text-muted-foreground uppercase block mb-3">How did it feel to write it?</label>
              <div className="flex gap-2">
                {REALNESS.map(r => (
                  <button key={r.id} onClick={() => setFeltRealness(r.id)}
                    className={`flex-1 p-3 rounded-xl border text-center transition-all ${feltRealness === r.id ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-secondary/40"}`}>
                    <p className={`text-xs font-light ${feltRealness === r.id ? "text-foreground" : "text-muted-foreground"}`}>{r.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setWriting(false)}>Cancel</Button>
              <Button className="flex-1" onClick={() => saveMutation.mutate({ entryText, gratitudeType, feltRealness })} disabled={!entryText.trim() || saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Entry"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
