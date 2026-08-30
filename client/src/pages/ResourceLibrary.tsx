import { useState } from "react";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Library, BookOpen, FileText, ArrowRight, ExternalLink, Info, Shield, Sparkles } from "lucide-react";

type RightsLabel = "public-domain" | "original" | "licensed";

interface Resource {
  id: number;
  category: string;
  module: string;
  title: string;
  author: string;
  description: string;
  type: string;
  free: boolean;
  rights: RightsLabel;
  rightsNote?: string;
  slug?: string; // if set, links to /library/:slug reader
}

const RESOURCES: Resource[] = [
  {
    id: 1, category: "text", module: "state", slug: "emotional-guidance-scale",
    title: "The Emotional Guidance Scale",
    author: "Lifewoven",
    description: "The complete 22-level emotional scale from despair to joy, with original Lifewoven guidance on how to use it as your inner GPS for daily alignment.",
    type: "Guide", free: true,
    rights: "original",
    rightsNote: "Original Lifewoven content.",
  },
  {
    id: 2, category: "text", module: "story",
    title: "Creative Mind and Success",
    author: "Lifewoven",
    description: "A foundational exploration of how consciousness shapes experience — the philosophical root of the Lifewoven State and Story modules.",
    type: "Book", free: true,
    rights: "public-domain",
    rightsNote: "Original Lifewoven content.",
  },
  {
    id: 3, category: "text", module: "stewardship",
    title: "The Interior Life",
    author: "Lifewoven",
    description: "Daily readings and meditations on the power of thought and interior practice. A companion for daily alignment work.",
    type: "Book", free: true,
    rights: "public-domain",
    rightsNote: "Original Lifewoven content.",
  },
  {
    id: 4, category: "text", module: "story", slug: "processes-to-raise-emotional-set-point",
    title: "Processes to Raise Your Emotional Set Point",
    author: "Lifewoven",
    description: "22 original Lifewoven practices for shifting your emotional baseline upward.",
    type: "Guide", free: true,
    rights: "original",
    rightsNote: "Original Lifewoven content. Original Lifewoven content.",
  },
  {
    id: 5, category: "guided-practice", module: "state",
    title: "Entering Alignment — Guided Practice",
    author: "Lifewoven",
    description: "An original Lifewoven guided practice for entering a state of interior alignment.",
    type: "Guided Practice", free: false,
    rights: "original",
    rightsNote: "Original Lifewoven interactive document.",
  },
  {
    id: 6, category: "text", module: "standards", slug: "four-laws-of-behavior-change",
    title: "The Four Laws of Behavior Change — Framework Summary",
    author: "Lifewoven",
    description: "An original Lifewoven summary of the habit loop framework: Make It Obvious, Attractive, Easy, and Satisfying — with original application exercises.",
    type: "Summary", free: true,
    rights: "original",
    rightsNote: "Original Lifewoven content.",
  },
  {
    id: 7, category: "text", module: "story", slug: "finding-meaning-primer",
    title: "Finding Meaning — A Lifewoven Primer",
    author: "Lifewoven",
    description: "An original Lifewoven exploration of meaning-centered living. Includes original reflection exercises.",
    type: "Summary", free: true,
    rights: "original",
    rightsNote: "Original Lifewoven content.",
  },
  {
    id: 8, category: "text", module: "state", slug: "art-of-allowing",
    title: "The Art of Allowing — Principles Guide",
    author: "Lifewoven",
    description: "An original Lifewoven guide to the third element of deliberate creation: releasing resistance and allowing desires to manifest.",
    type: "Guide", free: false,
    rights: "original",
    rightsNote: "Original Lifewoven content.",
  },
  {
    id: 9, category: "text", module: "state", slug: "morning-alignment-text-companion",
    title: "Morning Alignment — Text Companion",
    author: "Lifewoven",
    description: "A 15-minute original guided morning practice to anchor you in alignment before the day begins.",
    type: "Meditation", free: true,
    rights: "original",
    rightsNote: "Original Lifewoven interactive document.",
  },
  {
    id: 10, category: "text", module: "strategy", slug: "leverage-mapper",
    title: "The Leverage Mapper",
    author: "Lifewoven",
    description: "A guided exercise for identifying the highest-leverage actions in your life and work right now.",
    type: "Exercise", free: true,
    rights: "original",
    rightsNote: "Original Lifewoven content.",
  },
  {
    id: 11, category: "text", module: "story", slug: "emotional-futures-introduction",
    title: "Emotional Futures — Introduction",
    author: "Lifewoven",
    description: "An original Lifewoven introduction to the Emotional Futures practice — the practice of interior alignment through felt immersion in desired futures.",
    type: "Overview", free: true,
    rights: "original",
    rightsNote: "Original Lifewoven content.",
  },
  {
    id: 12, category: "guided-practice", module: "story",
    title: "Belief Rewrite Meditation",
    author: "Lifewoven",
    description: "A guided practice for identifying and rewriting a core constraining belief using the Story module framework.",
    type: "Guided Practice", free: false,
    rights: "original",
    rightsNote: "Original Lifewoven interactive document.",
  },
  // Soul Engineer Method entries
  {
    id: 13, category: "soul-engineer", module: "state",
    title: "The Soul Engineer Method — Overview",
    author: "DeWayne Woods",
    description: "The foundational premise: most people are not failing because they lack motivation — they are failing because they are building on an unstable foundation. An introduction to the five load-bearing structures.",
    type: "Overview", free: true,
    rights: "original",
    rightsNote: "Original Lifewoven content from Build a Life That Does Not Break You.",
  },
  {
    id: 14, category: "soul-engineer", module: "state",
    title: "State — The Foundation Dimension",
    author: "DeWayne Woods",
    description: "Your emotional and energetic quality is not a mood to manage — it is the interior weather that determines the quality of everything you do. Interior alignment precedes outer results.",
    type: "Guide", free: true,
    rights: "original",
    rightsNote: "Original Lifewoven content from Build a Life That Does Not Break You.",
  },
  {
    id: 15, category: "soul-engineer", module: "story",
    title: "Story — The Belief Architecture",
    author: "DeWayne Woods",
    description: "Your story is not what happened to you — it is the interpretation you carry forward. Constraining beliefs limit your possibilities before you even begin. Identity-level change is more durable than behavioral change alone.",
    type: "Guide", free: true,
    rights: "original",
    rightsNote: "Original Lifewoven content from Build a Life That Does Not Break You.",
  },
  {
    id: 16, category: "soul-engineer", module: "standards",
    title: "Standards — Values in Practice",
    author: "DeWayne Woods",
    description: "Standards are not rules imposed from outside — they are the expression of your identity in daily life. A standard without a rhythm is an aspiration. A rhythm without a standard is a habit without a soul.",
    type: "Guide", free: true,
    rights: "original",
    rightsNote: "Original Lifewoven content from Build a Life That Does Not Break You.",
  },
  {
    id: 17, category: "soul-engineer", module: "strategy",
    title: "Strategy — Aligned Action",
    author: "DeWayne Woods",
    description: "Strategy is not about hustle or optimization — it is about alignment between your interior state and your external actions. The right strategy from alignment produces flow.",
    type: "Guide", free: true,
    rights: "original",
    rightsNote: "Original Lifewoven content from Build a Life That Does Not Break You.",
  },
  {
    id: 18, category: "soul-engineer", module: "stewardship",
    title: "Stewardship — The Long Game",
    author: "DeWayne Woods",
    description: "Stewardship is the recognition that you are a resource, and resources require tending. It is the practice of maintaining what you have built so it compounds over time.",
    type: "Guide", free: true,
    rights: "original",
    rightsNote: "Original Lifewoven content from Build a Life That Does Not Break You.",
  },
  {
    id: 19, category: "soul-engineer", module: "state",
    title: "The Load-Bearing Survey — Your Starting Point",
    author: "DeWayne Woods",
    description: "The diagnostic that reveals which of your five load-bearing structures most needs attention. Not a test of your worth — a map of where the work begins.",
    type: "Exercise", free: true,
    rights: "original",
    rightsNote: "Original Lifewoven content from Build a Life That Does Not Break You.",
  },
  {
    id: 20, category: "soul-engineer", module: "story",
    title: "The First Honest Week",
    author: "DeWayne Woods",
    description: "Seven days of structured self-honesty. The entry point into the Soul Engineer Method for readers of Build a Life That Does Not Break You.",
    type: "Exercise", free: true,
    rights: "original",
    rightsNote: "Original Lifewoven content from Build a Life That Does Not Break You.",
  },
  {
    id: 21, category: "soul-engineer", module: "state",
    title: "The 6 Dimensions Life Map",
    author: "DeWayne Woods",
    description: "The six Becoming Questions that reveal where you are in each dimension of your interior life: Emotional, Physical, Spiritual, Creative, Identity, and Purpose.",
    type: "Exercise", free: true,
    rights: "original",
    rightsNote: "Original Lifewoven content from Build a Life That Does Not Break You.",
  },
  {
    id: 22, category: "soul-engineer", module: "standards", slug: "load-bearing-beliefs-identification-guide",
    title: "Load-Bearing Beliefs — Identification Guide",
    author: "DeWayne Woods",
    description: "How to identify the beliefs that are structurally load-bearing in your life — the ones that, if changed, would change everything downstream of them.",
    type: "Guide", free: false,
    rights: "original",
    rightsNote: "Original Lifewoven content from Build a Life That Does Not Break You.",
  },
  {
    id: 23, category: "soul-engineer", module: "strategy", slug: "honest-step-framework",
    title: "The Honest Step Framework",
    author: "DeWayne Woods",
    description: "Not the perfect step — the honest one. A practical framework for identifying the next right action when the full path is unclear.",
    type: "Guide", free: false,
    rights: "original",
    rightsNote: "Original Lifewoven content from Build a Life That Does Not Break You.",
  },
  {
    id: 24, category: "soul-engineer", module: "stewardship",
    title: "Build a Life That Does Not Break You — Book Overview",
    author: "DeWayne Woods",
    description: "A complete overview of the book: the premise, the five load-bearing dimensions, the diagnostic tools, and how the Soul Engineer Method is applied over time.",
    type: "Book", free: true,
    rights: "original",
    rightsNote: "Original Lifewoven content from Build a Life That Does Not Break You.",
  },
];

