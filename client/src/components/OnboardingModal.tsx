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
  loop?: boolean;  // default true; set false to play once and hold last frame
}

const SCENES: Scene[] = [
  {
    id: "birth",
    videoId: "core_unfurls",
    overlayOpacity: 0.35,
    loop: false,
    lines: [
      { text: "Something in you", startAt: 0.5, size: "xl" },
      { text: "has always known", startAt: 1.4, size: "xl" },
      { text: "you were made for more.", startAt: 2.4, size: "xl", accent: true, italic: true },
      { text: "You just couldn't hold it all together.", startAt: 4.2, size: "md" },
    ],
    cta: "I know this feeling →",
  },
  {
    id: "arrival",
    videoId: "sliding_in_1",
    overlayOpacity: 0.4,
    loop: false,
    lines: [
      { text: "Meet Lumin.", startAt: 0.8, size: "xl", accent: true },
      { text: "She's been waiting for you.", startAt: 2.0, size: "lg" },
      { text: "Not a chatbot. Not a coach.", startAt: 3.8, size: "md" },
      { text: "A living companion for your inner work.", startAt: 5.0, size: "md" },
    ],
    cta: "What does she do? →",
  },
  {
    id: "state",
    videoId: "self_soothing",
    overlayOpacity: 0.38,
    loop: false,
    lines: [
      { text: "She feels what you feel.", startAt: 0.6, size: "xl" },
      { text: "Your emotional state isn't noise.", startAt: 2.2, size: "lg" },
      { text: "It's data.", startAt: 3.8, size: "xl", accent: true, italic: true },
      { text: "Lumin uses it to shape your whole day.", startAt: 5.2, size: "md" },
    ],
    cta: "Show me how →",
  },
  {
    id: "oracle",
    videoId: "bobs_taps",
    overlayOpacity: 0.42,
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
    id: "reset",
    videoId: "bouncing_joyfully",
    overlayOpacity: 0.35,
    lines: [
      { text: "When you break the streak —", startAt: 0.6, size: "xl" },
      { text: "she doesn't shame you back.", startAt: 1.8, size: "xl", accent: true, italic: true },
      { text: "She bounces.", startAt: 3.2, size: "lg" },
      { text: "Because she knows you'll come back.", startAt: 4.6, size: "md" },
    ],
    cta: "Begin the weave →",
  },
  {
    id: "launch",
    videoId: "scene_9",
    overlayOpacity: 0.28,
    loop: false,
    lines: [
      { text: "You weren't lacking.", startAt: 0.5, size: "xl" },
      { text: "You were unwoven.", startAt: 1.8, size: "xl", accent: true, italic: true },
      { text: "Lumin is here to weave it back.", startAt: 3.8, size: "lg" },
      { text: "Let's begin.", startAt: 5.5, size: "lg", accent: true },
    ],
    cta: "Take the Alignment Audit →",
  },
];

function getVideoUrl(videoId: string) {
  return LUMIN_VIDEOS.find(v => v.id === videoId)?.url ?? "";
}

