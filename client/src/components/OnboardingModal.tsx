import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

/* ─── Scene definitions ─────────────────────────────────────────── */
const SCENES = [
  {
    id: "tension",
    bg: ["#050508", "#0a0a14", "#050508"],
    glow: { color: "180,140,60", x: 50, y: 65, rx: 60, ry: 38 },
    eyebrow: null,
    words: ["You already know", "something needs", "to change."],
    sub: "That quiet tension between who you are and who you're meant to be — it's not anxiety. It's a signal.",
    cta: "I feel it too",
    value: null,
  },
  {
    id: "cost",
    bg: ["#060408", "#0e0814", "#060408"],
    glow: { color: "160,80,220", x: 50, y: 50, rx: 70, ry: 45 },
    eyebrow: "THE REAL COST",
    words: ["Every day without", "a system is a day", "spent on drift."],
    sub: "Most people spend years reading about change. Lifewoven is where you actually make it — with a framework, a guide, and a daily practice.",
    cta: "Tell me more",
    value: null,
  },
  {
    id: "framework",
    bg: ["#060c16", "#0b1220", "#060c16"],
    glow: { color: "70,120,220", x: 50, y: 48, rx: 80, ry: 50 },
    eyebrow: "THE 5S FRAMEWORK",
    words: ["Five dimensions.", "One integrated life."],
    sub: "State · Story · Standards · Strategy · Stewardship — not five separate goals. One living system.",
    cta: "I want that system",
    value: "Built on Viktor Frankl, James Clear, Brené Brown, and 12 other proven frameworks.",
  },
  {
    id: "oracle",
    bg: ["#06080f", "#080c1a", "#06080f"],
    glow: { color: "100,70,200", x: 50, y: 42, rx: 65, ry: 60 },
    eyebrow: "YOUR AI GUIDE",
    words: ["You'll never", "practice alone."],
    sub: "The Oracle knows your pathways, your journal entries, your patterns. It gives you guidance that's actually about your life.",
    cta: "I want that",
    value: "Included in every plan. Not a chatbot — a practice partner.",
  },
  {
    id: "begin",
    bg: ["#0b0906", "#1c1508", "#0b0906"],
    glow: { color: "215,175,70", x: 50, y: 60, rx: 80, ry: 55 },
    eyebrow: "YOUR JOURNEY",
    words: ["Your alignment", "starts now."],
    sub: "Choose your first pathway. The life you've been designing in your mind is one practice away.",
    cta: "Begin",
    value: null,
  },
];

const PATHWAYS = [
  { slug: "align", name: "Align", sub: "Daily Grounding", color: "#10b981" },
  { slug: "resonance", name: "Resonance", sub: "Alignment Practice", color: "#8b5cf6" },
  { slug: "uplift", name: "Uplift", sub: "Emotional Shift", color: "#f59e0b" },
  { slug: "flow", name: "Flow", sub: "Visualization", color: "#0ea5e9" },
  { slug: "rhythms", name: "Rhythms", sub: "Habit Design", color: "#f97316" },
  { slug: "purpose", name: "Purpose", sub: "Meaning & Why", color: "#f43f5e" },
  { slug: "reset", name: "Reset", sub: "Resilience", color: "#14b8a6" },
];

const STORAGE_KEY = "lifewoven_onboarded_v4";

