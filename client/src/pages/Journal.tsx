import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useLuminMoment } from "@/components/LuminMoment";
import { LuminScene } from "@/components/LuminScene";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BookOpen, Plus, Sparkles, Search, Tag, ArrowRight, Loader2, Pencil, Download, Trash2 } from "lucide-react";
import { PullToRefresh } from "@/components/PullToRefresh";
import { SwipeableCard } from "@/components/SwipeableCard";
import { EmptyState } from "@/components/EmptyState";
import VoiceRecorder from "@/components/VoiceRecorder";
import { Streamdown } from "streamdown";
import { motion } from "framer-motion";
import { formatLifewovenDate, formatLifewovenToday } from "@/lib/datetime";

const MODULE_COLORS: Record<string, string> = {
  state: "text-state", story: "text-story", standards: "text-standards",
  strategy: "text-strategy", stewardship: "text-stewardship", free: "text-muted-foreground",
};

const DEFAULT_PROMPTS = [
  // Soul Engineer Method — 12 core prompts
  "What am I carrying right now that I haven't named yet?",
  "What is the load-bearing belief in this situation?",
  "What would I do if I trusted the structure I've built?",
  "What signal is my body sending that my mind is ignoring?",
  "What is the story I keep telling about this — and is it true?",
  "What would the version of me who has already solved this do first?",
  "Where am I spending energy I haven't consciously allocated?",
  "What am I tolerating that I've decided is permanent?",
  "What does this moment require of me — not what do I want it to require?",
  "What is the one thing that, if I did it, would make everything else easier?",
  "What capacity am I not using that this situation is calling for?",
  "What is the next honest step — not the perfect step, the honest one?",
];

