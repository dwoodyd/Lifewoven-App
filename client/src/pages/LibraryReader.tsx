/**
 * LibraryReader.tsx — Resource Reader + Chat Sidebar
 *
 * Route: /my-library/:id
 *
 * Layout:
 *  - Desktop: reader (left, ~60%) + chat sidebar (right, ~40%)
 *  - Mobile: reader full-width, chat as bottom sheet
 *
 * Features:
 *  - Paginated text chunks (10 chunks per page)
 *  - Text selection → floating toolbar (Highlight | Ask about this | Send to Weave)
 *  - Highlights list (collapsible panel)
 *  - Chat sidebar with pathway context, Send to Weave confirmation sheet
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  ArrowLeft, BookOpen, BookMarked, Highlighter, MessageSquare,
  Send, Loader2, ChevronLeft, ChevronRight, X, ChevronDown,
  ChevronUp, Bookmark,
} from "lucide-react";
import { getLoginUrl } from "@/const";

// ─── Constants ────────────────────────────────────────────────────────────────

const CHUNKS_PER_PAGE = 10;

const PATHWAY_OPTIONS = [
  { value: "align",     label: "Align" },
  { value: "resonance", label: "Resonance" },
  { value: "uplift",    label: "Uplift" },
  { value: "flow",      label: "Flow" },
  { value: "rhythms",   label: "Rhythms" },
  { value: "purpose",   label: "Purpose" },
  { value: "reset",     label: "Reset" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface FloatingToolbar {
  x: number;
  y: number;
  text: string;
  chunkIndex: number;
}

interface LocalMessage {
  role: "user" | "assistant";
  content: string;
  id?: number;
}

// ─── Send to Weave Sheet ──────────────────────────────────────────────────────

function SendToWeaveSheet({
  open,
  onClose,
  content,
  resourceTitle,
  resourceAuthor,
  pathwayTag,
  reflectionPrompt,
  sourceType,
  sourceId,
  savingHighlight,
}: {
  open: boolean;
  onClose: () => void;
  content: string;
  resourceTitle: string;
  resourceAuthor?: string | null;
  pathwayTag?: string;
  reflectionPrompt?: string;
  sourceType: "highlight" | "message";
  sourceId: number;
  savingHighlight?: boolean;
}) {
  const [, navigate] = useLocation();
  const [userNote, setUserNote] = useState("");

  const sendToWeaveMutation = trpc.library.sendToWeave.useMutation({
    onSuccess: (data) => {
      toast.success("Added to your Weave", {
        action: {
          label: "View entry",
          onClick: () => navigate(`/weave/${data.entryId}`),
        },
      });
      setUserNote("");
      onClose();
    },
    onError: () => toast.error("Could not send to The Weave."),
  });

  const handleConfirm = () => {
    sendToWeaveMutation.mutate({
      sourceType,
      sourceId,
      resourceTitle,
      resourceAuthor: resourceAuthor ?? undefined,
      content,
      userNote: userNote.trim() || undefined,
      pathwayTag,
      reflectionPrompt,
    });
  };

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-base">Send to The Weave</SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          {/* Content preview */}
          <div className="rounded-xl bg-secondary/60 p-4">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-2">
              From: {resourceTitle}{resourceAuthor ? ` · ${resourceAuthor}` : ""}
            </p>
            <p className="text-sm text-foreground leading-relaxed line-clamp-4">{content}</p>
          </div>

          {/* Reflection question */}
          {reflectionPrompt && (
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
              <p className="text-xs font-mono text-accent uppercase tracking-wide mb-1">Reflection</p>
              <p className="text-sm text-foreground italic">{reflectionPrompt}</p>
            </div>
          )}

          {/* Pathway tag */}
          {pathwayTag && (
            <p className="text-xs text-muted-foreground">
              Pathway: <span className="text-foreground capitalize">{pathwayTag}</span>
            </p>
          )}

          {/* User note */}
          <div className="space-y-1">
            <Label htmlFor="weave-note" className="text-xs">Add a note (optional)</Label>
            <Textarea
              id="weave-note"
              placeholder="Your own reflection or reaction…"
              value={userNote}
              onChange={e => setUserNote(e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" size="sm" onClick={onClose} disabled={sendToWeaveMutation.isPending}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirm} disabled={sendToWeaveMutation.isPending || savingHighlight} className="gap-1.5">
              {sendToWeaveMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <BookMarked className="h-3.5 w-3.5" />
              )}
              Add to Weave
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Chat Sidebar ─────────────────────────────────────────────────────────────

function ChatSidebar({
  resourceId,
  resourceTitle,
  resourceAuthor,
  prefillMessage,
  onClearPrefill,
}: {
  resourceId: number;
  resourceTitle: string;
  resourceAuthor?: string | null;
  prefillMessage?: string;
  onClearPrefill: () => void;
}) {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [activePathway, setActivePathway] = useState("none");
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [weaveSheet, setWeaveSheet] = useState<{
    open: boolean;
    content: string;
    id: number;
    reflectionPrompt?: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getOrCreateSession = trpc.library.getOrCreateSession.useMutation({
    onSuccess: (session) => setSessionId(session.id),
  });

  const chatMutation = trpc.library.chat.useMutation({
    onSuccess: (data) => {
      setLocalMessages(prev => [...prev, {
        role: "assistant",
        content: data.content,
        id: data.messageId,
      }]);
      setSending(false);
    },
    onError: () => {
      setSending(false);
      toast.error("Could not get a response. Please try again.");
    },
  });

  // Start session on mount
  useEffect(() => {
    getOrCreateSession.mutate({ resourceId });
  }, [resourceId]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, sending]);

  // Handle prefill from text selection
  useEffect(() => {
    if (prefillMessage) {
      setMessage(prefillMessage);
      onClearPrefill();
    }
  }, [prefillMessage, onClearPrefill]);

  const handleSend = () => {
    if (!message.trim() || !sessionId || sending) return;
    const userMsg = message.trim();
    setMessage("");
    setSending(true);
    setLocalMessages(prev => [...prev, { role: "user", content: userMsg }]);
    chatMutation.mutate({
      resourceId,
      sessionId,
      message: userMsg,
      activePathway: activePathway !== "none" ? activePathway : undefined,
    });
  };

  // Extract the reflection question from the end of an assistant message
  const extractReflection = (content: string): { body: string; reflection?: string } => {
    const lines = content.trim().split("\n");
    const lastLine = lines[lines.length - 1];
    // Reflection questions typically end with "?"
    if (lastLine && lastLine.trim().endsWith("?") && lines.length > 2) {
      return {
        body: lines.slice(0, -1).join("\n").trim(),
        reflection: lastLine.trim(),
      };
    }
    return { body: content };
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-1">
          Reading companion
        </p>
        <h3 className="font-medium text-foreground text-sm leading-snug truncate">{resourceTitle}</h3>
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
        {activePathway && activePathway !== "none" && (
          <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            {PATHWAY_OPTIONS.find(p => p.value === activePathway)?.label} pathway active
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
        {localMessages.length === 0 && (
          <div className="text-center py-10">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Ask anything about this text.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Select a passage to ask about it, or type a question below.
            </p>
          </div>
        )}
        {localMessages.map((msg, i) => {
          const { body, reflection } = msg.role === "assistant"
            ? extractReflection(msg.content)
            : { body: msg.content, reflection: undefined };

          return (
            <div key={i} className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                  ${msg.role === "user"
                    ? "bg-foreground text-background"
                    : "bg-secondary text-foreground"
                  }`}
              >
                {body}
                {reflection && (
                  <p className="mt-3 pt-3 border-t border-border/30 text-xs italic text-muted-foreground">
                    {reflection}
                  </p>
                )}
              </div>
              {msg.role === "assistant" && msg.id && (
                <button
                  onClick={() => setWeaveSheet({
                    open: true,
                    content: msg.content,
                    id: msg.id!,
                    reflectionPrompt: reflection,
                  })}
                  className="text-[10px] font-mono tracking-[0.12em] uppercase text-muted-foreground/60 hover:text-accent transition-colors flex items-center gap-1 ml-1"
                >
                  <BookMarked className="h-3 w-3" /> Send to Weave
                </button>
              )}
            </div>
          );
        })}
        {sending && (
          <div className="flex items-start">
            <div className="bg-secondary rounded-2xl px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
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
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!message.trim() || sending || !sessionId}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Send to Weave confirmation sheet */}
      {weaveSheet && (
        <SendToWeaveSheet
          open={weaveSheet.open}
          onClose={() => setWeaveSheet(null)}
          content={weaveSheet.content}
          resourceTitle={resourceTitle}
          resourceAuthor={resourceAuthor}
          pathwayTag={activePathway !== "none" ? activePathway : undefined}
          reflectionPrompt={weaveSheet.reflectionPrompt}
          sourceType="message"
          sourceId={weaveSheet.id}
        />
      )}
    </div>
  );
}

// ─── Highlights Panel ─────────────────────────────────────────────────────────

function HighlightsPanel({
  resourceId,
  resourceTitle,
  resourceAuthor,
}: {
  resourceId: number;
  resourceTitle: string;
  resourceAuthor?: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [weaveSheet, setWeaveSheet] = useState<{ open: boolean; highlight: { id: number; content: string; note?: string | null } } | null>(null);

  const { data: highlights, isLoading } = trpc.library.getHighlights.useQuery(
    { resourceId },
    { enabled: expanded }
  );

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary/40 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-muted-foreground" />
          Highlights
        </span>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-6 pb-4 space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map(i => <div key={i} className="h-14 rounded-xl bg-secondary/40 animate-pulse" />)}
            </div>
          ) : !highlights || highlights.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No highlights yet. Select text in the reader to highlight a passage.
            </p>
          ) : (
            highlights.map(h => (
              <div key={h.id} className="rounded-xl bg-secondary/50 p-4 space-y-2">
                <p className="text-sm text-foreground leading-relaxed">"{h.content}"</p>
                {h.note && (
                  <p className="text-xs text-muted-foreground italic">{h.note}</p>
                )}
                {h.pathwayTag && (
                  <span className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground/60">
                    {h.pathwayTag}
                  </span>
                )}
                {!h.sentToWeave && (
                  <button
                    onClick={() => setWeaveSheet({ open: true, highlight: h })}
                    className="text-[10px] font-mono tracking-[0.12em] uppercase text-muted-foreground/60 hover:text-accent transition-colors flex items-center gap-1"
                  >
                    <BookMarked className="h-3 w-3" /> Send to Weave
                  </button>
                )}
                {h.sentToWeave && (
                  <span className="text-[10px] font-mono uppercase tracking-wide text-accent/60">
                    ✓ Sent to Weave
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {weaveSheet && (
        <SendToWeaveSheet
          open={weaveSheet.open}
          onClose={() => setWeaveSheet(null)}
          content={weaveSheet.highlight.content}
          resourceTitle={resourceTitle}
          resourceAuthor={resourceAuthor}
          sourceType="highlight"
          sourceId={weaveSheet.highlight.id}
        />
      )}
    </div>
  );
}

// ─── Highlightable Text ───────────────────────────────────────────────────────

function HighlightableText({
  chunkIndex,
  content,
  onHighlight,
  onAskAbout,
  onSendToWeave,
}: {
  chunkIndex: number;
  content: string;
  onHighlight: (text: string, chunkIndex: number) => void;
  onAskAbout: (text: string) => void;
  onSendToWeave: (text: string, chunkIndex: number) => void;
}) {
  const [toolbar, setToolbar] = useState<FloatingToolbar | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setToolbar(null);
      return;
    }
    const text = selection.toString().trim();
    if (text.length < 5) {
      setToolbar(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    setToolbar({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 8,
      text,
      chunkIndex,
    });
  }, [chunkIndex]);

  const clearToolbar = useCallback(() => {
    setToolbar(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  return (
    <div ref={containerRef} className="relative" onMouseUp={handleMouseUp}>
      <p className="text-[15px] leading-[1.85] text-foreground/90 select-text">
        {content}
      </p>

      {toolbar && (
        <div
          className="absolute z-20 flex items-center gap-1 bg-foreground text-background rounded-xl shadow-lg px-2 py-1.5 -translate-x-1/2 -translate-y-full"
          style={{ left: toolbar.x, top: toolbar.y }}
        >
          <button
            onClick={() => { onHighlight(toolbar.text, toolbar.chunkIndex); clearToolbar(); }}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg hover:bg-background/10 transition-colors"
          >
            <Highlighter className="h-3 w-3" />
            Highlight
          </button>
          <div className="w-px h-4 bg-background/20" />
          <button
            onClick={() => { onAskAbout(toolbar.text); clearToolbar(); }}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg hover:bg-background/10 transition-colors"
          >
            <MessageSquare className="h-3 w-3" />
            Ask about this
          </button>
          <div className="w-px h-4 bg-background/20" />
          <button
            onClick={() => { onSendToWeave(toolbar.text, toolbar.chunkIndex); clearToolbar(); }}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg hover:bg-background/10 transition-colors"
          >
            <BookMarked className="h-3 w-3" />
            Weave
          </button>
          <button
            onClick={clearToolbar}
            className="ml-1 text-background/60 hover:text-background transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LibraryReader() {
  const [match, params] = useRoute("/my-library/:id");
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(0);
  const [prefillMessage, setPrefillMessage] = useState<string | undefined>();
  const [showChat, setShowChat] = useState(false); // mobile chat sheet
  const [highlightWeaveSheet, setHighlightWeaveSheet] = useState<{
    open: boolean;
    text: string;
    chunkIndex: number;
    highlightId: number | null;
  } | null>(null);

  const resourceId = match ? parseInt(params!.id, 10) : null;

  const { data: resource, isLoading: resourceLoading } = trpc.library.get.useQuery(
    { id: resourceId! },
    { enabled: !!resourceId && isAuthenticated }
  );

  const { data: chunks, isLoading: chunksLoading } = trpc.library.getChunks.useQuery(
    { resourceId: resourceId! },
    { enabled: !!resourceId && isAuthenticated && resource?.status === "ready" }
  );

  const addHighlightMutation = trpc.library.addHighlight.useMutation({
    onSuccess: () => toast.success("Highlight saved."),
    onError: () => toast.error("Could not save highlight."),
  });

  // Separate mutation for passage → Weave (saves highlight first, then opens sheet)
  const addHighlightForWeaveMutation = trpc.library.addHighlight.useMutation({
    onSuccess: (data) => {
      setHighlightWeaveSheet(prev => prev ? { ...prev, highlightId: data.id } : null);
    },
    onError: () => toast.error("Could not save passage. Please try again."),
  });

  const totalPages = chunks ? Math.ceil(chunks.length / CHUNKS_PER_PAGE) : 0;
  const pageChunks = chunks ? chunks.slice(page * CHUNKS_PER_PAGE, (page + 1) * CHUNKS_PER_PAGE) : [];

  const handleHighlight = (text: string, chunkIndex: number) => {
    if (!resourceId) return;
    addHighlightMutation.mutate({ resourceId, content: text, chunkIndex });
  };

  const handleAskAbout = (text: string) => {
    setPrefillMessage(`"${text}"\n\nWhat does this mean in the context of my life?`);
    setShowChat(true);
  };

  const handleSendToWeave = (text: string, chunkIndex: number) => {
    if (!resourceId) return;
    // Save the passage as a highlight first so we have a real DB ID for sendToWeave
    setHighlightWeaveSheet({ open: true, text, chunkIndex, highlightId: null });
    addHighlightForWeaveMutation.mutate({ resourceId, content: text, chunkIndex });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Nav />
        <div className="max-w-[480px] mx-auto px-6 pt-32 pb-24 text-center">
          <BookOpen className="h-10 w-10 mx-auto mb-5 text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm mb-6">Sign in to read your library.</p>
          <Button asChild><a href={getLoginUrl()}>Sign in</a></Button>
        </div>
      </div>
    );
  }

  if (!match || !resourceId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />

      <div className="flex flex-1 mt-16 h-[calc(100vh-64px)] overflow-hidden">

        {/* ─── Reader column ─── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Reader header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border flex-shrink-0">
            <button
              onClick={() => navigate("/my-library")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            {resourceLoading ? (
              <div className="h-5 w-48 rounded bg-secondary/60 animate-pulse" />
            ) : resource ? (
              <div className="min-w-0">
                <h1 className="font-medium text-foreground text-sm leading-snug truncate">{resource.title}</h1>
                {resource.author && (
                  <p className="text-xs text-muted-foreground">{resource.author}</p>
                )}
              </div>
            ) : null}
            {/* Mobile: open chat */}
            <button
              onClick={() => setShowChat(true)}
              className="ml-auto lg:hidden text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          </div>

          {/* Reader body */}
          <div className="flex-1 overflow-y-auto">
            {resourceLoading || chunksLoading ? (
              <div className="max-w-[680px] mx-auto px-6 py-10 space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-full rounded bg-secondary/40 animate-pulse" />
                    <div className="h-4 w-5/6 rounded bg-secondary/40 animate-pulse" />
                    <div className="h-4 w-4/6 rounded bg-secondary/40 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : resource?.status === "processing" ? (
              <div className="max-w-[480px] mx-auto px-6 py-20 text-center">
                <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Processing your resource…</p>
                <p className="text-xs text-muted-foreground/60 mt-1">This usually takes a few seconds.</p>
              </div>
            ) : resource?.status === "error" ? (
              <div className="max-w-[480px] mx-auto px-6 py-20 text-center">
                <p className="text-sm text-destructive mb-2">Could not process this resource.</p>
                <p className="text-xs text-muted-foreground">Try deleting it and adding it again.</p>
              </div>
            ) : !chunks || chunks.length === 0 ? (
              <div className="max-w-[480px] mx-auto px-6 py-20 text-center">
                <p className="text-sm text-muted-foreground">No text content found.</p>
              </div>
            ) : (
              <div className="max-w-[680px] mx-auto px-6 py-8">
                {/* Page indicator */}
                {totalPages > 1 && (
                  <p className="text-[11px] font-mono text-muted-foreground/60 uppercase tracking-wide mb-6">
                    Page {page + 1} of {totalPages}
                  </p>
                )}

                {/* Chunks */}
                <div className="space-y-6">
                  {pageChunks.map((chunk) => (
                    <HighlightableText
                      key={chunk.id}
                      chunkIndex={chunk.chunkIndex}
                      content={chunk.content}
                      onHighlight={handleHighlight}
                      onAskAbout={handleAskAbout}
                      onSendToWeave={handleSendToWeave}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
                      disabled={page === 0}
                      className="gap-1.5"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Previous
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {page + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
                      disabled={page >= totalPages - 1}
                      className="gap-1.5"
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Highlights panel */}
          {resource && (
            <HighlightsPanel
              resourceId={resource.id}
              resourceTitle={resource.title}
              resourceAuthor={resource.author}
            />
          )}
        </div>

        {/* ─── Chat sidebar (desktop) ─── */}
        {resource && (
          <div className="hidden lg:flex w-[400px] flex-shrink-0 border-l border-border flex-col">
            <ChatSidebar
              resourceId={resource.id}
              resourceTitle={resource.title}
              resourceAuthor={resource.author}
              prefillMessage={prefillMessage}
              onClearPrefill={() => setPrefillMessage(undefined)}
            />
          </div>
        )}
      </div>

      {/* ─── Mobile chat sheet ─── */}
      {resource && (
        <Sheet open={showChat} onOpenChange={setShowChat}>
          <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col">
            <ChatSidebar
              resourceId={resource.id}
              resourceTitle={resource.title}
              resourceAuthor={resource.author}
              prefillMessage={prefillMessage}
              onClearPrefill={() => setPrefillMessage(undefined)}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* ─── Highlight → Send to Weave sheet ─── */}
      {highlightWeaveSheet && resource && (
        <SendToWeaveSheet
          open={highlightWeaveSheet.open}
          onClose={() => setHighlightWeaveSheet(null)}
          content={highlightWeaveSheet.text}
          resourceTitle={resource.title}
          resourceAuthor={resource.author}
          sourceType="highlight"
          sourceId={highlightWeaveSheet.highlightId ?? 0}
          savingHighlight={highlightWeaveSheet.highlightId === null}
        />
      )}
    </div>
  );
}