/* ─── Word-by-word animated headline ───────────────────────────── */
function AnimatedHeadline({ lines, active }: { lines: string[]; active: boolean }) {
  const allWords = lines.flatMap((line, li) =>
    line.split(" ").map((w, wi) => ({ word: w, lineBreak: wi === line.split(" ").length - 1 && li < lines.length - 1 }))
  );
  return (
    <h1 className="font-serif font-light leading-tight text-center" style={{ fontSize: "clamp(2rem,7.5vw,2.8rem)", color: "rgba(255,255,255,0.95)" }}>
      {allWords.map((item, i) => (
        <span key={i} style={{ display: "inline" }}>
          <span
            style={{
              display: "inline-block",
              opacity: active ? 1 : 0,
              transform: active ? "translateY(0)" : "translateY(14px)",
              transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`,
            }}
          >
            {item.word}
          </span>
          {item.lineBreak ? <br /> : " "}
        </span>
      ))}
    </h1>
  );
}

/* ─── Scene-specific SVG art ────────────────────────────────────── */
function SceneArt({ id, active }: { id: string; active: boolean }) {
  const op = active ? 1 : 0;
  const tr = `transition: opacity 1.2s ease 0.2s`;

  if (id === "tension") return (
    <svg viewBox="0 0 200 120" className="w-48 h-28 mx-auto mb-8" style={{ opacity: op, transition: "opacity 1.2s ease 0.2s" }}>
      {/* Two threads pulling apart */}
      <line x1="20" y1="60" x2="90" y2="60" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <line x1="110" y1="60" x2="180" y2="60" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <circle cx="100" cy="60" r="8" fill="none" stroke="rgba(180,140,60,0.6)" strokeWidth="1.5"
        style={{ opacity: active ? 1 : 0, transition: "opacity 0.8s ease 0.8s" }} />
      <circle cx="100" cy="60" r="16" fill="none" stroke="rgba(180,140,60,0.2)" strokeWidth="1"
        style={{ opacity: active ? 1 : 0, transition: "opacity 0.8s ease 1s" }} />
      <circle cx="100" cy="60" r="26" fill="none" stroke="rgba(180,140,60,0.08)" strokeWidth="1"
        style={{ opacity: active ? 1 : 0, transition: "opacity 0.8s ease 1.2s" }} />
      {/* Signal dot */}
      <circle cx="100" cy="60" r="2.5" fill="rgba(251,191,36,0.9)"
        style={{ opacity: active ? 1 : 0, transition: "opacity 0.6s ease 1.4s" }} />
    </svg>
  );

  if (id === "cost") return (
    <svg viewBox="0 0 200 100" className="w-48 h-24 mx-auto mb-8" style={{ opacity: op, transition: "opacity 1.2s ease 0.2s" }}>
      {/* Drifting particles */}
      {[30,60,90,120,150,170].map((x, i) => (
        <circle key={i} cx={x} cy={40 + (i % 3) * 15} r="2" fill="rgba(255,255,255,0.15)"
          style={{ opacity: active ? 0.15 + i * 0.05 : 0, transition: `opacity 0.6s ease ${0.3 + i * 0.15}s` }} />
      ))}
      {/* Anchor line */}
      <line x1="100" y1="20" x2="100" y2="80" stroke="rgba(160,80,220,0.4)" strokeWidth="1.5"
        strokeDasharray="4 3"
        style={{ opacity: active ? 1 : 0, transition: "opacity 0.8s ease 0.9s" }} />
      <circle cx="100" cy="80" r="4" fill="rgba(160,80,220,0.7)"
        style={{ opacity: active ? 1 : 0, transition: "opacity 0.6s ease 1.3s" }} />
    </svg>
  );

  if (id === "framework") return (
    <svg viewBox="0 0 200 110" className="w-48 h-28 mx-auto mb-8" style={{ opacity: op, transition: "opacity 1.2s ease 0.2s" }}>
      {/* 5 orbiting nodes */}
      {[0,1,2,3,4].map(i => {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const cx = 100 + 38 * Math.cos(angle);
        const cy = 55 + 32 * Math.sin(angle);
        const colors = ["#10b981","#8b5cf6","#f59e0b","#0ea5e9","#f43f5e"];
        return (
          <g key={i}>
            <line x1="100" y1="55" x2={cx} y2={cy} stroke="rgba(255,255,255,0.08)" strokeWidth="1"
              style={{ opacity: active ? 1 : 0, transition: `opacity 0.5s ease ${0.4 + i * 0.1}s` }} />
            <circle cx={cx} cy={cy} r="6" fill={colors[i]} fillOpacity="0.7"
              style={{ opacity: active ? 1 : 0, transition: `opacity 0.5s ease ${0.6 + i * 0.12}s` }} />
          </g>
        );
      })}
      <circle cx="100" cy="55" r="8" fill="rgba(251,191,36,0.15)" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5"
        style={{ opacity: active ? 1 : 0, transition: "opacity 0.6s ease 1.2s" }} />
    </svg>
  );

  if (id === "oracle") return (
    <svg viewBox="0 0 200 110" className="w-48 h-28 mx-auto mb-8" style={{ opacity: op, transition: "opacity 1.2s ease 0.2s" }}>
      {/* Starfield */}
      {[20,50,80,130,160,40,110,170,90,145].map((x, i) => (
        <circle key={i} cx={x} cy={15 + (i * 11) % 70} r="1" fill="white"
          style={{ opacity: active ? 0.1 + (i % 4) * 0.08 : 0, transition: `opacity 0.4s ease ${i * 0.1}s` }} />
      ))}
      {/* Pulse rings */}
      {[12,22,34].map((r, i) => (
        <circle key={i} cx="100" cy="65" r={r} fill="none" stroke="rgba(100,70,200,0.35)" strokeWidth="1"
          style={{ opacity: active ? 1 : 0, transition: `opacity 0.6s ease ${0.5 + i * 0.25}s` }} />
      ))}
      <circle cx="100" cy="65" r="4" fill="rgba(180,140,255,0.9)"
        style={{ opacity: active ? 1 : 0, transition: "opacity 0.5s ease 1.3s" }} />
    </svg>
  );

  // begin — sunrise rays
  return (
    <svg viewBox="0 0 200 110" className="w-48 h-28 mx-auto mb-8" style={{ opacity: op, transition: "opacity 1.2s ease 0.2s" }}>
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x2 = 100 + 45 * Math.cos(rad);
        const y2 = 75 + 38 * Math.sin(rad);
        return (
          <line key={i} x1="100" y1="75" x2={x2} y2={y2}
            stroke="rgba(215,175,70,0.25)" strokeWidth="1"
            style={{ opacity: active ? 1 : 0, transition: `opacity 0.4s ease ${0.3 + i * 0.06}s` }} />
        );
      })}
      <circle cx="100" cy="75" r="14" fill="rgba(215,175,70,0.12)" stroke="rgba(215,175,70,0.5)" strokeWidth="1.5"
        style={{ opacity: active ? 1 : 0, transition: "opacity 0.7s ease 1s" }} />
      <circle cx="100" cy="75" r="5" fill="rgba(251,191,36,0.95)"
        style={{ opacity: active ? 1 : 0, transition: "opacity 0.5s ease 1.4s" }} />
    </svg>
  );
}

/* ─── Main component ────────────────────────────────────────────── */
interface Props { userId?: number | null; }

export default function OnboardingModal({ userId }: Props) {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [scene, setScene] = useState(0);
  const [bgIn, setBgIn] = useState(false);
  const [artIn, setArtIn] = useState(false);
  const [textIn, setTextIn] = useState(false);
  const [btnIn, setBtnIn] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState("align");
  const glowRef = useRef<HTMLDivElement>(null);

  const completeMutation = trpc.profile.completeOnboarding.useMutation();

  useEffect(() => {
    if (!userId) return;
    const seen = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (!seen) setOpen(true);
  }, [userId]);

  useEffect(() => {
    if (!open) return;
    setBgIn(false); setArtIn(false); setTextIn(false); setBtnIn(false);
    const t1 = setTimeout(() => setBgIn(true), 30);
    const t2 = setTimeout(() => setArtIn(true), 200);
    const t3 = setTimeout(() => setTextIn(true), 400);
    const t4 = setTimeout(() => setBtnIn(true), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [open, scene]);

  // Parallax glow on mouse move
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!glowRef.current) return;
      const dx = (e.clientX / window.innerWidth - 0.5) * 30;
      const dy = (e.clientY / window.innerHeight - 0.5) * 20;
      glowRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  if (!open) return null;

  const s = SCENES[scene];
  const isLast = scene === SCENES.length - 1;

  function dismiss() {
    if (userId) localStorage.setItem(`${STORAGE_KEY}_${userId}`, "1");
    completeMutation.mutate({ recommendedPathway: selectedPathway });
    setOpen(false);
  }

  function advance() {
    if (isLast) { dismiss(); navigate(`/pathway/${selectedPathway}`); }
    else setScene(p => p + 1);
  }

  const [r, g, b] = s.glow.color.split(",").map(Number);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden select-none"
      style={{ background: s.bg[0] }}>

      {/* Animated background gradient */}
      <div className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `linear-gradient(160deg, ${s.bg[0]} 0%, ${s.bg[1]} 50%, ${s.bg[2]} 100%)`,
          opacity: bgIn ? 1 : 0,
        }} />

      {/* Parallax glow */}
      <div ref={glowRef} className="absolute inset-0 pointer-events-none"
        style={{ transition: "transform 0.4s ease", willChange: "transform" }}>
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse ${s.glow.rx}% ${s.glow.ry}% at ${s.glow.x}% ${s.glow.y}%, rgba(${r},${g},${b},0.22) 0%, transparent 70%)`,
          opacity: bgIn ? 1 : 0,
          transition: "opacity 1.2s ease",
        }} />
      </div>

      {/* Film grain */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "120px" }} />

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5 z-10">
        <div className="h-full transition-all duration-700 ease-out"
          style={{ width: `${((scene + 1) / SCENES.length) * 100}%`, background: `rgba(${r},${g},${b},0.8)` }} />
      </div>

      {/* Dots */}
      <div className="absolute top-5 left-0 right-0 flex justify-center gap-2 z-10">
        {SCENES.map((_, i) => (
          <div key={i} className="rounded-full transition-all duration-500"
            style={{ width: i === scene ? "20px" : "5px", height: "5px",
              background: i === scene ? `rgba(${r},${g},${b},0.9)` : i < scene ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)" }} />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-sm mx-auto w-full">

        {/* SVG art */}
        <SceneArt id={s.id} active={artIn} />

        {/* Eyebrow */}
        {s.eyebrow && (
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-5"
            style={{ color: `rgba(${r},${g},${b},0.75)`, opacity: textIn ? 1 : 0, transition: "opacity 0.6s ease 0.1s" }}>
            {s.eyebrow}
          </p>
        )}

        {/* Animated headline */}
        <div className="mb-5">
          <AnimatedHeadline lines={s.words} active={textIn} />
        </div>

        {/* Sub */}
        <p className="text-sm leading-relaxed font-light max-w-[270px] mb-3"
          style={{ color: "rgba(255,255,255,0.48)", opacity: textIn ? 1 : 0, transition: "opacity 0.7s ease 0.7s" }}>
          {s.sub}
        </p>

        {/* Value proof */}
        {s.value && (
          <p className="text-[11px] font-medium mb-0 px-3 py-1.5 rounded-full"
            style={{
              color: `rgba(${r},${g},${b},0.85)`,
              background: `rgba(${r},${g},${b},0.1)`,
              border: `1px solid rgba(${r},${g},${b},0.2)`,
              opacity: textIn ? 1 : 0,
              transition: "opacity 0.6s ease 1s",
            }}>
            {s.value}
          </p>
        )}

        {/* Pathway picker on last scene */}
        {isLast && (
          <div className="grid grid-cols-2 gap-2 w-full mt-5"
            style={{ opacity: btnIn ? 1 : 0, transition: "opacity 0.6s ease" }}>
            {PATHWAYS.map(p => (
              <button key={p.slug} onClick={() => setSelectedPathway(p.slug)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all duration-200 active:scale-95"
                style={{
                  background: selectedPathway === p.slug ? `rgba(${p.color.replace("#","").match(/../g)!.map(h=>parseInt(h,16)).join(",")},0.18)` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${selectedPathway === p.slug ? p.color + "60" : "rgba(255,255,255,0.08)"}`,
                }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                <div>
                  <p className="text-xs font-medium text-white/90">{p.name}</p>
                  <p className="text-[10px] text-white/35">{p.sub}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-3 z-10"
        style={{ opacity: btnIn ? 1 : 0, transform: btnIn ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
        <button onClick={advance}
          className="px-11 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 active:scale-95"
          style={{ background: `rgba(${r},${g},${b},1)`, color: "#07070f", boxShadow: `0 0 40px rgba(${r},${g},${b},0.3)` }}>
          {s.cta}
        </button>
        {scene === 0 && (
          <button onClick={dismiss}
            className="text-xs transition-colors"
            style={{ color: "rgba(255,255,255,0.18)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.18)")}>
            Skip intro
          </button>
        )}
      </div>

      {/* Counter */}
      <p className="absolute bottom-5 right-6 text-[10px] tabular-nums z-10" style={{ color: "rgba(255,255,255,0.1)" }}>
        {scene + 1} / {SCENES.length}
      </p>
    </div>
  );
}