export default function Journal() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const urlPrompt = params.get("prompt") || "";
  const urlModule = params.get("module") || "";

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [composerModule, setComposerModule] = useState(urlModule);
  const [searchQuery, setSearchQuery] = useState("");
  const [isWriting, setIsWriting] = useState(!!urlPrompt);
  const [currentPrompt, setCurrentPrompt] = useState(urlPrompt);
  const [aiReflection, setAiReflection] = useState("");
  const [isGettingReflection, setIsGettingReflection] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const exportData = trpc.journal.exportData.useQuery(
    { module: selectedModule || undefined, limit: 200 },
    { enabled: false } // only fetch on demand
  );

  async function handleExportPdf() {
    setIsExporting(true);
    try {
      const result = await exportData.refetch();
      const data = result.data;
      if (!data || data.entries.length === 0) {
        toast.info("No entries to export.");
        return;
      }
      const printWindow = window.open("", "_blank");
      if (!printWindow) { toast.error("Pop-up blocked. Please allow pop-ups and try again."); return; }
      const moduleLabel = selectedModule ? selectedModule.charAt(0).toUpperCase() + selectedModule.slice(1) : "All Modules";
      const dateStr = formatLifewovenToday({ month: "long" });
      const entriesHtml = data.entries.map((e: any) => `
        <div class="entry">
          <div class="entry-meta">${formatLifewovenDate(e.createdAt, { month: "long" })}${e.module ? ` · ${e.module}` : ""}</div>
          <h2>${(e.title || "Untitled Entry").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</h2>
          ${e.content.split("\n\n").map((p: string) => `<p>${p.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`).join("")}
          ${e.aiReflection ? `<blockquote class="reflection"><span class="reflection-label">Oracle Reflection</span>${e.aiReflection.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</blockquote>` : ""}
        </div>
      `).join("");
      const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>The Weave — ${moduleLabel} — Lifewoven</title><style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Inter',sans-serif;font-size:11pt;line-height:1.75;color:#1a1a1a;background:#fff;padding:0}
        @page{margin:2.2cm 2.8cm;size:A4}
        .cover{page-break-after:always;display:flex;flex-direction:column;justify-content:flex-end;min-height:100vh;padding-bottom:4cm}
        .brand{font-family:'Inter',sans-serif;font-size:8pt;letter-spacing:.18em;text-transform:uppercase;color:#888;margin-bottom:3cm}
        h1{font-family:'Cormorant Garamond',serif;font-size:34pt;font-weight:300;line-height:1.15;color:#111;margin-bottom:.6cm}
        .subtitle{font-family:'Cormorant Garamond',serif;font-size:14pt;font-weight:300;font-style:italic;color:#555;margin-bottom:.4cm}
        .meta{font-size:9pt;color:#888;letter-spacing:.06em}
        .entry{margin-bottom:2cm;page-break-inside:avoid}
        .entry-meta{font-size:8.5pt;color:#aaa;letter-spacing:.06em;text-transform:uppercase;margin-bottom:.3cm}
        h2{font-family:'Cormorant Garamond',serif;font-size:18pt;font-weight:400;color:#111;margin-bottom:.4cm}
        p{margin-bottom:.45cm;orphans:3;widows:3}
        blockquote.reflection{border-left:2px solid #c9a96e;padding-left:.7cm;margin:1cm 0;font-family:'Cormorant Garamond',serif;font-size:12pt;font-style:italic;color:#555;line-height:1.6}
        .reflection-label{display:block;font-family:'Inter',sans-serif;font-size:7.5pt;letter-spacing:.12em;text-transform:uppercase;color:#c9a96e;margin-bottom:.25cm;font-style:normal}
        .footer{position:fixed;bottom:1cm;left:2.8cm;right:2.8cm;display:flex;justify-content:space-between;font-size:8pt;color:#aaa;border-top:1px solid #eee;padding-top:.3cm}
        hr{border:none;border-top:1px solid #eee;margin:1.5cm 0}
      </style></head><body>
      <div class="cover">
        <div class="brand">Lifewoven · Personal Transformation Platform</div>
        <h1>The Weave</h1>
        <p class="subtitle">${moduleLabel} · ${data.entries.length} ${data.entries.length === 1 ? "entry" : "entries"}</p>
        <p class="meta">Exported ${dateStr}${data.userName ? ` · ${data.userName}` : ""}</p>
      </div>
      <div class="footer"><span>Lifewoven — lifewoven.click</span><span>The Weave · ${moduleLabel}</span></div>
      ${entriesHtml}
      </body></html>`;
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); }, 600);
    } finally {
      setIsExporting(false);
    }
  }

  useEffect(() => { if (urlPrompt) { setCurrentPrompt(urlPrompt); setIsWriting(true); } }, [urlPrompt]);

  const { data: entries, refetch } = trpc.journal.list.useQuery({ module: selectedModule || undefined, search: searchQuery || undefined }, { enabled: isAuthenticated });
  const { data: recentCheckIns = [] } = trpc.checkIn.recent.useQuery({ limit: 7 }, { enabled: isAuthenticated });
  const { triggerMoment } = useLuminMoment();
  const deleteMutation = trpc.journal.delete.useMutation({ onSuccess: () => { toast.success("Entry deleted."); refetch(); } });
  const createEntry = trpc.journal.create.useMutation({
    onSuccess: () => {
      toast.success("Entry saved.");
      // Journal save — Lumin waves sparkles in appreciation
      triggerMoment(Math.random() < 0.5 ? "waves_sparkles" : "nodding_gently");
      setContent(""); setTitle(""); setTags(""); setIsWriting(false); refetch();
    },
  });
  useEffect(() => {
    const syncPending = async () => {
      const pending = localStorage.getItem("lifewoven_pending_weave_entry");
      if (!pending || !navigator.onLine) return;
      try { await createEntry.mutateAsync(JSON.parse(pending)); localStorage.removeItem("lifewoven_pending_weave_entry"); }
      catch { /* retain until the next connection */ }
    };
    void syncPending();
    window.addEventListener("online", syncPending);
    return () => window.removeEventListener("online", syncPending);
  }, [createEntry]);

  const saveWeaveEntry = () => {
    const payload = { title: title.trim() || autoTitle(content), content, module: composerModule as any || undefined, tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined };
    if (!navigator.onLine) {
      localStorage.setItem("lifewoven_pending_weave_entry", JSON.stringify(payload));
      toast.success("Your Weave entry is saved on this device and will sync when you reconnect.");
      setIsWriting(false);
      return;
    }
    createEntry.mutate(payload, { onError: () => localStorage.setItem("lifewoven_pending_weave_entry", JSON.stringify(payload)) });
  };
  const [savedEntryId, setSavedEntryId] = useState<number | null>(null);
  const getReflection = trpc.journal.generateReflection.useMutation({
    onSuccess: (data: any) => { setAiReflection(data.reflection); setIsGettingReflection(false); },
    onError: () => setIsGettingReflection(false),
  });

  // Auto-generate a title from the first 6–8 words of content when none is provided
  function autoTitle(text: string): string {
    const words = text.trim().split(/\s+/).slice(0, 7).join(" ");
    return words.length < text.trim().length ? words + "\u2026" : words;
  }

  const handleGetReflection = () => {
    if (!content.trim()) return;
    setIsGettingReflection(true);
    const resolvedTitle = title.trim() || autoTitle(content);
    // First save the entry, then reflect on it
    createEntry.mutate(
      { title: resolvedTitle, content, module: composerModule as any || undefined, tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined },
      { onSuccess: () => { getReflection.mutate({ entryId: 0, content }); } }
    );
  };

  const modules = ["state", "story", "standards", "strategy", "stewardship"];
  const filterModules = ["free", ...modules];
  const moduleLabels: Record<string, string> = { free: "Free writing", state: "State", story: "Story", standards: "Standards", strategy: "Strategy", stewardship: "Stewardship" };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[calc(7rem+env(safe-area-inset-bottom))] max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative mb-6 min-h-[210px] overflow-hidden border-b border-primary/20 sm:min-h-[250px]">
          <div className="pointer-events-none absolute right-[-6%] top-1/2 hidden h-full w-[42%] -translate-y-1/2 sm:block" aria-hidden="true">
            <LuminScene videoId="tilting_listening" ambient loop ambientSize="100%" ambientPosition={{ position: "absolute", inset: 0 }} ambientAspectRatio="16 / 9" ambientFit="contain" ambientBlendMode="normal" ambientMaskImage="linear-gradient(to right, transparent 0%, rgba(0,0,0,0.7) 24%, #000 56%, #000 100%)" className="opacity-100" />
          </div>
          <div className="relative z-10 flex flex-col gap-4 pt-5 sm:max-w-[68%] sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 w-full">
            <div className="p-2.5 sm:p-3 rounded-xl bg-secondary flex-shrink-0"><BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" /></div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-1">The Weave</h1>
              <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-xl">The private record that holds every entry, every check-in, every reflection. The receipt that you’re doing the work.</p>
            </div>
          </div>
          {isAuthenticated && !isWriting && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={isExporting} className="gap-1.5">
                {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">Export PDF</span>
              </Button>
              <Button onClick={() => setIsWriting(true)} size="sm" className="gap-1.5 flex-1 sm:flex-none"><Plus className="h-4 w-4" /><span>New entry</span></Button>
            </div>
          )}
        </div>
        </div>

        {isWriting && (
          <div className="p-4 sm:p-6 rounded-2xl border border-border bg-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-light text-foreground">New Entry</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsWriting(false)}>Cancel</Button>
            </div>
            {currentPrompt && (
              <div className="mb-4 p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">Prompt</p>
                <p className="text-sm font-medium text-foreground italic">{currentPrompt}</p>
              </div>
            )}
            <Input placeholder="Title (optional)" value={title} onChange={e => setTitle(e.target.value)} className="mb-3 text-sm" />
            <Textarea
              placeholder={currentPrompt ? `Responding to: "${currentPrompt}"\n\nName what you're carrying. The building begins with honest seeing.` : "Name what you're carrying. The building begins with honest seeing."}
              value={content}
              onChange={e => setContent(e.target.value)}
              className="resize-y text-sm font-light leading-relaxed mb-3 min-h-[200px] scroll-mb-[45vh]"
              rows={8}
            />
            <div className="flex flex-wrap gap-2 mb-4">
              {modules.map(m => {
                const ABBR: Record<string,string> = { state: 'State', story: 'Story', standards: 'Standards', strategy: 'Strategy', stewardship: 'Stewardship' };
                return (
                  <button key={m} title={m.charAt(0).toUpperCase()+m.slice(1)} onClick={() => setComposerModule(composerModule === m ? '' : m)} className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${composerModule === m ? `border-current bg-current/10 ${MODULE_COLORS[m]}` : 'border-border text-muted-foreground'}`}>{ABBR[m] ?? m}</button>
                );
              })}
            </div>
            <Input placeholder="Tags (comma separated: load-bearing, signals, capacity...)" value={tags} onChange={e => setTags(e.target.value)} className="mb-4 text-sm" />
            {aiReflection && (
              <div className="mb-4 p-4 rounded-xl bg-secondary/50">
                <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-2">Oracle Reflection</p>
                <Streamdown className="text-sm text-foreground leading-relaxed">{aiReflection}</Streamdown>
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              <VoiceRecorder onTranscription={(text) => setContent(prev => prev ? prev + "\n\n" + text : text)} />
              <Button onClick={saveWeaveEntry} disabled={!content.trim() || createEntry.isPending} className="gap-2">
                {createEntry.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />} Save Entry
              </Button>
              <Button variant="outline" onClick={handleGetReflection} disabled={!content.trim() || isGettingReflection} className="gap-2">
                {isGettingReflection ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Oracle Reflect
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Search entries..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 text-sm" />
                  </div>
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
                    <button onClick={() => setSelectedModule("")} className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${!selectedModule ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"}`}>All</button>
                    {filterModules.map(m => <button key={m} title={moduleLabels[m]} onClick={() => setSelectedModule(selectedModule === m ? '' : m)} className={`shrink-0 text-xs px-2.5 py-2.5 rounded-lg border transition-colors ${selectedModule === m ? `border-current bg-current/10 ${MODULE_COLORS[m]}` : 'border-border text-muted-foreground'}`}>{m === "free" ? "Free" : moduleLabels[m]}</button>)}
                  </div>
                </div>
                {recentCheckIns.length > 0 && !searchQuery && !selectedModule && (
                  <section aria-label="Recent Daily Check-ins" className="border border-border bg-card/70 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xs font-mono tracking-[0.16em] uppercase text-muted-foreground">Recent Daily Check-ins</h3>
                      <span className="text-xs text-muted-foreground">{recentCheckIns.length} recorded</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {recentCheckIns.slice(0, 4).map((checkIn: any) => (
                        <div key={checkIn.id} className="border-l-2 border-accent/60 pl-3 py-1">
                          <p className="text-sm text-foreground">State {checkIn.emotionalScore}/22 · Energy {checkIn.energyLevel}/10 · Clarity {checkIn.clarityLevel}/10</p>
                          {checkIn.note && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{checkIn.note}</p>}
                          <p className="mt-1 text-xs text-muted-foreground">{formatLifewovenDate(checkIn.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {entries && entries.length > 0 ? (
                  <PullToRefresh onRefresh={async () => { await refetch(); }}>
                  <div className="space-y-3">
                    {entries.map((entry: any, idx: number) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.32), ease: [0.22, 1, 0.36, 1] }}
                      >
                      <SwipeableCard
                        leftActions={[{
                          icon: <Trash2 className="h-4 w-4" />,
                          label: "Delete",
                          color: "destructive",
                          onAction: () => {
                            if (confirm("Delete this entry?")) {
                              deleteMutation.mutate({ id: entry.id });
                            }
                          },
                        }]}
                      >
                        <Link href={`/weave/${entry.id}`}>
                          <div className="p-4 border border-border bg-card hover:border-accent/30 hover:bg-accent/3 transition-all duration-150 cursor-pointer group">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-medium text-foreground text-base">{entry.title || "Untitled Entry"}</h3>
                              <span className="text-xs text-muted-foreground flex-shrink-0">{formatLifewovenDate(entry.createdAt)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{entry.content}</p>
                            <div className="flex items-center gap-2">
                              {entry.module && <Badge variant="secondary" className={`text-xs capitalize ${MODULE_COLORS[entry.module]}`}>{entry.module}</Badge>}
                              {entry.tags && entry.tags.slice(0, 3).map((tag: string) => <span key={tag} className="text-xs text-muted-foreground">#{tag}</span>)}
                            </div>
                          </div>
                        </Link>
                      </SwipeableCard>
                      </motion.div>
                    ))}
                  </div>
                  </PullToRefresh>
                ) : (
                  <EmptyState
                    variant="journal"
                    title="The Weave is waiting for your first entry."
                    description="Choose a prompt from the Prompts panel, or write freely."
                    action={{ label: "First Entry", onClick: () => setIsWriting(true) }}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-serif text-lg font-light text-foreground mb-2">Sign in to access The Weave.</p>
                <Button asChild variant="outline"><Link href="/dashboard">Get Started</Link></Button>
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-4"><Sparkles className="h-4 w-4 text-muted-foreground" /><h2 className="font-serif text-base font-light text-foreground">Prompts</h2></div>
              <div className="space-y-2">
                {DEFAULT_PROMPTS.map(p => (
                  <button key={p} onClick={() => { setCurrentPrompt(p); setIsWriting(true); }} className="w-full text-left p-2.5 rounded-lg hover:bg-secondary/50 transition-colors group flex items-start gap-2">
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-foreground transition-colors" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{p}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-3"><Tag className="h-4 w-4 text-muted-foreground" /><h2 className="font-serif text-base font-light text-foreground">Modules</h2></div>
              <div className="space-y-1.5">
                {filterModules.map(m => (
                  <button key={m} onClick={() => setSelectedModule(selectedModule === m ? "" : m)} className={`w-full text-left p-2 rounded-lg transition-colors capitalize text-sm flex items-center justify-between ${selectedModule === m ? "bg-secondary" : "hover:bg-secondary/50"}`}>
                    <span className={selectedModule === m ? MODULE_COLORS[m] : "text-muted-foreground"}>{moduleLabels[m]}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
