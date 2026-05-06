/**
 * LuminAmbient — Lumin as the dominant visual presence on a page.
 *
 * Design principle: The page revolves around Lumin.
 * She is larger than life — content floats over her world.
 *
 * Two modes:
 *   dominant (default) — Lumin fills the viewport center, content overlaid on top.
 *   corner             — Legacy small placement for secondary contexts.
 */

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.play().catch(() => {/* autoplay blocked — silent fail */});
  }, [videoId]);

  if (!video?.url) return null;

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
        }}
      />
    </div>
  );
}
