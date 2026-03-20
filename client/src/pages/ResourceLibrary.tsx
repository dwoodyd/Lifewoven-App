import { useState } from "react";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Library, BookOpen, Headphones, FileText, ArrowRight, ExternalLink } from "lucide-react";

const RESOURCES = [
  { id: 1, category: "text", module: "state", title: "The Emotional Guidance Scale", author: "Abraham-Hicks", description: "The complete 22-level emotional scale from despair to joy, with guidance on how to use it as your inner GPS.", type: "Guide", free: true },
  { id: 2, category: "text", module: "story", title: "Creative Mind and Success", author: "Ernest Holmes", description: "Holmes' foundational work on the power of thought to create material reality. Public domain. Read in full.", type: "Book", free: true },
  { id: 3, category: "text", module: "stewardship", title: "Living the Science of Mind", author: "Ernest Holmes", description: "Daily readings and meditations from Holmes' Science of Mind teachings. A companion for daily practice.", type: "Book", free: true },
  { id: 4, category: "text", module: "story", title: "The Processes to Raise Your Emotional Set Point", author: "Abraham-Hicks", description: "22 practical processes for shifting your emotional baseline upward, from the Abraham-Hicks teachings.", type: "Guide", free: true },
  { id: 5, category: "audio", module: "state", title: "Getting Into the Vortex Meditation", author: "Abraham-Hicks", description: "Guided meditation for entering the Vortex — the vibrational space where all desires are held.", type: "Meditation", free: false },
  { id: 6, category: "text", module: "standards", title: "The Four Laws of Behavior Change", author: "James Clear", description: "A summary of the core framework from Atomic Habits: Make It Obvious, Attractive, Easy, and Satisfying.", type: "Summary", free: true },
  { id: 7, category: "text", module: "story", title: "Logotherapy in a Nutshell", author: "Viktor Frankl", description: "Frankl's core philosophy of meaning-centered therapy, extracted from Man's Search for Meaning.", type: "Summary", free: true },
  { id: 8, category: "text", module: "state", title: "The Art of Allowing", author: "Abraham-Hicks", description: "The third element of deliberate creation: allowing your desires to manifest by releasing resistance.", type: "Guide", free: false },
  { id: 9, category: "audio", module: "stewardship", title: "Morning Alignment Meditation", author: "LifeOS", description: "A 15-minute guided morning practice to anchor you in alignment before the day begins.", type: "Meditation", free: true },
  { id: 10, category: "text", module: "strategy", title: "The Leverage Mapper", author: "LifeOS", description: "A guided exercise for identifying the highest-leverage actions in your life and work right now.", type: "Exercise", free: true },
  { id: 11, category: "text", module: "story", title: "Creative Flowdreaming Overview", author: "Summer McStravick", description: "An introduction to Flowdreaming — the practice of manifesting through emotional immersion in desired futures.", type: "Overview", free: true },
  { id: 12, category: "audio", module: "story", title: "Belief Rewrite Meditation", author: "LifeOS", description: "A guided audio session for identifying and rewriting a core limiting belief using the Story module framework.", type: "Meditation", free: false },
];

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
  const modules = ["state", "story", "standards", "strategy", "stewardship"];
  const filtered = RESOURCES.filter(r => {
    const catMatch = activeCategory === "all" || r.category === activeCategory;
    const modMatch = !activeModule || r.module === activeModule;
    return catMatch && modMatch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-24 pb-20 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Library</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">Resource Library</h1>
          <p className="text-muted-foreground text-lg font-light max-w-xl mx-auto">The distilled wisdom of the ages, organized by the 5S Framework. Texts, guides, meditations, and summaries.</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-colors ${activeCategory === cat.id ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-muted-foreground"}`}><Icon className="h-3.5 w-3.5" /> {cat.label}</button>;
          })}
        </div>
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <button onClick={() => setActiveModule("")} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!activeModule ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"}`}>All Modules</button>
          {modules.map(m => <button key={m} onClick={() => setActiveModule(activeModule === m ? "" : m)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${activeModule === m ? `border-current bg-current/10 ${MODULE_COLORS[m]}` : "border-border text-muted-foreground"}`}>{m}</button>)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(resource => (
            <div key={resource.id} className="p-5 rounded-2xl border border-border bg-card hover:border-muted-foreground transition-all">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs capitalize font-medium ${MODULE_COLORS[resource.module]}`}>{resource.module}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{resource.type}</span>
                    {resource.free && <span className="text-xs px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">Free</span>}
                  </div>
                  <h3 className="font-medium text-foreground text-sm">{resource.title}</h3>
                  <p className="text-xs text-muted-foreground">{resource.author}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-light leading-relaxed mt-2 mb-3">{resource.description}</p>
              {resource.free ? (
                <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                  <Link href={`/journal?module=${resource.module}&prompt=Reflecting on: ${encodeURIComponent(resource.title)}`}>
                    <ArrowRight className="h-3 w-3" /> Explore & Journal
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                  <Link href="/pricing"><ExternalLink className="h-3 w-3" /> Unlock with Membership</Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
