/**
 * LuminAmbient — Lumin as an environmental presence, not a face.
 *
 * Three modes:
 *  "edge-fade"   — bleeds in from the right edge, heavily masked, opacity ~0.25.
 *                  She's felt, not watched. Use on content pages (Weave, Oracle, Pathways).
 *  "floor-glow"  — anchored to the bottom of the viewport, only lower-third visible.
 *                  Like candlelight. Use on Dashboard, Character, MoodRhythm.
 *  "dominant"    — large centered presence (kept for OnboardingModal / FoundingWelcomeCard).
 *                  Do NOT use on regular app pages.
 *
 * Legacy props (position, size, offset) are accepted but ignored — they were only
 * used by the removed "corner" mode. Callers can be updated lazily.
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LUMIN_VIDEOS } from "@/data/lumin";



export type LuminMode = "edge-fade" | "floor-glow" | "dominant" | "corner";
// "corner" is kept as a type alias for "edge-fade" so existing callers don't break.

export type LuminPosition =
  | "top-right" | "top-left" | "bottom-right" | "bottom-left"
  | "center-right" | "center-left" | "top-center" | "bottom-center" | "center";

interface LuminAmbientProps {
  videoId: string;
  mode?: LuminMode;
  /** Override opacity. Defaults: edge-fade=0.25, floor-glow=0.20, dominant=0.65 */
  opacity?: number;
  loop?: boolean;
  style?: React.CSSProperties;
  zIndex?: number;
  // Legacy props — accepted but ignored
  position?: LuminPosition;
  size?: string;
  offset?: number;
}

export function LuminAmbient({
  videoId,
  mode = "edge-fade",
  opacity,
  loop = true,
  style,
  zIndex = 0,
}: LuminAmbientProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const video = LUMIN_VIDEOS.find(v => v.id === videoId);

  const [screenshotMode, setScreenshotMode] = useState(
    () => localStorage.getItem("lifeos_screenshot_mode") === "true"
  );
  const [luminEnabled, setLuminEnabled] = useState(
    () => localStorage.getItem("lifeos_lumin_enabled") !== "false"
  );
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "lifeos_screenshot_mode") setScreenshotMode(e.newValue === "true");
      if (e.key === "lifeos_lumin_enabled") setLuminEnabled(e.newValue !== "false");
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.play().catch(() => {});
  }, [videoId]);

  if (!video?.url || screenshotMode || !luminEnabled) return null;

  // ── Edge-fade mode (default for content pages) ─────────────────────────────
  // Lumin bleeds in from the right, masked so only a soft glow/silhouette shows.
  if (mode === "edge-fade" || mode === "corner") {
    const o = opacity ?? 0.15;
    return (
      <>
        {/* Background scrim: keeps the page background color visible on the right side
            so text printed over that region remains legible regardless of video content */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "min(52vw, 520px)",
            height: "100vh",
            zIndex: zIndex - 1,
            pointerEvents: "none",
            background: "linear-gradient(to right, transparent 0%, var(--background) 55%)",
          }}
        />
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.2, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "min(52vw, 520px)",
            height: "100vh",
            zIndex,
            pointerEvents: "none",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%)",
            opacity: o,
            ...style,
          }}
        >
          <video
            ref={videoRef}
            src={video.url}
            autoPlay
            muted
            loop={loop}
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center center",
              mixBlendMode: "normal",
              display: "block",
            }}
          />
        </motion.div>
      </>
    );
  }

  // ── Floor-glow mode ────────────────────────────────────────────────────────
  // Lumin anchored to the bottom, only her lower third visible — like candlelight.
  if (mode === "floor-glow") {
    const o = opacity ?? 0.10;
    return (
      <>
        {/* Bottom scrim so content above the floor video stays on the page background */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: "min(50vh, 500px)",
            zIndex: zIndex - 1,
            pointerEvents: "none",
            background: "linear-gradient(to bottom, var(--background) 0%, transparent 60%)",
          }}
        />
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.2, ease: "easeOut" }}
          style={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(70vw, 700px)",
            height: "min(50vh, 500px)",
            zIndex,
            pointerEvents: "none",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%)",
            opacity: o,
            ...style,
          }}
        >
          <video
            ref={videoRef}
            src={video.url}
            autoPlay
            muted
            loop={loop}
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center bottom",
              mixBlendMode: "normal",
              display: "block",
            }}
          />
        </motion.div>
      </>
    );
  }

  // ── Dominant mode (onboarding / founding welcome only) ─────────────────────
  const o = opacity ?? 0.65;
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.2, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(88vw, 860px)",
        aspectRatio: "16/9",
        zIndex,
        pointerEvents: "none",
        opacity: o,
        ...style,
      }}
    >
      <video
        ref={videoRef}
        src={video.url}
        autoPlay
        muted
        loop={loop}
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          mixBlendMode: "screen",
          display: "block",
        }}
      />
    </motion.div>
  );
}
