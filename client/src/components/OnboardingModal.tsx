import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { LUMIN_VIDEOS } from "@/data/lumin";

/* ─── Storage keys ───────────────────────────────────────────────── */
const STORAGE_KEY = "lifewoven_onboarded_v9";
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
};

/* ─── Scene definitions ──────────────────────────────────────────── */
interface Line {
  text: string;
  startAt: number;
  accent?: boolean;
  size?: "xl" | "lg" | "md" | "sm";
  italic?: boolean;
}

interface Scene {
  id: string;
  videoId: string;
  lines: Line[];
  cta: string;
  whisper?: string;
  overlayOpacity: number;
  loop?: boolean;
}

const SCENES: Scene[] = [
  {
    id: "pain",
    videoId: "screen1_hero",
    overlayOpacity: 0.38,
    loop: true,
    lines: [
      { text: "FOR PEOPLE WHO'VE READ THE BOOKS", startAt: 0.5, size: "sm", accent: true },
      { text: "You have the books.", startAt: 1.8, size: "xl" },
      { text: "Something still isn't woven.", startAt: 3.0, size: "xl", accent: true, italic: true },
      { text: "The wisdom you've gathered doesn't need more reading.", startAt: 4.8, size: "md" },
      { text: "It needs a place to land.", startAt: 6.2, size: "md", accent: true },
    ],
    cta: "Show me how →",
    whisper: "I'm tired of starting over.",
  },
  {
    id: "reframe",
    videoId: "nodding_gently",
    overlayOpacity: 0.35,
    loop: true,
    lines: [
      { text: "Your inner state isn't noise.", startAt: 0.6, size: "xl" },
      { text: "It's the first signal.", startAt: 2.0, size: "xl", accent: true, italic: true },
      { text: "Most days you push through it.", startAt: 3.6, size: "md" },
      { text: "We'll start by asking — once, honestly — where you actually are.", startAt: 5.0, size: "md" },
      { text: "Lumin will be here.", startAt: 6.8, size: "lg", accent: true },
    ],
    cta: "And the story I tell myself? →",
  },
  {
    id: "system",
    videoId: "holographic_panel",
    overlayOpacity: 0.32,
    loop: true,
    lines: [
      { text: "THE 5S FRAMEWORK", startAt: 0.5, size: "sm", accent: true },
      { text: "Five dimensions. One life, woven.", startAt: 1.8, size: "xl" },
      { text: "Your state shapes your story.", startAt: 3.4, size: "md" },
      { text: "Your story sets your standards.", startAt: 4.6, size: "md" },
      { text: "Hold them as one thing.", startAt: 5.8, size: "lg", accent: true, italic: true },
    ],
    cta: "What if I fall? →",
  },
  {
    id: "reset",
    videoId: "transformation",
    overlayOpacity: 0.35,
    loop: true,
    lines: [
      { text: "PATHWAY · FLAGSHIP", startAt: 0.4, size: "sm", accent: true },
      { text: "When you fall —", startAt: 1.4, size: "xl" },
      { text: "Reset doesn't shame you back.", startAt: 2.6, size: "xl", accent: true, italic: true },
      { text: "Most systems break the moment you break the streak.", startAt: 4.2, size: "md" },
      { text: "The flagship pathway is built for the day after.", startAt: 5.8, size: "md" },
    ],
    cta: "And before the words? →",
  },
  {
    id: "contemplative",
    videoId: "self_hug",
    overlayOpacity: 0.30,
    loop: true,
    lines: [
      { text: "A contemplative practice —", startAt: 0.5, size: "xl" },
      { text: "before prayer, before speech.", startAt: 1.8, size: "xl", italic: true },
      { text: "For the moments when language fails.", startAt: 3.4, size: "md" },
      { text: "Two-minute practices for the days you don't have ten.", startAt: 5.0, size: "md" },
    ],
    cta: "Show me where to start →",
  },
  {
    id: "launch",
    videoId: "burst_joy",
    overlayOpacity: 0.28,
    loop: true,
    lines: [
      { text: "WOVEN", startAt: 0.4, size: "sm", accent: true },
      { text: "You were unwoven.", startAt: 1.6, size: "xl", accent: true, italic: true },
      { text: "Let's begin the weave.", startAt: 2.8, size: "xl" },
      { text: "Twelve questions. Three to five minutes.", startAt: 4.4, size: "md" },
      { text: "Free, no account required.", startAt: 5.6, size: "md" },
    ],
    cta: "Take the Audit →",
    whisper: "I'll come back to it.",
  },
];

