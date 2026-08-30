import { useState } from "react";
import { MessageSquare, X, Send, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [sent, setSent] = useState(false);

  const notify = trpc.system.notifyOwner.useMutation({
    onSuccess: () => setSent(true),
    onError: () => toast.error("Couldn't send feedback. Please try again."),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    notify.mutate({
      title: `Beta Feedback${rating ? ` — ${rating}/5 stars` : ""}`,
      content: message.trim(),
    });
  }

  function reset() {
    setOpen(false);
    setTimeout(() => { setMessage(""); setRating(null); setSent(false); }, 300);
  }

  return (
    <>
      {/* Floating trigger — subtle icon-only circle, palette-matched */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Send feedback"
        title="Send feedback"
        className={`
          fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-[calc(env(safe-area-inset-right)+1rem)] z-40
          w-11 h-11 rounded-full
          max-sm:static max-sm:mx-auto max-sm:mb-[calc(env(safe-area-inset-bottom)+1.25rem)] max-sm:mt-6 max-sm:h-11 max-sm:w-auto max-sm:rounded-full max-sm:px-4
          flex items-center justify-center
          bg-[oklch(0.22_0.02_60)] border border-border
          text-[oklch(0.72_0.08_60)]
          shadow-md shadow-black/20
          hover:bg-[oklch(0.28_0.04_60)] hover:text-[oklch(0.82_0.10_60)]
          hover:border-border
          transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.72_0.08_60)]/50
        `}
      >
        <MessageSquare className="h-4 w-4" />
        <span className="hidden max-sm:inline text-sm font-medium">Feedback</span>
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] right-[max(1rem,env(safe-area-inset-right))] z-50 w-[min(20rem,calc(100vw-2rem))] bg-card border border-border rounded-2xl shadow-2xl p-5"
          style={{ boxShadow: "0 8px 40px oklch(0 0 0 / 0.35)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-foreground">Share your thoughts</p>
            <button
              onClick={reset}
              aria-label="Close feedback panel"
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {sent ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-accent" />
              <p className="text-sm font-light text-foreground">Thank you — received.</p>
              <Button size="sm" variant="outline" onClick={reset}>Close</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-2">How's your experience so far?</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className={`text-lg transition-opacity ${rating && n <= rating ? "opacity-100 text-[oklch(0.75_0.12_60)]" : "opacity-25 hover:opacity-50"}`}
                      aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                    >★</button>
                  ))}
                </div>
              </div>
              <textarea
                required
                rows={3}
                placeholder="What's working? What's confusing? What's missing?"
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit" size="sm" className="w-full gap-2" disabled={notify.isPending}>
                {notify.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {notify.isPending ? "Sending…" : "Send Feedback"}
              </Button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
