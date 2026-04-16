import { useState } from "react";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Library, BookOpen, Headphones, FileText, ArrowRight, ExternalLink, Info, Shield } from "lucide-react";

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
    id: 5, category: "audio", module: "state",
    title: "Entering Alignment — Guided Practice",
    author: "Lifewoven",
    description: "An original Lifewoven guided meditation for entering a state of interior alignment.",
    type: "Meditation", free: false,
    rights: "original",
    rightsNote: "Original Lifewoven audio content.",
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
    id: 9, category: "text", module: "stewardship", slug: "morning-alignment-text-companion",
    title: "Morning Alignment — Text Companion",
    author: "Lifewoven",
    description: "A 15-minute original guided morning practice to anchor you in alignment before the day begins.",
    type: "Meditation", free: true,
    rights: "original",
    rightsNote: "Original Lifewoven audio content.",
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
    id: 12, category: "audio", module: "story",
    title: "Belief Rewrite Meditation",
    author: "Lifewoven",
    description: "A guided audio session for identifying and rewriting a core constraining belief using the Story module framework.",
    type: "Meditation", free: false,
    rights: "original",
    rightsNote: "Original Lifewoven audio content.",
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
  { id: "all", label: "All Resources", icon: Library },
  { id: "text", label: "Texts & Guides", icon: BookOpen },
  { id: "audio", label: "Audio", icon: Headphones },
  { id: "summary", label: "Summaries", icon: FileText },
];

export default function ResourceLibrary() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeModule, setActiveModule] = useState("");
  const [activeRights, setActiveRights] = useState<RightsLabel | "">("");
  const [showRightsInfo, setShowRightsInfo] = useState(false);
  const modules = ["state", "story", "standards", "strategy", "stewardship"];

  const filtered = RESOURCES.filter(r => {
    const catMatch = activeCategory === "all" || r.category === activeCategory;
    const modMatch = !activeModule || r.module === activeModule;
    const rightsMatch = !activeRights || r.rights === activeRights;
    return catMatch && modMatch && rightsMatch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Library</p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foreground mb-4">Resource Library</h1>
          <p className="text-muted-foreground text-lg font-light max-w-2xl">
            The distilled wisdom of the ages, organized by the 5S Framework. Every resource is clearly labeled by content rights so you always know what you are working with.
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
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-colors ${activeCategory === cat.id ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-muted-foreground"}`}>
                  <Icon className="h-3.5 w-3.5" /> {cat.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveModule("")}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!activeModule ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"}`}>
              All Modules
            </button>
            {modules.map(m => (
              <button key={m} onClick={() => setActiveModule(activeModule === m ? "" : m)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${activeModule === m ? `border-current bg-current/10 ${MODULE_COLORS[m]}` : "border-border text-muted-foreground"}`}>
                {m}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveRights("")}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!activeRights ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"}`}>
              All Rights
            </button>
            {(["public-domain", "original", "licensed"] as RightsLabel[]).map(r => (
              <button key={r} onClick={() => setActiveRights(activeRights === r ? "" : r)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${activeRights === r ? `${RIGHTS_CONFIG[r].color} ${RIGHTS_CONFIG[r].bg}` : "border-border text-muted-foreground"}`}>
                {RIGHTS_CONFIG[r].label}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(resource => {
            const rights = RIGHTS_CONFIG[resource.rights];
            return (
              <div key={resource.id} className="p-5 rounded-2xl border border-border bg-card hover:border-muted-foreground transition-all group">
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

                <p className="text-base text-muted-foreground font-light leading-relaxed mb-3">{resource.description}</p>

                {resource.rightsNote && (
                  <p className="text-sm text-muted-foreground/70 italic leading-relaxed mb-3 border-l-2 border-border pl-2">
                    {resource.rightsNote}
                  </p>
                )}

                {resource.slug ? (
                  <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                    <Link href={`/library/${resource.slug}`}>
                      <ArrowRight className="h-3 w-3" /> Read
                    </Link>
                  </Button>
                ) : resource.free ? (
                  <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                    <Link href={`/journal?module=${resource.module}&prompt=Reflecting on: ${encodeURIComponent(resource.title)}`}>
                      <ArrowRight className="h-3 w-3" /> Explore & Journal
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                    <Link href="/pricing">
                      <ExternalLink className="h-3 w-3" /> Unlock with Membership
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
