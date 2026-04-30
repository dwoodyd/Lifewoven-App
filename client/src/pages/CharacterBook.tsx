import { useState } from "react";
import { useLocation, useParams } from "wouter";
import Nav from "@/components/Nav";
import { LoomCorner } from "@/components/Loom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowLeft, BookOpen, Quote, Highlighter, Lightbulb, PenLine,
  Plus, MoreVertical, Star, Edit2, Trash2, BookHeart, CheckCircle2,
  BookMarked, Pause, ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type NoteType = "note" | "quote" | "highlight" | "lesson";
type BookStatus = "want_to_read" | "reading" | "completed" | "paused";

const NOTE_TYPE_CONFIG: Record<NoteType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  note:      { label: "Note",      icon: PenLine,      color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20" },
  quote:     { label: "Quote",     icon: Quote,        color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20" },
  highlight: { label: "Highlight", icon: Highlighter,  color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  lesson:    { label: "Lesson",    icon: Lightbulb,    color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
};

const STATUS_CONFIG: Record<BookStatus, { label: string; icon: React.ElementType; color: string }> = {
  want_to_read: { label: "Want to Read", icon: BookOpen,     color: "text-blue-400" },
  reading:      { label: "Reading",      icon: BookMarked,   color: "text-amber-400" },
  completed:    { label: "Completed",    icon: CheckCircle2, color: "text-green-400" },
  paused:       { label: "Paused",       icon: Pause,        color: "text-zinc-400" },
};

const TABS = [
  { id: "notes",    label: "Notes",      icon: PenLine },
  { id: "quotes",   label: "Quotes",     icon: Quote },
  { id: "lessons",  label: "Lessons",    icon: Lightbulb },
  { id: "journal",  label: "Journal",    icon: BookHeart },
] as const;
type TabId = typeof TABS[number]["id"];

// ─── Add Note Modal ───────────────────────────────────────────────────────────

function AddNoteModal({
  open, onClose, bookId, defaultType,
}: {
  open: boolean; onClose: () => void; bookId: number; defaultType: NoteType;
}) {
  const [type, setType]       = useState<NoteType>(defaultType);
  const [content, setContent] = useState("");
  const [chapter, setChapter] = useState("");
  const [pageRef, setPageRef] = useState("");
  const utils = trpc.useUtils();

  const addNote = trpc.character.addNote.useMutation({
    onSuccess: () => {
      utils.character.listNotes.invalidate({ bookId });
      toast.success(`${NOTE_TYPE_CONFIG[type].label} saved`);
      setContent(""); setChapter(""); setPageRef("");
      onClose();
    },
    onError: () => toast.error("Failed to save"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addNote.mutate({ bookId, type, content: content.trim(), chapter: chapter.trim() || undefined, pageRef: pageRef.trim() || undefined });
  };

  const TypeIcon = NOTE_TYPE_CONFIG[type].icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif font-light text-xl flex items-center gap-2">
            <TypeIcon className={`h-5 w-5 ${NOTE_TYPE_CONFIG[type].color}`} />
            Add {NOTE_TYPE_CONFIG[type].label}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <div className="flex gap-2 flex-wrap">
              {(Object.entries(NOTE_TYPE_CONFIG) as [NoteType, typeof NOTE_TYPE_CONFIG[NoteType]][]).map(([k, v]) => (
                <button
                  key={k} type="button"
                  onClick={() => setType(k)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                    type === k ? `${v.bg} ${v.color} border-current` : "border-border/50 text-muted-foreground hover:border-border"
                  }`}
                >
                  <v.icon className="h-3 w-3" />
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="content">
              {type === "quote" ? "Quote text" : type === "highlight" ? "Highlighted passage" : type === "lesson" ? "Lesson learned" : "Your note"}
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={
                type === "quote" ? '"The quote exactly as written…"' :
                type === "highlight" ? "The passage that stood out…" :
                type === "lesson" ? "What this taught me…" :
                "Your thoughts, reflections, or analysis…"
              }
              rows={4}
              className="resize-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="chapter">Chapter <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input id="chapter" value={chapter} onChange={e => setChapter(e.target.value)} placeholder="e.g. Chapter 3" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="page">Page <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input id="page" value={pageRef} onChange={e => setPageRef(e.target.value)} placeholder="e.g. p. 47" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={addNote.isPending || !content.trim()}>
              {addNote.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Note Card ────────────────────────────────────────────────────────────────

function NoteCard({ note, bookId }: {
  note: { id: number; type: NoteType; content: string; chapter?: string | null; pageRef?: string | null; createdAt: Date };
  bookId: number;
}) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const utils = trpc.useUtils();
  const cfg = NOTE_TYPE_CONFIG[note.type];
  const Icon = cfg.icon;

  const updateNote = trpc.character.updateNote.useMutation({
    onSuccess: () => { utils.character.listNotes.invalidate({ bookId }); setEditing(false); toast.success("Updated"); },
  });
  const deleteNote = trpc.character.deleteNote.useMutation({
    onSuccess: () => { utils.character.listNotes.invalidate({ bookId }); toast.success("Deleted"); },
  });

  return (
    <div className={`rounded-xl border p-4 ${cfg.bg} transition-all group`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Icon className={`h-3.5 w-3.5 ${cfg.color} shrink-0`} />
          <span className={`text-xs font-mono ${cfg.color}`}>{cfg.label}</span>
          {note.chapter && <span className="text-xs text-muted-foreground">· {note.chapter}</span>}
          {note.pageRef && <span className="text-xs text-muted-foreground">· {note.pageRef}</span>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditContent(note.content); setEditing(true); }}>
              <Edit2 className="h-3.5 w-3.5 mr-2" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => deleteNote.mutate({ id: note.id })}>
              <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {editing ? (
        <div className="space-y-2">
          <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={3} className="resize-none text-sm" />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <Button size="sm" onClick={() => updateNote.mutate({ id: note.id, content: editContent })} disabled={updateNote.isPending}>Save</Button>
          </div>
        </div>
      ) : (
        <p className={`text-sm leading-relaxed ${note.type === "quote" ? "font-serif italic text-foreground/90" : "text-foreground/80"}`}>
          {note.type === "quote" ? `"${note.content}"` : note.content}
        </p>
      )}
    </div>
  );
}

// ─── Journal Entry Card ───────────────────────────────────────────────────────

function JournalCard({ entry, bookId }: {
  entry: { id: number; title?: string | null; content: string; createdAt: Date };
  bookId: number;
}) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle]     = useState(entry.title ?? "");
  const [editContent, setEditContent] = useState(entry.content);
  const utils = trpc.useUtils();

  const updateEntry = trpc.character.updateJournalEntry.useMutation({
    onSuccess: () => { utils.character.listJournal.invalidate({ bookId }); setEditing(false); toast.success("Updated"); },
  });
  const deleteEntry = trpc.character.deleteJournalEntry.useMutation({
    onSuccess: () => { utils.character.listJournal.invalidate({ bookId }); toast.success("Deleted"); },
  });

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 group transition-all hover:border-border">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          {editing ? (
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Entry title…" className="text-sm h-7 mb-1" />
          ) : (
            entry.title && <h4 className="font-serif font-light text-foreground mb-0.5">{entry.title}</h4>
          )}
          <p className="text-xs text-muted-foreground font-mono">{new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditTitle(entry.title ?? ""); setEditContent(entry.content); setEditing(true); }}>
              <Edit2 className="h-3.5 w-3.5 mr-2" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => deleteEntry.mutate({ id: entry.id })}>
              <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {editing ? (
        <div className="space-y-2">
          <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={5} className="resize-none text-sm" />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <Button size="sm" onClick={() => updateEntry.mutate({ id: entry.id, title: editTitle || null, content: editContent })} disabled={updateEntry.isPending}>Save</Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
      )}
    </div>
  );
}

// ─── Add Journal Entry Inline ─────────────────────────────────────────────────

function AddJournalInline({ bookId }: { bookId: number }) {
  const [open, setOpen]       = useState(false);
  const [title, setTitle]     = useState("");
  const [content, setContent] = useState("");
  const utils = trpc.useUtils();

  const addEntry = trpc.character.addJournalEntry.useMutation({
    onSuccess: () => {
      utils.character.listJournal.invalidate({ bookId });
      toast.success("Journal entry saved");
      setTitle(""); setContent(""); setOpen(false);
    },
    onError: () => toast.error("Failed to save"),
  });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed border-border/50 p-5 text-left text-muted-foreground text-sm hover:border-border hover:text-foreground transition-all flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Write a journal entry about this book…
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
      <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Entry title (optional)…" className="bg-transparent border-border/50 text-sm" />
      <Textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="What did this book stir in you? What are you applying? What questions did it raise?…"
        rows={5}
        className="resize-none bg-transparent border-border/50 text-sm"
        autoFocus
      />
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        <Button size="sm" onClick={() => { if (content.trim()) addEntry.mutate({ bookId, title: title.trim() || undefined, content: content.trim() }); }} disabled={addEntry.isPending || !content.trim()}>
          {addEntry.isPending ? "Saving…" : "Save Entry"}
        </Button>
      </div>
    </div>
  );
}

// ─── Book Detail Page ─────────────────────────────────────────────────────────

export default function CharacterBook() {
  const { id } = useParams<{ id: string }>();
  const bookId = parseInt(id ?? "0", 10);
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<TabId>("notes");
  const [showAddNote, setShowAddNote] = useState(false);
  const [addNoteType, setAddNoteType] = useState<NoteType>("note");
  const utils = trpc.useUtils();

  const { data: book, isLoading: bookLoading } = trpc.character.getBook.useQuery({ id: bookId }, { enabled: !!bookId });

  // Notes filtered by tab
  const noteTypeForTab: Record<TabId, NoteType | undefined> = {
    notes:   "note",
    quotes:  "quote",
    lessons: "lesson",
    journal: undefined,
  };
  const { data: notes = [], isLoading: notesLoading } = trpc.character.listNotes.useQuery(
    { bookId, type: noteTypeForTab[activeTab] },
    { enabled: !!bookId && activeTab !== "journal" }
  );
  const { data: journalEntries = [], isLoading: journalLoading } = trpc.character.listJournal.useQuery(
    { bookId },
    { enabled: !!bookId && activeTab === "journal" }
  );

  const updateBook = trpc.character.updateBook.useMutation({
    onSuccess: () => utils.character.getBook.invalidate({ id: bookId }),
  });

  if (bookLoading) return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
      </div>
    </div>
  );

  if (!book) return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">Book not found.</p>
        <Button variant="ghost" onClick={() => navigate("/character")}><ArrowLeft className="h-4 w-4 mr-2" />Back to Library</Button>
      </div>
    </div>
  );

  const StatusIcon = STATUS_CONFIG[(book.status as BookStatus)].icon;
  const tabNoteType: NoteType = activeTab === "notes" ? "note" : activeTab === "quotes" ? "quote" : "lesson";

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <LoomCorner />

      <div className="max-w-4xl mx-auto px-4 pt-28 pb-20">
        {/* Back */}
        <button onClick={() => navigate("/character")} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </button>

        {/* Book header */}
        <div className="flex gap-6 mb-8">
          {/* Cover */}
          <div className="w-24 sm:w-32 shrink-0 rounded-xl overflow-hidden bg-zinc-800/60 aspect-[2/3] flex items-center justify-center">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <BookHeart className="h-8 w-8 text-amber-500/30" />
            )}
          </div>

          {/* Meta */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono tracking-widest uppercase text-amber-500/70 mb-1">Character & Growth</p>
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-foreground leading-tight mb-1">{book.title}</h1>
            {book.author && <p className="text-muted-foreground mb-3">{book.author}</p>}

            <div className="flex flex-wrap items-center gap-2">
              {/* Status selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full border border-border/50 hover:border-border transition-all ${STATUS_CONFIG[book.status as BookStatus].color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {STATUS_CONFIG[book.status as BookStatus].label}
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {(Object.entries(STATUS_CONFIG) as [BookStatus, typeof STATUS_CONFIG[BookStatus]][]).map(([k, v]) => (
                    <DropdownMenuItem key={k} onClick={() => updateBook.mutate({ id: bookId, status: k })}>
                      <v.icon className={`h-3.5 w-3.5 mr-2 ${v.color}`} />
                      {v.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Rating */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => updateBook.mutate({ id: bookId, rating: book.rating === n ? null : n })}
                    className={`transition-colors ${n <= (book.rating ?? 0) ? "text-amber-400" : "text-muted-foreground/30 hover:text-amber-400/50"}`}
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </button>
                ))}
              </div>

              {book.category && <Badge variant="outline" className="text-xs">{book.category}</Badge>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border/50">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-mono transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab !== "journal" ? (
          <div className="space-y-4">
            {/* Add button */}
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => { setAddNoteType(tabNoteType); setShowAddNote(true); }}
              >
                <Plus className="h-3.5 w-3.5" />
                Add {NOTE_TYPE_CONFIG[tabNoteType].label}
              </Button>
            </div>

            {notesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-card/50 animate-pulse" />)}
              </div>
            ) : notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                {(() => { const Ic = NOTE_TYPE_CONFIG[tabNoteType].icon; return <Ic className={`h-10 w-10 ${NOTE_TYPE_CONFIG[tabNoteType].color} opacity-30`} />; })()}
                <div>
                  <p className="font-serif text-lg font-light text-foreground mb-1">No {NOTE_TYPE_CONFIG[tabNoteType].label.toLowerCase()}s yet</p>
                  <p className="text-muted-foreground text-sm">
                    {activeTab === "notes" && "Capture your thoughts and reflections as you read."}
                    {activeTab === "quotes" && "Save the lines that stop you in your tracks."}
                    {activeTab === "lessons" && "Record what this book is teaching you about yourself."}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setAddNoteType(tabNoteType); setShowAddNote(true); }}>
                  <Plus className="h-3.5 w-3.5" />
                  Add your first {NOTE_TYPE_CONFIG[tabNoteType].label.toLowerCase()}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map(note => <NoteCard key={note.id} note={note as any} bookId={bookId} />)}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <AddJournalInline bookId={bookId} />
            {journalLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-32 rounded-xl bg-card/50 animate-pulse" />)}
              </div>
            ) : journalEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <BookHeart className="h-10 w-10 text-amber-500/30" />
                <p className="font-serif text-lg font-light text-foreground">No journal entries yet</p>
                <p className="text-muted-foreground text-sm max-w-sm">Journal your reactions, questions, and growth moments as you read through this book.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {journalEntries.map(entry => <JournalCard key={entry.id} entry={entry as any} bookId={bookId} />)}
              </div>
            )}
          </div>
        )}
      </div>

      <AddNoteModal open={showAddNote} onClose={() => setShowAddNote(false)} bookId={bookId} defaultType={addNoteType} />
    </div>
  );
}
