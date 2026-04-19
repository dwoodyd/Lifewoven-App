import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

/* ─── Design tokens (matching the HTML demo exactly) ─────────────── */
const T = {
  bg:          "#0d0c11",
  bgWarm:      "#14110f",
  ink:         "#f0ebe1",
  muted:       "#9a9389",
  quiet:       "#5d5751",
  paper:       "#f9f4eb",
  state:       "#e07b6e",
  story:       "#d6a96a",
  standards:   "#6fb597",
  strategy:    "#6f8fc4",
  stewardship: "#b89e6a",
  thread:      "#d8b878",
  card:        "rgba(255,255,255,0.03)",
  cardBorder:  "rgba(255,255,255,0.08)",
};

const STORAGE_KEY = "lifewoven_onboarded_v5";
const DEVICE_KEY  = `${STORAGE_KEY}_device`;

/* ─── Replay helper (exported for Nav/Settings) ───────────────────── */
export function replayOnboarding(userId?: number | null) {
  localStorage.removeItem(DEVICE_KEY);
  if (userId) localStorage.removeItem(`${STORAGE_KEY}_${userId}`);
  window.dispatchEvent(new CustomEvent("lifewoven:replay-onboarding"));
}

/* ═══════════════════════════════════════════════════════════════════
   SLIDE 1 — The thesis / five threads weaving
═══════════════════════════════════════════════════════════════════ */
function Slide1Art({ active }: { active: boolean }) {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 560, margin: "0 auto 1.75rem", height: 130 }}>
      <svg viewBox="0 0 580 160" style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}>
        {/* Five threads converging to a knot */}
        {[
          { d: "M 10 30 C 200 30, 300 70, 460 80 L 540 80",  color: T.state,       delay: "0.2s" },
          { d: "M 10 60 C 200 60, 280 75, 460 80 L 540 80",  color: T.story,       delay: "0.5s" },
          { d: "M 10 90 C 200 90, 280 85, 460 80 L 540 80",  color: T.standards,   delay: "0.8s" },
          { d: "M 10 120 C 200 120, 280 95, 460 80 L 540 80",color: T.strategy,    delay: "1.1s" },
          { d: "M 10 150 C 200 150, 300 110, 460 80 L 540 80",color: T.stewardship,delay: "1.4s" },
        ].map((p, i) => (
          <path key={i} d={p.d} fill="none" stroke={p.color} strokeWidth="1.5" strokeLinecap="round"
            strokeDasharray="1200" strokeDashoffset={active ? "0" : "1200"}
            style={{ transition: `stroke-dashoffset 3.6s ease-out ${p.delay}`, opacity: 0.75 }} />
        ))}
        {/* Knot */}
        <circle cx="540" cy="80" r="7" fill={T.thread}
          style={{
            opacity: active ? 1 : 0,
            filter: "drop-shadow(0 0 12px rgba(216,184,120,0.6))",
            transition: "opacity 0.8s ease 3.6s",
          }} />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SLIDE 2 — Emotional guidance scale
