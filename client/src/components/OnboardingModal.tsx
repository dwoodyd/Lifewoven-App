import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { LUMIN_VIDEOS } from "@/data/lumin";

/* ─── Storage keys ───────────────────────────────────────────────── */
const STORAGE_KEY = "lifewoven_onboarded_v7";
const DEVICE_KEY  = `${STORAGE_KEY}_device`;

export function replayOnboarding(userId?: number | null) {
  localStorage.removeItem(DEVICE_KEY);
  if (userId) localStorage.removeItem(`${STORAGE_KEY}_${userId}`);
  window.dispatchEvent(new CustomEvent("lifewoven:replay-onboarding"));
}

/* ─── Design tokens ──────────────────────────────────────────────── */
const T = {
  thread:      "#d8b878",
  threadGlow:  "rgba(216,184,120,0.55)",
  ink:         "#f0ebe1",
  muted:       "rgba(240,235,225,0.55)",
  quiet:       "rgba(240,235,225,0.28)",
  state:       "#e07b6e",
  story:       "#d6a96a",
  standards:   "#6fb597",
  strategy:    "#6f8fc4",
  stewardship: "#b89e6a",
};

/* ─── Scene definitions — each authored around Lumin's action ───── */
interface Scene {
  id: string;
  videoId: string;
  /** Words appear one by one; timing in seconds from video start */
  lines: Array<{
    text: string;
    startAt: number;   // seconds into the video when this line begins revealing
    accent?: boolean;  // golden colour
    size?: "xl" | "lg" | "md" | "sm";
    italic?: boolean;
  }>;
  /** CTA button label */
  cta: string;
  /** Optional whisper below CTA */
  whisper?: string;
  /** Overlay darkness: 0 = fully transparent, 1 = fully black */
  overlayOpacity: number;
  /** Where to position the text block */
  textAlign: "center" | "bottom-center" | "bottom-left";
}

const SCENES: Scene[] = [
  {
    // Lumin's core lights up and unfurls — she is being born
    id: "birth",
    videoId: "core_unfurls",
    overlayOpacity: 0.35,
    textAlign: "bottom-center",
    lines: [
      { text: "Something in you", startAt: 0.5, size: "xl" },
      { text: "has always known", startAt: 1.4, size: "xl" },
      { text: "you were made for more.", startAt: 2.4, size: "xl", accent: true, italic: true },
      { text: "You just couldn't hold it all together.", startAt: 4.2, size: "md" },
    ],
    cta: "I know this feeling →",
  },
  {
    // Lumin slides into view — she arrives for you
    id: "arrival",
    videoId: "sliding_in_1",
    overlayOpacity: 0.4,
    textAlign: "bottom-center",
    lines: [
      { text: "Meet Lumin.", startAt: 0.8, size: "xl", accent: true },
      { text: "She's been waiting for you.", startAt: 2.0, size: "lg" },
      { text: "Not a chatbot. Not a coach.", startAt: 3.8, size: "md" },
      { text: "A living companion for your inner work.", startAt: 5.0, size: "md" },
    ],
    cta: "What does she do? →",
  },
  {
    // Lumin self-soothes — she shows you what inner state feels like
    id: "state",
    videoId: "self_soothing",
    overlayOpacity: 0.38,
    textAlign: "bottom-center",
    lines: [
      { text: "She feels what you feel.", startAt: 0.6, size: "xl" },
      { text: "Your emotional state isn't noise.", startAt: 2.2, size: "lg" },
      { text: "It's", startAt: 3.8, size: "xl" },
      { text: "data.", startAt: 4.1, size: "xl", accent: true, italic: true },
      { text: "Lumin uses it to shape your whole day.", startAt: 5.2, size: "md" },
    ],
    cta: "Show me how →",
  },
  {
    // Lumin bobs and taps — she's listening, present, curious
    id: "oracle",
    videoId: "bobs_taps",
    overlayOpacity: 0.42,
    textAlign: "bottom-center",
    lines: [
      { text: "She listens.", startAt: 0.5, size: "xl" },
      { text: "To your check-ins. Your journal.", startAt: 1.8, size: "lg" },
      { text: "The patterns you can't see yourself.", startAt: 3.2, size: "lg" },
      { text: "Then she tells you the next right step.", startAt: 5.0, size: "md", accent: true },
    ],
    cta: "What about when I fall? →",
    whisper: "The Oracle — available on Seeker & Oracle plans.",
  },
  {
    // Lumin bounces joyfully — she celebrates resilience
    id: "reset",
    videoId: "bouncing_joyfully",
    overlayOpacity: 0.35,
    textAlign: "bottom-center",
    lines: [
      { text: "When you break the streak —", startAt: 0.6, size: "xl" },
      { text: "she doesn't shame you back.", startAt: 1.8, size: "xl", accent: true, italic: true },
      { text: "She bounces.", startAt: 3.2, size: "lg" },
      { text: "Because she knows you'll come back.", startAt: 4.6, size: "md" },
      { text: "She always does.", startAt: 5.8, size: "md" },
    ],
    cta: "Begin the weave →",
  },
  {
    // Lumin points with energy — she's sending you forward
    id: "launch",
    videoId: "pointing_energy",
    overlayOpacity: 0.32,
    textAlign: "bottom-center",
    lines: [
      { text: "You weren't lacking.", startAt: 0.5, size: "xl" },
      { text: "You were", startAt: 1.8, size: "xl" },
      { text: "unwoven.", startAt: 2.3, size: "xl", accent: true, italic: true },
      { text: "Lumin is here to weave it back.", startAt: 3.8, size: "lg" },
      { text: "Let's begin.", startAt: 5.5, size: "lg", accent: true },
    ],
    cta: "Take the Alignment Audit →",
  },
];

