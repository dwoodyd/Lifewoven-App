/**
 * LuminMoment — a transient Lumin micro-animation overlay.
 *
 * Plays a Lumin MP4 clip for 3-4 seconds then spring-fades out.
 * Triggered programmatically via the useLuminMoment() hook.
 *
 * Design:
 *  - Fixed bottom-right corner (non-intrusive, premium feel)
 *  - mix-blend-mode: screen strips the black background
 *  - framer-motion AnimatePresence for spring-in / spring-out
 *  - Auto-dismisses after the clip ends (or 5s max)
 *  - Respects "lumin_enabled" and "screenshot_mode" localStorage flags
 */

import { useCallback, useEffect, useRef, useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LUMIN_VIDEOS } from "@/data/lumin";
import { gentleSpring } from "@/lib/springs";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getVideoUrl(id: string): string {
  const v = LUMIN_VIDEOS.find((v) => v.id === id);
  return v?.url ?? "";
}

// ── Context ──────────────────────────────────────────────────────────────────

interface LuminMomentContextValue {
  triggerMoment: (videoId: string, onComplete?: () => void) => void;
}

const LuminMomentContext = createContext<LuminMomentContextValue>({
  triggerMoment: () => {},
});

// ── Provider ─────────────────────────────────────────────────────────────────

interface ActiveMoment {
  id: string;
  videoId: string;
  onComplete?: () => void;
}

export function LuminMomentProvider({ children }: { children: React.ReactNode }) {
  const [moment, setMoment] = useState<ActiveMoment | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerMoment = useCallback((videoId: string, onComplete?: () => void) => {
    // Respect user preferences
    if (localStorage.getItem("lifeos_lumin_enabled") === "false") {
      onComplete?.();
      return;
    }
    if (localStorage.getItem("lifeos_screenshot_mode") === "true") {
      onComplete?.();
      return;
    }

    // Clear any existing moment
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setMoment({
      id: `${videoId}-${Date.now()}`,
      videoId,
      onComplete,
    });
  }, []);

  const dismiss = useCallback((completeCb?: () => void) => {
    setMoment(null);
    completeCb?.();
  }, []);

  return (
    <LuminMomentContext.Provider value={{ triggerMoment }}>
      {children}
      <AnimatePresence>
        {moment && (
          <LuminMomentOverlay
            key={moment.id}
            videoId={moment.videoId}
            onComplete={() => dismiss(moment.onComplete)}
          />
        )}
      </AnimatePresence>
    </LuminMomentContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useLuminMoment() {
  return useContext(LuminMomentContext);
}

// ── Overlay ──────────────────────────────────────────────────────────────────

interface LuminMomentOverlayProps {
  videoId: string;
  onComplete: () => void;
}

function LuminMomentOverlay({ videoId, onComplete }: LuminMomentOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dismissedRef = useRef(false);
  const url = getVideoUrl(videoId);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    onComplete();
  }, [onComplete]);

  // Auto-dismiss after 5s max (safety net)
  useEffect(() => {
    const t = setTimeout(dismiss, 5000);
    return () => clearTimeout(t);
  }, [dismiss]);

  const handleEnded = useCallback(() => {
    dismiss();
  }, [dismiss]);

  if (!url) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 32, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.55, y: 20, rotate: 6 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      style={{
        position: "fixed",
        bottom: "5rem",
        right: "1.25rem",
        zIndex: 9000,
        pointerEvents: "none",
        width: "clamp(120px, 18vw, 200px)",
        aspectRatio: "1 / 1",
        filter: "drop-shadow(0 0 18px oklch(0.80 0.14 78 / 0.25))",
      }}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        src={url}
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          // Strip black background — Lumin floats transparently over the UI
          mixBlendMode: "screen",
          display: "block",
        }}
      />
    </motion.div>
  );
}