/* ─── Word-by-word reveal ────────────────────────────────────────── */
function WordReveal({
  text, active, accent = false, italic = false, size = "md",
}: {
  text: string; active: boolean; accent?: boolean; italic?: boolean;
  size?: "xl" | "lg" | "md" | "sm";
}) {
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
          opacity: active ? 1 : 0,
          transform: active ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
          transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.07}s,
                       transform 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.07}s`,
          marginRight: "0.3em",
        }}>{w}</span>
      ))}
    </span>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
interface Props { userId?: number | null; }

export default function OnboardingModal({ userId }: Props) {
  const [, navigate] = useLocation();
  const [open, setOpen]         = useState(false);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [finished, setFinished] = useState(false);
  const [fadeIn, setFadeIn]     = useState(false);   // portal entrance fade
  const [dissolving, setDissolving] = useState(false); // portal exit fade

  // ── A/B video cross-fade ──────────────────────────────────────────
  // We keep TWO <video> elements always mounted.
  // "active" slot is the one currently showing.
  // When advancing: load next URL into inactive slot → wait for canplay → swap active → fade out old.
  const [slotA, setSlotA] = useState({ url: "", visible: false, ready: false });
  const [slotB, setSlotB] = useState({ url: "", visible: false, ready: false });
  const [activeSlot, setActiveSlot] = useState<"a" | "b">("a");
  // Per-scene loop flag — derived from current scene
  const activeSceneLoop = finished ? true : (SCENES[sceneIdx]?.loop ?? true);
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);

  // ── Scene UI state ────────────────────────────────────────────────
  const [videoTime, setVideoTime]   = useState(0);
  const [btnVisible, setBtnVisible] = useState(false);
  const [sceneKey, setSceneKey]     = useState(0);
  const currentScene = finished ? null : SCENES[sceneIdx];

  // ── tRPC ──────────────────────────────────────────────────────────
  const completeMutation = trpc.profile.completeOnboarding.useMutation();
  const trackEvent       = trpc.system.trackEvent.useMutation();

  /* ── Preload next video into the inactive slot ─────────────────── */
  const preloadIntoInactiveSlot = useCallback((url: string) => {
    if (activeSlot === "a") {
      setSlotB(s => ({ ...s, url, ready: false, visible: false }));
    } else {
      setSlotA(s => ({ ...s, url, ready: false, visible: false }));
    }
  }, [activeSlot]);

  /* ── Swap to the inactive slot (called when it signals canplay) ── */
  const swapToInactiveSlot = useCallback(() => {
    if (activeSlot === "a") {
      // B is now ready — reset it to t=0 and play, then show it
      const vidB = videoBRef.current;
      if (vidB) {
        vidB.currentTime = 0;
        vidB.play().catch(() => {});
      }
      setSlotB(s => ({ ...s, visible: true }));
      setActiveSlot("b");
      setTimeout(() => {
        setSlotA(s => ({ ...s, visible: false }));
        // Pause the now-hidden slot A so it doesn't drift
        if (videoARef.current) videoARef.current.pause();
      }, 50);
    } else {
      // A is now ready — reset it to t=0 and play, then show it
      const vidA = videoARef.current;
      if (vidA) {
        vidA.currentTime = 0;
        vidA.play().catch(() => {});
      }
      setSlotA(s => ({ ...s, visible: true }));
      setActiveSlot("a");
      setTimeout(() => {
        setSlotB(s => ({ ...s, visible: false }));
        // Pause the now-hidden slot B so it doesn't drift
        if (videoBRef.current) videoBRef.current.pause();
      }, 50);
    }
  }, [activeSlot]);

  /* ── Initial open: seed slot A ───────────────────────────────────── */
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

  // Lock body scroll while onboarding is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

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
    setSceneKey(1);
    setDissolving(false);

    // Fade in portal after a tick
    requestAnimationFrame(() => requestAnimationFrame(() => setFadeIn(true)));

    // History
    window.history.pushState({ onboarding: true }, "");
    const onPop = () => { setOpen(false); setFadeIn(false); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open]);

  /* ── When slot A becomes ready and it's the active slot, show it ── */
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

  /* ── Preload next scene's video as soon as current scene starts ── */
  useEffect(() => {
    if (!open || finished) return;
    const nextIdx = sceneIdx + 1;
    if (nextIdx < SCENES.length) {
      const nextUrl = getVideoUrl(SCENES[nextIdx].videoId);
      preloadIntoInactiveSlot(nextUrl);
    } else {
      // Preload finished screen video
      preloadIntoInactiveSlot(getVideoUrl("alignment_audit"));
    }
  }, [sceneIdx, open, finished]);

  /* ── CTA timer ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (!currentScene) return;
    setBtnVisible(false);
    setVideoTime(0);
    const lastLine = currentScene.lines[currentScene.lines.length - 1];
    const wordCount = lastLine.text.split(" ").length;
    const delay = (lastLine.startAt + wordCount * 0.07 + 1.2) * 1000;
    const t = setTimeout(() => setBtnVisible(true), delay);
    return () => clearTimeout(t);
  }, [sceneKey]);

  /* ── Video time tracking — always track the active slot ─────────── */
  useEffect(() => {
    const vid = activeSlot === "a" ? videoARef.current : videoBRef.current;
    if (!vid) return;
    // Reset time for new scene
    setVideoTime(vid.currentTime);
    const onTime = () => setVideoTime(vid.currentTime);
    vid.addEventListener("timeupdate", onTime);
    // Also use requestAnimationFrame for smoother updates
    let rafId: number;
    const rafLoop = () => {
      if (vid) setVideoTime(vid.currentTime);
      rafId = requestAnimationFrame(rafLoop);
    };
    rafId = requestAnimationFrame(rafLoop);
    return () => {
      vid.removeEventListener("timeupdate", onTime);
      cancelAnimationFrame(rafId);
    };
  }, [activeSlot, sceneKey]);

  /* ── Keyboard / swipe ────────────────────────────────────────────── */
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

  /* ── Actions ─────────────────────────────────────────────────────── */
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
    trackEvent.mutate({ event: "onboarding_slide_advance", properties: { from: sceneIdx, scene: SCENES[sceneIdx]?.id } });
    const next = sceneIdx + 1;
    if (next < SCENES.length) {
      // Swap to the preloaded slot immediately
      swapToInactiveSlot();
      setSceneIdx(next);
      setSceneKey(k => k + 1);
      setBtnVisible(false);
      setVideoTime(0);
    } else {
      // Swap to the preloaded finished video
      swapToInactiveSlot();
      setFinished(true);
    }
  }, [sceneIdx, swapToInactiveSlot]);

  // Keep ref in sync so keyboard handler always has latest version
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
    /* ── Persistent portal — never unmounts while open ── */
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,           // High enough to cover everything including nav
      background: "#000",
      opacity: dissolving ? 0 : fadeIn ? 1 : 0,
      transition: dissolving ? "opacity 0.8s ease" : "opacity 0.5s ease",
      pointerEvents: fadeIn && !dissolving ? "auto" : "none",
      isolation: "isolate",
    }}>

      {/* ── Solid black base — prevents nav/page bleed-through under mix-blend-mode:screen ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "#000",
        pointerEvents: "none",
      }} />

      {/* ── Video slot A ── */}
      <video
        ref={videoARef}
        {...(slotA.url ? { src: slotA.url } : {})}
        muted playsInline
        loop={activeSlot === "a" ? activeSceneLoop : false}
        autoPlay={activeSlot === "a"}
        onCanPlay={() => {
          // When preloading into inactive slot, pause immediately so it doesn't drift
          if (activeSlot !== "a" && videoARef.current) {
            videoARef.current.pause();
          }
          setSlotA(s => ({ ...s, ready: true }));
        }}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          mixBlendMode: "screen",
          opacity: slotA.visible ? 1 : 0,
          transition: "opacity 0.7s ease",
          zIndex: 1,
        }}
      />

      {/* ── Video slot B ── */}
      <video
        ref={videoBRef}
        {...(slotB.url ? { src: slotB.url } : {})}
        muted playsInline
        loop={activeSlot === "b" ? activeSceneLoop : false}
        autoPlay={activeSlot === "b"}
        onCanPlay={() => {
          // When preloading into inactive slot, pause immediately so it doesn't drift
          if (activeSlot !== "b" && videoBRef.current) {
            videoBRef.current.pause();
          }
          setSlotB(s => ({ ...s, ready: true }));
        }}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          mixBlendMode: "screen",
          opacity: slotB.visible ? 1 : 0,
          transition: "opacity 0.7s ease",
          zIndex: 1,
        }}
      />

      {/* ── Gradient overlay ── */}
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

      {/* ── Skip button (scene 0 only) ── */}
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

      {/* ── Scene dot progress ── */}
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

      {/* ── Scene text ── */}
      {!finished && currentScene && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "0 clamp(1.5rem,6vw,5rem) 2.5rem",
          zIndex: 10,
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", gap: "0.6rem",
        }}>
          <div key={sceneKey} style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: "0.5rem", marginBottom: "1.6rem",
          }}>
            {currentScene.lines.map((line, li) => (
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
              onClick={handleAdvance}
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
              {currentScene.cta}
            </button>
            {currentScene.whisper && (
              <p style={{ color: T.quiet, fontSize: "0.75rem", fontStyle: "italic", letterSpacing: "0.04em" }}>
                {currentScene.whisper}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Finished screen ── */}
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
              onClick={() => { setFinished(false); setSceneIdx(0); setSceneKey(k => k + 1); setVideoTime(0); setBtnVisible(false); }}
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