const RIGHTS_CONFIG: Record<RightsLabel, { label: string; color: string; bg: string; description: string }> = {
  "public-domain": {
    label: "Public Domain",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    description: "Verified public domain works that may be reproduced freely.",
  },
  "original": {
    label: "Original Lifewoven",
    color: "text-accent",
    bg: "bg-accent/5 border-accent/20",
    description: "Original content created by Lifewoven.",
  },
  "licensed": {
    label: "Licensed",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    description: "Content used under license from the original rights holder.",
  },
};

const MODULE_COLORS: Record<string, string> = {
  state: "text-state", story: "text-story", standards: "text-standards",
  strategy: "text-strategy", stewardship: "text-stewardship",
};

const CATEGORIES = [
  { id: "soul-engineer", label: "Soul Engineer Method", icon: Sparkles },
  { id: "all", label: "All Resources", icon: Library },
  { id: "text", label: "Texts & Guides", icon: BookOpen },
  { id: "guided-practice", label: "Guided Practices", icon: FileText },
  { id: "summary", label: "Summaries", icon: FileText },
];

export default function ResourceLibrary() {
  const { user } = useAuth();
  const membershipTier = (user as any)?.membershipTier as string | undefined;
  const { data: access } = trpc.store.getAccess.useQuery(undefined, { enabled: !!user });
  const hasPaidLibraryAccess = membershipTier === "oracle" || membershipTier === "seeker" || !!access?.isBetaMember;
  const [activeCategory, setActiveCategory] = useState("soul-engineer");
  const [activeModule, setActiveModule] = useState("");
  const [activeRights, setActiveRights] = useState<RightsLabel | "">("");
  const [showRightsInfo, setShowRightsInfo] = useState(false);
  const modules = ["state", "story", "standards", "strategy", "stewardship"];

  const filtered = RESOURCES.filter(r => {
    const catMatch = activeCategory === "all" || r.category === activeCategory;
    const modMatch = !activeModule || r.module === activeModule;
    const rightsMatch = !activeRights || r.rights === activeRights;
    return catMatch && modMatch && rightsMatch;
  }).sort((a, b) => {
    // Soul Engineer entries always appear first in the All view
    if (activeCategory === "all") {
      if (a.category === "soul-engineer" && b.category !== "soul-engineer") return -1;
      if (a.category !== "soul-engineer" && b.category === "soul-engineer") return 1;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-[calc(5.5rem+env(safe-area-inset-top))] pb-[calc(7rem+env(safe-area-inset-bottom))] max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Library</p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foreground mb-4">Resource Library</h1>
          <p className="text-muted-foreground text-lg font-light max-w-2xl leading-relaxed">
            A curated working library for clearer decisions, steadier practice, and a life that holds its shape. Every resource is organized through the 5S Framework and labeled with its content rights.
          </p>
        </div>

        {/* Content Rights Notice */}
        <div className={`rounded-xl border p-4 mb-8 transition-all ${showRightsInfo ? "border-accent/30 bg-accent/5" : "border-border bg-card"}`}>
          <button
            onClick={() => setShowRightsInfo(s => !s)}
            className="flex items-center gap-2 w-full text-left"
          >
            <Shield className="h-4 w-4 text-accent shrink-0" />
            <span className="text-sm font-medium text-foreground">Content Rights System</span>
            <Info className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
          </button>
          {showRightsInfo && (
            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              {(Object.entries(RIGHTS_CONFIG) as [RightsLabel, typeof RIGHTS_CONFIG[RightsLabel]][]).map(([key, cfg]) => (
                <div key={key} className={`p-3 rounded-lg border text-sm ${cfg.bg}`}>
                  <p className={`font-medium text-xs mb-1 ${cfg.color}`}>{cfg.label}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{cfg.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-10">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm transition-colors ${activeCategory === cat.id ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-muted-foreground"}`}>
                  <Icon className="h-3.5 w-3.5" /> {cat.label}
                </button>
              );
            })}
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            <button onClick={() => setActiveModule("")}
              className={`shrink-0 text-xs px-3 py-2.5 rounded-full border transition-colors ${!activeModule ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"}`}>
              All Modules
            </button>
            {modules.map(m => (
              <button key={m} onClick={() => setActiveModule(activeModule === m ? "" : m)}
                className={`shrink-0 text-xs px-3 py-2.5 rounded-full border transition-colors capitalize ${activeModule === m ? `border-current bg-current/10 ${MODULE_COLORS[m]}` : "border-border text-muted-foreground"}`}>
                {m}
              </button>
            ))}
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            <button onClick={() => setActiveRights("")}
              className={`shrink-0 text-xs px-3 py-2.5 rounded-full border transition-colors ${!activeRights ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"}`}>
              All Rights
            </button>
            {(["public-domain", "original", "licensed"] as RightsLabel[]).map(r => (
              <button key={r} onClick={() => setActiveRights(activeRights === r ? "" : r)}
                className={`shrink-0 text-xs px-3 py-2.5 rounded-full border transition-colors ${activeRights === r ? `${RIGHTS_CONFIG[r].color} ${RIGHTS_CONFIG[r].bg}` : "border-border text-muted-foreground"}`}>
                {RIGHTS_CONFIG[r].label}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(resource => {
            const rights = RIGHTS_CONFIG[resource.rights];
            const canRead = resource.free || hasPaidLibraryAccess;
            return (
              <div key={resource.id} className="p-5 rounded-2xl border border-border bg-card hover:border-primary/45 transition-all group flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-1.5 mb-1.5">
                      <span className={`text-xs capitalize font-medium ${MODULE_COLORS[resource.module]}`}>{resource.module}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{resource.type}</span>
                      {resource.free && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">Free</span>
                      )}
                    </div>
                    <h3 className="font-medium text-foreground text-base leading-snug">{resource.title}</h3>
                    <p className="text-base text-muted-foreground mt-0.5">{resource.author}</p>
                  </div>
                  {/* Rights badge */}
                  <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${rights.color} ${rights.bg}`}>
                    {rights.label}
                  </span>
                </div>

                <p className="text-base text-muted-foreground font-light leading-relaxed mb-3 flex-1">{resource.description}</p>

                {resource.rightsNote && (
                  <p className="text-sm text-muted-foreground/70 italic leading-relaxed mb-3 border-l-2 border-border pl-2">
                    {resource.rightsNote}
                  </p>
                )}

                {resource.slug && canRead ? (
                  <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                    <Link href={`/library/${resource.slug}`}>
                      <ArrowRight className="h-3 w-3" /> Read
                    </Link>
                  </Button>
                ) : resource.free ? (
                  <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                    <Link href={`/weave?module=${resource.module}&prompt=Reflecting on: ${encodeURIComponent(resource.title)}`}>
                      <ArrowRight className="h-3 w-3" /> Explore & Journal
                    </Link>
                  </Button>
                ) : hasPaidLibraryAccess ? (
                  <span className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-accent/20 bg-accent/5 px-3 text-xs text-accent">
                    <Sparkles className="h-3.5 w-3.5" /> Included with your membership
                  </span>
                ) : (
                  <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                    <Link href="/pricing?tier=seeker">
                      <ExternalLink className="h-3 w-3" /> Unlock the full library with Seeker
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Library className="h-10 w-10 mx-auto mb-4 opacity-30" />
            <p className="font-serif text-lg font-light">No resources match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