function getVideoUrl(videoId: string) {
  return LUMIN_VIDEOS.find(v => v.id === videoId)?.url ?? "";
}

/* ─── Word-by-word reveal ────────────────────────────────────────── */
/**
 * Once `active` flips to true the words animate in and STAY visible.
 * We never reset them — the prop is one-way (false → true only per scene).
 */
function WordReveal({
  text, active, accent = false, italic = false, size = "md",
}: {
  text: string; active: boolean; accent?: boolean; italic?: boolean;
  size?: "xl" | "lg" | "md" | "sm";
}) {
  // Latch: once active becomes true, it stays true even if videoTime resets on loop
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (active && !revealed) setRevealed(true);
  }, [active]);

  const sizeMap = {
    xl: "clamp(2rem,5vw,3.2rem)",
    lg: "clamp(1.4rem,3vw,2rem)",
    md: "clamp(1rem,2vw,1.2rem)",
    sm: "0.85rem",
  };
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
        ? `0 0 40px ${T.threadGlow}, 0 2px 8px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.95)`
        : "0 2px 16px rgba(0,0,0,0.98), 0 1px 4px rgba(0,0,0,0.98)",
    }}>
      {words.map((w, i) => (
        <span key={i} style={{
          display: "inline-block",
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
          transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.07}s,
                       transform 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.07}s`,
          marginRight: "0.3em",
        }}>{w}</span>
      ))}
    </span>
  );
}

/* ─── SceneText: mounts once per scene, never re-mounts on video loop ─── */
/**
 * Key insight: we give this component a stable key=sceneIdx so it only
 * re-mounts when the SCENE changes, not when the video loops.
 * videoTime is passed in and used only for the initial trigger threshold.
 */
function SceneText({
  scene, videoTime, btnVisible, onAdvance,
}: {
  scene: Scene;
  videoTime: number;
  btnVisible: boolean;
  onAdvance: () => void;
}) {
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      padding: "0 clamp(1.5rem,6vw,5rem) 2.5rem",
      zIndex: 10,
      display: "flex", flexDirection: "column", alignItems: "center",
      textAlign: "center", gap: "0.6rem",
    }}>
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: "0.5rem", marginBottom: "1.6rem",
      }}>
        {scene.lines.map((line, li) => (
          <div key={li} style={{ lineHeight: 1.2 }}>
            <WordReveal
              text={line.text}
              active={videoTime >= line.startAt}
              accent={line.accent}
              italic={line.italic}
              size={line.size ?? "md"}
            />
          </div>
        ))}
      </div>

      <div style={{
        opacity: btnVisible ? 1 : 0,
        transform: btnVisible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem",
      }}>
        <button
          onClick={onAdvance}
          style={{
            background: `linear-gradient(135deg, ${T.thread}, #c9a55a)`,
            color: "#1a1610", border: "none",
            padding: "1rem 2.8rem", borderRadius: 999,
            fontSize: "0.98rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
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
          <button
            onClick={onAdvance}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: T.quiet, fontSize: "0.82rem", fontStyle: "italic",
              letterSpacing: "0.04em", fontFamily: "inherit",
              transition: "color 0.2s",
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = T.muted; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = T.quiet; }}
          >
            {scene.whisper}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
interface Props { userId?: number | null; }

export default function OnboardingModal({ userId }: Props) {
  const [, navigate] = useLocation();
  const [open, setOpen]         = useState(false);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [finished, setFinished] = useState(false);
  const [fadeIn, setFadeIn]     = useState(false);
  const [dissolving, setDissolving] = useState(false);

  // ── A/B video cross-fade ──────────────────────────────────────────
  const [slotA, setSlotA] = useState({ url: "", visible: false, ready: false });
  const [slotB, setSlotB] = useState({ url: "", visible: false, ready: false });
  const [activeSlot, setActiveSlot] = useState<"a" | "b">("a");
  const activeSceneLoop = finished ? true : (SCENES[sceneIdx]?.loop ?? true);
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);

  // ── Scene UI state ────────────────────────────────────────────────
  // videoTime is used ONLY for the initial line trigger threshold.
  // We track it but WordReveal latches once revealed — so loops don't reset copy.
  const [videoTime, setVideoTime]   = useState(0);
  const [btnVisible, setBtnVisible] = useState(false);
  const currentScene = finished ? null : SCENES[sceneIdx];

  // ── tRPC — silent: onError suppresses the global toast ────────────
  // trackEvent requires auth; onboarding shows before login, so we silence failures.
  const completeMutation = trpc.profile.completeOnboarding.useMutation({ onError: () => {} });
  const trackEvent       = trpc.system.trackEvent.useMutation({ onError: () => {} });

  /* ── Preload next video into the inactive slot ─────────────────── */
  const preloadIntoInactiveSlot = useCallback((url: string) => {
    if (activeSlot === "a") {
      setSlotB(s => ({ ...s, url, ready: false, visible: false }));
    } else {
      setSlotA(s => ({ ...s, url, ready: false, visible: false }));
    }
  }, [activeSlot]);

  /* ── Swap to the inactive slot ── */
  const swapToInactiveSlot = useCallback(() => {
    if (activeSlot === "a") {
      const vidB = videoBRef.current;
      if (vidB) { vidB.currentTime = 0; vidB.play().catch(() => {}); }
      setSlotB(s => ({ ...s, visible: true }));
      setActiveSlot("b");
      setTimeout(() => {
        setSlotA(s => ({ ...s, visible: false }));
        if (videoARef.current) videoARef.current.pause();
      }, 50);
    } else {
      const vidA = videoARef.current;
      if (vidA) { vidA.currentTime = 0; vidA.play().catch(() => {}); }
      setSlotA(s => ({ ...s, visible: true }));
      setActiveSlot("a");
      setTimeout(() => {
        setSlotB(s => ({ ...s, visible: false }));
        if (videoBRef.current) videoBRef.current.pause();
      }, 50);
    }
  }, [activeSlot]);

  /* ── Open / replay ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!localStorage.getItem(DEVICE_KEY)) setOpen(true);
  }, []);

  useEffect(() => {
    const handler = () => {
      setSceneIdx(0); setFinished(false); setDissolving(false);
      setOpen(true);
    };
    window.addEventListener("lifewoven:replay-onboarding", handler);
    return () => window.removeEventListener("lifewoven:replay-onboarding", handler);
  }, []);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Init on open
  useEffect(() => {
    if (!open) return;
    const scene0 = SCENES[0];
    const url0 = getVideoUrl(scene0.videoId);
    setSlotA({ url: url0, visible: false, ready: false });
    setSlotB({ url: "", visible: false, ready: false });
    setActiveSlot("a");
    setSceneIdx(0);
    setFinished(false);
    setVideoTime(0);
    setBtnVisible(false);
    setDissolving(false);

    requestAnimationFrame(() => requestAnimationFrame(() => setFadeIn(true)));

    window.history.pushState({ onboarding: true }, "");
    const onPop = () => { setOpen(false); setFadeIn(false); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open]);

  /* ── Show slot A when ready and active ── */
  useEffect(() => {
    if (slotA.ready && activeSlot === "a" && !slotA.visible) {
      setSlotA(s => ({ ...s, visible: true }));
    }
  }, [slotA.ready, activeSlot]);

  useEffect(() => {
    if (slotB.ready && activeSlot === "b" && !slotB.visible) {
      setSlotB(s => ({ ...s, visible: true }));
    }
  }, [slotB.ready, activeSlot]);

  /* ── Preload next scene ── */
  useEffect(() => {
    if (!open || finished) return;
    const nextIdx = sceneIdx + 1;
    if (nextIdx < SCENES.length) {
      preloadIntoInactiveSlot(getVideoUrl(SCENES[nextIdx].videoId));
    } else {
      preloadIntoInactiveSlot(getVideoUrl("starburst_joy"));
    }
  }, [sceneIdx, open, finished]);

  /* ── CTA timer — fires once per scene, based on last line timing ── */
  useEffect(() => {
    if (!currentScene) return;
    setBtnVisible(false);
    const lastLine = currentScene.lines[currentScene.lines.length - 1];
    const wordCount = lastLine.text.split(" ").length;
    const delay = (lastLine.startAt + wordCount * 0.07 + 1.2) * 1000;
    const t = setTimeout(() => setBtnVisible(true), delay);
    return () => clearTimeout(t);
  }, [sceneIdx]); // only re-run when scene changes, NOT on video loop

  /* ── Wall-clock scene start time (fallback for slow/buffering video) ── */
  const sceneStartTimeRef = useRef<number>(Date.now());
  useEffect(() => {
    sceneStartTimeRef.current = Date.now();
  }, [sceneIdx]);

  /* ── Video time tracking ─────────────────────────────────────────
   * We track videoTime to trigger the initial word reveals.
   * Because WordReveal latches (revealed stays true), video loops
   * resetting currentTime to 0 won't hide the copy again.
   *
   * Wall-clock fallback: if the video hasn't advanced past a line's
   * startAt (e.g. still buffering on Safari), we use elapsed wall-clock
   * time so copy always appears even on slow connections.
   */
  useEffect(() => {
    const vid = activeSlot === "a" ? videoARef.current : videoBRef.current;
    let rafId: number;
    const rafLoop = () => {
      const vidTime = vid ? vid.currentTime : 0;
      // Use whichever is further along — video time or wall-clock elapsed
      const wallTime = (Date.now() - sceneStartTimeRef.current) / 1000;
      setVideoTime(Math.max(vidTime, wallTime));
      rafId = requestAnimationFrame(rafLoop);
    };
    rafId = requestAnimationFrame(rafLoop);
    return () => cancelAnimationFrame(rafId);
  }, [activeSlot, sceneIdx]); // sceneIdx ensures we re-attach on scene change

  /* ── Keyboard / swipe ── */
  const handleAdvanceRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!open || finished) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") handleAdvanceRef.current();
      if (e.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, finished]);

  useEffect(() => {
    if (!open || finished) return;
    let startX = 0;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onEnd   = (e: TouchEvent) => {
      if (e.changedTouches[0].clientX - startX < -40) handleAdvanceRef.current();
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend",   onEnd,   { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend",   onEnd);
    };
  }, [open, finished]);

  /* ── Actions ── */
  function dismiss() {
    localStorage.setItem(DEVICE_KEY, "1");
    if (userId) localStorage.setItem(`${STORAGE_KEY}_${userId}`, "1");
    completeMutation.mutate({ recommendedPathway: "align" });
    if (window.history.state?.onboarding) {
      window.history.replaceState({}, "", window.location.pathname);
    }
    setFadeIn(false);
    setTimeout(() => setOpen(false), 800);
  }

  const handleAdvance = useCallback(() => {
    trackEvent.mutate({
      event: "onboarding_slide_advance",
      properties: { from: sceneIdx, scene: SCENES[sceneIdx]?.id },
    });
    const next = sceneIdx + 1;
    if (next < SCENES.length) {
      swapToInactiveSlot();
      setSceneIdx(next);
      // Reset videoTime so new scene's lines trigger correctly
      setVideoTime(0);
      setBtnVisible(false);
    } else {
      swapToInactiveSlot();
      setFinished(true);
    }
  }, [sceneIdx, swapToInactiveSlot]);

  useEffect(() => { handleAdvanceRef.current = handleAdvance; }, [handleAdvance]);

  function handleSkip() {
    trackEvent.mutate({ event: "onboarding_complete", properties: { skipped: true, at: sceneIdx } });
    setDissolving(true);
    setTimeout(dismiss, 700);
  }

  function goTo(path: string) {
    setDissolving(true);
    setTimeout(() => { dismiss(); navigate(path); }, 900);
  }

  if (!open) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "#000",
      opacity: dissolving ? 0 : fadeIn ? 1 : 0,
      transition: dissolving ? "opacity 0.8s ease" : "opacity 0.5s ease",
      pointerEvents: fadeIn && !dissolving ? "auto" : "none",
      isolation: "isolate",
    }}>

      {/* Solid black base */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "#000", pointerEvents: "none",
      }} />

      {/* Video slot A */}
      <video
        ref={videoARef}
        {...(slotA.url ? { src: slotA.url } : {})}
        muted playsInline
        loop={activeSlot === "a" ? activeSceneLoop : false}
        autoPlay={activeSlot === "a"}
        onCanPlay={() => {
          if (activeSlot !== "a" && videoARef.current) videoARef.current.pause();
          setSlotA(s => ({ ...s, ready: true }));
        }}
        style={{
          position: "absolute", inset: 0, zIndex: 1,
          width: "100%", height: "100%",
          objectFit: "cover",
          mixBlendMode: "screen",
          opacity: slotA.visible ? 1 : 0,
          transition: "opacity 0.7s ease",
        }}
      />

      {/* Video slot B */}
      <video
        ref={videoBRef}
        {...(slotB.url ? { src: slotB.url } : {})}
        muted playsInline
        loop={activeSlot === "b" ? activeSceneLoop : false}
        autoPlay={activeSlot === "b"}
        onCanPlay={() => {
          if (activeSlot !== "b" && videoBRef.current) videoBRef.current.pause();
          setSlotB(s => ({ ...s, ready: true }));
        }}
        style={{
          position: "absolute", inset: 0, zIndex: 1,
          width: "100%", height: "100%",
          objectFit: "cover",
          mixBlendMode: "screen",
          opacity: slotB.visible ? 1 : 0,
          transition: "opacity 0.7s ease",
        }}
      />

      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2,
        background: `linear-gradient(
          to top,
          rgba(0,0,0,${(currentScene?.overlayOpacity ?? 0.4) + 0.35}) 0%,
          rgba(0,0,0,${(currentScene?.overlayOpacity ?? 0.4) * 0.6}) 40%,
          rgba(0,0,0,${(currentScene?.overlayOpacity ?? 0.4) * 0.2}) 100%
        )`,
        pointerEvents: "none",
        transition: "background 0.8s ease",
      }} />

      {/* Skip button (scene 0 only) */}
      {!finished && sceneIdx === 0 && (
        <button
          onClick={handleSkip}
          style={{
            position: "absolute", top: 24, right: 24, zIndex: 10,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: T.quiet, fontSize: "0.7rem", letterSpacing: "0.14em",
            padding: "0.45rem 1rem", borderRadius: 999, cursor: "pointer",
            fontFamily: "inherit", backdropFilter: "blur(8px)",
          }}
        >
          Skip intro
        </button>
      )}

      {/* Scene dot progress */}
      {!finished && (
        <div style={{
          position: "absolute", top: 28, left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 6, zIndex: 10,
        }}>
          {SCENES.map((_, i) => (
            <div key={i} style={{
              height: 3,
              width: i === sceneIdx ? 20 : 4,
              background: i === sceneIdx
                ? T.thread
                : i < sceneIdx ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)",
              borderRadius: 999,
              transition: "width 0.4s ease, background 0.4s ease",
              boxShadow: i === sceneIdx ? `0 0 8px ${T.threadGlow}` : "none",
            }} />
          ))}
        </div>
      )}

      {/* Scene text — key=sceneIdx ensures it re-mounts only on scene change, not on video loop */}
      {!finished && currentScene && (
        <SceneText
          key={sceneIdx}
          scene={currentScene}
          videoTime={videoTime}
          btnVisible={btnVisible}
          onAdvance={handleAdvance}
        />
      )}

      {/* Finished screen */}
      {finished && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "0 clamp(1.5rem,6vw,5rem) 3rem",
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", gap: "1rem", zIndex: 10,
          animation: "fadeSlideUp 0.9s ease 0.3s both",
        }}>
          <style>{`
            @keyframes fadeSlideUp {
              from { opacity: 0; transform: translateY(24px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <p style={{
            fontFamily: "Georgia, serif", fontStyle: "italic",
            color: T.thread,
            fontSize: "clamp(0.85rem,1.5vw,1rem)",
            letterSpacing: "0.06em",
            textShadow: "0 2px 12px rgba(0,0,0,1), 0 1px 4px rgba(0,0,0,1)",
            background: "rgba(0,0,0,0.6)",
            padding: "0.3rem 1rem",
            borderRadius: 999,
            backdropFilter: "blur(6px)",
            marginBottom: "0.2rem",
          }}>
            — the weave begins now.
          </p>

          <h1 style={{
            fontFamily: "Georgia, serif", fontWeight: 500,
            fontSize: "clamp(2rem,5vw,3rem)", lineHeight: 1.1,
            color: "white",
            textShadow: "0 2px 24px rgba(0,0,0,1), 0 1px 6px rgba(0,0,0,1)",
            marginBottom: "0.4rem",
          }}>
            The first thread is yours.
          </h1>

          <p style={{
            color: T.muted, fontSize: "clamp(0.95rem,1.8vw,1.1rem)", lineHeight: 1.7,
            maxWidth: 480,
            textShadow: "0 2px 12px rgba(0,0,0,1), 0 1px 4px rgba(0,0,0,1)",
            marginBottom: "0.4rem",
          }}>
            Open your dashboard whenever you're ready.<br />
            Lumin is already waiting inside.
          </p>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", marginTop: "0.4rem" }}>
            <button
              onClick={() => goTo("/audit")}
              style={{
                background: `linear-gradient(135deg, ${T.thread}, #c9a55a)`,
                color: "#1a1610", border: "none",
                padding: "1.05rem 2.8rem", borderRadius: 999,
                fontSize: "1rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                boxShadow: `0 0 40px rgba(216,184,120,0.5), 0 8px 32px rgba(0,0,0,0.5)`,
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.transform = "scale(1.04)"; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.transform = "scale(1)"; }}
            >
              Take the Alignment Audit →
            </button>

            <button
              onClick={() => goTo("/pricing")}
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
              onClick={() => { setFinished(false); setSceneIdx(0); setVideoTime(0); setBtnVisible(false); }}
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
      )}
    </div>
  );
}
