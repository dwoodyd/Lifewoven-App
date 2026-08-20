/**
 * LuminScene — immersive full-bleed Lumin video experience.
 *
 * Design principles:
 *  - Full-bleed video fills 100vw × 100vh; UI text floats over it.
 *  - mix-blend-mode: screen strips the black background so Lumin's
 *    woven limbs and golden glow float transparently over any UI layer.
 *  - No chrome: nav, sidebar, and progress bars are hidden during a scene.
 *  - Word-by-word copy syncs to video currentTime via onTimeUpdate.
 *  - Dissolve transition: the scene fades + scales out into the next view.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { LUMIN_VIDEOS } from "@/data/lumin";
import { getLumenPoster } from "@shared/lumenMedia";

// ── Types ────────────────────────────────────────────────────────────────────

export interface WordTiming {
  word: string;
  /** Time in seconds at which this word appears */
  t: number;
}

export interface LuminSceneProps {
  /** ID from LUMIN_VIDEOS catalogue */
  videoId: string;
  /** Words to reveal in sync with the video. Each entry has a word + timestamp. */
  words?: WordTiming[];
  /** Large headline shown above the word-sync copy */
  headline?: string;
  /** Called when the video ends (or skip is pressed) */
  onComplete?: () => void;
  /** If true, show a "Skip" button */
  showSkip?: boolean;
  /** If true, the video loops instead of calling onComplete */
  loop?: boolean;
  /** Overlay opacity (0–1). Default 0.35 */
  overlayOpacity?: number;
  /** If true, Lumin is blended over existing page content (ambient mode).
   *  If false (default), the scene is a full-screen takeover. */
  ambient?: boolean;
  /** Ambient mode: size of the video container (CSS value). Default "40vw" */
  ambientSize?: string;
  /** Ambient mode: CSS position for the container */
  ambientPosition?: React.CSSProperties;
  /** Ambient mode: media fit inside its portrait footprint. */
  ambientFit?: "cover" | "contain";
  /** Ambient mode: source-aware frame ratio. Defaults to the standard Lumen portrait scene. */
  ambientAspectRatio?: string;
  /** Ambient mode: preserve black matte rather than screen-blending video when the scene is a dedicated panel. */
  ambientBlendMode?: "screen" | "normal";
  /** Optional max width for a specific ambient scene; defaults preserve existing secondary media sizes. */
  ambientMaxWidth?: string;
  /** Optional CSS mask for softly dissolving an ambient scene into its surrounding composition. */
  ambientMaskImage?: string;
  /** Extra className on the root element */
  className?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getVideoUrl(id: string): string {
  const v = LUMIN_VIDEOS.find((v) => v.id === id);
  return v?.url ?? "";
}

// ── Component ────────────────────────────────────────────────────────────────

export function LuminScene({
  videoId,
  words = [],
  headline,
  onComplete,
  showSkip = true,
  loop = false,
  overlayOpacity = 0.35,
  ambient = false,
  ambientSize = "40vw",
  ambientPosition,
  ambientFit = "cover",
  ambientAspectRatio = "4 / 5",
  ambientBlendMode = "screen",
  ambientMaxWidth = "min(86vw, 520px)",
  ambientMaskImage,
  className = "",
}: LuminSceneProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [visibleWords, setVisibleWords] = useState<string[]>([]);
  const [dissolving, setDissolving] = useState(false);
  const [entered, setEntered] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(!ambient);
  const [videoReady, setVideoReady] = useState(false);

  const url = getVideoUrl(videoId);
  const poster = getLumenPoster(videoId);

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Ambient clips are decorative. Give the browser a small intersection window
  // before loading one, while a portrait poster is visible immediately.
  useEffect(() => {
    setVideoReady(false);
    setShouldLoadVideo(!ambient);
  }, [ambient, videoId]);

  useEffect(() => {
    if (!ambient || shouldLoadVideo || !sceneRef.current) return;
    const target = sceneRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [ambient, shouldLoadVideo]);

  // Word-sync via timeupdate
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || words.length === 0) return;
    const ct = videoRef.current.currentTime;
    const revealed = words.filter((w) => w.t <= ct).map((w) => w.word);
    setVisibleWords(revealed);
  }, [words]);

  // Dissolve out then call onComplete
  const handleComplete = useCallback(() => {
    if (dissolving) return;
    setDissolving(true);
    setTimeout(() => {
      onComplete?.();
    }, 700);
  }, [dissolving, onComplete]);

  const handleVideoEnd = useCallback(() => {
    if (!loop) handleComplete();
  }, [loop, handleComplete]);

  // ── Ambient mode — Lumin floats over existing content ──────────────────
  if (ambient) {
    return (
      <div
        ref={sceneRef}
        className={className}
        style={{
          position: "absolute",
          pointerEvents: "none",
          zIndex: 10,
          ...ambientPosition,
          width: ambientSize,
          minWidth: ambientSize === "68px" ? undefined : "min(30vw, 380px)",
          maxWidth: ambientMaxWidth,
          aspectRatio: ambientAspectRatio,
          overflow: "hidden",
          WebkitMaskImage: ambientMaskImage,
          maskImage: ambientMaskImage,
          transition: "opacity 1.2s ease",
          opacity: entered ? 1 : 0,
        }}
      >
        <video
          ref={videoRef}
          src={shouldLoadVideo ? url : undefined}
          poster={poster}
          preload="none"
          autoPlay={shouldLoadVideo}
          muted
          loop={loop}
          playsInline
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoReady(false)}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnd}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: ambientFit,
            mixBlendMode: ambientBlendMode,
            background: "var(--card)",
            display: "block",
          }}
        />
      </div>
    );
  }

  // ── Full-screen takeover mode ───────────────────────────────────────────
  return (
    <div
      ref={sceneRef}
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        transition: dissolving
          ? "opacity 0.7s ease, transform 0.7s ease"
          : "opacity 0.5s ease",
        opacity: dissolving ? 0 : entered ? 1 : 0,
        transform: dissolving ? "scale(1.04)" : "scale(1)",
      }}
    >
      {/* ── Full-bleed video ── */}
      <video
        ref={videoRef}
        src={shouldLoadVideo ? url : undefined}
        poster={poster}
        preload="none"
        autoPlay={shouldLoadVideo}
        muted
        loop={loop}
        playsInline
        onCanPlay={() => setVideoReady(true)}
        onError={() => setVideoReady(false)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnd}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          mixBlendMode: "screen",
          background: "#000",
          zIndex: 1,
        }}
      />

      {/* ── Dark overlay so text is readable ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `rgba(8, 6, 18, ${overlayOpacity})`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* ── Synchronized copy ── */}
      {(headline || words.length > 0) && (
        <div
          style={{
            position: "absolute",
            bottom: "12%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 3,
            textAlign: "center",
            maxWidth: "min(680px, 90vw)",
            padding: "0 1.5rem",
          }}
        >
          {headline && (
            <h1
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "clamp(1.6rem, 4vw, 2.8rem)",
                fontWeight: 400,
                color: "#fff",
                letterSpacing: "0.02em",
                lineHeight: 1.25,
                marginBottom: "1rem",
                textShadow: "0 2px 24px rgba(0,0,0,0.8)",
              }}
            >
              {headline}
            </h1>
          )}

          {words.length > 0 && (
            <p
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "clamp(1rem, 2.2vw, 1.35rem)",
                fontWeight: 300,
                color: "rgba(255,255,255,0.92)",
                lineHeight: 1.7,
                letterSpacing: "0.01em",
                textShadow: "0 1px 16px rgba(0,0,0,0.9)",
                minHeight: "3em",
              }}
            >
              {words.map((w, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    marginRight: "0.3em",
                    transition: "opacity 0.25s ease, transform 0.3s ease",
                    opacity: visibleWords.includes(w.word) &&
                      visibleWords.indexOf(w.word) === words.findIndex((x) => x.word === w.word && x.t === w.t)
                      ? 1 : 0,
                    transform: visibleWords.includes(w.word) ? "translateY(0)" : "translateY(6px)",
                  }}
                >
                  {w.word}
                </span>
              ))}
            </p>
          )}
        </div>
      )}

      {/* ── Skip button ── */}
      {showSkip && !loop && (
        <button
          onClick={handleComplete}
          style={{
            position: "absolute",
            bottom: "5%",
            right: "5%",
            zIndex: 4,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "2rem",
            color: "rgba(255,255,255,0.6)",
            fontSize: "0.8rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "0.5rem 1.2rem",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.15)";
            (e.currentTarget as HTMLButtonElement).style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)";
          }}
        >
          Skip
        </button>
      )}
    </div>
  );
}

// ── LuminOnboarding — the full multi-scene onboarding sequence ───────────────

export interface OnboardingScene {
  videoId: string;
  headline?: string;
  words?: WordTiming[];
}

interface LuminOnboardingProps {
  scenes: OnboardingScene[];
  onComplete: () => void;
}

export function LuminOnboarding({ scenes, onComplete }: LuminOnboardingProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const advance = useCallback(() => {
    if (transitioning) return;
    if (sceneIndex < scenes.length - 1) {
      setTransitioning(true);
      setTimeout(() => {
        setSceneIndex((i) => i + 1);
        setTransitioning(false);
      }, 200); // brief gap between scenes
    } else {
      onComplete();
    }
  }, [sceneIndex, scenes.length, onComplete, transitioning]);

  const scene = scenes[sceneIndex];
  if (!scene) return null;

  return (
    <LuminScene
      key={sceneIndex}
      videoId={scene.videoId}
      headline={scene.headline}
      words={scene.words}
      onComplete={advance}
      showSkip={true}
      loop={false}
      overlayOpacity={0.3}
    />
  );
}
