import { useState } from "react";
import { BookOpen, Check, ChevronRight, Plus, Trash2, StickyNote } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// ─── Static chapter list (mirrors server config) ─────────────────────────────
const SECTIONS = [
  {
    id: null,
    label: "Start Here",
    chapters: [
      { id: "start-here", title: "Start Here: If Life Feels Like It Is Caving In" },
      { id: "intro",      title: "Introduction: A Different Kind of Strength" },
    ],
  },
  {
    id: "STATE",
    label: "State",
    chapters: [
      { id: "ch-1", title: "Chapter 1: Strong But Not Okay" },
      { id: "ch-2", title: "Chapter 2: The Performance Economy" },
    ],
  },
  {
    id: "STORY",
    label: "Story",
    chapters: [
      { id: "ch-3", title: "Chapter 3: How We Learn to Ignore Ourselves" },
      { id: "ch-4", title: "Chapter 4: Burnout Starts Before the Collapse" },
    ],
  },
  {
    id: "STANDARDS",
    label: "Standards",
    chapters: [
      { id: "ch-5", title: "Chapter 5: The Body Has Been Speaking" },
      { id: "ch-6", title: "Chapter 6: Capacity Is Not a Moral Virtue" },
    ],
  },
  {
    id: "STRATEGY",
    label: "Strategy",
    chapters: [
      { id: "ch-7", title: "Chapter 7: Being Needed Is Not Being Known" },
      { id: "ch-8", title: "Chapter 8: The Courage to Fit" },
    ],
  },
  {
    id: "STEWARDSHIP",
    label: "Stewardship",
    chapters: [
      { id: "ch-9",    title: "Chapter 9: Rest Is Not the Reward" },
      { id: "ch-10",   title: "Chapter 10: Building for Decades" },
      { id: "ch-11",   title: "Chapter 11: What You Are Becoming" },
      { id: "epilogue", title: "Epilogue: What Rebuilding Made Possible" },
    ],
  },
];

// Maps 5S section id → Lifewoven pathway name
const SECTION_PATHWAY: Record<string, string> = {
  STATE:       "Ground",
  STORY:       "Uplift",
  STANDARDS:   "Rhythms",
  STRATEGY:    "Flow",
  STEWARDSHIP: "Purpose",
};

