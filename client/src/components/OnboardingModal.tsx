import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { LUMIN_VIDEOS } from "@/data/lumin";

/* ─── Storage keys ───────────────────────────────────────────────── */
const STORAGE_KEY = "lifewoven_onboarded_v8";
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
}

const SCENES: Scene[] = [
  {
    id: "birth",
    videoId: "core_unfurls",
    overlayOpacity: 0.35,
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
    videoId: "pointing_energy",
    overlayOpacity: 0.32,
    lines: [
      { text: "You weren't lacking.", startAt: 0.5, size: "xl" },
      { text: "You were unwoven.", startAt: 1.8, size: "xl", accent: true, italic: true },
      { text: "Lumin is here to weave it back.", startAt: 3.8, size: "lg" },
      { text: "Let's begin.", startAt: 5.5, size: "lg", accent: true },
    ],
    cta: "Take the Alignment Audit →",
  },
];

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
        ? `0 0 40px ${T.threadGlow}, 0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.9)`
        : "0 2px 16px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,0.95)",
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

/* ─── Main onboarding component — persistent portal, never unmounts ─ */
interface Props { userId?: number | null; }

export default function OnboardingModal({ userId }: Props) {
  const [, navigate] = useLocation();
  const [open, setOpen]         = useState(false);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [finished, setFinished] = useState(false);

  // Portal visibility — controls the outer wrapper opacity only
  const [portalVisible, setPortalVisible] = useState(false);

  // A/B video cross-fade: two <video> elements always mounted, we swap which is visible
  const [activeSlot, setActiveSlot] = useState<"a" | "b">("a");
  const [slotAUrl, setSlotAUrl]     = useState("");
  const [slotBUrl, setSlotBUrl]     = useState("");
  const [slotAReady, setSlotAReady] = useState(false);
  const [slotBReady, setSlotBReady] = useState(false);
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);

  // Text / button state
  const [videoTime, setVideoTime]   = useState(0);
  const [btnVisible, setBtnVisible] = useState(false);
  const [overlayOp, setOverlayOp]   = useState(0.35);
  const [lines, setLines]           = useState<Line[]>([]);
  const [cta, setCta]               = useState("");
  const [whisper, setWhisper]       = useState<string | undefined>();
  const [sceneKey, setSceneKey]     = useState(0); // bumped to reset word animations

  // Dissolve-out before closing
  const [dissolving, setDissolving] = useState(false);

  const completeMutation = trpc.profile.completeOnboarding.useMutation();
  const trackEvent       = trpc.system.trackEvent.useMutation();

  /* ── helpers ── */
  function getVideoUrl(videoId: string) {
    return LUMIN_VIDEOS.find(v => v.id === videoId)?.url ?? "";
  }

  function loadScene(idx: number) {
    const scene = SCENES[idx];
    if (!scene) return;

    const url = getVideoUrl(scene.videoId);
    const nextSlot = activeSlot === "a" ? "b" : "a";

    // Load the next video into the inactive slot
    if (nextSlot === "b") {
      setSlotBReady(false);
      setSlotBUrl(url);
    } else {
      setSlotAReady(false);
      setSlotAUrl(url);
    }

    setOverlayOp(scene.overlayOpacity);
    setLines(scene.lines);
    setCta(scene.cta);
    setWhisper(scene.whisper);
    setVideoTime(0);
    setBtnVisible(false);
    setSceneKey(k => k + 1);

    // Schedule CTA reveal
    const lastLine = scene.lines[scene.lines.length - 1];
    const wordCount = lastLine.text.split(" ").length;
    const btnDelay = (lastLine.startAt + wordCount * 0.07 + 1.2) * 1000;
    const t = setTimeout(() => setBtnVisible(true), btnDelay);

    // Swap to the new slot once it's ready (or after a short timeout)
    const swapTimeout = setTimeout(() => {
      setActiveSlot(nextSlot);
    }, 300); // give the video 300ms to start loading before swapping

    return () => { clearTimeout(t); clearTimeout(swapTimeout); };
  }

  /* ── initial load ── */
  useEffect(() => {
    if (!localStorage.getItem(DEVICE_KEY)) setOpen(true);
  }, []);

  /* ── replay event ── */
  useEffect(() => {
    const handler = () => {
      setSceneIdx(0);
      setFinished(false);
      setDissolving(false);
      setOpen(true);
    };
    window.addEventListener("lifewoven:replay-onboarding", handler);
    return () => window.removeEventListener("lifewoven:replay-onboarding", handler);
  }, []);

  /* ── when open, fade in the portal ── */
  useEffect(() => {
    if (open) {
      setPortalVisible(false);
      // Seed slot A with scene 0 immediately
      const scene0 = SCENES[0];
      setSlotAUrl(getVideoUrl(scene0.videoId));
      setSlotAReady(false);
      setActiveSlot("a");
      setOverlayOp(scene0.overlayOpacity);
      setLines(scene0.lines);
      setCta(scene0.cta);
      setWhisper(scene0.whisper);
      setVideoTime(0);
      setBtnVisible(false);
      setSceneKey(1);
      // Fade in after a tick
      requestAnimationFrame(() => requestAnimationFrame(() => setPortalVisible(true)));

      // CTA for scene 0
      const lastLine = scene0.lines[scene0.lines.length - 1];
      const wordCount = lastLine.text.split(" ").length;
      const btnDelay = (lastLine.startAt + wordCount * 0.07 + 1.2) * 1000;
      const t = setTimeout(() => setBtnVisible(true), btnDelay);

      // History
      window.history.pushState({ onboarding: true }, "");
      const onPop = () => setOpen(false);
      window.addEventListener("popstate", onPop);
      return () => {
        clearTimeout(t);
        window.removeEventListener("popstate", onPop);
      };
    }
  }, [open]);

  /* ── video time tracking ── */
  useEffect(() => {
    const vid = activeSlot === "a" ? videoARef.current : videoBRef.current;
    if (!vid) return;
    const onTime = () => setVideoTime(vid.currentTime);
    vid.addEventListener("timeupdate", onTime);
    return () => vid.removeEventListener("timeupdate", onTime);
  }, [activeSlot]);

  /* ── keyboard / swipe ── */
  useEffect(() => {
    if (!open || finished) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") handleAdvance();
      if (e.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, finished, sceneIdx]);

  useEffect(() => {
    if (!open || finished) return;
    let startX = 0;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onEnd   = (e: TouchEvent) => {
      if (e.changedTouches[0].clientX - startX < -40) handleAdvance();
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend",   onEnd,   { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend",   onEnd);
    };
  }, [open, finished, sceneIdx]);

  /* ── actions ── */
  function dismiss() {
    localStorage.setItem(DEVICE_KEY, "1");
    if (userId) localStorage.setItem(`${STORAGE_KEY}_${userId}`, "1");
    completeMutation.mutate({ recommendedPathway: "align" });
    if (window.history.state?.onboarding) {
      window.history.replaceState({}, "", window.location.pathname);
    }
    setOpen(false);
    setPortalVisible(false);
  }

  const handleAdvance = useCallback(() => {
    trackEvent.mutate({ event: "onboarding_slide_advance", properties: { from: sceneIdx, scene: SCENES[sceneIdx]?.id } });
    const next = sceneIdx + 1;
    if (next < SCENES.length) {
      setSceneIdx(next);
      loadScene(next);
    } else {
      setFinished(true);
      // Load the finished screen video into the inactive slot
      const finUrl = getVideoUrl("alignment_audit");
      const nextSlot = activeSlot === "a" ? "b" : "a";
      if (nextSlot === "b") { setSlotBReady(false); setSlotBUrl(finUrl); }
      else { setSlotAReady(false); setSlotAUrl(finUrl); }
      setTimeout(() => setActiveSlot(nextSlot), 300);
    }
  }, [sceneIdx, activeSlot]);

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

  const isSlotAActive = activeSlot === "a";

  return (
    /* ── Persistent outer wrapper — NEVER unmounts while open ── */
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "#000",
      opacity: dissolving ? 0 : portalVisible ? 1 : 0,
      transition: dissolving
        ? "opacity 0.8s ease"
        : portalVisible
          ? "opacity 0.6s ease"
          : "none",
      pointerEvents: portalVisible && !dissolving ? "auto" : "none",
    }}>

      {/* ── Video slot A ── */}
      <video
        ref={videoARef}
        src={slotAUrl}
        autoPlay muted loop playsInline
        onCanPlay={() => setSlotAReady(true)}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          mixBlendMode: "screen",
          opacity: isSlotAActive && slotAReady ? 1 : 0,
          transition: "opacity 0.6s ease",
          zIndex: 1,
        }}
      />

      {/* ── Video slot B ── */}
      <video
        ref={videoBRef}
        src={slotBUrl}
        autoPlay muted loop playsInline
        onCanPlay={() => setSlotBReady(true)}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          mixBlendMode: "screen",
          opacity: !isSlotAActive && slotBReady ? 1 : 0,
          transition: "opacity 0.6s ease",
          zIndex: 1,
        }}
      />

      {/* ── Gradient overlay ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2,
        background: `linear-gradient(
          to top,
          rgba(0,0,0,${overlayOp + 0.35}) 0%,
          rgba(0,0,0,${overlayOp * 0.6}) 40%,
          rgba(0,0,0,${overlayOp * 0.2}) 100%
        )`,
        pointerEvents: "none",
        transition: "background 0.6s ease",
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
      {!finished && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "0 clamp(1.5rem,6vw,5rem) 2.5rem",
          zIndex: 10,
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", gap: "0.6rem",
        }}>
          {/* Lines */}
          <div key={sceneKey} style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: "0.5rem", marginBottom: "1.6rem",
          }}>
            {lines.map((line, li) => (
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

          {/* CTA */}
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
              {cta}
            </button>
            {whisper && (
              <p style={{ color: T.quiet, fontSize: "0.75rem", fontStyle: "italic", letterSpacing: "0.04em" }}>
                {whisper}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Finished screen content ── */}
      {finished && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "0 clamp(1.5rem,6vw,5rem) 3rem",
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", gap: "1rem", zIndex: 10,
          opacity: finished ? 1 : 0,
          transform: finished ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.9s ease 0.5s, transform 0.9s ease 0.5s",
        }}>
          {/* "the weave begins now" — dark background pill so it reads against Lumin's glow */}
          <p style={{
            fontFamily: "Georgia, serif", fontStyle: "italic",
            color: T.thread,
            fontSize: "clamp(0.85rem,1.5vw,1rem)",
            letterSpacing: "0.06em",
            textShadow: "0 2px 12px rgba(0,0,0,1), 0 1px 4px rgba(0,0,0,1)",
            background: "rgba(0,0,0,0.55)",
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
              onClick={() => { setFinished(false); setSceneIdx(0); loadScene(0); }}
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