═══════════════════════════════════════════════════════════════════ */
function Slide2Art() {
  return (
    <div style={{
      margin: "1.5rem auto 0", maxWidth: 520,
      background: T.card, border: `1px solid ${T.cardBorder}`,
      borderRadius: 16, padding: "1.5rem 1.75rem",
      textAlign: "left", boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
    }}>
      <div style={{ color: T.state, fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
        Today's emotional guidance scale
      </div>
      <div style={{ color: "white", fontFamily: "Georgia, serif", fontSize: "1.1rem", marginBottom: "1rem" }}>
        Where are you right now?
      </div>
      {/* Track + drifting thumb */}
      <div style={{ position: "relative", height: 8, background: `linear-gradient(90deg, ${T.state} 0%, ${T.story} 50%, ${T.standards} 100%)`, borderRadius: 999, opacity: 0.55 }}>
        <div style={{
          position: "absolute", top: "50%", left: "32%",
          width: 16, height: 16,
          background: T.paper, borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 12px rgba(255,255,255,0.5)",
          animation: "thumbDrift 4s ease-in-out infinite alternate",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.6rem", color: T.muted, fontSize: "0.72rem", letterSpacing: "0.05em" }}>
        <span>Pessimism</span><span>Acceptance</span><span>Joy · Freedom</span>
      </div>
      {/* Declaration */}
      <div style={{
        marginTop: "1.25rem", padding: "0.85rem 1rem",
        background: "rgba(224,123,110,0.07)", border: "1px solid rgba(224,123,110,0.18)",
        borderRadius: 10, color: "white",
        fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "0.95rem", lineHeight: 1.5,
      }}>
        "I am someone whose inner state shapes outer experience, and I tend that state deliberately."
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SLIDE 3 — Five dimensions
═══════════════════════════════════════════════════════════════════ */
const PILLARS = [
  { cls: "state",       color: T.state,       name: "State",       desc: "Emotional alignment · nervous system regulation · daily grounding" },
  { cls: "story",       color: T.story,       name: "Story",       desc: "Belief rewriting · identity design · meaning-making" },
  { cls: "standards",   color: T.standards,   name: "Standards",   desc: "Habit architecture · daily scorecards · deep work" },
  { cls: "strategy",    color: T.strategy,    name: "Strategy",    desc: "Decision clarity · leverage mapping · AI analysis" },
  { cls: "stewardship", color: T.stewardship, name: "Stewardship", desc: "Energy · body · time · wealth — tended with intention" },
];

function Slide3Art({ active }: { active: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", margin: "1.5rem auto 0", maxWidth: 540, width: "100%" }}>
      {PILLARS.map((p, i) => (
        <div key={p.cls} style={{
          display: "flex", alignItems: "center", gap: "1rem",
          padding: "1rem 1.25rem",
          background: T.card, border: `1px solid ${T.cardBorder}`,
          borderRadius: 12, textAlign: "left",
          opacity: active ? 1 : 0,
          transform: active ? "translateY(0)" : "translateY(10px)",
          transition: `opacity 0.5s ease ${0.1 + i * 0.1}s, transform 0.5s ease ${0.1 + i * 0.1}s`,
        }}>
          <div style={{ width: 8, height: 32, borderRadius: 999, background: p.color, flexShrink: 0 }} />
          <div>
            <div style={{ color: "white", fontFamily: "Georgia, serif", fontSize: "1.05rem" }}>{p.name}</div>
            <div style={{ color: T.muted, fontSize: "0.82rem", marginTop: "0.15rem" }}>{p.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SLIDE 4 — Oracle orb
═══════════════════════════════════════════════════════════════════ */
function Slide4Art() {
  return (
    <div style={{ position: "relative", width: 200, height: 200, margin: "0 auto 1.75rem" }}>
      {/* Rings */}
      {[180, 130, 80].map((size, i) => (
        <div key={i} style={{
          position: "absolute", left: "50%", top: "50%",
          width: size, height: size,
          border: "1px solid rgba(216,184,120,0.18)",
          borderRadius: "50%",
          transform: "translate(-50%,-50%)",
          animation: `ringPulse 4s ease-in-out infinite ${i * 0.6}s`,
        }} />
      ))}
      {/* Core */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        width: 18, height: 18, borderRadius: "50%",
        background: T.thread,
        boxShadow: "0 0 30px rgba(216,184,120,0.8), 0 0 80px rgba(216,184,120,0.4)",
        transform: "translate(-50%,-50%)",
        animation: "corePulse 3s ease-in-out infinite",
      }} />
    </div>
  );
}

const ORACLE_MODES = [
  { name: "Guide",          when: "Open conversation" },
  { name: "Unstuck",        when: "When you're blocked" },
  { name: "Pattern Mirror", when: "What you can't see in yourself" },
];

/* ═══════════════════════════════════════════════════════════════════
   SLIDE 5 — Before the Words door
═══════════════════════════════════════════════════════════════════ */
function Slide5Art({ active }: { active: boolean }) {
  return (
    <div style={{ position: "relative", width: 200, height: 260, margin: "0 auto 1.5rem" }}>
      {/* Arch */}
      <div style={{
        position: "absolute", inset: 0,
        border: "1px solid rgba(216,184,120,0.32)",
        borderRadius: "100px 100px 0 0",
        boxShadow: "0 0 60px rgba(216,184,120,0.1), inset 0 0 30px rgba(216,184,120,0.05)",
      }} />
      {/* Rising light */}
      <div style={{
        position: "absolute", left: "50%", bottom: 0,
        width: "90%", height: "90%",
        background: "radial-gradient(ellipse at bottom, rgba(216,184,120,0.45), transparent 70%)",
        borderRadius: "50%",
        transformOrigin: "bottom center",
        transform: active ? "translateX(-50%) scaleY(1)" : "translateX(-50%) scaleY(0)",
        transition: "transform 3s ease-out 0.4s",
      }} />
      {/* Fleuron symbol */}
      <div style={{
        position: "absolute", left: "50%", top: "45%",
        transform: "translate(-50%,-50%)",
        fontFamily: "Georgia, serif", color: T.thread, fontStyle: "italic", fontSize: "1.2rem",
        opacity: active ? 0.85 : 0,
        transition: "opacity 1.2s ease 1.5s",
      }}>
        ❧
      </div>
    </div>
  );
}

const FEEL_STATES = ["I feel scattered", "I feel burdened", "I feel ready to settle"];

/* ═══════════════════════════════════════════════════════════════════
   SLIDE 6 — Reset card
═══════════════════════════════════════════════════════════════════ */
function Slide6Art() {
  return (
    <div style={{
      margin: "1.5rem auto 0", maxWidth: 540, padding: "1.75rem 2rem",
      background: "linear-gradient(180deg, rgba(111,181,151,0.08), rgba(255,255,255,0.02))",
      border: "1px solid rgba(111,181,151,0.18)",
      borderRadius: 18, textAlign: "left",
    }}>
      <span style={{
        display: "inline-block", padding: "0.25rem 0.7rem", borderRadius: 999,
        background: "rgba(111,181,151,0.15)", color: T.standards,
        fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.85rem",
      }}>
        Reset · 20–30 min
      </span>
      <div style={{ fontFamily: "Georgia, serif", fontSize: "1.5rem", color: "white", marginBottom: "0.3rem" }}>
        Resilience after setback
      </div>
      <div style={{ color: T.muted, fontSize: "0.85rem", marginBottom: "1.1rem" }}>
        For the morning after the night you didn't show up
      </div>
      <div style={{ color: T.ink, fontStyle: "italic", fontFamily: "Georgia, serif", fontSize: "1.08rem", lineHeight: 1.5 }}>
        "You came back. The system you built is still here. Nothing in it requires you to explain where you've been."
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SLIDE 7 — Close / woven ribbon
═══════════════════════════════════════════════════════════════════ */
function Slide7Art({ active }: { active: boolean }) {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 560, margin: "0 auto 1.75rem", height: 50 }}>
      <svg viewBox="0 0 580 50" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        {/* Single woven ribbon — all five colors blended */}
        <defs>
          <linearGradient id="ribbonGrad" x1="0" x2="1">
            <stop offset="0%"   stopColor={T.state} />
            <stop offset="25%"  stopColor={T.story} />
            <stop offset="50%"  stopColor={T.standards} />
            <stop offset="75%"  stopColor={T.strategy} />
            <stop offset="100%" stopColor={T.thread} />
          </linearGradient>
        </defs>
        <path d="M 0 25 Q 145 10, 290 25 T 580 25"
          fill="none" stroke="url(#ribbonGrad)" strokeWidth="3" strokeLinecap="round"
          strokeDasharray="1200" strokeDashoffset={active ? "0" : "1200"}
          style={{ transition: "stroke-dashoffset 2.4s ease-out 0.3s", opacity: 0.85 }}
          filter="drop-shadow(0 0 8px rgba(216,184,120,0.5))" />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SLIDE DEFINITIONS
═══════════════════════════════════════════════════════════════════ */
type SlideId = "thesis" | "state" | "framework" | "oracle" | "btw" | "reset" | "close";

interface SlideConfig {
  id: SlideId;
  eyebrow: string;
  eyebrowColor: string;
  headline: string;
  accentPart: string;       // the italic gold part of the headline
  headlineAfter?: string;   // text after the accent (if any)
  sub: string;
  whisper?: string;
  cta: string;
  bgColors: [string, string, string];
  glowColor: string;
  glowPos: { x: number; y: number };
}

const SLIDES: SlideConfig[] = [
  {
    id: "thesis",
    eyebrow: "For people who've read the books",
    eyebrowColor: T.thread,
    headline: "You have the vision.\nYou have the books.\n",
    accentPart: "Something still isn't woven.",
    sub: "Lifewoven is the operating system that integrates the five dimensions of a transformed life — so the wisdom you already carry actually becomes who you are.",
    cta: "Show me how it weaves →",
    bgColors: ["#0d0c11", "#14110f", "#0d0c11"],
    glowColor: "rgba(216,184,120,0.14)",
    glowPos: { x: 50, y: 60 },
  },
  {
    id: "state",
    eyebrow: "Module 1 · State",
    eyebrowColor: T.state,
    headline: "Your inner state isn't noise.\n",
    accentPart: "It's data.",
    sub: "Most days you push through whatever you're feeling. Lifewoven asks where you actually are — and uses your honest answer to shape the rest of the day.",
    cta: "What about the story I tell myself? →",
    bgColors: ["#100c0b", "#1a0f0d", "#100c0b"],
    glowColor: "rgba(224,123,110,0.14)",
    glowPos: { x: 50, y: 55 },
  },
  {
    id: "framework",
    eyebrow: "The 5S Framework",
    eyebrowColor: T.thread,
    headline: "Five dimensions.\n",
    accentPart: "One woven life.",
    sub: "Most personal-growth tools work on one thing. Lifewoven holds all five at once — because they're already entangled in you.",
    whisper: "Built on Frankl, Clear, Brown, and twelve other proven frameworks.",
    cta: "Will I have to do this alone? →",
    bgColors: ["#0b0d12", "#0f1320", "#0b0d12"],
    glowColor: "rgba(111,143,196,0.12)",
    glowPos: { x: 50, y: 50 },
  },
  {
    id: "oracle",
    eyebrow: "The Oracle",
    eyebrowColor: T.thread,
    headline: "You'll never ",
    accentPart: "practice alone.",
    sub: "Not a chatbot. A practice partner that listens to your check-ins, your journal entries, and your patterns — and tells you the next right step.",
    whisper: "Personalization is opt-in. The Oracle works without it too.",
    cta: "What about when I have nothing left? →",
    bgColors: ["#08080f", "#0a0a1a", "#08080f"],
    glowColor: "rgba(111,143,196,0.16)",
    glowPos: { x: 50, y: 45 },
  },
  {
    id: "btw",
    eyebrow: "Before the Words",
    eyebrowColor: T.stewardship,
    headline: "A contemplative practice\n",
    accentPart: "before prayer, before speech.",
    sub: "Lifewoven holds space for the moments when language fails. Choose where you are — and the practice meets you there.",
    whisper: "Two-minute practices for the days you don't have ten.",
    cta: "And when life knocks me down? →",
    bgColors: ["#0d0c0a", "#14110d", "#0d0c0a"],
    glowColor: "rgba(184,158,106,0.12)",
    glowPos: { x: 50, y: 55 },
  },
  {
    id: "reset",
    eyebrow: "Pathway · Flagship",
    eyebrowColor: T.standards,
    headline: "When you fall, stop, or lose your footing —\n",
    accentPart: "Reset doesn't shame you back.",
    sub: "Most systems break the moment you break the streak. Lifewoven's flagship pathway is built for the day after.",
    cta: "Begin the weave →",
    bgColors: ["#090e0b", "#0d1510", "#090e0b"],
    glowColor: "rgba(111,181,151,0.12)",
    glowPos: { x: 50, y: 55 },
  },
  {
    id: "close",
    eyebrow: "One last thing",
    eyebrowColor: T.thread,
    headline: "You weren't lacking.\n",
    accentPart: "You were unwoven.",
    sub: "Lifewoven holds your state, your story, your standards, your strategy, and your stewardship as the single living system they were always meant to be.",
    cta: "Take the Audit",
    bgColors: ["#0d0c11", "#14110f", "#0d0c11"],
    glowColor: "rgba(216,184,120,0.14)",
    glowPos: { x: 50, y: 60 },
  },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
interface Props { userId?: number | null; }

export default function OnboardingModal({ userId }: Props) {
  const [, navigate] = useLocation();
  const [open, setOpen]     = useState(false);
  const [idx, setIdx]       = useState(0);
  const [artIn, setArtIn]   = useState(false);
  const [textIn, setTextIn] = useState(false);
  const [btnIn, setBtnIn]   = useState(false);
  const [finished, setFinished] = useState(false);
  const glowRef = useRef<HTMLDivElement>(null);
  const completeMutation = trpc.profile.completeOnboarding.useMutation();

  // Fire for all visitors on first visit
  useEffect(() => {
    if (!localStorage.getItem(DEVICE_KEY)) setOpen(true);
  }, []);

  // Replay event
  useEffect(() => {
    const handler = () => { setIdx(0); setFinished(false); setOpen(true); };
    window.addEventListener("lifewoven:replay-onboarding", handler);
    return () => window.removeEventListener("lifewoven:replay-onboarding", handler);
  }, []);

  // Stagger animations on slide change
  useEffect(() => {
    if (!open) return;
    setArtIn(false); setTextIn(false); setBtnIn(false);
    const t1 = setTimeout(() => setArtIn(true), 80);
    const t2 = setTimeout(() => setTextIn(true), 320);
    const t3 = setTimeout(() => setBtnIn(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [open, idx]);

  // Arrow-key navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIdx(i => Math.min(SLIDES.length - 1, i + 1));
      if (e.key === "ArrowLeft")  setIdx(i => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Parallax glow
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!glowRef.current) return;
      const dx = (e.clientX / window.innerWidth  - 0.5) * 28;
      const dy = (e.clientY / window.innerHeight - 0.5) * 18;
      glowRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  if (!open) return null;

  const s = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  function dismiss() {
    localStorage.setItem(DEVICE_KEY, "1");
    if (userId) localStorage.setItem(`${STORAGE_KEY}_${userId}`, "1");
    completeMutation.mutate({ recommendedPathway: "align" });
    setOpen(false);
  }

  function advance() {
    if (isLast) {
      if (!finished) {
        setFinished(true);
        return;
      }
      dismiss();
      navigate("/alignment-audit");
    } else {
      setIdx(i => i + 1);
    }
  }

  /* ── Finished state (after "Take the Audit" on slide 7) ── */
  if (finished) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "#0d0c11" }}>
        {/* Ambient threads */}
        <AmbientThreads />
        <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-lg mx-auto">
          <div style={{ color: T.thread, fontSize: "0.7rem", letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: "1.4rem" }}>
            Woven
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 500, fontSize: "clamp(2rem,5vw,2.8rem)", lineHeight: 1.13, color: "white", marginBottom: "1.5rem" }}>
            The first <span style={{ color: T.thread, fontStyle: "italic" }}>thread</span> is yours.
          </h1>
          <p style={{ color: T.ink, opacity: 0.85, fontSize: "clamp(1rem,1.7vw,1.15rem)", lineHeight: 1.65, maxWidth: 520, margin: "0 auto 2.5rem" }}>
            Open your dashboard whenever you're ready. The system is waiting — and now it knows your name.
          </p>
          <button onClick={() => { dismiss(); navigate("/alignment-audit"); }}
            style={{ background: T.thread, color: "#1a1610", border: "none", padding: "0.95rem 2.4rem", borderRadius: 999, fontSize: "0.98rem", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
            Take the Alignment Audit →
          </button>
          <button onClick={() => { setFinished(false); setIdx(0); }}
            style={{ background: "transparent", color: T.quiet, border: "none", cursor: "pointer", fontSize: "0.88rem", fontFamily: "inherit", marginTop: "1rem" }}>
            I want to feel it again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden select-none"
      style={{ background: s.bgColors[0] }}>

      {/* Keyframe styles injected once */}
      <style>{`
        @keyframes thumbDrift { from { left: 30%; } to { left: 60%; } }
        @keyframes corePulse {
          0%,100% { box-shadow: 0 0 24px rgba(216,184,120,0.6), 0 0 60px rgba(216,184,120,0.3); }
          50%      { box-shadow: 0 0 36px rgba(216,184,120,0.9), 0 0 100px rgba(216,184,120,0.5); }
        }
        @keyframes ringPulse {
          0%,100% { opacity: 0.3; transform: translate(-50%,-50%) scale(0.95); }
          50%      { opacity: 0.8; transform: translate(-50%,-50%) scale(1.05); }
        }
      `}</style>

      {/* Ambient background threads */}
      <AmbientThreads />

      {/* Background gradient */}
      <div className="absolute inset-0 transition-all duration-1000"
        style={{ background: `linear-gradient(160deg, ${s.bgColors[0]} 0%, ${s.bgColors[1]} 50%, ${s.bgColors[2]} 100%)` }} />

      {/* Parallax glow */}
      <div ref={glowRef} className="absolute inset-0 pointer-events-none" style={{ transition: "transform 0.4s ease", willChange: "transform" }}>
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse 80% 60% at ${s.glowPos.x}% ${s.glowPos.y}%, ${s.glowColor}, transparent 70%)`,
        }} />
      </div>

      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.04,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: "120px" }} />

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-20" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div className="h-full transition-all duration-700 ease-out"
          style={{ width: `${((idx + 1) / SLIDES.length) * 100}%`, background: s.eyebrowColor }} />
      </div>

      {/* Dot progress */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
        {SLIDES.map((_, i) => (
          <div key={i} className="rounded-full transition-all duration-500"
            style={{
              height: 6,
              width: i === idx ? 22 : 6,
              background: i === idx ? T.thread : i < idx ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.1)",
              borderRadius: i === idx ? 4 : "50%",
            }} />
        ))}
      </div>

      {/* Slide counter */}
      <p className="absolute bottom-5 right-6 z-20 tabular-nums" style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.1)" }}>
        {idx + 1} / {SLIDES.length}
      </p>

      {/* Skip */}
      {idx === 0 && (
        <button onClick={dismiss} className="absolute top-5 right-5 z-20"
          style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: T.quiet, fontSize: "0.7rem", letterSpacing: "0.12em", padding: "0.4rem 0.95rem", borderRadius: 999, cursor: "pointer", fontFamily: "inherit" }}>
          Skip intro
        </button>
      )}

      {/* ── Scrollable slide content ── */}
      <div className="absolute inset-0 z-10 overflow-y-auto">
        <div className="flex flex-col items-center justify-start min-h-full px-6 pt-16 pb-28"
          style={{ opacity: 1, transform: "translateY(0)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>
          <div style={{ width: "100%", maxWidth: 760, textAlign: "center" }}>

            {/* Eyebrow */}
            <div style={{
              fontSize: "0.7rem", letterSpacing: "0.24em", textTransform: "uppercase",
              color: s.eyebrowColor, marginBottom: "1.4rem",
              opacity: textIn ? 1 : 0, transition: "opacity 0.6s ease 0.1s",
            }}>
              {s.eyebrow}
            </div>

            {/* Slide-specific art / animation */}
            {s.id === "thesis"    && <Slide1Art active={artIn} />}
            {s.id === "oracle"    && <Slide4Art />}
            {s.id === "btw"       && <Slide5Art active={artIn} />}

            {/* Headline */}
            <h1 style={{
              fontFamily: "Georgia, serif", fontWeight: 500,
              fontSize: "clamp(1.7rem, 4.2vw, 2.8rem)", lineHeight: 1.13,
              letterSpacing: "-0.012em", color: "white", marginBottom: "1.5rem",
              whiteSpace: "pre-line",
              opacity: textIn ? 1 : 0, transform: textIn ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
            }}>
              {s.headline}
              <span style={{ color: T.thread, fontStyle: "italic" }}>{s.accentPart}</span>
              {s.headlineAfter}
            </h1>

            {/* Sub */}
            <p style={{
              color: T.ink, opacity: textIn ? 0.85 : 0,
              fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)", lineHeight: 1.65,
              maxWidth: 580, margin: "0 auto",
              transition: "opacity 0.7s ease 0.5s",
            }}>
              {s.sub}
            </p>

            {/* Slide-specific content blocks */}
            {s.id === "state"     && <Slide2Art />}
            {s.id === "framework" && <Slide3Art active={artIn} />}
            {s.id === "oracle"    && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.5rem", margin: "1.75rem auto 0", maxWidth: 520 }}>
                {ORACLE_MODES.map((m, i) => (
                  <div key={i} style={{
                    padding: "0.85rem 0.6rem",
                    background: T.card, border: `1px solid ${T.cardBorder}`,
                    borderRadius: 12, textAlign: "center",
                    opacity: artIn ? 1 : 0, transform: artIn ? "translateY(0)" : "translateY(8px)",
                    transition: `opacity 0.5s ease ${0.4 + i * 0.08}s, transform 0.5s ease ${0.4 + i * 0.08}s`,
                  }}>
                    <div style={{ color: T.thread, fontFamily: "Georgia, serif", fontSize: "1.02rem" }}>{m.name}</div>
                    <div style={{ color: T.muted, fontSize: "0.74rem", marginTop: "0.15rem" }}>{m.when}</div>
                  </div>
                ))}
              </div>
            )}
            {s.id === "btw"       && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.6rem", maxWidth: 540, margin: "1.25rem auto 0" }}>
                {FEEL_STATES.map((f, i) => (
                  <div key={i} style={{
                    padding: "0.85rem 0.6rem",
                    background: T.card, border: `1px solid ${T.cardBorder}`,
                    borderRadius: 12, color: T.ink, fontSize: "0.86rem", textAlign: "center",
                    opacity: artIn ? 1 : 0, transition: `opacity 0.5s ease ${0.3 + i * 0.1}s`,
                  }}>
                    {f}
                  </div>
                ))}
              </div>
            )}
            {s.id === "reset"     && <Slide6Art />}
            {s.id === "close"     && <Slide7Art active={artIn} />}

            {/* Whisper */}
            {s.whisper && (
              <p style={{
                color: T.quiet, fontSize: "0.82rem", letterSpacing: "0.04em",
                marginTop: "1rem", fontStyle: "italic",
                opacity: textIn ? 1 : 0, transition: "opacity 0.6s ease 0.9s",
              }}>
                {s.whisper}
              </p>
            )}

            {/* Signature on close slide */}
            {s.id === "close" && (
              <p style={{
                fontFamily: "Georgia, serif", fontStyle: "italic",
                color: T.thread, fontSize: "1.1rem", marginTop: "1.5rem",
                opacity: textIn ? 1 : 0, transition: "opacity 0.7s ease 0.8s",
              }}>
                — let's begin the weave.
              </p>
            )}

            {/* CTA row */}
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "0.85rem",
              marginTop: "2.25rem",
              opacity: btnIn ? 1 : 0, transform: btnIn ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}>
              <button onClick={advance} style={{
                background: T.thread, color: "#1a1610", border: "none",
                padding: "0.95rem 2.4rem", borderRadius: 999,
                fontSize: "0.98rem", fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
              }}>
                {s.cta}
              </button>
              {idx === 0 && (
                <button onClick={advance} style={{
                  background: "transparent", color: T.quiet, border: "none",
                  cursor: "pointer", fontSize: "0.88rem", fontFamily: "inherit", fontStyle: "italic",
                }}>
                  I'm tired of starting over
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Ambient background threads SVG ─────────────────────────────── */
function AmbientThreads() {
  return (
    <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.18 }}
      viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      <path d="M -100 200 Q 360 100 720 200 T 1540 200" fill="none" stroke={T.state}       strokeWidth="0.6" opacity="0.7"/>
      <path d="M -100 320 Q 360 240 720 320 T 1540 320" fill="none" stroke={T.story}       strokeWidth="0.6" opacity="0.7"/>
      <path d="M -100 440 Q 360 380 720 440 T 1540 440" fill="none" stroke={T.standards}   strokeWidth="0.6" opacity="0.7"/>
      <path d="M -100 560 Q 360 500 720 560 T 1540 560" fill="none" stroke={T.strategy}    strokeWidth="0.6" opacity="0.7"/>
      <path d="M -100 680 Q 360 620 720 680 T 1540 680" fill="none" stroke={T.stewardship} strokeWidth="0.6" opacity="0.7"/>
    </svg>
  );
}