// ─── Quick Notes Panel ────────────────────────────────────────────────────────
function NotesPanel({ chapterId, chapterTitle }: { chapterId: string; chapterTitle: string }) {
  const [draft, setDraft] = useState("");
  const utils = trpc.useUtils();

  const { data: notes = [], isLoading } = trpc.readingBridge.getNotes.useQuery({ chapterId });

  const addNote = trpc.readingBridge.addNote.useMutation({
    onSuccess: () => {
      utils.readingBridge.getNotes.invalidate({ chapterId });
      utils.readingBridge.getNoteSummary.invalidate();
      setDraft("");
    },
  });

  const deleteNote = trpc.readingBridge.deleteNote.useMutation({
    onSuccess: () => {
      utils.readingBridge.getNotes.invalidate({ chapterId });
      utils.readingBridge.getNoteSummary.invalidate();
    },
  });

  const handleAdd = () => {
    if (!draft.trim()) return;
    addNote.mutate({ chapterId, content: draft.trim() });
  };

  return (
    <div className="mt-3 ml-4 pl-4 border-l-2 border-amber-200 dark:border-amber-800/50">
      <div className="flex items-center gap-1.5 mb-3">
        <StickyNote className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Notes for {chapterTitle.split(":")[0]}</span>
      </div>

      {/* Existing notes */}
      {isLoading ? (
        <div className="h-8 rounded bg-muted animate-pulse mb-2" />
      ) : notes.length > 0 ? (
        <div className="space-y-2 mb-3">
          {notes.map((note) => (
            <div key={note.id} className="group flex items-start gap-2 bg-amber-50/60 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-lg px-3 py-2.5">
              <p className="flex-1 text-xs text-foreground leading-relaxed whitespace-pre-wrap">{note.content}</p>
              <button
                onClick={() => deleteNote.mutate({ noteId: note.id })}
                disabled={deleteNote.isPending}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                aria-label="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {/* Add note */}
      <div className="flex flex-col gap-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What stood out? A question, a quote, a tension…"
          className="text-xs min-h-[72px] resize-none bg-background border-border focus-visible:ring-amber-400/50"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAdd();
          }}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleAdd}
          disabled={!draft.trim() || addNote.isPending}
          className="self-end h-7 text-xs gap-1.5 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
        >
          <Plus className="w-3 h-3" />
          Save note
        </Button>
      </div>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted-foreground">Reading progress</span>
        <span className="text-xs font-medium text-amber-700 dark:text-amber-400">{progress}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-amber-100 dark:bg-amber-900/30 overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-500 dark:bg-amber-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReadingBridge() {
  const [, navigate] = useLocation();
  const { data: status, isLoading } = trpc.readingBridge.getStatus.useQuery();
  const { data: noteSummary = {} } = trpc.readingBridge.getNoteSummary.useQuery();
  const utils = trpc.useUtils();

  const setChapter = trpc.readingBridge.setChapter.useMutation({
    onSuccess: () => utils.readingBridge.getStatus.invalidate(),
  });
  const dismiss = trpc.readingBridge.dismiss.useMutation({
    onSuccess: () => {
      utils.readingBridge.getStatus.invalidate();
      navigate("/dashboard");
    },
  });

  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);

  const currentChapter = status?.chapter ?? null;
  const progress = status?.progress ?? 0;

  const handleSelect = async (chapterId: string) => {
    await setChapter.mutateAsync({ chapterId });
    setConfirmed(chapterId);
    setTimeout(() => setConfirmed(null), 2000);
  };

  const toggleNotes = (chapterId: string) => {
    setExpandedNotes(prev => prev === chapterId ? null : chapterId);
  };

  // Find chapter title for notes panel
  const allChapters = SECTIONS.flatMap(s => s.chapters);
  const expandedTitle = expandedNotes
    ? allChapters.find(c => c.id === expandedNotes)?.title ?? expandedNotes
    : "";

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground font-serif">Reading Bridge</h1>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
            Tell Lifewoven where you are in{" "}
            <em>Build a Life That Does Not Break You</em>. The Oracle will
            reference concepts you have already encountered, and your pathway
            practice will align to the section you are reading.
          </p>

          {/* Status badge */}
          {status?.chapter && !status.isFinished && status.section && (
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full px-3 py-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Currently aligned to the <strong>{status.section}</strong> section
              {SECTION_PATHWAY[status.section] && (
                <> — <strong>{SECTION_PATHWAY[status.section]}</strong> pathway</>
              )}
            </div>
          )}
          {status?.isFinished && (
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-full px-3 py-1.5">
              <Check className="w-3.5 h-3.5" />
              You have finished the book — all sections are unlocked
            </div>
          )}

          {/* Progress bar — shown once a chapter is set */}
          {status?.chapter && <ProgressBar progress={progress} />}
        </div>

        {/* Confirmation toast */}
        {confirmed && (
          <div className="mb-6 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-3">
            <Check className="w-4 h-4 shrink-0" />
            Got it. We will align your practice to where you are in the book.
          </div>
        )}

        {/* Chapter list */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {SECTIONS.map((section) => (
              <div key={section.label}>
                {/* Section header */}
                {section.id ? (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold tracking-widest uppercase text-amber-600 dark:text-amber-400">
                      {section.label}
                    </span>
                    <div className="flex-1 h-px bg-amber-200 dark:bg-amber-800/50" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                      {section.label}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}

                {/* Chapter rows */}
                <div className="space-y-1.5">
                  {section.chapters.map((ch) => {
                    const isSelected = currentChapter === ch.id;
                    const noteCount = (noteSummary as Record<string, number>)[ch.id] ?? 0;
                    const notesOpen = expandedNotes === ch.id;
                    return (
                      <div key={ch.id}>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSelect(ch.id)}
                            disabled={setChapter.isPending}
                            className={[
                              "flex-1 flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                              isSelected
                                ? "bg-amber-50 dark:bg-amber-900/25 border border-amber-300 dark:border-amber-700"
                                : "bg-card border border-border hover:bg-muted/60",
                            ].join(" ")}
                          >
                            <span className={[
                              "text-sm leading-snug",
                              isSelected ? "text-amber-800 dark:text-amber-200 font-medium" : "text-foreground",
                            ].join(" ")}>
                              {ch.title}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              {noteCount > 0 && (
                                <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded-full px-1.5 py-0.5 leading-none">
                                  {noteCount}
                                </span>
                              )}
                              {isSelected ? (
                                <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50" />
                              )}
                            </div>
                          </button>
                          {/* Notes toggle */}
                          <button
                            onClick={() => toggleNotes(ch.id)}
                            title={notesOpen ? "Hide notes" : "Add / view notes"}
                            className={[
                              "p-2 rounded-lg border transition-colors shrink-0",
                              notesOpen
                                ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400"
                                : "bg-card border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                            ].join(" ")}
                          >
                            <StickyNote className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Inline notes panel */}
                        {notesOpen && (
                          <NotesPanel chapterId={ch.id} chapterTitle={ch.title} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Finished the book */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-px bg-border" />
              </div>
              <button
                onClick={() => handleSelect("finished")}
                disabled={setChapter.isPending}
                className={[
                  "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                  currentChapter === "finished"
                    ? "bg-emerald-50 dark:bg-emerald-900/25 border border-emerald-300 dark:border-emerald-700"
                    : "bg-card border border-border hover:bg-muted/60",
                ].join(" ")}
              >
                <span className={[
                  "text-sm font-medium",
                  currentChapter === "finished" ? "text-emerald-800 dark:text-emerald-200" : "text-foreground",
                ].join(" ")}>
                  Finished the book ✓
                </span>
                {currentChapter === "finished" ? (
                  <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground opacity-50" />
                )}
              </button>
            </div>

            {/* Not reading it */}
            <div className="pt-2 border-t border-border">
              <button
                onClick={() => dismiss.mutate()}
                disabled={dismiss.isPending}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
              >
                Not reading it — hide this section
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
