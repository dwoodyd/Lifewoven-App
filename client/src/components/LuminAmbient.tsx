/**
 * LuminAmbient — Lumin as the dominant visual presence on a page.
 *
 * Design principle: The page revolves around Lumin.
 * She is larger than life — content floats over her world.
 *
 * Two modes:
 *   dominant (default) — Lumin fills the viewport center, content overlaid on top.
 *   corner             — Legacy small placement for secondary contexts.
 *
 * VEO watermark crop: The container uses overflow:hidden and the video is scaled
 * to 112% and shifted slightly left/up so the bottom-right watermark is clipped
 * outside the visible area. The character remains fully centered.
 */

import { useEffect, useRef, useState } from "react";
import { LUMIN_VIDEOS } from "@/data/lumin";

export type LuminPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "center-right"
  | "center-left"
  | "top-center"
  | "bottom-center"
  | "center";

export type LuminMode = "dominant" | "corner";

interface LuminAmbientProps {
  /** Video ID from the LUMIN_VIDEOS catalogue */
  videoId: string;
  /**
   * "dominant" — Lumin fills the viewport, content floats over her (default).
   * "corner"   — Small fixed placement at an edge (legacy).
   */
  mode?: LuminMode;
  /** Where to anchor Lumin (only used in "corner" mode, default: "center") */
  position?: LuminPosition;
  /**
   * In "dominant" mode: width as CSS value (default: "min(90vw, 900px)").
   * In "corner" mode: width as CSS value (default: "min(32vw, 400px)").
   */
  size?: string;
  /** Overall opacity (default: dominant=0.65, corner=0.45) */
  opacity?: number;
  /** Whether to loop the video (default: true) */
  loop?: boolean;
  /** Extra CSS applied to the outer wrapper */
  style?: React.CSSProperties;
  /** z-index (default: dominant=0, corner=0) */
  zIndex?: number;
  /** Offset from the anchor edge in px — corner mode only */
  offset?: number;
}

const CORNER_POSITION_STYLES: Record<LuminPosition, React.CSSProperties> = {
  "top-right":     { top: 0,    right: 0 },
  "top-left":      { top: 0,    left: 0 },
  "bottom-right":  { bottom: 0, right: 0 },
  "bottom-left":   { bottom: 0, left: 0 },
  "center-right":  { top: "50%", right: 0,   transform: "translateY(-50%)" },
  "center-left":   { top: "50%", left: 0,    transform: "translateY(-50%)" },
  "top-center":    { top: 0,    left: "50%", transform: "translateX(-50%)" },
  "bottom-center": { bottom: 0, left: "50%", transform: "translateX(-50%)" },
  "center":        { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
};

/**
 * Watermark crop style applied to every <video> element.
 *
 * The VEO watermark sits in the bottom-right corner of the video frame.
 * We scale the video to 112% and shift it slightly left and up so the
 * watermark is pushed outside the container's overflow:hidden boundary.
 * The character stays visually centered because we compensate with a
 * negative translate on both axes.
 */
const VIDEO_CROP_STYLE: React.CSSProperties = {
  // Scale up so we have room to shift without leaving gaps
  transform: "scale(1.12) translate(-5%, -5%)",
  // Ensure the transform origin is the center of the video
  transformOrigin: "center center",
};

export function LuminAmbient({
  videoId,
  mode = "dominant",
  position = "center",
  size,
  opacity,
  loop = true,
  style,
  zIndex = 0,
  offset = 0,
}: LuminAmbientProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const video = LUMIN_VIDEOS.find(v => v.id === videoId);

  // Screenshot mode — hide Lumin when user has enabled it in Settings
  const [screenshotMode, setScreenshotMode] = useState(
    () => localStorage.getItem("lifeos_screenshot_mode") === "true"
  );
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "lifeos_screenshot_mode") {
        setScreenshotMode(e.newValue === "true");
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.play().catch(() => {/* autoplay blocked — silent fail */});
  }, [videoId]);

  if (!video?.url) return null;
  if (screenshotMode) return null;

  // ── Dominant mode ──────────────────────────────────────────────────────────
  if (mode === "dominant") {
    const dominantSize  = size    ?? "min(88vw, 860px)";
    const dominantOpacity = opacity ?? 0.65;

    return (
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: dominantSize,
          aspectRatio: "16/9",
          zIndex,
          pointerEvents: "none",
          opacity: dominantOpacity,
          overflow: "hidden",   // clips the watermark
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
            ...VIDEO_CROP_STYLE,
          }}
        />
      </div>
    );
  }

  // ── Corner mode (legacy) ───────────────────────────────────────────────────
  const cornerSize    = size    ?? "min(32vw, 400px)";
  const cornerOpacity = opacity ?? 0.45;
  const posStyle = CORNER_POSITION_STYLES[position];

  const offsetStyle: React.CSSProperties = {};
  if (offset) {
    if ("top"    in posStyle && posStyle.top    === 0) offsetStyle.top    = offset;
    if ("bottom" in posStyle && posStyle.bottom === 0) offsetStyle.bottom = offset;
    if ("left"   in posStyle && posStyle.left   === 0) offsetStyle.left   = offset;
    if ("right"  in posStyle && posStyle.right  === 0) offsetStyle.right  = offset;
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        width: cornerSize,
        aspectRatio: "16/9",
        zIndex,
        pointerEvents: "none",
        opacity: cornerOpacity,
        overflow: "hidden",   // clips the watermark
        ...posStyle,
        ...offsetStyle,
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
          mixBlendMode: "screen",
          display: "block",
          ...VIDEO_CROP_STYLE,
        }}
      />
    </div>
  );
}
