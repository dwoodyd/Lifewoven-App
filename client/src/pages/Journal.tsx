import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BookOpen, Plus, Sparkles, Search, Tag, ArrowRight, Loader2, Pencil } from "lucide-react";
import VoiceRecorder from "@/components/VoiceRecorder";
import { Streamdown } from "streamdown";

const MODULE_COLORS: Record<string, string> = {
  state: "text-state", story: "text-story", standards: "text-standards",
  strategy: "text-strategy", stewardship: "text-stewardship",
};

const DEFAULT_PROMPTS = [
  "What am I most grateful for right now?",
  "What is the most important thing I can focus on today?",
  "What constraining belief showed up for me recently?",
  "How am I feeling in my body right now?",
  "What would the best version of me do today?",
  "What meaning am I finding in my current challenges?",
  "What habit is serving me well? What habit needs work?",
  "What decision am I avoiding, and why?",
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
  const [selectedModule, setSelectedModule] = useState(urlModule);
  const [searchQuery, setSearchQuery] = useState("");
  const [isWriting, setIsWriting] = useState(!!urlPrompt);
  const [currentPrompt, setCurrentPrompt] = useState(urlPrompt);
  const [aiReflection, setAiReflection] = useState("");
  const [isGettingReflection, setIsGettingReflection] = useState(false);

  useEffect(() => { if (urlPrompt) { setCurrentPrompt(urlPrompt); setIsWriting(true); } }, [urlPrompt]);

  const { data: entries, refetch } = trpc.journal.list.useQuery({ module: selectedModule || undefined, search: searchQuery || undefined }, { enabled: isAuthenticated });
  const createEntry = trpc.journal.create.useMutation({
    onSuccess: () => { toast.success("Entry saved."); setContent(""); setTitle(""); setTags(""); setIsWriting(false); refetch(); },
  });
  const [savedEntryId, setSavedEntryId] = useState<number | null>(null);
  const getReflection = trpc.journal.generateReflection.useMutation({
    onSuccess: (data: any) => { setAiReflection(data.reflection); setIsGettingReflection(false); },
    onError: () => setIsGettingReflection(false),
  });

  const handleGetReflection = () => {
    if (!content.trim()) return;
    setIsGettingReflection(true);
    // First save the entry, then reflect on it
    createEntry.mutate(
      { title: title || undefined, content, module: selectedModule as any || undefined, tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined },
      { onSuccess: () => { /* entry saved, but we need the id - use a workaround via direct reflection */ getReflection.mutate({ entryId: 0, content }); } }
    );
  };

  const modules = ["state", "story", "standards", "strategy", "stewardship"];

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 sm:p-3 rounded-xl bg-secondary flex-shrink-0"><BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" /></div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-1">Journal</h1>
              <p className="text-muted-foreground text-sm font-light">Your private space for reflection, clarity, and growth.</p>
            </div>
          </div>
          {isAuthenticated && !isWriting && (
            <Button onClick={() => setIsWriting(true)} size="sm" className="gap-1.5 flex-shrink-0"><Plus className="h-4 w-4" /><span className="hidden sm:inline">New Entry</span><span className="sm:hidden">New</span></Button>
          )}
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
              placeholder={currentPrompt ? `Responding to: "${currentPrompt}"\n\nWrite freely...` : "Write freely..."}
              value={content}
              onChange={e => setContent(e.target.value)}
              className="resize-none text-sm font-light leading-relaxed mb-3 min-h-[200px]"
              rows={8}
            />
            <div className="flex flex-wrap gap-2 mb-4">
              {modules.map(m => (
                <button key={m} onClick={() => setSelectedModule(selectedModule === m ? "" : m)} className={`text-xs px-2.5 py-1 rounded-full border transition-colors capitalize ${selectedModule === m ? `border-current bg-current/10 ${MODULE_COLORS[m]}` : "border-border text-muted-foreground"}`}>{m}</button>
              ))}
            </div>
            <Input placeholder="Tags (comma separated: gratitude, morning, insight...)" value={tags} onChange={e => setTags(e.target.value)} className="mb-4 text-sm" />
            {aiReflection && (
              <div className="mb-4 p-4 rounded-xl bg-secondary/50">
                <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-2">Oracle Reflection</p>
                <Streamdown className="text-sm text-foreground leading-relaxed">{aiReflection}</Streamdown>
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              <VoiceRecorder onTranscription={(text) => setContent(prev => prev ? prev + "\n\n" + text : text)} />
              <Button onClick={() => createEntry.mutate({ title: title || undefined, content, module: selectedModule as any || undefined, tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined })} disabled={!content.trim() || createEntry.isPending} className="gap-2">
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
                  <div className="flex gap-1 overflow-x-auto flex-shrink-0">
                    <button onClick={() => setSelectedModule("")} className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${!selectedModule ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"}`}>All</button>
                    {modules.map(m => { const abbr: Record<string,string> = { state:'State', story:'Story', standards:'Stds', strategy:'Strat', stewardship:'Stew' }; return <button key={m} title={m.charAt(0).toUpperCase()+m.slice(1)} onClick={() => setSelectedModule(selectedModule === m ? '' : m)} className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${selectedModule === m ? `border-current bg-current/10 ${MODULE_COLORS[m]}` : 'border-border text-muted-foreground'}`}>{abbr[m]}</button>; })}
                  </div>
                </div>
                {entries && entries.length > 0 ? (
                  <div className="space-y-3">
                    {entries.map((entry: any) => (
                      <Link key={entry.id} href={`/journal/${entry.id}`}>
                        <div className="p-4 rounded-xl border border-border bg-card hover:border-muted-foreground transition-all cursor-pointer">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-medium text-foreground text-base">{entry.title || "Untitled Entry"}</h3>
                            <span className="text-xs text-muted-foreground flex-shrink-0">{new Date(entry.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{entry.content}</p>
                          <div className="flex items-center gap-2">
                            {entry.module && <Badge variant="secondary" className={`text-xs capitalize ${MODULE_COLORS[entry.module]}`}>{entry.module}</Badge>}
                            {entry.tags && entry.tags.slice(0, 3).map((tag: string) => <span key={tag} className="text-xs text-muted-foreground">#{tag}</span>)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-serif text-lg font-light text-foreground mb-2">Your journal is empty.</p>
                    <p className="text-base text-muted-foreground mb-6">Begin with a prompt below, or write freely.</p>
                    <Button onClick={() => setIsWriting(true)} className="gap-2"><Plus className="h-4 w-4" /> First Entry</Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-serif text-lg font-light text-foreground mb-2">Sign in to access your journal.</p>
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
                {modules.map(m => (
                  <button key={m} onClick={() => setSelectedModule(selectedModule === m ? "" : m)} className={`w-full text-left p-2 rounded-lg transition-colors capitalize text-sm flex items-center justify-between ${selectedModule === m ? "bg-secondary" : "hover:bg-secondary/50"}`}>
                    <span className={selectedModule === m ? MODULE_COLORS[m] : "text-muted-foreground"}>{m}</span>
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
