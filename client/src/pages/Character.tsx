import { useState, useRef } from "react";
import { useLocation } from "wouter";
import Nav from "@/components/Nav";
import { LuminCorner } from "@/components/LuminCorner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { BookOpen, Plus, MoreVertical, Star, BookMarked, CheckCircle2, Pause, BookHeart, Sparkles, Search, Upload, X, Check, ImageIcon } from "lucide-react";
import { LuminAmbient } from "@/components/LuminAmbient";

// ─── Types ────────────────────────────────────────────────────────────────────

type BookStatus = "want_to_read" | "reading" | "completed" | "paused";

const STATUS_CONFIG: Record<BookStatus, { label: string; color: string; icon: React.ElementType }> = {
  want_to_read: { label: "Want to Read",  color: "text-blue-400",   icon: BookOpen },
  reading:      { label: "Reading",       color: "text-amber-400",  icon: BookMarked },
  completed:    { label: "Completed",     color: "text-green-400",  icon: CheckCircle2 },
  paused:       { label: "Paused",        color: "text-zinc-400",   icon: Pause },
};

const CATEGORIES = [
  "Mindset", "Leadership", "Character", "Spirituality", "Philosophy",
  "Discipline", "Relationships", "Health", "Business", "Biography", "Other",
];

// ─── Add Book Modal ───────────────────────────────────────────────────────────

function AddBookModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle]             = useState("");
  const [author, setAuthor]           = useState("");
  const [coverUrl, setCoverUrl]       = useState("");
  const [category, setCategory]       = useState("");
  const [status, setStatus]           = useState<BookStatus>("want_to_read");
  const [coverResults, setCoverResults] = useState<string[]>([]);
  const [coverSearched, setCoverSearched] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const lookupCover = trpc.character.lookupBookCover.useQuery(
    { title: title.trim(), author: author.trim() || undefined },
    { enabled: false }
  );

  const uploadCoverMutation = trpc.character.uploadBookCover.useMutation({
    onSuccess: ({ url }) => { setCoverUrl(url); toast.success("Cover uploaded"); },
    onError: () => toast.error("Upload failed"),
    onSettled: () => setUploadingCover(false),
  });

  const addBook = trpc.character.addBook.useMutation({
    onSuccess: () => {
      utils.character.listBooks.invalidate();
      toast.success("Book added to your library");
      resetForm();
      onClose();
    },
    onError: () => toast.error("Failed to add book"),
  });

  const resetForm = () => {
    setTitle(""); setAuthor(""); setCoverUrl(""); setCategory("");
    setStatus("want_to_read"); setCoverResults([]); setCoverSearched(false);
  };

  const handleSearchCover = async () => {
    if (!title.trim()) { toast.error("Enter a title first"); return; }
    const result = await lookupCover.refetch();
    const covers = result.data?.covers ?? [];
    setCoverResults(covers);
    setCoverSearched(true);
    if (covers.length === 0) toast.info("No covers found — upload one below");
    else toast.success(`Found ${covers.length} cover option${covers.length > 1 ? "s" : ""}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    setUploadingCover(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      uploadCoverMutation.mutate({ imageDataUrl: dataUrl, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addBook.mutate({
      title: title.trim(),
      author: author.trim() || undefined,
      coverUrl: coverUrl.trim() || undefined,
      category: category || undefined,
      status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif font-light text-xl">Add a Book</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Book title" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="author">Author</Label>
            <Input id="author" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as BookStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(STATUS_CONFIG) as [BookStatus, typeof STATUS_CONFIG[BookStatus]][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cover section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Cover Art <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs gap-1.5"
                  onClick={handleSearchCover} disabled={lookupCover.isFetching || !title.trim()}>
                  <Search className="h-3 w-3" />
                  {lookupCover.isFetching ? "Searching…" : "Find Cover"}
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs gap-1.5"
                  onClick={() => fileInputRef.current?.click()} disabled={uploadingCover}>
                  <Upload className="h-3 w-3" />
                  {uploadingCover ? "Uploading…" : "Upload"}
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </div>
            </div>

            {/* Auto-fetched cover grid */}
            {coverResults.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {coverResults.map((url) => (
                  <button key={url} type="button"
                    onClick={() => setCoverUrl(url)}
                    className={`relative aspect-[2/3] rounded-lg overflow-hidden border-2 transition-all ${
                      coverUrl === url ? "border-amber-500 ring-2 ring-amber-500/30" : "border-border/50 hover:border-amber-500/50"
                    }`}>
                    <img src={url} alt="cover option" className="w-full h-full object-cover" />
                    {coverUrl === url && (
                      <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                        <Check className="h-5 w-5 text-amber-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Selected cover preview or empty state */}
            {coverUrl ? (
              <div className="flex items-center gap-3 p-2 rounded-lg bg-card border border-border/50">
                <img src={coverUrl} alt="selected cover" className="h-14 w-10 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{coverUrl.length > 50 ? coverUrl.slice(0, 50) + "…" : coverUrl}</p>
                  <p className="text-xs text-green-400 mt-0.5 flex items-center gap-1"><Check className="h-3 w-3" /> Cover selected</p>
                </div>
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => setCoverUrl("")}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : coverSearched && coverResults.length === 0 ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-dashed border-border/50">
                <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">No covers found automatically. Click <strong>Upload</strong> to add your own image.</p>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => { resetForm(); onClose(); }}>Cancel</Button>
            <Button type="submit" disabled={addBook.isPending || !title.trim()}>
              {addBook.isPending ? "Adding…" : "Add Book"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Book Card ────────────────────────────────────────────────────────────────

function BookCard({ book }: { book: { id: number; title: string; author?: string | null; coverUrl?: string | null; category?: string | null; status: BookStatus; rating?: number | null } }) {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const StatusIcon = STATUS_CONFIG[book.status].icon;

  const updateBook = trpc.character.updateBook.useMutation({
    onSuccess: () => utils.character.listBooks.invalidate(),
  });
  const deleteBook = trpc.character.deleteBook.useMutation({
    onSuccess: () => {
      utils.character.listBooks.invalidate();
      toast.success("Book removed");
    },
  });

  return (
    <div
      className="group relative rounded-2xl border border-border/50 bg-card overflow-hidden cursor-pointer transition-all duration-200 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5"
      onClick={() => navigate(`/character/${book.id}`)}
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
    >
      {/* Cover */}
      <div className="aspect-[2/3] w-full overflow-hidden bg-muted relative">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
            <BookHeart className="h-10 w-10 text-amber-500/40" />
            <p className="text-xs text-center text-muted-foreground/60 font-serif italic leading-snug line-clamp-3">{book.title}</p>
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute top-2 left-2">
          <span className={`flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm ${STATUS_CONFIG[book.status].color}`}>
            <StatusIcon className="h-3 w-3" />
            {STATUS_CONFIG[book.status].label}
          </span>
        </div>
        {/* Actions menu */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7 bg-background/80 backdrop-blur-sm rounded-full">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.entries(STATUS_CONFIG) as [BookStatus, typeof STATUS_CONFIG[BookStatus]][]).map(([k, v]) => (
                <DropdownMenuItem key={k} onClick={() => updateBook.mutate({ id: book.id, status: k })}>
                  Mark as {v.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => { if (confirm("Remove this book and all its notes?")) deleteBook.mutate({ id: book.id }); }}
              >
                Remove book
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-serif text-sm font-light text-foreground line-clamp-2 leading-snug mb-0.5">{book.title}</h3>
        {book.author && <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>}
        <div className="flex items-center gap-2 mt-2">
          {book.category && <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">{book.category}</Badge>}
          {book.rating && (
            <span className="flex items-center gap-0.5 text-xs text-amber-400">
              {Array.from({ length: book.rating }).map((_, i) => <Star key={i} className="h-2.5 w-2.5 fill-current" />)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Character Hub Page ───────────────────────────────────────────────────────

const STATUS_FILTERS: { value: BookStatus | "all"; label: string }[] = [
  { value: "all",          label: "All Books" },
  { value: "reading",      label: "Reading" },
  { value: "want_to_read", label: "Want to Read" },
  { value: "completed",    label: "Completed" },
  { value: "paused",       label: "Paused" },
];

export default function Character() {
  const { isAuthenticated, loading } = useAuth();
  const [showAdd, setShowAdd]         = useState(false);
  const [statusFilter, setStatusFilter] = useState<BookStatus | "all">("all");

  const { data: books = [], isLoading } = trpc.character.listBooks.useQuery(
    statusFilter === "all" ? undefined : { status: statusFilter },
    { enabled: isAuthenticated }
  );

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4 text-center">
          <BookHeart className="h-16 w-16 text-amber-500/40" />
          <h1 className="font-serif text-3xl font-light text-foreground">Your Character Library</h1>
          <p className="text-muted-foreground max-w-md">Track the books shaping your character, capture quotes that move you, and journal your growth — all in one place.</p>
          <Button asChild>
            <a href={getLoginUrl(window.location.pathname)}>Sign in to begin</a>
          </Button>
        </div>
      </div>
    );
  }

  const readingCount   = books.filter(b => b.status === "reading").length;
  const completedCount = books.filter(b => b.status === "completed").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Lumin glows warmly from the floor — candlelight, not spotlight */}
      <LuminAmbient
        videoId="bouncing_joyfully"
        mode="floor-glow"
        opacity={0.18}
        zIndex={0}
      />
      <Nav />
      <LuminCorner />

      <div className="max-w-6xl mx-auto px-4 pt-28 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-mono tracking-widest uppercase text-amber-500/70 mb-1">Character & Growth</p>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-foreground">Your Reading Library</h1>
            {books.length > 0 && (
              <p className="text-muted-foreground mt-1 text-sm">
                {readingCount > 0 && <span className="text-amber-400">{readingCount} currently reading</span>}
                {readingCount > 0 && completedCount > 0 && <span className="mx-2 text-border">·</span>}
                {completedCount > 0 && <span>{completedCount} completed</span>}
              </p>
            )}
          </div>
          <Button onClick={() => setShowAdd(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Add a Book
          </Button>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono tracking-wide transition-all ${
                statusFilter === f.value
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "text-muted-foreground border border-border/50 hover:border-border hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Book grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-card/50 animate-pulse aspect-[2/3]" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center">
              <BookHeart className="h-9 w-9 text-amber-500/50" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-light text-foreground mb-2">
                {statusFilter === "all" ? "Your library is empty" : `No books marked as "${STATUS_CONFIG[statusFilter as BookStatus]?.label}"`}
              </h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                {statusFilter === "all"
                  ? "Every book you read shapes who you become. Start tracking your reading journey here."
                  : "Change the filter above or add a new book to get started."}
              </p>
            </div>
            {statusFilter === "all" && (
              <Button onClick={() => setShowAdd(true)} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add your first book
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map(book => (
              <BookCard key={book.id} book={book as any} />
            ))}
          </div>
        )}

        {/* Oracle nudge */}
        {books.length >= 3 && (
          <div className="mt-12 p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Sparkles className="h-6 w-6 text-blue-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-0.5">The Oracle can see your reading patterns</p>
              <p className="text-xs text-muted-foreground">Ask it what the books you're reading reveal about where you're growing — and where you're avoiding.</p>
            </div>
            <Button size="sm" variant="outline" asChild className="shrink-0">
              <a href="/oracle">Ask the Oracle</a>
            </Button>
          </div>
        )}
      </div>

      <AddBookModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
