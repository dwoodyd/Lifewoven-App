/**
 * Dimensions.tsx — The 6 Dimensions Life Map
 *
 * A quarterly reflection on what you are building.
 * The 6 Dimensions are the Soul Engineer Method's map of the whole self.
 * The 5S Framework is how you tend them daily.
 *
 * Per the Soul Engineer Design Brief (Section 4.2):
 *   - Header: "The 6 Dimensions" / Subhead: "A quarterly reflection on what you are building."
 *   - 6 expandable dimension cards with Becoming Questions from Chapter 11
 *   - Journal input per dimension
 *   - Link to 5S at the bottom
 */
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronDown, ArrowRight, Heart, Zap, Flame, Palette, User, Compass } from "lucide-react";

// ─── 6 Dimensions data ────────────────────────────────────────────────────────

type DimensionKey = "emotional" | "physical" | "spiritual" | "creative" | "identity" | "purpose";

interface DimensionDef {
  key: DimensionKey;
  name: string;
  mapsTo: string;
  definition: string;
  becomingQuestion: string;
  icon: React.ElementType;
  color: string;
  glyph: string;
}

const DIMENSIONS: DimensionDef[] = [
  {
    key: "emotional",
    name: "Emotional",
    mapsTo: "State",
    definition: "Your ability to feel, process, and be present to your interior life without suppressing it or being overwhelmed by it.",
    becomingQuestion: "What have I been feeling that I have not allowed myself to feel? What would it mean to let that feeling be real?",
    icon: Heart,
    color: "oklch(0.48 0.12 195)",   // State teal
    glyph: "◉",
  },
  {
    key: "physical",
    name: "Physical",
    mapsTo: "State",
    definition: "The quality of your relationship with your body — receiving its signals, honoring its requirements, sustaining rather than depleting.",
    becomingQuestion: "What is my body asking me for right now, honestly? What one thing could I do this week to honor that ask?",
    icon: Zap,
    color: "oklch(0.48 0.12 195)",   // State teal
    glyph: "◎",
  },
  {
    key: "spiritual",
    name: "Spiritual",
    mapsTo: "Standards",
    definition: "Connection to meaning that is not dependent on performance or output. Somewhere to be when the external structures fall away.",
    becomingQuestion: "What gives my life meaning that is not dependent on my performance? When did I last spend real time in that source?",
    icon: Flame,
    color: "oklch(0.46 0.12 148)",   // Standards green
    glyph: "◈",
  },
  {
    key: "creative",
    name: "Creative",
    mapsTo: "Story",
    definition: "The deep human impulse to bring something into being that was not there before. Requires safety, surplus, and freedom from obligation.",
    becomingQuestion: "What wants to be made that I have been postponing? What one small step toward that making could happen this week?",
    icon: Palette,
    color: "oklch(0.44 0.12 290)",   // Story purple
    glyph: "◆",
  },
  {
    key: "identity",
    name: "Identity",
    mapsTo: "Story",
    definition: "Who you are beneath and beyond what you produce. The self that remains when the role is removed and the audience is gone.",
    becomingQuestion: "Who am I when nobody needs me to be anything? Describe that person. Do you know them? Do you like them?",
    icon: User,
    color: "oklch(0.44 0.12 290)",   // Story purple
    glyph: "◇",
  },
  {
    key: "purpose",
    name: "Purpose",
    mapsTo: "Standards",
    definition: "The sense of something you are building toward that is larger than any single project or season. Direction across time.",
    becomingQuestion: "In ten years, what will I most wish I had given my attention to? Am I giving it that attention now?",
    icon: Compass,
    color: "oklch(0.46 0.12 148)",   // Standards green
    glyph: "✦",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dimensions() {
  const { isAuthenticated } = useAuth();
  const [expanded, setExpanded] = useState<DimensionKey | null>(null);
  const [drafts, setDrafts] = useState<Record<DimensionKey, string>>({
    emotional: "", physical: "", spiritual: "", creative: "", identity: "", purpose: "",
  });
  const [saving, setSaving] = useState<DimensionKey | null>(null);

  const { data: entries, refetch } = trpc.dimensions.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const saveEntry = trpc.dimensions.saveEntry.useMutation({
    onSuccess: (_, vars) => {
      toast.success(`${vars.dimension.charAt(0).toUpperCase() + vars.dimension.slice(1)} reflection saved.`);
      setDrafts(prev => ({ ...prev, [vars.dimension]: "" }));
      setSaving(null);
      refetch();
    },
    onError: () => {
      setSaving(null);
      toast.error("Could not save. Please try again.");
    },
  });

  const handleSave = (dim: DimensionKey, question: string) => {
    const content = drafts[dim].trim();
    if (!content) return;
    setSaving(dim);
    saveEntry.mutate({ dimension: dim, content, becomingQuestion: question });
  };

  const toggle = (key: DimensionKey) => {
    setExpanded(prev => (prev === key ? null : key));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <main className="max-w-[680px] mx-auto px-6 pt-20 pb-24">

        {/* ─── HEADER ─── */}
        <div className="mb-12">
          <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase mb-4">
            Soul Engineer Method
          </p>
          <h1
            className="text-foreground mb-3 leading-[1.06]"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(2.4rem, 6vw, 3.4rem)",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            The 6 Dimensions
          </h1>
          <p
            className="text-muted-foreground leading-relaxed mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontSize: "clamp(1.05rem, 2.5vw, 1.2rem)",
            }}
          >
            A quarterly reflection on what you are building.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[520px]">
            The Soul Engineer Method names six dimensions of the self — not as metaphysics, but as a practical map for what you are building when you are building a life. The 5S is how you work on them, one thread at a time.
          </p>
        </div>

        {/* ─── DIMENSION CARDS ─── */}
        <div className="space-y-3 mb-12">
          {DIMENSIONS.map((dim) => {
            const isOpen = expanded === dim.key;
            const entry = entries?.[dim.key];
            const Icon = dim.icon;

            return (
              <div
                key={dim.key}
                className="rounded-2xl border border-border bg-card overflow-hidden
                           transition-all duration-300 ease-out"
                style={{
                  borderColor: isOpen ? `color-mix(in oklch, ${dim.color} 40%, transparent)` : undefined,
                  boxShadow: isOpen ? `0 0 0 1px color-mix(in oklch, ${dim.color} 20%, transparent)` : undefined,
                }}
              >
                {/* Card header — always visible */}
                <button
                  onClick={() => toggle(dim.key)}
                  className="w-full flex items-center gap-4 px-6 py-5 text-left
                             hover:bg-secondary/30 transition-colors duration-150"
                >
                  <span
                    className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: `color-mix(in oklch, ${dim.color} 12%, transparent)` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: dim.color }} />
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="font-mono text-[10px] tracking-[0.14em] uppercase"
                        style={{ color: dim.color }}
                      >
                        {dim.glyph} {dim.name}
                      </span>
                      <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted-foreground/60">
                        → {dim.mapsTo}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-snug line-clamp-1">
                      {dim.definition}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {entry && (
                      <span className="text-[10px] font-mono text-muted-foreground/60 hidden sm:block">
                        {new Date(entry.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                    <ChevronDown
                      className="h-4 w-4 text-muted-foreground transition-transform duration-200"
                      style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </div>
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div className="px-6 pb-6 border-t border-border/40">
                    {/* Definition */}
                    <p className="text-sm text-muted-foreground leading-relaxed mt-4 mb-5">
                      {dim.definition}
                    </p>

                    {/* Becoming Question */}
                    <div
                      className="rounded-xl px-5 py-4 mb-5"
                      style={{ background: `color-mix(in oklch, ${dim.color} 7%, transparent)` }}
                    >
                      <p
                        className="font-mono text-[10px] tracking-[0.14em] uppercase mb-2"
                        style={{ color: dim.color }}
                      >
                        Becoming Question — Chapter 11
                      </p>
                      <p
                        className="text-foreground leading-relaxed"
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontStyle: "italic",
                          fontSize: "1.05rem",
                        }}
                      >
                        "{dim.becomingQuestion}"
                      </p>
                    </div>

                    {/* Previous entry if exists */}
                    {entry && (
                      <div className="mb-4 p-4 rounded-xl bg-secondary/40 border border-border/30">
                        <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted-foreground mb-2">
                          Last reflection — {new Date(entry.updatedAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </p>
                        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-4">
                          {entry.content}
                        </p>
                      </div>
                    )}

                    {/* Journal input */}
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Write your reflection here…"
                          value={drafts[dim.key]}
                          onChange={e => setDrafts(prev => ({ ...prev, [dim.key]: e.target.value }))}
                          className="resize-none text-sm min-h-[100px]"
                          rows={4}
                        />
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            onClick={() => handleSave(dim.key, dim.becomingQuestion)}
                            disabled={!drafts[dim.key].trim() || saving === dim.key}
                            className="gap-2"
                          >
                            {saving === dim.key ? "Saving…" : "Save reflection"}
                          </Button>
                          <Link
                            href={`/weave?prompt=${encodeURIComponent(dim.becomingQuestion)}&module=${dim.mapsTo.toLowerCase()}`}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 flex items-center gap-1"
                          >
                            Open in The Weave
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-3">Sign in to save your reflections.</p>
                        <Button asChild variant="outline" size="sm">
                          <Link href="/dashboard">Get Started</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ─── ATTRIBUTION ─── */}
        <div className="border-t border-border pt-8 text-center">
          <p
            className="text-muted-foreground leading-relaxed mb-6"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontSize: "1rem",
            }}
          >
            "Come back to these questions. They will not be the same questions twice."
          </p>
          <p className="text-xs font-mono tracking-[0.14em] uppercase text-muted-foreground mb-6">
            — Build a Life That Does Not Break You, Chapter 11
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            The 5S is how you work on these dimensions daily.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "/state", label: "State" },
              { href: "/story", label: "Story" },
              { href: "/standards", label: "Standards" },
              { href: "/strategy", label: "Strategy" },
              { href: "/stewardship", label: "Stewardship" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs font-mono tracking-[0.12em] uppercase px-3 py-1.5 rounded-full
                           border border-border text-muted-foreground
                           hover:border-accent/50 hover:text-foreground
                           transition-all duration-150"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
