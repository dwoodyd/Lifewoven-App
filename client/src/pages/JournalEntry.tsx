import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { BookOpen, Sparkles, Loader2, ArrowLeft, Pencil, Check, X } from "lucide-react";
import { Streamdown } from "streamdown";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function JournalEntry() {
  const [, params] = useRoute("/weave/:id");
  const id = parseInt(params?.id || "0");
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [isReflecting, setIsReflecting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const { data: entry, refetch } = trpc.journal.get.useQuery(
    { id },
    { enabled: isAuthenticated && !!id }
  );

  // Populate edit fields when entry loads
  useEffect(() => {
    if (entry) {
      setEditTitle(entry.title || "");
      setEditContent(entry.content || "");
    }
  }, [entry?.id]);

  const generateReflection = trpc.journal.generateReflection.useMutation({
    onSuccess: () => {
      toast.success("Oracle reflection added.");
      setIsReflecting(false);
      refetch();
    },
    onError: () => setIsReflecting(false),
  });

  const updateEntry = trpc.journal.update.useMutation({
    onSuccess: () => {
      toast.success("Entry saved.");
      setIsEditing(false);
      refetch();
      utils.journal.list.invalidate();
    },
    onError: (e) => toast.error(e.message || "Failed to save entry."),
  });

  function handleSave() {
    if (!editContent.trim()) { toast.error("Entry content cannot be empty."); return; }
    updateEntry.mutate({ id, title: editTitle.trim() || undefined, content: editContent.trim() });
  }

  function handleCancelEdit() {
    if (entry) {
      setEditTitle(entry.title || "");
      setEditContent(entry.content || "");
    }
    setIsEditing(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-2xl mx-auto px-4 sm:px-6">
        <Link href="/weave">
          <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-6">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to The Weave
          </div>
        </Link>

        {entry ? (
          <div>
            {isEditing ? (
              /* ─── Edit mode ─── */
              <div className="space-y-4">
                <Input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="Entry title (optional)"
                  className="text-xl font-serif font-light border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-b-foreground bg-transparent"
                />
                <Textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  placeholder="Write your entry…"
                  className="min-h-[320px] resize-none font-light leading-relaxed text-base border-border"
                  autoFocus
                />
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={updateEntry.isPending}
                    size="sm"
                    className="gap-1.5"
                  >
                    {updateEntry.isPending
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Check className="h-3.5 w-3.5" />
                    }
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={updateEntry.isPending}
                    className="gap-1.5"
                  >
                    <X className="h-3.5 w-3.5" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* ─── Read mode ─── */
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
                  <div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-light text-foreground mb-1">
                      {entry.title || "Untitled Entry"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString("en", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                    {!entry.aiReflection && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => {
                          setIsReflecting(true);
                          generateReflection.mutate({ entryId: entry.id, content: entry.content });
                        }}
                        disabled={isReflecting}
                      >
                        {isReflecting
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <Sparkles className="h-3 w-3" />
                        }
                        Oracle Reflect
                      </Button>
                    )}
                  </div>
                </div>

                <div className="prose prose-base max-w-none text-foreground font-light leading-relaxed mb-8 whitespace-pre-wrap">
                  {entry.content}
                </div>

                {entry.aiReflection && (
                  <div className="p-5 rounded-2xl border border-border bg-card">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
                        Oracle Reflection
                      </p>
                    </div>
                    <Streamdown className="text-base text-foreground leading-relaxed">
                      {entry.aiReflection}
                    </Streamdown>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Entry not found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
