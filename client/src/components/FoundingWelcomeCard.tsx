/**
 * FoundingWelcomeCard
 *
 * One-time "Welcome to Oracle" card shown on the Dashboard for founding members
 * whose `needsIntro` flag is still true. Dismissed by calling
 * `applications.completeIntro`, which flips `needsIntro = false` in the DB.
 *
 * The card uses a Lumin video (transformation / bouncing_joyfully) as a
 * full-bleed right-panel accent, with the welcome copy on the left.
 */

import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { LUMIN_VIDEOS } from "@/data/lumin";
import { Library, Sparkles, X } from "lucide-react";

const TIER_LABELS: Record<string, string> = {
  seeker: "Seeker",
  oracle: "Oracle",
  guide: "Guide",
};

interface Props {
  tier: string | null | undefined;
  onDismiss?: () => void;
}

export default function FoundingWelcomeCard({ tier, onDismiss }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [exiting, setExiting] = useState(false);
  const utils = trpc.useUtils();

  const completeIntro = trpc.applications.completeIntro.useMutation({
    onSuccess: () => {
      // Invalidate auth.me so the needsIntro flag updates globally
      utils.auth.me.invalidate();
    },
    onError: () => {
      // Dismiss locally even if the server call fails
    },
  });

  const handleDismiss = () => {
    setExiting(true);
    completeIntro.mutate();
    setTimeout(() => {
      setDismissed(true);
      onDismiss?.();
    }, 400);
  };

  if (dismissed) return null;

  // Pick the Lumin video: transformation for Oracle, bouncing_joyfully for others
  const videoId = tier === "oracle" ? "transformation" : "bouncing_joyfully";
  const video = LUMIN_VIDEOS.find(v => v.id === videoId);
  const tierLabel = TIER_LABELS[tier ?? ""] ?? "Oracle";

  return (
    <div
      className={`relative mb-6 rounded-2xl overflow-hidden border transition-all duration-400 ${
        exiting ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
      style={{
        background: "linear-gradient(135deg, oklch(0.14 0.025 260) 0%, oklch(0.12 0.035 280) 100%)",
        borderColor: "oklch(0.55 0.18 280 / 0.35)",
        boxShadow: "0 0 40px oklch(0.55 0.18 280 / 0.12), inset 0 1px 0 oklch(1 0 0 / 0.04)",
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss welcome card"
        className="absolute top-3 right-3 z-20 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col sm:flex-row items-stretch min-h-[200px]">
        {/* Left: copy */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center gap-4 z-10">
          {/* Founding badge */}
          <div className="inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full text-xs font-medium tracking-wide"
            style={{
              background: "oklch(0.55 0.18 280 / 0.18)",
              border: "1px solid oklch(0.65 0.18 280 / 0.35)",
              color: "oklch(0.82 0.14 280)",
            }}
          >
            <Sparkles className="h-3 w-3" />
            Founding Member · {tierLabel}
          </div>

          {/* Headline */}
          <div>
            <h2
              className="font-serif text-2xl sm:text-3xl font-light leading-tight mb-2"
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                color: "oklch(0.95 0.04 60)",
              }}
            >
              Welcome to Oracle.
            </h2>
            <p className="text-sm sm:text-base leading-relaxed"
              style={{ color: "oklch(0.72 0.04 260)" }}
            >
              The complete Lifewoven Library is now yours — every course, workbook,
              audio program, and card deck, included with your membership. Your
              founding rate is locked for life.
            </p>
          </div>

          {/* Library access pill */}
          <div className="flex items-center gap-2 text-xs"
            style={{ color: "oklch(0.75 0.14 280)" }}
          >
            <Library className="h-3.5 w-3.5 shrink-0" />
            <span>All Library items are now in your account — no separate purchase needed.</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 pt-1">
            <Button
              asChild
              size="sm"
              style={{
                background: "linear-gradient(135deg, oklch(0.65 0.18 280), oklch(0.55 0.22 300))",
                color: "oklch(0.98 0.01 260)",
                border: "none",
              }}
            >
              <Link href="/store">Browse the Library</Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-[oklch(0.55_0.18_280/0.35)] text-[oklch(0.75_0.12_280)] hover:bg-[oklch(0.55_0.18_280/0.08)]"
            >
              <Link href="/oracle">Open Oracle</Link>
            </Button>
          </div>
        </div>

        {/* Right: Lumin video panel */}
        {video?.url && (
          <div
            className="relative w-full sm:w-52 shrink-0 overflow-hidden"
            style={{ minHeight: "180px" }}
          >
            {/* Gradient fade on left edge to blend with copy panel */}
            <div
              className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none"
              style={{
                background: "linear-gradient(to right, oklch(0.14 0.025 260), transparent)",
              }}
            />
            <video
              src={video.url}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{
                mixBlendMode: "screen",
                opacity: 0.85,
              }}
            />
            {/* Subtle violet glow behind Lumin */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center, oklch(0.45 0.18 280 / 0.25) 0%, transparent 70%)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
