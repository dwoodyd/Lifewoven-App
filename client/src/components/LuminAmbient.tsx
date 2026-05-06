/**
 * LuminAmbient — places Lumin as a scene element, not a UI element.
 * She floats in the space behind the content using mix-blend-mode: screen,
 * so her black background disappears and only her woven form glows through.
 *
 * Design principle: Lumin is IN the page, not ON the page.
 * The content lives inside her world, not on top of her.
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
  | "bottom-center";

interface LuminAmbientProps {
  /** Video ID from the LUMIN_VIDEOS catalogue */
  videoId: string;
  /** Where to anchor Lumin in the viewport */
  position?: LuminPosition;
  /** Width as a CSS value (default: "min(32vw, 400px)") */
  size?: string;
  /** Overall opacity (default: 0.55) */
  opacity?: number;
  /** Whether to loop the video (default: true) */
  loop?: boolean;
  /** Extra CSS applied to the outer wrapper */
  style?: React.CSSProperties;
  /** z-index (default: 0 — behind content) */
  zIndex?: number;
  /** Offset from the anchor edge in px (default: 0) */
  offset?: number;
}

const POSITION_STYLES: Record<LuminPosition, React.CSSProperties> = {
  "top-right":     { top: 0,    right: 0 },
  "top-left":      { top: 0,    left: 0 },
  "bottom-right":  { bottom: 0, right: 0 },
  "bottom-left":   { bottom: 0, left: 0 },
  "center-right":  { top: "50%", right: 0,  transform: "translateY(-50%)" },
  "center-left":   { top: "50%", left: 0,   transform: "translateY(-50%)" },
  "top-center":    { top: 0,    left: "50%", transform: "translateX(-50%)" },
  "bottom-center": { bottom: 0, left: "50%", transform: "translateX(-50%)" },
};

export function LuminAmbient({
  videoId,
  position = "top-right",
  size = "min(32vw, 400px)",
  opacity = 0.55,
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
    // Ensure autoplay starts even if browser deferred it
    el.play().catch(() => {/* autoplay blocked — silent fail */});
  }, [videoId]);

  if (!video?.url) return null;

  const posStyle = POSITION_STYLES[position];

  // Apply offset to the relevant edge
  const offsetStyle: React.CSSProperties = {};
  if (offset) {
    if ("top" in posStyle && posStyle.top === 0)    offsetStyle.top    = offset;
    if ("bottom" in posStyle && posStyle.bottom === 0) offsetStyle.bottom = offset;
    if ("left" in posStyle && posStyle.left === 0)  offsetStyle.left   = offset;
    if ("right" in posStyle && posStyle.right === 0) offsetStyle.right  = offset;
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        width: size,
        aspectRatio: "16/9",
        zIndex,
        pointerEvents: "none",
        opacity,
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