/* ─── Word-by-word reveal ────────────────────────────────────────── */
function WordReveal({
  text, active, baseDelay = 0, accent = false, italic = false,
  size = "md",
}: {
  text: string; active: boolean; baseDelay?: number;
  accent?: boolean; italic?: boolean; size?: "xl" | "lg" | "md" | "sm";
}) {
  const sizeMap = { xl: "clamp(2rem,5vw,3.2rem)", lg: "clamp(1.4rem,3vw,2rem)", md: "clamp(1rem,2vw,1.2rem)", sm: "0.85rem" };
  const words = text.split(" ");
  return (
    <span style={{
      display: "inline",
      color: accent ? T.thread : T.ink,
      fontStyle: italic ? "italic" : "normal",
      fontSize: sizeMap[size],
      fontFamily: size === "xl" || size === "lg" ? "Georgia, serif" : "inherit",
      fontWeight: size === "xl" ? 500 : 400,
      lineHeight: 1.15,
      textShadow: accent
        ? `0 0 40px ${T.threadGlow}, 0 2px 8px rgba(0,0,0,0.8)`
        : "0 2px 12px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)",
    }}>
      {words.map((w, i) => (
        <span key={i} style={{
          display: "inline-block",
          opacity: active ? 1 : 0,
          transform: active ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
          transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${baseDelay + i * 0.07}s,
                       transform 0.6s cubic-bezier(0.22,1,0.36,1) ${baseDelay + i * 0.07}s`,
          marginRight: "0.3em",
        }}>{w}</span>
      ))}
    </span>
  );
}

/* ─── Scene renderer ─────────────────────────────────────────────── */
function LuminScene({
  scene, onAdvance, onSkip, isLast, sceneIndex, totalScenes,
}: {
  scene: Scene;
  onAdvance: () => void;
  onSkip: () => void;
  isLast: boolean;
  sceneIndex: number;
  totalScenes: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoTime, setVideoTime] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [btnVisible, setBtnVisible] = useState(false);
  const [dissolving, setDissolving] = useState(false);

  const videoUrl = LUMIN_VIDEOS.find(v => v.id === scene.videoId)?.url ?? "";

  // Track video time for word-sync
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onTime = () => setVideoTime(vid.currentTime);
    vid.addEventListener("timeupdate", onTime);
    return () => vid.removeEventListener("timeupdate", onTime);
  }, []);

  // Show CTA button after last line has had time to appear
  useEffect(() => {
    setVideoTime(0);
    setVideoLoaded(false);
    setBtnVisible(false);
    setDissolving(false);
    const lastLine = scene.lines[scene.lines.length - 1];
    const wordCount = lastLine.text.split(" ").length;
    const btnDelay = (lastLine.startAt + wordCount * 0.07 + 1.2) * 1000;
    const t = setTimeout(() => setBtnVisible(true), btnDelay);
    return () => clearTimeout(t);
  }, [scene]);

  function handleAdvance() {
    setDissolving(true);
    setTimeout(onAdvance, 700);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "#000",
        opacity: dissolving ? 0 : 1,
        transition: dissolving ? "opacity 0.7s ease" : "opacity 0.5s ease",
      }}
    >
      {/* Full-bleed Lumin video */}
      <video
        ref={videoRef}
        key={videoUrl}
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        onCanPlay={() => setVideoLoaded(true)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: videoLoaded ? 1 : 0,
          transition: "opacity 0.8s ease",
          // Strip black background — Lumin's woven form floats over the dark field
          mixBlendMode: "screen",
        }}
      />

      {/* Dark overlay — lets text breathe without killing the video */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(
          to top,
          rgba(0,0,0,${scene.overlayOpacity + 0.35}) 0%,
          rgba(0,0,0,${scene.overlayOpacity * 0.6}) 40%,
          rgba(0,0,0,${scene.overlayOpacity * 0.2}) 100%
        )`,
        pointerEvents: "none",
      }} />

      {/* Skip button — top right, always present */}
      {sceneIndex === 0 && (
        <button
          onClick={onSkip}
          style={{
            position: "absolute", top: 24, right: 24, zIndex: 10,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: T.quiet, fontSize: "0.7rem", letterSpacing: "0.14em",
            padding: "0.45rem 1rem", borderRadius: 999, cursor: "pointer",
            fontFamily: "inherit", backdropFilter: "blur(8px)",
            transition: "color 0.2s, border-color 0.2s",
          }}
          onMouseEnter={e => {
            (e.target as HTMLElement).style.color = T.muted;
            (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.3)";
          }}
          onMouseLeave={e => {
            (e.target as HTMLElement).style.color = T.quiet;
            (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
          }}
        >
          Skip intro
        </button>
      )}

      {/* Scene dot progress — top center */}
      <div style={{
        position: "absolute", top: 28, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 6, zIndex: 10,
      }}>
        {Array.from({ length: totalScenes }).map((_, i) => (
          <div key={i} style={{
            height: 3,
            width: i === sceneIndex ? 20 : 4,
            background: i === sceneIndex
              ? T.thread
              : i < sceneIndex
                ? "rgba(255,255,255,0.35)"
                : "rgba(255,255,255,0.12)",
            borderRadius: 999,
            transition: "width 0.4s ease, background 0.4s ease",
            boxShadow: i === sceneIndex ? `0 0 8px ${T.threadGlow}` : "none",
          }} />
        ))}
      </div>

      {/* Text block — bottom center, word-synced to video time */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "0 clamp(1.5rem, 6vw, 5rem) 2.5rem",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.6rem",
        textAlign: "center",
      }}>
        {/* Lines — each reveals when videoTime passes its startAt */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", marginBottom: "1.6rem" }}>
          {scene.lines.map((line, li) => {
            const lineActive = videoTime >= line.startAt;
            const wordCount = scene.lines.slice(0, li).reduce((acc, l) => acc + l.text.split(" ").length, 0);
            return (
              <div key={li} style={{ lineHeight: 1.2 }}>
                <WordReveal
                  text={line.text}
                  active={lineActive}
                  baseDelay={0}
                  accent={line.accent}
                  italic={line.italic}
                  size={line.size ?? "md"}
                />
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{
          opacity: btnVisible ? 1 : 0,
          transform: btnVisible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
        }}>
          <button
            onClick={handleAdvance}
            style={{
              background: `linear-gradient(135deg, ${T.thread}, #c9a55a)`,
              color: "#1a1610",
              border: "none",
              padding: "1rem 2.8rem",
              borderRadius: 999,
              fontSize: "0.98rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.01em",
              boxShadow: `0 0 40px rgba(216,184,120,0.5), 0 8px 28px rgba(0,0,0,0.5)`,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={e => {
              (e.target as HTMLElement).style.transform = "scale(1.05) translateY(-1px)";
              (e.target as HTMLElement).style.boxShadow = `0 0 60px rgba(216,184,120,0.75), 0 12px 36px rgba(0,0,0,0.6)`;
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.transform = "scale(1) translateY(0)";
              (e.target as HTMLElement).style.boxShadow = `0 0 40px rgba(216,184,120,0.5), 0 8px 28px rgba(0,0,0,0.5)`;
            }}
          >
            {scene.cta}
          </button>

          {scene.whisper && (
            <p style={{
              color: T.quiet,
              fontSize: "0.75rem",
              fontStyle: "italic",
              letterSpacing: "0.04em",
            }}>
              {scene.whisper}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Finished screen — dissolves into the app ───────────────────── */
function FinishedScreen({ onDismiss, onNavigate }: { onDismiss: () => void; onNavigate: (path: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [dissolving, setDissolving] = useState(false);
  const videoUrl = LUMIN_VIDEOS.find(v => v.id === "sliding_in_2")?.url ?? "";

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  function go(path: string) {
    setDissolving(true);
    setTimeout(() => { onDismiss(); onNavigate(path); }, 900);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200, background: "#000",
      opacity: dissolving ? 0 : 1,
      transition: dissolving ? "opacity 0.9s ease" : "opacity 0.5s ease",
    }}>
      {/* Lumin slides in — the door opens */}
      <video
        key={videoUrl}
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          mixBlendMode: "screen",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s ease",
        }}
      />

      {/* Gradient veil — bottom heavy so text is readable */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.05) 100%)",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "0 clamp(1.5rem,6vw,5rem) 3rem",
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", gap: "1rem",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.9s ease 0.4s, transform 0.9s ease 0.4s",
      }}>
        <p style={{
          fontFamily: "Georgia, serif", fontStyle: "italic",
          color: T.thread, fontSize: "clamp(0.85rem,1.5vw,1rem)",
          letterSpacing: "0.06em",
          textShadow: `0 0 30px ${T.threadGlow}`,
          marginBottom: "0.4rem",
        }}>
          — the weave begins now.
        </p>

        <h1 style={{
          fontFamily: "Georgia, serif", fontWeight: 500,
          fontSize: "clamp(2rem,5vw,3rem)", lineHeight: 1.1,
          color: "white",
          textShadow: "0 2px 20px rgba(0,0,0,0.9)",
          marginBottom: "0.5rem",
        }}>
          The first thread is yours.
        </h1>

        <p style={{
          color: T.muted, fontSize: "clamp(0.95rem,1.8vw,1.1rem)", lineHeight: 1.7,
          maxWidth: 480,
          textShadow: "0 1px 8px rgba(0,0,0,0.8)",
          marginBottom: "0.5rem",
        }}>
          Open your dashboard whenever you're ready.<br />
          Lumin is already waiting inside.
        </p>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
          <button
            onClick={() => go("/audit")}
            style={{
              background: `linear-gradient(135deg, ${T.thread}, #c9a55a)`,
              color: "#1a1610", border: "none",
              padding: "1.05rem 2.8rem", borderRadius: 999,
              fontSize: "1rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              boxShadow: `0 0 40px rgba(216,184,120,0.5), 0 8px 32px rgba(0,0,0,0.5)`,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.transform = "scale(1.04)"; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = "scale(1)"; }}
          >
            Take the Alignment Audit →
          </button>

          <button
            onClick={() => go("/pricing")}
            style={{
              background: "rgba(111,143,196,0.12)", color: "#6f8fc4",
              border: "1px solid rgba(111,143,196,0.35)",
              padding: "0.75rem 2rem", borderRadius: 999,
              fontSize: "0.88rem", fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.background = "rgba(111,143,196,0.22)"; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = "rgba(111,143,196,0.12)"; }}
          >
            Unlock the Oracle — $49/mo
          </button>

          <button
            onClick={() => { setVisible(false); setTimeout(() => { onDismiss(); onNavigate("/"); }, 500); }}
            style={{
              background: "transparent", color: T.quiet, border: "none",
              cursor: "pointer", fontSize: "0.85rem", fontFamily: "inherit",
              fontStyle: "italic", marginTop: "0.25rem",
              transition: "color 0.2s",
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = T.muted; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = T.quiet; }}
          >
            I want to feel it again
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
interface Props { userId?: number | null; }

export default function OnboardingModal({ userId }: Props) {
  const [, navigate] = useLocation();
  const [open, setOpen]       = useState(false);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [finished, setFinished] = useState(false);
  const completeMutation = trpc.profile.completeOnboarding.useMutation();
  const trackEvent = trpc.system.trackEvent.useMutation();

  // Open on first device visit
  useEffect(() => {
    if (!localStorage.getItem(DEVICE_KEY)) setOpen(true);
  }, []);

  // Replay event
  useEffect(() => {
    const handler = () => { setSceneIdx(0); setFinished(false); setOpen(true); };
    window.addEventListener("lifewoven:replay-onboarding", handler);
    return () => window.removeEventListener("lifewoven:replay-onboarding", handler);
  }, []);

  // Push history entry so browser Back closes the modal
  useEffect(() => {
    if (open) {
      window.history.pushState({ onboarding: true }, "");
      const onPop = () => setOpen(false);
      window.addEventListener("popstate", onPop);
      return () => window.removeEventListener("popstate", onPop);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open || finished) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") handleAdvance();
      if (e.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, finished, sceneIdx]);

  // Swipe
  useEffect(() => {
    if (!open || finished) return;
    let startX = 0;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onEnd   = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (dx < -40) handleAdvance();
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend",   onEnd,   { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend",   onEnd);
    };
  }, [open, finished, sceneIdx]);

  function dismiss() {
    localStorage.setItem(DEVICE_KEY, "1");
    if (userId) localStorage.setItem(`${STORAGE_KEY}_${userId}`, "1");
    completeMutation.mutate({ recommendedPathway: "align" });
    if (window.history.state?.onboarding) {
      window.history.replaceState({}, "", window.location.pathname);
    }
    setOpen(false);
  }

  const handleAdvance = useCallback(() => {
    trackEvent.mutate({ event: "onboarding_slide_advance", properties: { from: sceneIdx, scene: SCENES[sceneIdx]?.id } });
    if (sceneIdx < SCENES.length - 1) {
      setSceneIdx(i => i + 1);
    } else {
      setFinished(true);
    }
  }, [sceneIdx]);

  function handleSkip() {
    trackEvent.mutate({ event: "onboarding_complete", properties: { skipped: true, at: sceneIdx } });
    dismiss();
  }

  if (!open) return null;

  if (finished) {
    return (
      <FinishedScreen
        onDismiss={dismiss}
        onNavigate={(path) => navigate(path)}
      />
    );
  }

  return (
    <LuminScene
      key={sceneIdx}
      scene={SCENES[sceneIdx]}
      onAdvance={handleAdvance}
      onSkip={handleSkip}
      isLast={sceneIdx === SCENES.length - 1}
      sceneIndex={sceneIdx}
      totalScenes={SCENES.length}
    />
  );
}
