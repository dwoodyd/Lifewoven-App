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
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Send feedback"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-foreground text-background shadow-lg hover:opacity-90 transition-opacity text-sm font-light"
      >
        <MessageSquare className="h-4 w-4" />
        Feedback
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 bg-card border border-border rounded-2xl shadow-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-foreground">Send Feedback</p>
            <button onClick={reset} aria-label="Close feedback panel" className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {sent ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <p className="text-sm font-light text-foreground">Thank you — received.</p>
              <Button size="sm" variant="outline" onClick={reset}>Close</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              {/* Star rating */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">How's your experience so far?</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className={`text-lg transition-opacity ${rating && n <= rating ? "opacity-100" : "opacity-30 hover:opacity-60"}`}
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
