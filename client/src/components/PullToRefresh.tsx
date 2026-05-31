/**
 * PullToRefresh — mobile pull-to-refresh gesture component
 *
 * Uses @use-gesture/react for drag detection.
 * Only activates when the user is at the top of the scroll container.
 *
 * Usage:
 *   <PullToRefresh onRefresh={async () => { await refetch(); }}>
 *     {children}
 *   </PullToRefresh>
 */

import { useState, useRef, useCallback } from "react";
import { useDrag } from "@use-gesture/react";
import { motion, useSpring, useTransform } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { haptics } from "@/hooks/useHaptics";

const THRESHOLD = 72; // px to trigger refresh
const MAX_PULL = 100; // px max visual pull

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className = "" }: PullToRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const pullY = useSpring(0, { stiffness: 300, damping: 30 });
  const indicatorOpacity = useTransform(pullY, [0, THRESHOLD * 0.5, THRESHOLD], [0, 0.5, 1]);
  const indicatorScale = useTransform(pullY, [0, THRESHOLD], [0.6, 1]);
  const indicatorRotate = useTransform(pullY, [0, THRESHOLD * 2], [0, 360]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    haptics.medium();
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
      setTriggered(false);
      pullY.set(0);
    }
  }, [onRefresh, pullY]);

  const bind = useDrag(
    ({ movement: [, my], last, active, event }) => {
      // Only trigger when scrolled to top
      const el = containerRef.current;
      if (!el) return;
      const scrollTop = el.scrollTop ?? 0;
      if (scrollTop > 0) return;

      // Prevent default scroll during pull
      if (active && my > 0) {
        (event as TouchEvent)?.preventDefault?.();
      }

      if (active && !refreshing) {
        const clamped = Math.min(Math.max(my, 0), MAX_PULL);
        pullY.set(clamped);
        if (clamped >= THRESHOLD && !triggered) {
          setTriggered(true);
          haptics.light();
        } else if (clamped < THRESHOLD && triggered) {
          setTriggered(false);
        }
      }

      if (last && !refreshing) {
        if (triggered) {
          handleRefresh();
        } else {
          pullY.set(0);
          setTriggered(false);
        }
      }
    },
    {
      axis: "y",
      filterTaps: true,
      pointer: { touch: true },
    }
  );

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      style={{ touchAction: "pan-y" }}
    >
      {/* Pull indicator */}
      <motion.div
        style={{ y: pullY, opacity: indicatorOpacity }}
        className="absolute top-0 left-0 right-0 flex justify-center z-10 pointer-events-none"
      >
        <motion.div
          style={{ scale: indicatorScale }}
          className={`mt-2 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono
            shadow-md transition-colors duration-200
            ${
              refreshing
                ? "bg-accent/15 border border-accent/30 text-accent"
                : triggered
                  ? "bg-accent/10 border border-accent/40 text-accent"
                  : "bg-card border border-border/50 text-muted-foreground"
            }`}
        >
          <motion.div
            style={{ rotate: refreshing ? indicatorRotate : 0 }}
            animate={triggered && !refreshing ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </motion.div>
          {refreshing ? "Refreshing…" : triggered ? "Release to refresh" : "Pull to refresh"}
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        ref={(el) => {
          if (el) {
            const handlers = bind();
            // Apply gesture handlers to the DOM element
            (el as any).__gestureHandlers = handlers;
          }
        }}
        onPointerDown={(e) => { const el = e.currentTarget; const h = (el as any).__gestureHandlers; h?.onPointerDown?.(e); }}
        style={{ y: pullY } as React.CSSProperties}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}
