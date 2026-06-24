/**
 * TermTooltip — shows a definition tooltip for proprietary Lifewoven terms.
 * On first exposure (within the first 7 days after account creation, or first 7 days of localStorage key),
 * the tooltip auto-opens for 3 seconds. After that it only opens on hover/focus.
 */
import { useState, useEffect, useRef } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const GLOSSARY: Record<string, { definition: string; context?: string }> = {
  "5S Framework": {
    definition: "The five dimensions of a whole life: State, Story, Standards, Strategy, and Stewardship.",
    context: "Lifewoven's core model for personal transformation.",
  },
  "The Oracle": {
    definition: "Your AI reflection partner — reads patterns across all five dimensions and offers insight without judgment.",
    context: "Available in the Oracle section.",
  },
  "The Weave": {
    definition: "Your personal journal — a place to reflect, process, and track your inner life over time.",
    context: "Accessible from the navigation.",
  },
  "Capacity Audit": {
    definition: "A short self-assessment that maps where you are across the 5S dimensions and recommends your first pathway.",
    context: "Takes about 5 minutes.",
  },
  "Pathway": {
    definition: "A guided, timer-based practice experience designed for a specific moment in your life.",
    context: "Seven pathways available, from Align to Reset.",
  },
  "Lumin": {
    definition: "The Lifewoven guide — a visual presence that accompanies you through practices and transitions.",
    context: "Not an assistant. A witness.",
  },
  "Ground Guide": {
    definition: "A short grounding practice that anchors you in the present moment before deeper work.",
    context: "Used at the start of most pathways.",
  },
  "Identity Builder": {
    definition: "A practice for defining who you are becoming — not by what you do, but by who you are.",
    context: "Part of the Story module.",
  },
  "Emotional Compass": {
    definition: "A 22-level scale of emotional states, from fear and grief at the bottom to joy and love at the top.",
    context: "Based on the Emotional Guidance Scale.",
  },
  "BetterMirror": {
    definition: "A consistency metric that measures return rate, reset speed, and kept promises — not streaks.",
    context: "Replaces streak-based tracking in Rhythms.",
  },
};

// localStorage key prefix for first-exposure tracking
const FIRST_EXPOSURE_KEY = "lifeos_term_seen_";
// Show auto-open tooltip for first 7 days of account (approximated by localStorage)
const FIRST_EXPOSURE_DAYS = 7;

interface TermTooltipProps {
  term: string;
  children: React.ReactNode;
  /** If true, always show the definition tooltip on hover (no first-exposure logic) */
  alwaysShow?: boolean;
}

export function TermTooltip({ term, children, alwaysShow = false }: TermTooltipProps) {
  const entry = GLOSSARY[term];
  const [open, setOpen] = useState(false);
  const autoOpenedRef = useRef(false);

  useEffect(() => {
    if (!entry || alwaysShow || autoOpenedRef.current) return;

    const key = FIRST_EXPOSURE_KEY + term.toLowerCase().replace(/\s+/g, "_");
    const firstSeen = localStorage.getItem(key);
    const now = Date.now();

    if (!firstSeen) {
      // First time seeing this term — record it
      localStorage.setItem(key, String(now));
      // Auto-open the tooltip after a brief delay
      autoOpenedRef.current = true;
      const timer = setTimeout(() => {
        setOpen(true);
        // Auto-close after 3 seconds
        setTimeout(() => setOpen(false), 3000);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      // Check if within first 7 days
      const daysSince = (now - parseInt(firstSeen)) / (1000 * 60 * 60 * 24);
      if (daysSince < FIRST_EXPOSURE_DAYS && !autoOpenedRef.current) {
        // Within first-exposure window — still show on hover (handled by Tooltip)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  if (!entry) return <>{children}</>;

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <span
            className="cursor-help underline decoration-dotted decoration-muted-foreground/50 underline-offset-2"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
          >
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm font-medium mb-0.5">{term}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{entry.definition}</p>
          {entry.context && (
            <p className="text-xs text-muted-foreground/70 mt-1 italic">{entry.context}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export { GLOSSARY };
