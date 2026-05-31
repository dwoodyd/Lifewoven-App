/**
 * SwipeableCard — swipe-left to reveal actions, swipe-right for primary action
 *
 * Uses framer-motion drag for smooth physics + icon scale pop + drag shadow.
 */

import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { haptics } from "@/hooks/useHaptics";

const ACTION_WIDTH = 72;
const SWIPE_THRESHOLD = 60;

interface SwipeAction {
  icon: React.ReactNode;
  label: string;
  color?: "destructive" | "accent" | "muted";
  onAction: () => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightAction?: SwipeAction;
  className?: string;
  disabled?: boolean;
}

const colorMap: Record<string, string> = {
  destructive: "bg-destructive text-destructive-foreground",
  accent: "bg-accent text-accent-foreground",
  muted: "bg-muted text-muted-foreground",
};

export function SwipeableCard({
  children,
  leftActions = [],
  rightAction,
  className = "",
  disabled = false,
}: SwipeableCardProps) {
  const x = useMotionValue(0);
  const [swiped, setSwiped] = useState<"left" | "right" | null>(null);
  const hasTriggered = useRef(false);

  const leftRevealWidth = leftActions.length * ACTION_WIDTH;

  // Opacity transforms
  const rightOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const leftOpacity  = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  // Icon scale — pop in as threshold is crossed
  const rightIconScale = useTransform(x, [0, SWIPE_THRESHOLD], [0.7, 1.0]);
  const leftIconScale  = useTransform(x, [-SWIPE_THRESHOLD, 0], [1.0, 0.7]);

  // Drag shadow depth
  const dragShadow = useTransform(
    x,
    [-leftRevealWidth, 0, SWIPE_THRESHOLD],
    [
      "0 4px 20px oklch(0.10 0.020 240 / 0.25)",
      "0 1px 4px oklch(0.10 0.020 240 / 0.08)",
      "0 4px 20px oklch(0.10 0.020 240 / 0.25)",
    ]
  );

  function snapBack() {
    animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    setSwiped(null);
    hasTriggered.current = false;
  }

  function snapToLeft() {
    animate(x, -leftRevealWidth, { type: "spring", stiffness: 300, damping: 28 });
    setSwiped("left");
  }

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {/* Right action background (swipe right) */}
      {rightAction && (
        <motion.div
          style={{ opacity: rightOpacity }}
          className="absolute inset-y-0 left-0 flex items-center pl-4"
        >
          <motion.div
            style={{ scale: rightIconScale }}
            className={`flex flex-col items-center gap-1 ${colorMap[rightAction.color ?? "accent"]?.split(" ")[1] ?? "text-accent"}`}
          >
            {rightAction.icon}
            <span className="text-xs font-medium">{rightAction.label}</span>
          </motion.div>
        </motion.div>
      )}

      {/* Left actions background (swipe left) */}
      {leftActions.length > 0 && (
        <motion.div
          style={{ opacity: leftOpacity }}
          className="absolute inset-y-0 right-0 flex items-stretch"
        >
          {leftActions.map((action, i) => (
            <button
              key={i}
              onClick={() => { action.onAction(); snapBack(); }}
              className={`flex flex-col items-center justify-center gap-1 w-[72px] text-xs font-medium transition-opacity duration-100 active:opacity-70 ${colorMap[action.color ?? "muted"]}`}
            >
              <motion.span
                style={{ scale: leftIconScale }}
                className="flex flex-col items-center gap-1"
              >
                {action.icon}
                {action.label}
              </motion.span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Draggable card surface */}
      <motion.div
        drag="x"
        dragConstraints={{
          left: leftActions.length > 0 ? -leftRevealWidth : 0,
          right: rightAction ? SWIPE_THRESHOLD * 1.5 : 0,
        }}
        dragElastic={0.15}
        style={{ x, boxShadow: dragShadow }}
        onDrag={(_, info) => {
          const current = info.offset.x;
          if (!hasTriggered.current && Math.abs(current) > SWIPE_THRESHOLD) {
            haptics.light();
            hasTriggered.current = true;
          } else if (hasTriggered.current && Math.abs(current) < SWIPE_THRESHOLD) {
            hasTriggered.current = false;
          }
        }}
        onDragEnd={(_, info) => {
          const offset = info.offset.x;
          const velocity = info.velocity.x;

          if (rightAction && (offset > SWIPE_THRESHOLD || velocity > 500)) {
            haptics.medium();
            rightAction.onAction();
            snapBack();
          } else if (leftActions.length > 0 && (offset < -SWIPE_THRESHOLD || velocity < -500)) {
            snapToLeft();
          } else {
            snapBack();
          }
        }}
        className="relative bg-card cursor-grab active:cursor-grabbing touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  );
}
