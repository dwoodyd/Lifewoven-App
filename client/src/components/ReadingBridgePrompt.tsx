import { useEffect, useState } from "react";
import { Link } from "wouter";
import { BookOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

const SESSION_SEEN_KEY = "lifewoven_reading_bridge_session_seen";
const SESSION_COUNT_KEY = "lifewoven_reading_bridge_session_count";
const PROMPT_SESSION_THRESHOLD = 3;

function readSessionCount() {
  const parsed = Number.parseInt(localStorage.getItem(SESSION_COUNT_KEY) ?? "0", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

/** A small, one-time dashboard invitation—not a modal—to connect active readers with the book context. */
export default function ReadingBridgePrompt({ enabled }: { enabled: boolean }) {
  const utils = trpc.useUtils();
  const { data: status } = trpc.readingBridge.getStatus.useQuery(undefined, { enabled });
  const [sessionCount, setSessionCount] = useState(readSessionCount);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (!enabled || sessionStorage.getItem(SESSION_SEEN_KEY)) return;
    sessionStorage.setItem(SESSION_SEEN_KEY, "1");
    const nextCount = readSessionCount() + 1;
    localStorage.setItem(SESSION_COUNT_KEY, String(nextCount));
    setSessionCount(nextCount);
  }, [enabled]);

  const dismiss = trpc.readingBridge.dismiss.useMutation({
    onSuccess: () => {
      setResolved(true);
      utils.readingBridge.getStatus.invalidate();
    },
  });

  const shouldShow = enabled
    && sessionCount >= PROMPT_SESSION_THRESHOLD
    && !resolved
    && Boolean(status)
    && !status?.chapter
    && !status?.dismissed;

  if (!shouldShow) return null;

  return (
    <aside
      className="mb-6 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] px-5 py-4"
      aria-label="Reading Bridge invitation"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground">Reading <em>Build a Life That Does Not Break You</em>?</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Set your chapter and Lifewoven can keep your pathway and Oracle context aligned with what you have already encountered.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/reading-bridge"><BookOpen className="h-3.5 w-3.5" />Set my chapter</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => dismiss.mutate()}
            disabled={dismiss.isPending}
          >
            {dismiss.isPending ? "Saving…" : "Not reading it"}
          </Button>
        </div>
      </div>
    </aside>
  );
}
