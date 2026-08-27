import { useState } from "react";
import { Link } from "wouter";
import { Sparkles, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";

const DISMISS_KEY = "lifewoven_post_activation_invite_dismissed";

/** One respectful invitation, shown only after a user has both reflected and consumed content. */
export default function PostActivationInvite() {
  const { user } = useAuth();
  const { data: activation } = trpc.system.activationStatus.useQuery(undefined, { enabled: !!user });
  const { data: access } = trpc.store.getAccess.useQuery();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "1");

  if (!user || dismissed || !activation?.isActivated || access?.isBetaMember || access?.tier === "seeker" || access?.tier === "oracle") return null;
  const dismiss = () => { localStorage.setItem(DISMISS_KEY, "1"); setDismissed(true); };

  return (
    <aside className="relative mb-6 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] px-5 py-4 pr-11" aria-label="Continue your practice">
      <button type="button" onClick={dismiss} aria-label="Dismiss this invitation" className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"><X className="h-4 w-4" /></button>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Your practice has a shape now.</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">When you are ready to go deeper, Seeker keeps the full pathway, habit, and reflection tools within reach.</p>
        </div>
        <Button asChild size="sm" className="shrink-0 gap-1.5"><Link href="/pricing?tier=seeker"><Sparkles className="h-3.5 w-3.5" />See what continues</Link></Button>
      </div>
    </aside>
  );
}
