/**
 * EmptyState — bespoke illustrated empty states for Lifewoven
 *
 * Usage:
 *   <EmptyState variant="habits" title="No habits yet" description="..." action={...} />
 */

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { gentleSpring } from "@/lib/springs";

// ─── SVG Illustrations ────────────────────────────────────────────────────────

function HabitsIllustration() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      {/* Circular rhythm rings */}
      <circle cx="48" cy="48" r="38" stroke="currentColor" strokeOpacity="0.10" strokeWidth="1.5" />
      <circle cx="48" cy="48" r="28" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1.5" />
      {/* Seedling */}
      <path d="M48 70 L48 46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M48 52 Q38 46 36 36 Q46 36 48 46" fill="currentColor" fillOpacity="0.20" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M48 56 Q58 50 60 40 Q50 40 48 50" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Small dots — days */}
      {[0, 51, 102, 153, 204, 255, 306].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x = 48 + 38 * Math.cos(rad);
        const y = 48 + 38 * Math.sin(rad);
        return <circle key={i} cx={x} cy={y} r="2.5" fill="currentColor" fillOpacity={i === 0 ? 0.5 : 0.18} />;
      })}
    </svg>
  );
}

function JournalIllustration() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      {/* Open book */}
      <path d="M20 28 Q20 24 24 24 L48 28 L72 24 Q76 24 76 28 L76 68 Q76 72 72 72 L48 68 L24 72 Q20 72 20 68 Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.06" />
      {/* Spine */}
      <line x1="48" y1="28" x2="48" y2="68" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
      {/* Lines on left page */}
      <line x1="28" y1="38" x2="44" y2="37" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" strokeLinecap="round" />
      <line x1="28" y1="44" x2="44" y2="43" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.20" strokeLinecap="round" />
      <line x1="28" y1="50" x2="40" y2="49" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.15" strokeLinecap="round" />
      {/* Quill on right page */}
      <path d="M68 34 Q58 44 56 58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
      <path d="M68 34 Q72 30 74 26 Q70 28 68 34 Z" fill="currentColor" fillOpacity="0.30" />
    </svg>
  );
}

function BooksIllustration() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      {/* Stack of books */}
      <rect x="22" y="58" width="52" height="12" rx="2" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.5" />
      <rect x="26" y="44" width="44" height="14" rx="2" fill="currentColor" fillOpacity="0.13" stroke="currentColor" strokeWidth="1.5" />
      <rect x="30" y="30" width="36" height="14" rx="2" fill="currentColor" fillOpacity="0.10" stroke="currentColor" strokeWidth="1.5" />
      {/* Bookmark ribbon */}
      <path d="M60 30 L60 24 L56 27 L52 24 L52 30" fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}

function OracleIllustration() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      {/* Eye of insight */}
      <ellipse cx="48" cy="48" rx="28" ry="18" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
      <circle cx="48" cy="48" r="10" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="48" cy="48" r="4" fill="currentColor" fillOpacity="0.40" />
      {/* Radiating lines */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 48 + 32 * Math.cos(rad);
        const y1 = 48 + 32 * Math.sin(rad);
        const x2 = 48 + 40 * Math.cos(rad);
        const y2 = 48 + 40 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.18" strokeLinecap="round" />;
      })}
    </svg>
  );
}

function PathwaysIllustration() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      {/* Winding path */}
      <path d="M20 76 Q30 60 48 56 Q66 52 76 36 Q80 28 76 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.30" fill="none" />
      {/* Waypoints */}
      <circle cx="20" cy="76" r="4" fill="currentColor" fillOpacity="0.40" />
      <circle cx="48" cy="56" r="4" fill="currentColor" fillOpacity="0.25" />
      <circle cx="76" cy="20" r="4" fill="currentColor" fillOpacity="0.15" />
      {/* Horizon glow */}
      <ellipse cx="76" cy="20" rx="12" ry="12" fill="currentColor" fillOpacity="0.06" />
    </svg>
  );
}

function GenericIllustration() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.15" />
      <circle cx="48" cy="48" r="20" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.20" />
      <circle cx="48" cy="48" r="6" fill="currentColor" fillOpacity="0.25" />
    </svg>
  );
}

// ─── Variant Map ──────────────────────────────────────────────────────────────

const ILLUSTRATIONS: Record<string, React.FC> = {
  habits: HabitsIllustration,
  journal: JournalIllustration,
  books: BooksIllustration,
  oracle: OracleIllustration,
  pathways: PathwaysIllustration,
  generic: GenericIllustration,
};

// ─── Component ────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  variant?: keyof typeof ILLUSTRATIONS;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function EmptyState({
  variant = "generic",
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  const Illustration = ILLUSTRATIONS[variant] ?? GenericIllustration;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={gentleSpring}
      className={`flex flex-col items-center justify-center gap-4 py-16 px-6 text-center ${className}`}
    >
      <div className="text-muted-foreground/60">
        <Illustration />
      </div>
      <div className="space-y-1.5 max-w-xs">
        <p className="font-serif text-lg font-light text-foreground/80">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="mt-2 gap-2"
        >
          {action.icon}
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
