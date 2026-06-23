/**
 * MyLibrary.tsx — Personal Reading Companion
 *
 * The Library is a personal reading companion. Users add books, articles,
 * or pasted text. The AI can answer questions about the content with
 * pathway context. Highlights and AI responses can be sent to The Weave.
 *
 * Route: /my-library
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  BookOpen, Plus, Trash2, MessageSquare, ArrowRight,
  FileText, Globe, Loader2, BookMarked, Send, Bookmark, X,
} from "lucide-react";
import { getLoginUrl } from "@/const";

// ─── Types ────────────────────────────────────────────────────────────────────

type SourceType = "text" | "url";

const PATHWAY_OPTIONS = [
  { value: "align", label: "Align" },
  { value: "resonance", label: "Resonance" },
  { value: "uplift", label: "Uplift" },
  { value: "flow", label: "Flow" },
  { value: "rhythms", label: "Rhythms" },
  { value: "purpose", label: "Purpose" },
  { value: "reset", label: "Reset" },
];

// ─── Add Resource Dialog ──────────────────────────────────────────────────────

function AddResourceDialog({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [sourceType, setSourceType] = useState<SourceType>("text");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [pathwayTags, setPathwayTags] = useState<string[]>([]);

  const addMutation = trpc.library.add.useMutation({
    onSuccess: () => {
      toast.success("Resource added to your library.");
      setTitle(""); setAuthor(""); setContent(""); setPathwayTags([]);
      onAdded();
      onClose();
    },
    onError: () => toast.error("Could not add resource. Please try again."),
  });

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required.");
      return;
    }
    addMutation.mutate({ title: title.trim(), author: author.trim() || undefined, sourceType, content: content.trim(), pathwayTags });
  };

  const togglePathway = (val: string) => {
    setPathwayTags(prev => prev.includes(val) ? prev.filter(p => p !== val) : [...prev, val]);
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add to Your Library</DialogTitle>
          <DialogDescription>
            Paste text from a book, article, or any source you want to explore with the AI.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Source type */}
          <div className="flex gap-2">
            {(["text", "url"] as SourceType[]).map(t => (
              <button
                key={t}
                onClick={() => setSourceType(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm transition-colors
                  ${sourceType === t ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-muted-foreground"}`}
              >
                {t === "text" ? <FileText className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                {t === "text" ? "Paste Text" : "URL / Link"}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <Label htmlFor="lib-title">Title *</Label>
            <Input id="lib-title" placeholder="e.g. Build a Life That Does Not Break You" value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="lib-author">Author (optional)</Label>
            <Input id="lib-author" placeholder="e.g. DeWayne Woods" value={author} onChange={e => setAuthor(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="lib-content">
              {sourceType === "text" ? "Paste text *" : "URL *"}
            </Label>
            {sourceType === "text" ? (
              <Textarea
                id="lib-content"
                placeholder="Paste the text you want to explore…"
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={6}
                className="resize-none text-sm"
              />
            ) : (
              <Input
                id="lib-content"
                placeholder="https://…"
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            )}
          </div>

          {/* Pathway tags */}
          <div className="space-y-2">
            <Label>Pathway tags (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {PATHWAY_OPTIONS.map(p => (
                <button
                  key={p.value}
                  onClick={() => togglePathway(p.value)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors
                    ${pathwayTags.includes(p.value) ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-muted-foreground"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={addMutation.isPending}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={addMutation.isPending} className="gap-2">
              {addMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add to Library
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────

function ChatPanel({
  resourceId,
  resourceTitle,
  resourceAuthor,
  onClose,
}: {
  resourceId: number;
  resourceTitle: string;
  resourceAuthor?: string | null;
  onClose: () => void;
}) {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [activePathway, setActivePathway] = useState("");
  const [localMessages, setLocalMessages] = useState<Array<{ role: "user" | "assistant"; content: string; id?: number }>>([]);
  const [sending, setSending] = useState(false);

  const getOrCreateSession = trpc.library.getOrCreateSession.useMutation({
    onSuccess: (session) => {
      setSessionId(session.id);
    },
  });

  const chatMutation = trpc.library.chat.useMutation({
    onSuccess: (data) => {
      setLocalMessages(prev => [...prev, { role: "assistant", content: data.content, id: data.messageId }]);
      setSending(false);
    },
    onError: () => {
      setSending(false);
      toast.error("Could not get a response. Please try again.");
    },
  });

  const sendToWeaveMutation = trpc.library.sendToWeave.useMutation({
    onSuccess: () => toast.success("Sent to The Weave."),
    onError: () => toast.error("Could not send to The Weave."),
  });

  // Start session on mount
  useState(() => {
    getOrCreateSession.mutate({ resourceId });
  });

  const handleSend = () => {
    if (!message.trim() || !sessionId || sending) return;
    const userMsg = message.trim();
    setMessage("");
    setSending(true);
    setLocalMessages(prev => [...prev, { role: "user", content: userMsg }]);
    chatMutation.mutate({ resourceId, sessionId, message: userMsg, activePathway: activePathway || undefined });
  };

  const handleSendToWeave = (content: string, msgId?: number) => {
    sendToWeaveMutation.mutate({
      sourceType: "message",
      sourceId: msgId ?? 0,
      resourceTitle,
      resourceAuthor: resourceAuthor ?? undefined,
      content,
      pathwayTag: activePathway || undefined,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-0.5">Reading companion</p>
          <h3 className="font-medium text-foreground text-sm leading-snug truncate">{resourceTitle}</h3>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors ml-3 flex-shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Pathway selector */}
      <div className="px-5 py-3 border-b border-border/50">
        <Select value={activePathway} onValueChange={setActivePathway}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="No pathway context" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No pathway context</SelectItem>
            {PATHWAY_OPTIONS.map(p => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
        {localMessages.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Ask anything about this text.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">The AI will draw from the passages you added.</p>
          </div>
        )}
        {localMessages.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                ${msg.role === "user"
                  ? "bg-foreground text-background"
                  : "bg-secondary text-foreground"
                }`}
            >
              {msg.content}
            </div>
            {msg.role === "assistant" && msg.id && (
              <button
                onClick={() => handleSendToWeave(msg.content, msg.id)}
                className="text-[10px] font-mono tracking-[0.12em] uppercase text-muted-foreground/60 hover:text-accent transition-colors flex items-center gap-1"
              >
                <BookMarked className="h-3 w-3" /> Send to Weave
              </button>
            )}
          </div>
        ))}
        {sending && (
          <div className="flex items-start">
            <div className="bg-secondary rounded-2xl px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about this text…"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="text-sm"
            disabled={sending || !sessionId}
          />
          <Button size="icon" onClick={handleSend} disabled={!message.trim() || sending || !sessionId}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MyLibrary() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [showAdd, setShowAdd] = useState(false);
  const [chatResource, setChatResource] = useState<{ id: number; title: string; author?: string | null } | null>(null);

  const { data: resources, refetch, isLoading } = trpc.library.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const deleteMutation = trpc.library.delete.useMutation({
    onSuccess: () => {
      toast.success("Resource removed from your library.");
      refetch();
    },
    onError: () => toast.error("Could not delete resource."),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Nav />
        <div className="max-w-[480px] mx-auto px-6 pt-32 pb-24 text-center">
          <BookOpen className="h-10 w-10 mx-auto mb-5 text-muted-foreground/40" />
          <h1
            className="text-foreground mb-3"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "2rem", fontWeight: 500 }}
          >
            Your Library
          </h1>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Add books, articles, and passages. Explore them with the AI. Send insights to The Weave.
          </p>
          <Button asChild>
            <a href={getLoginUrl()}>Sign in to get started</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <div className={`flex h-[calc(100vh-64px)] mt-16 ${chatResource ? "overflow-hidden" : ""}`}>

        {/* ─── Main column ─── */}
        <div className={`flex-1 overflow-y-auto px-6 py-8 ${chatResource ? "max-w-[55%]" : "max-w-[680px] mx-auto"}`}>

          {/* Header */}
          <div className="mb-8">
            <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase mb-3">
              Personal Library
            </p>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1
                  className="text-foreground mb-2 leading-tight"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "clamp(2rem, 5vw, 2.8rem)",
                    fontWeight: 500,
                  }}
                >
                  Your Library
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[440px]">
                  Add books, articles, and passages. Explore them with the AI. Send insights to The Weave.
                </p>
              </div>
              <Button onClick={() => setShowAdd(true)} className="gap-2 flex-shrink-0">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          {/* Resource list */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-2xl bg-secondary/40 animate-pulse" />
              ))}
            </div>
          ) : !resources || resources.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-10 w-10 mx-auto mb-4 text-muted-foreground/30" />
              <p
                className="text-muted-foreground mb-2"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: "1.1rem" }}
              >
                Your library is empty.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Add a book, article, or passage to begin.
              </p>
              <Button variant="outline" onClick={() => setShowAdd(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add your first resource
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map(resource => (
                <div
                  key={resource.id}
                  className={`rounded-2xl border border-border bg-card p-5 transition-all duration-150
                    ${chatResource?.id === resource.id ? "border-accent/40 bg-accent/5" : "hover:border-muted-foreground/40"}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-secondary"
                    >
                      {resource.sourceType === "pdf" ? (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      ) : resource.sourceType === "url" ? (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-medium text-foreground text-sm leading-snug">{resource.title}</h3>
                          {resource.author && (
                            <p className="text-xs text-muted-foreground mt-0.5">{resource.author}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Status badge */}
                          {resource.status !== "ready" && (
                            <span className={`text-[10px] font-mono tracking-wide px-2 py-0.5 rounded-full border
                              ${resource.status === "processing" ? "border-amber-400/30 text-amber-600 bg-amber-50/50" :
                                resource.status === "error" ? "border-red-400/30 text-red-600 bg-red-50/50" :
                                "border-border text-muted-foreground"}`}>
                              {resource.status}
                            </span>
                          )}
                          <button
                            onClick={() => deleteMutation.mutate({ id: resource.id })}
                            className="text-muted-foreground/40 hover:text-destructive transition-colors p-1"
                            title="Remove from library"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wide">
                          {resource.sourceType}
                        </span>
                        {resource.wordCount > 0 && (
                          <span className="text-[10px] text-muted-foreground/60">
                            {resource.wordCount.toLocaleString()} words
                          </span>
                        )}
                        {(resource.pathwayTags as string[] ?? []).map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground/60">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      {resource.status === "ready" && (
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs h-7"
                            onClick={() => setChatResource({ id: resource.id, title: resource.title, author: resource.author })}
                          >
                            <MessageSquare className="h-3 w-3" />
                            Ask the AI
                          </Button>
                          <Link
                            href={`/weave?prompt=${encodeURIComponent(`Reflecting on: ${resource.title}`)}`}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                          >
                            <BookMarked className="h-3 w-3" />
                            Journal about it
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Chat panel ─── */}
        {chatResource && (
          <div className="w-[45%] max-w-[480px] border-l border-border bg-background flex flex-col">
            <ChatPanel
              resourceId={chatResource.id}
              resourceTitle={chatResource.title}
              resourceAuthor={chatResource.author}
              onClose={() => setChatResource(null)}
            />
          </div>
        )}
      </div>

      {/* Add dialog */}
      <AddResourceDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdded={refetch}
      />
    </div>
  );
}
