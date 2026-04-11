import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Nav from "@/components/Nav";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Star, StarOff, Mic } from "lucide-react";

const TYPES = [
  { id: "prayer", label: "Prayer", desc: "Spoken or written from the ground" },
  { id: "declaration", label: "Declaration", desc: "A truth you speak over your life" },
  { id: "scripture", label: "Scripture", desc: "A passage that holds you" },
  { id: "voice_note", label: "Voice Note", desc: "A recorded reflection or prayer" },
] as const;

type ItemType = typeof TYPES[number]["id"];
type AudioItem = { id: number; type: string; title: string | null; fileUrlOrText: string; favorite: boolean; createdAt: Date };

const LIBRARY_ITEMS = [
  { type: "scripture" as ItemType, title: "Psalm 46:10", text: "Be still and know that I am God." },
  { type: "scripture" as ItemType, title: "Isaiah 41:10", text: "Fear not, for I am with you; be not dismayed, for I am your God." },
  { type: "declaration" as ItemType, title: "Grounded Declaration", text: "I am not behind. I am not forgotten. I am held by what does not change." },
  { type: "declaration" as ItemType, title: "Return Declaration", text: "I can return. Every return is a practice. I am the kind of person who comes back." },
  { type: "prayer" as ItemType, title: "Honest Morning Prayer", text: "I don't know what today holds. I know I am not alone in it. That is enough to begin." },
];

export default function WordsWithWeight() {
  const [writing, setWriting] = useState(false);
  const [type, setType] = useState<ItemType>("prayer");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const { data: items, refetch } = trpc.btw.getAudioItems.useQuery();
  const saveMutation = trpc.btw.saveAudioItem.useMutation({ onSuccess: () => { refetch(); setWriting(false); setText(""); setTitle(""); } });
  const favoriteMutation = trpc.btw.toggleAudioFavorite.useMutation({ onSuccess: () => refetch() });

  const handleAddFromLibrary = (item: typeof LIBRARY_ITEMS[0]) => {
    saveMutation.mutate({ type: item.type, title: item.title, fileUrlOrText: item.text, sourceType: "library" });
  };

  const favorites = (items as AudioItem[] | undefined)?.filter(i => i.favorite) ?? [];
  const all = (items as AudioItem[] | undefined) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-24 pb-20 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Before the Words</p>
          <h1 className="font-serif text-4xl font-light text-foreground mb-3">Words With Weight</h1>
          <p className="text-muted-foreground font-light max-w-md mx-auto">
            Prayers, declarations, and scripture spoken from settled ground. Words that carry you, not words you perform.
          </p>
        </div>

        {!writing ? (
          <>
            <Button className="w-full gap-2 mb-8" size="lg" onClick={() => setWriting(true)}>
              <Plus className="h-4 w-4" /> Add Words
            </Button>

            {/* Favorites */}
            {favorites.length > 0 && (
              <div className="mb-8">
                <h2 className="font-serif text-lg font-light text-foreground mb-4">Your anchors</h2>
                <div className="space-y-3">
                  {favorites.map((item: AudioItem) => (
                    <div key={item.id} className="p-5 rounded-2xl border border-primary/30 bg-primary/5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          {item.title && <p className="text-base font-light text-foreground mb-0.5">{item.title}</p>}
                          <span className="text-xs text-muted-foreground capitalize">{item.type}</span>
                        </div>
                        <button onClick={() => favoriteMutation.mutate({ id: item.id, favorite: false })} className="text-accent">
                          <Star className="h-4 w-4 fill-current" />
                        </button>
                      </div>
                      <p className="text-base text-muted-foreground font-light leading-relaxed italic">{item.fileUrlOrText}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Library suggestions */}
            <div className="p-6 rounded-2xl border border-border bg-card mb-8">
              <h2 className="font-serif text-lg font-light text-foreground mb-4">From the library</h2>
              <div className="space-y-3">
                {LIBRARY_ITEMS.map(item => (
                  <div key={item.title} className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-0.5 capitalize">{item.type} · {item.title}</p>
                      <p className="text-base text-foreground font-light leading-relaxed italic">{item.text}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="shrink-0 text-xs" onClick={() => handleAddFromLibrary(item)}>
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* All items */}
            {all.filter(i => !i.favorite).length > 0 && (
              <div className="space-y-3">
                <h2 className="font-serif text-lg font-light text-foreground">All words</h2>
                {all.filter(i => !i.favorite).map((item: AudioItem) => (
                  <div key={item.id} className="p-5 rounded-2xl border border-border bg-card">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        {item.title && <p className="text-sm font-light text-foreground mb-0.5">{item.title}</p>}
                        <span className="text-xs text-muted-foreground capitalize">{item.type}</span>
                      </div>
                      <button onClick={() => favoriteMutation.mutate({ id: item.id, favorite: true })} className="text-muted-foreground hover:text-accent transition-colors">
                        <StarOff className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed italic">{item.fileUrlOrText}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-mono tracking-widest text-muted-foreground uppercase block mb-3">Type</label>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map(t => (
                  <button key={t.id} onClick={() => setType(t.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${type === t.id ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-secondary/40"}`}>
                    <p className={`text-sm font-light ${type === t.id ? "text-foreground" : "text-muted-foreground"}`}>{t.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-mono tracking-widest text-muted-foreground uppercase block mb-2">Title (optional)</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Name these words"
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm font-light text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>

            <div>
              <label className="text-xs font-mono tracking-widest text-muted-foreground uppercase block mb-2">
                {type === "voice_note" ? "Paste a URL or describe the recording" : "The words"}
              </label>
              <Textarea value={text} onChange={e => setText(e.target.value)}
                placeholder={type === "scripture" ? "Write the passage…" : type === "declaration" ? "Write what you declare over your life…" : "Write your prayer…"}
                className="min-h-32 font-light text-sm leading-relaxed resize-none" autoFocus />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setWriting(false)}>Cancel</Button>
              <Button className="flex-1" onClick={() => saveMutation.mutate({ type, title: title || undefined, fileUrlOrText: text })} disabled={!text.trim() || saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
