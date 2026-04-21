import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loom, type LoomState } from "@/components/Loom";

/* ─── Ambient sound engine (Web Audio API — no external files) ───── */
function createAmbientEngine() {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // Three detuned sine oscillators for a warm drone
  const freqs = [55, 82.4, 110]; // A1, E2, A2
  const oscs = freqs.map(f => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = f;
    g.gain.value = f === 55 ? 0.18 : 0.09;
    o.connect(g);
    g.connect(master);
    o.start();
    return o;
  });

  // Subtle shimmer — high sine at 880 Hz, very quiet
  const shimmer = ctx.createOscillator();
  const shimmerGain = ctx.createGain();
  shimmer.type = "sine";
  shimmer.frequency.value = 880;
  shimmerGain.gain.value = 0.012;
  shimmer.connect(shimmerGain);
  shimmerGain.connect(master);
  shimmer.start();

  return {
    fadeIn()  { master.gain.setTargetAtTime(1, ctx.currentTime, 2.5); },
    fadeOut() { master.gain.setTargetAtTime(0, ctx.currentTime, 1.5); },
    close()   { ctx.close(); },
  };
}
/* ─── Design tokens ──────────────────────────────────────────────── */
const T = {
  bg:          "#080709",
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
  card:        "rgba(255,255,255,0.04)",
  cardBorder:  "rgba(255,255,255,0.09)",
};

const STORAGE_KEY = "lifewoven_onboarded_v6";
const DEVICE_KEY  = `${STORAGE_KEY}_device`;

export function replayOnboarding(userId?: number | null) {
  localStorage.removeItem(DEVICE_KEY);
  if (userId) localStorage.removeItem(`${STORAGE_KEY}_${userId}`);
  window.dispatchEvent(new CustomEvent("lifewoven:replay-onboarding"));
}

/* ─── Word-by-word staggered reveal ─────────────────────────────── */
function WordReveal({ text, active, baseDelay = 0, color, italic = false, fontSize }: {
  text: string; active: boolean; baseDelay?: number;
  color?: string; italic?: boolean; fontSize?: string;
}) {
  const words = text.split(" ");
  return (
    <span style={{ display: "inline", color: color ?? "inherit", fontStyle: italic ? "italic" : "inherit", fontSize }}>
      {words.map((w, i) => (
        <span key={i} style={{
          display: "inline-block",
          opacity: active ? 1 : 0,
          transform: active ? "translateY(0) scale(1)" : "translateY(18px) scale(0.96)",
          transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${baseDelay + i * 0.055}s,
                       transform 0.55s cubic-bezier(0.22,1,0.36,1) ${baseDelay + i * 0.055}s`,
          marginRight: "0.28em",
        }}>{w}</span>
      ))}
    </span>
  );
}

/* ─── Slide 1 — Five threads flying across the screen ───────────── */
function Slide1Art({ active }: { active: boolean }) {
  // Draggable dot state — t=0 is left edge, t=1 is right edge
  const [t, setT] = useState(0.5);
  // Spring-interpolated t for smooth path morphing (works in all browsers)
  const [springT, setSpringT] = useState(0.5);
  const springRef = useRef(0.5);
  const rafRef = useRef<number | null>(null);
  const dragging = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Spring toward target t on every frame
  useEffect(() => {
    const stiffness = 0.18;
    function tick() {
      const diff = t - springRef.current;
      if (Math.abs(diff) > 0.0005) {
        springRef.current += diff * stiffness;
        setSpringT(springRef.current);
        rafRef.current = requestAnimationFrame(tick);
      } else {
        springRef.current = t;
        setSpringT(t);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [t]);

  // Convert SVG x coordinate (0–600) to t (0–1)
  const xToT = (svgX: number) => Math.max(0, Math.min(1, (svgX + 60) / 720));

  // Get point on cubic bezier path at parameter t
  function bezierY(startY: number, midY: number, endY: number, t: number) {
    // Simplified: use the same cubic formula as the SVG path
    // M -60 startY C 150 startY, 260 midY, 300 midY S 450 endY, 660 endY
    // Map t to x: x = -60 + t * 720
    const x = -60 + t * 720;
    if (x <= 300) {
      // First cubic: from (-60,startY) to (300,midY) with CP (150,startY),(260,midY)
      const lt = (x + 60) / 360; // 0..1 over first half
      const mt = Math.max(0, Math.min(1, lt));
      return (1-mt)**3 * startY + 3*(1-mt)**2*mt * startY + 3*(1-mt)*mt**2 * midY + mt**3 * midY;
    } else {
      // Second cubic: from (300,midY) to (660,endY) with reflected CP and (450,endY)
      const lt = (x - 300) / 360;
      const mt = Math.max(0, Math.min(1, lt));
      return (1-mt)**3 * midY + 3*(1-mt)**2*mt * midY + 3*(1-mt)*mt**2 * endY + mt**3 * endY;
    }
  }

  const threads = [
    { color: T.state,       startY: 10,  midY: 78, endY: 20,  delay: 0,    dur: 1.6 },
    { color: T.story,       startY: 35,  midY: 80, endY: 55,  delay: 0.18, dur: 1.7 },
    { color: T.standards,   startY: 80,  midY: 82, endY: 80,  delay: 0.35, dur: 1.8 },
    { color: T.strategy,    startY: 125, midY: 84, endY: 105, delay: 0.52, dur: 1.7 },
    { color: T.stewardship, startY: 150, midY: 86, endY: 140, delay: 0.68, dur: 1.6 },
  ];

  // Dot position: use springT for smooth visual position
  const dotX = -60 + springT * 720;
  const dotY = threads.reduce((sum, th) => sum + bezierY(th.startY, th.midY, th.endY, springT), 0) / threads.length;
  // Active thread index: whichever thread is closest to the dot
  const activeThread = threads.reduce((best, th, i) => {
    const dy = Math.abs(bezierY(th.startY, th.midY, th.endY, springT) - dotY);
    return dy < best.dy ? { i, dy } : best;
  }, { i: 0, dy: Infinity }).i;

  function getSvgX(clientX: number) {
    if (!svgRef.current) return 300;
    const rect = svgRef.current.getBoundingClientRect();
    const ratio = 600 / rect.width;
    return (clientX - rect.left) * ratio;
  }

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    setT(xToT(getSvgX(e.clientX)));
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    setT(xToT(getSvgX(e.clientX)));
  }
  function onPointerUp() { dragging.current = false; }

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 580, margin: "0 auto 2rem", height: 160, overflow: "visible",
      animation: active ? "artPulse 0.45s cubic-bezier(0.34,1.56,0.64,1) 2.8s both" : "none",
    }}>
      <style>{`
        @keyframes threadFly0 { 0%{stroke-dashoffset:900;opacity:0} 8%{opacity:0.9} 100%{stroke-dashoffset:0;opacity:0.85} }
        @keyframes threadFly1 { 0%{stroke-dashoffset:900;opacity:0} 8%{opacity:0.9} 100%{stroke-dashoffset:0;opacity:0.85} }
        @keyframes threadFly2 { 0%{stroke-dashoffset:900;opacity:0} 8%{opacity:0.9} 100%{stroke-dashoffset:0;opacity:0.85} }
        @keyframes threadFly3 { 0%{stroke-dashoffset:900;opacity:0} 8%{opacity:0.9} 100%{stroke-dashoffset:0;opacity:0.85} }
        @keyframes threadFly4 { 0%{stroke-dashoffset:900;opacity:0} 8%{opacity:0.9} 100%{stroke-dashoffset:0;opacity:0.85} }
        @keyframes trailFly0 { 0%{stroke-dashoffset:900;opacity:0} 12%{opacity:0.35} 100%{stroke-dashoffset:0;opacity:0.18} }
        @keyframes trailFly1 { 0%{stroke-dashoffset:900;opacity:0} 12%{opacity:0.35} 100%{stroke-dashoffset:0;opacity:0.18} }
        @keyframes trailFly2 { 0%{stroke-dashoffset:900;opacity:0} 12%{opacity:0.35} 100%{stroke-dashoffset:0;opacity:0.18} }
        @keyframes trailFly3 { 0%{stroke-dashoffset:900;opacity:0} 12%{opacity:0.35} 100%{stroke-dashoffset:0;opacity:0.18} }
        @keyframes trailFly4 { 0%{stroke-dashoffset:900;opacity:0} 12%{opacity:0.35} 100%{stroke-dashoffset:0;opacity:0.18} }
        @keyframes orbPop { 0%,85%{r:0;opacity:0} 92%{r:12;opacity:1} 100%{r:9;opacity:1} }
        @keyframes artPulse { 0%{transform:scale(1)} 50%{transform:scale(1.045)} 100%{transform:scale(1)} }
        @keyframes sparkle { 0%{stroke-dashoffset:32;opacity:0} 60%{opacity:1} 100%{stroke-dashoffset:0;opacity:0} }
        @keyframes dotPulse { 0%,100%{r:7} 50%{r:9} }
      `}</style>
      <svg ref={svgRef} viewBox="0 0 600 160" style={{ width: "100%", height: "100%", overflow: "visible", cursor: "grab", touchAction: "none" }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
        <defs>
          {threads.map((_, i) => (
            <filter key={i} id={`tglow${i}`}>
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          ))}
          <filter id="orbGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="dotGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {threads.map((th, i) => {
          // --- Weaving distortion ---
          // The dot acts as a loom shuttle: each thread is pulled toward the dot's Y
          // with a falloff based on horizontal distance. Threads above the dot pull down,
          // threads below pull up — creating an over/under weave alternation.
          const isActive = i === activeThread;
          const weavePull = 55; // max pixels of pull
          const falloff = 180;  // horizontal influence radius in SVG units
          const distX = Math.abs((-60 + springT * 720) - 300); // distance from center convergence point
          const influence = Math.exp(-(distX * distX) / (2 * falloff * falloff));

          // Alternate over/under: even threads go toward dot, odd threads go away
          const direction = i % 2 === 0 ? 1 : -1;
          const pull = weavePull * influence * direction * (dragging.current ? 1 : 0.3);

          // Build a dynamic path: the mid-point is pulled by the weave
          const wMidY = th.midY + pull;
          // Also warp the control points near the dot X position
          const wStartY = th.startY + pull * 0.15;
          const wEndY = th.endY + pull * 0.15;
          const d = `M -60 ${wStartY} C 150 ${wStartY}, 260 ${wMidY}, 300 ${wMidY} S 450 ${wEndY}, 660 ${wEndY}`;

          return (
            <g key={i}>
              {/* Trail glow */}
              <path d={d} fill="none" stroke={th.color} strokeWidth="7" strokeLinecap="round"
                style={active ? {
                  opacity: isActive ? 0.32 : 0.18,
                } : { opacity: 0 }} />
              {/* Main thread */}
              <path d={d} fill="none" stroke={th.color} strokeWidth={isActive ? 3.5 : 2.2} strokeLinecap="round"
                filter={`url(#tglow${i})`}
                style={active ? {
                  opacity: isActive ? 1 : 0.82,
                  transition: "stroke-width 0.15s, opacity 0.15s",
                } : { opacity: 0 }} />
            </g>
          );
        })}
        {/* Convergence orb */}
        <circle cx="300" cy="82" r="0" fill={T.thread} filter="url(#orbGlow)"
          style={active ? { animation: `orbPop 2.6s cubic-bezier(0.22,1,0.36,1) 0.4s both` } : { opacity: 0 }} />
        {/* Sparkle burst */}
        {active && [0,45,90,135,180,225,270,315].map((angle, i) => {
          const rad = angle * Math.PI / 180;
          const x1 = 300 + Math.cos(rad) * 14; const y1 = 82 + Math.sin(rad) * 14;
          const x2 = 300 + Math.cos(rad) * 30; const y2 = 82 + Math.sin(rad) * 30;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={T.thread} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="32"
            style={{ animation: `sparkle 0.55s cubic-bezier(0.22,1,0.36,1) ${2.85 + i * 0.03}s both` }} />;
        })}
        {/* Interactive draggable dot — appears after animation settles */}
        {active && dotX >= -60 && dotX <= 660 && (
          <g style={{ cursor: "grab", transition: "transform 0.05s" }}>
            {/* Glow ring */}
            <circle cx={dotX} cy={dotY} r="14" fill="none"
              stroke={threads[activeThread].color} strokeWidth="1" opacity="0.4"
              filter="url(#dotGlow)" />
            {/* Main dot */}
            <circle cx={dotX} cy={dotY} r="7"
              fill={threads[activeThread].color}
              filter="url(#dotGlow)"
              style={{ animation: dragging.current ? "none" : "dotPulse 2s ease-in-out infinite" }} />
            {/* White center highlight */}
            <circle cx={dotX - 2} cy={dotY - 2} r="2" fill="white" opacity="0.7" />
          </g>
        )}
      </svg>
      {/* Hint label */}
      {active && (
        <div style={{ textAlign: "center", marginTop: "-0.5rem", color: T.muted, fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.6, pointerEvents: "none", animation: "fadeUp 1s ease 3.5s both" }}>
          drag the dot
        </div>
      )}
    </div>
  );
}

/* ─── Slide 2 — Emotional guidance scale ────────────────────────── */
function Slide2Art({ active }: { active: boolean }) {
  return (
    <div style={{
      margin: "2rem auto 0", maxWidth: 520,
      background: "linear-gradient(160deg, rgba(224,123,110,0.07), rgba(255,255,255,0.02))",
      border: "1px solid rgba(224,123,110,0.2)",
      borderRadius: 20, padding: "1.75rem 2rem",
      textAlign: "left",
      opacity: active ? 1 : 0, transform: active ? "translateY(0)" : "translateY(20px)",
      transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s",
      boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(224,123,110,0.1)",
    }}>
      <div style={{ color: T.state, fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.6rem" }}>
        Today's emotional guidance scale
      </div>
      <div style={{ color: "white", fontFamily: "Georgia, serif", fontSize: "1.15rem", marginBottom: "1.25rem" }}>
        Where are you right now?
      </div>
      <div style={{ position: "relative", height: 8, background: `linear-gradient(90deg, ${T.state} 0%, ${T.story} 50%, ${T.standards} 100%)`, borderRadius: 999, opacity: 0.6 }}>
        <div style={{
          position: "absolute", top: "50%", left: "32%",
          width: 18, height: 18,
          background: "white", borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 16px rgba(255,255,255,0.7), 0 2px 8px rgba(0,0,0,0.4)",
          animation: "thumbDrift 4s ease-in-out infinite alternate",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.7rem", color: T.muted, fontSize: "0.7rem", letterSpacing: "0.05em" }}>
        <span>Pessimism</span><span>Acceptance</span><span>Joy · Freedom</span>
      </div>
      <div style={{
        marginTop: "1.4rem", padding: "1rem 1.1rem",
        background: "rgba(224,123,110,0.08)", border: "1px solid rgba(224,123,110,0.2)",
        borderRadius: 12, color: "white",
        fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "0.98rem", lineHeight: 1.6,
      }}>
        "I am someone whose inner state shapes outer experience, and I tend that state deliberately."
      </div>
    </div>
  );
}

/* ─── Slide 3 — Five dimensions ─────────────────────────────────── */
const PILLARS = [
  { color: T.state,       name: "State",       desc: "Emotional alignment · nervous system regulation · daily grounding" },
  { color: T.story,       name: "Story",       desc: "Belief rewriting · identity design · meaning-making" },
  { color: T.standards,   name: "Standards",   desc: "Habit architecture · daily scorecards · deep work" },
  { color: T.strategy,    name: "Strategy",    desc: "Decision clarity · leverage mapping · AI analysis" },
  { color: T.stewardship, name: "Stewardship", desc: "Energy · body · time · wealth — tended with intention" },
];

function Slide3Art({ active }: { active: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", margin: "2rem auto 0", maxWidth: 560, width: "100%" }}>
      {PILLARS.map((p, i) => (
        <div key={p.name} style={{
          display: "flex", alignItems: "center", gap: "1.1rem",
          padding: "1.1rem 1.4rem",
          background: T.card, border: `1px solid ${T.cardBorder}`,
          borderRadius: 14, textAlign: "left",
          opacity: active ? 1 : 0,
          transform: active ? "translateX(0)" : "translateX(-20px)",
          transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${0.05 + i * 0.09}s,
                       transform 0.55s cubic-bezier(0.22,1,0.36,1) ${0.05 + i * 0.09}s`,
          boxShadow: active ? `0 0 0 1px ${p.color}22, 0 8px 32px rgba(0,0,0,0.3)` : "none",
        }}>
          <div style={{
            width: 6, height: 36, borderRadius: 999, background: p.color, flexShrink: 0,
            boxShadow: `0 0 12px ${p.color}88`,
          }} />
          <div>
            <div style={{ color: "white", fontFamily: "Georgia, serif", fontSize: "1.08rem" }}>{p.name}</div>
            <div style={{ color: T.muted, fontSize: "0.8rem", marginTop: "0.18rem", lineHeight: 1.4 }}>{p.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Slide 4 — Oracle orb ───────────────────────────────────────── */
function Slide4Art({ active }: { active: boolean }) {
  return (
    <div style={{ position: "relative", width: 220, height: 220, margin: "0 auto 2rem" }}>
      {[200, 148, 96].map((size, i) => (
        <div key={i} style={{
          position: "absolute", left: "50%", top: "50%",
          width: size, height: size,
          border: `1px solid rgba(216,184,120,${0.12 + i * 0.06})`,
          borderRadius: "50%",
          transform: "translate(-50%,-50%)",
          opacity: active ? 1 : 0,
          transition: `opacity 0.8s ease ${0.2 + i * 0.15}s`,
          animation: `ringPulse 4s ease-in-out infinite ${i * 0.7}s`,
        }} />
      ))}
      {/* Outer glow halo */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        width: 220, height: 220,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(216,184,120,0.18) 0%, transparent 70%)",
        transform: "translate(-50%,-50%)",
        opacity: active ? 1 : 0,
        transition: "opacity 1s ease 0.5s",
        animation: "haloBreath 5s ease-in-out infinite",
      }} />
      {/* Core */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        width: 22, height: 22, borderRadius: "50%",
        background: T.thread,
        boxShadow: "0 0 30px rgba(216,184,120,0.9), 0 0 80px rgba(216,184,120,0.5), 0 0 140px rgba(216,184,120,0.25)",
        transform: "translate(-50%,-50%)",
        opacity: active ? 1 : 0,
        transition: "opacity 0.6s ease 0.8s",
        animation: "corePulse 3s ease-in-out infinite",
      }} />
    </div>
  );
}

const ORACLE_MODES = [
  { name: "Guide",          when: "Open conversation" },
  { name: "Unstuck",        when: "When you're blocked" },
  { name: "Pattern Mirror", when: "What you can't see" },
];

/* ─── Slide 5 — Before the Words door ───────────────────────────── */
function Slide5Art({ active }: { active: boolean }) {
  return (
    <div style={{ position: "relative", width: 200, height: 270, margin: "0 auto 1.75rem" }}>
      {/* Arch frame */}
      <div style={{
        position: "absolute", inset: 0,
        border: "1px solid rgba(216,184,120,0.35)",
        borderRadius: "100px 100px 0 0",
        boxShadow: "0 0 80px rgba(216,184,120,0.12), inset 0 0 40px rgba(216,184,120,0.06)",
        opacity: active ? 1 : 0,
        transition: "opacity 0.8s ease 0.2s",
      }} />
      {/* Second arch — depth */}
      <div style={{
        position: "absolute", inset: 16,
        border: "1px solid rgba(216,184,120,0.12)",
        borderRadius: "90px 90px 0 0",
        opacity: active ? 1 : 0,
        transition: "opacity 0.8s ease 0.5s",
      }} />
      {/* Rising light */}
      <div style={{
        position: "absolute", left: "50%", bottom: 0,
        width: "95%", height: "95%",
        background: "radial-gradient(ellipse at bottom, rgba(216,184,120,0.55), transparent 65%)",
        borderRadius: "50%",
        transformOrigin: "bottom center",
        transform: active ? "translateX(-50%) scaleY(1)" : "translateX(-50%) scaleY(0)",
        transition: "transform 3.2s cubic-bezier(0.22,1,0.36,1) 0.4s",
      }} />
      {/* Fleuron */}
      <div style={{
        position: "absolute", left: "50%", top: "42%",
        transform: "translate(-50%,-50%)",
        fontFamily: "Georgia, serif", color: T.thread, fontStyle: "italic", fontSize: "1.4rem",
        opacity: active ? 0.9 : 0,
        transition: "opacity 1.4s ease 1.8s",
        textShadow: `0 0 20px ${T.thread}`,
      }}>
        ❧
      </div>
    </div>
  );
}

const FEEL_STATES = ["I feel scattered", "I feel burdened", "I feel ready to settle"];

/* ─── Slide 6 — Reset card ───────────────────────────────────────── */
function Slide6Art({ active }: { active: boolean }) {
  return (
    <div style={{
      margin: "2rem auto 0", maxWidth: 540, padding: "1.85rem 2.1rem",
      background: "linear-gradient(160deg, rgba(111,181,151,0.1), rgba(255,255,255,0.02))",
      border: "1px solid rgba(111,181,151,0.22)",
      borderRadius: 20, textAlign: "left",
      opacity: active ? 1 : 0, transform: active ? "translateY(0)" : "translateY(24px)",
      transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s",
      boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(111,181,151,0.08)",
    }}>
      <span style={{
        display: "inline-block", padding: "0.28rem 0.8rem", borderRadius: 999,
        background: "rgba(111,181,151,0.18)", color: T.standards,
        fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1rem",
      }}>
        Reset · 20–30 min
      </span>
      <div style={{ fontFamily: "Georgia, serif", fontSize: "1.55rem", color: "white", marginBottom: "0.4rem", lineHeight: 1.2 }}>
        Resilience after setback
      </div>
      <div style={{ color: T.muted, fontSize: "0.85rem", marginBottom: "1.25rem", lineHeight: 1.5 }}>
        A guided pathway for the day after
      </div>
      <div style={{ color: T.ink, fontStyle: "italic", fontFamily: "Georgia, serif", fontSize: "1rem", lineHeight: 1.6 }}>
        "You came back. The system you built is still here. Nothing in it requires you to explain where you've been."
      </div>
    </div>
  );
}

/* ─── Slide 7 — Woven ribbon close ──────────────────────────────── */
function Slide7Art({ active }: { active: boolean }) {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 580, margin: "0 auto 2rem", height: 60 }}>
      <svg viewBox="0 0 600 60" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <linearGradient id="ribbonGrad" x1="0" x2="1">
            <stop offset="0%"   stopColor={T.state} />
            <stop offset="25%"  stopColor={T.story} />
            <stop offset="50%"  stopColor={T.standards} />
            <stop offset="75%"  stopColor={T.strategy} />
            <stop offset="100%" stopColor={T.thread} />
          </linearGradient>
          <filter id="ribbonGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Shadow ribbon */}
        <path d="M 0 30 Q 150 12, 300 30 T 600 30"
          fill="none" stroke="rgba(216,184,120,0.15)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray="1400" strokeDashoffset={active ? "0" : "1400"}
          style={{ transition: "stroke-dashoffset 2.8s cubic-bezier(0.22,1,0.36,1) 0.2s" }} />
        {/* Main ribbon */}
        <path d="M 0 30 Q 150 12, 300 30 T 600 30"
          fill="none" stroke="url(#ribbonGrad)" strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray="1400" strokeDashoffset={active ? "0" : "1400"}
          filter="url(#ribbonGlow)"
          style={{ transition: "stroke-dashoffset 2.8s cubic-bezier(0.22,1,0.36,1) 0.2s", opacity: 0.9 }} />
      </svg>
    </div>
  );
}

/* ─── Slide definitions ──────────────────────────────────────────── */
type SlideId = "thesis" | "state" | "framework" | "oracle" | "btw" | "reset" | "close";

interface SlideConfig {
  id: SlideId;
  eyebrow: string;
  eyebrowColor: string;
  headlineParts: Array<{ text?: string; accent?: boolean; italic?: boolean; break?: boolean }>;
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
    headlineParts: [
      { text: "You have the vision." },
      { break: true },
      { text: "You have the books." },
      { break: true },
      { text: "Something still isn't", accent: true, italic: true },
      { text: "woven.", accent: true, italic: true },
    ],
    sub: "Lifewoven is the operating system that integrates the five dimensions of a transformed life — so the wisdom you already carry actually becomes who you are.",
    cta: "Show me how it weaves →",
    bgColors: ["#080709", "#100e0a", "#080709"],
    glowColor: "rgba(216,184,120,0.16)",
    glowPos: { x: 50, y: 58 },
  },
  {
    id: "state",
    eyebrow: "Module 1 · State",
    eyebrowColor: T.state,
    headlineParts: [
      { text: "Your inner state" },
      { break: true },
      { text: "isn't noise." },
      { break: true },
      { text: "It's", accent: true, italic: true },
      { text: "data.", accent: true, italic: true },
    ],
    sub: "Most days you push through whatever you're feeling. Lifewoven asks where you actually are — and uses your honest answer to shape the rest of the day.",
    cta: "What about the story I tell myself? →",
    bgColors: ["#0e0908", "#1a0f0d", "#0e0908"],
    glowColor: "rgba(224,123,110,0.16)",
    glowPos: { x: 50, y: 52 },
  },
  {
    id: "framework",
    eyebrow: "The 5S Framework",
    eyebrowColor: T.thread,
    headlineParts: [
      { text: "Five dimensions." },
      { break: true },
      { text: "One", accent: true, italic: true },
      { text: "woven", accent: true, italic: true },
      { text: "life.", accent: true, italic: true },
    ],
    sub: "Most personal-growth tools work on one thing. Lifewoven holds all five at once — because they're already entangled in you.",
    whisper: "Built on Frankl, Clear, Brown, and twelve other proven frameworks.",
    cta: "Will I have to do this alone? →",
    bgColors: ["#080a10", "#0d1220", "#080a10"],
    glowColor: "rgba(111,143,196,0.14)",
    glowPos: { x: 50, y: 48 },
  },
  {
    id: "oracle",
    eyebrow: "The Oracle",
    eyebrowColor: T.thread,
    headlineParts: [
      { text: "You'll never" },
      { break: true },
      { text: "practice", accent: true, italic: true },
      { text: "alone.", accent: true, italic: true },
    ],
    sub: "Not a chatbot. A practice partner that listens to your check-ins, your journal entries, and your patterns — and tells you the next right step.",
    whisper: "Personalization is opt-in. The Oracle works without it too.",
    cta: "What about when I have nothing left? →",
    bgColors: ["#06060f", "#09091a", "#06060f"],
    glowColor: "rgba(111,143,196,0.18)",
    glowPos: { x: 50, y: 42 },
  },
  {
    id: "btw",
    eyebrow: "Before the Words",
    eyebrowColor: T.stewardship,
    headlineParts: [
      { text: "A contemplative practice" },
      { break: true },
      { text: "before prayer,", accent: true, italic: true },
      { text: "before speech.", accent: true, italic: true },
    ],
    sub: "Lifewoven holds space for the moments when language fails. Choose where you are — and the practice meets you there.",
    whisper: "Two-minute practices for the days you don't have ten.",
    cta: "And when life knocks me down? →",
    bgColors: ["#0c0b09", "#14110d", "#0c0b09"],
    glowColor: "rgba(184,158,106,0.14)",
    glowPos: { x: 50, y: 52 },
  },
  {
    id: "reset",
    eyebrow: "Pathway · Flagship",
    eyebrowColor: T.standards,
    headlineParts: [
      { text: "When you fall —" },
      { break: true },
      { text: "Reset doesn't", accent: true, italic: true },
      { text: "shame you back.", accent: true, italic: true },
    ],
    sub: "Most systems break the moment you break the streak. Lifewoven's flagship pathway is built for the day after.",
    cta: "Begin the weave →",
    bgColors: ["#080d0a", "#0c1510", "#080d0a"],
    glowColor: "rgba(111,181,151,0.14)",
    glowPos: { x: 50, y: 52 },
  },
  {
    id: "close",
    eyebrow: "One last thing",
    eyebrowColor: T.thread,
    headlineParts: [
      { text: "You weren't lacking." },
      { break: true },
      { text: "You were", accent: true, italic: true },
      { text: "unwoven.", accent: true, italic: true },
    ],
    sub: "Lifewoven holds your state, your story, your standards, your strategy, and your stewardship as the single living system they were always meant to be.",
    cta: "Take the Audit",
    bgColors: ["#080709", "#100e0a", "#080709"],
    glowColor: "rgba(216,184,120,0.16)",
    glowPos: { x: 50, y: 58 },
  },
];

/* ─── Ambient threads ────────────────────────────────────────────── */
function AmbientThreads() {
  return (
    <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.14 }}
      viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      <path d="M -100 180 Q 360 80  720 180 T 1540 180" fill="none" stroke={T.state}       strokeWidth="0.7" opacity="0.8"/>
      <path d="M -100 310 Q 360 230 720 310 T 1540 310" fill="none" stroke={T.story}       strokeWidth="0.7" opacity="0.8"/>
      <path d="M -100 440 Q 360 370 720 440 T 1540 440" fill="none" stroke={T.standards}   strokeWidth="0.7" opacity="0.8"/>
      <path d="M -100 570 Q 360 500 720 570 T 1540 570" fill="none" stroke={T.strategy}    strokeWidth="0.7" opacity="0.8"/>
      <path d="M -100 700 Q 360 630 720 700 T 1540 700" fill="none" stroke={T.stewardship} strokeWidth="0.7" opacity="0.8"/>
    </svg>
  );
}

/* ─── Particle field ─────────────────────────────────────────────── */
function ParticleField({ color }: { color: string }) {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    x: 5 + (i * 5.5) % 90,
    y: 5 + (i * 7.3) % 90,
    size: 1 + (i % 3) * 0.7,
    dur: 4 + (i % 5),
    delay: (i * 0.4) % 3,
  }));
  return (
    <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.35 }}
      viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      {particles.map((p, i) => (
        <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r={p.size} fill={color} opacity="0.4"
          style={{ animation: `particleFloat ${p.dur}s ease-in-out infinite ${p.delay}s alternate` }} />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
interface Props { userId?: number | null; }

export default function OnboardingModal({ userId }: Props) {
  const [, navigate] = useLocation();
  const [open, setOpen]         = useState(false);
  const [idx, setIdx]           = useState(0);
  const [artIn, setArtIn]       = useState(false);
  const [textIn, setTextIn]     = useState(false);
  const [btnIn, setBtnIn]       = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loomState, setLoomState] = useState<LoomState>("hidden");
  const glowRef = useRef<HTMLDivElement>(null);
  const completeMutation = trpc.profile.completeOnboarding.useMutation();
  const SOUND_KEY = "lifewoven_onboarding_sound";
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem("lifewoven_onboarding_sound") === "1");
  const audioRef = useRef<ReturnType<typeof createAmbientEngine> | null>(null);
  const trackEvent = trpc.system.trackEvent.useMutation();

  // Boot audio engine on first user interaction
  function toggleSound() {
    if (!audioRef.current) {
      audioRef.current = createAmbientEngine();
    }
    if (!soundOn) {
      audioRef.current.fadeIn();
      setSoundOn(true);
      localStorage.setItem(SOUND_KEY, "1");
    } else {
      audioRef.current.fadeOut();
      setSoundOn(false);
      localStorage.removeItem(SOUND_KEY);
    }
  }

  // Auto-start / fade-out sound based on open state
  useEffect(() => {
    if (open && soundOn) {
      if (!audioRef.current) audioRef.current = createAmbientEngine();
      audioRef.current.fadeIn();
    } else if (!open && audioRef.current) {
      audioRef.current.fadeOut();
      // Don't clear soundOn — preserve the preference
    }
  }, [open]);

  useEffect(() => {
    if (!localStorage.getItem(DEVICE_KEY)) setOpen(true);
  }, []);

  useEffect(() => {
    const handler = () => { setIdx(0); setFinished(false); setOpen(true); };
    window.addEventListener("lifewoven:replay-onboarding", handler);
    return () => window.removeEventListener("lifewoven:replay-onboarding", handler);
  }, []);

  // Stagger animations on slide change
  useEffect(() => {
    if (!open) return;
    setArtIn(false); setTextIn(false); setBtnIn(false);
    const t1 = setTimeout(() => setArtIn(true), 60);
    const t2 = setTimeout(() => setTextIn(true), 200);
    const t3 = setTimeout(() => setBtnIn(true), 1200);
    // Loom state per slide
    if (idx === 0) {
      setLoomState("emerge");
    } else if (idx === SLIDES.length - 1) {
      setLoomState("farewell");
    } else {
      setLoomState("react");
      const tr = setTimeout(() => setLoomState("idle"), 800);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(tr); };
    }
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [open, idx]);

  // Arrow-key navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft")  goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, idx]);

  // Swipe gesture
  useEffect(() => {
    if (!open) return;
    let startX = 0;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onEnd   = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) < 40) return;
      if (dx < 0) goNext(); else goPrev();
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend",   onEnd,   { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend",   onEnd);
    };
  }, [open, idx]);

  // Parallax glow
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!glowRef.current) return;
      const dx = (e.clientX / window.innerWidth  - 0.5) * 32;
      const dy = (e.clientY / window.innerHeight - 0.5) * 22;
      glowRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const goNext = useCallback(() => {
    if (transitioning) return;
    setIdx(i => Math.min(SLIDES.length - 1, i + 1));
  }, [transitioning]);

  const goPrev = useCallback(() => {
    if (transitioning) return;
    setIdx(i => Math.max(0, i - 1));
  }, [transitioning]);

  // Push a history entry when the modal opens so browser Back closes it
  useEffect(() => {
    if (open) {
      window.history.pushState({ onboarding: true }, "");
      const onPop = () => setOpen(false);
      window.addEventListener("popstate", onPop);
      return () => window.removeEventListener("popstate", onPop);
    }
  }, [open]);

  if (!open) return null;

  const s = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  function dismiss() {
    localStorage.setItem(DEVICE_KEY, "1");
    if (userId) localStorage.setItem(`${STORAGE_KEY}_${userId}`, "1");
    completeMutation.mutate({ recommendedPathway: "align" });
    // Replace (not pop) the onboarding history entry so browser Back doesn't reload
    if (window.history.state?.onboarding) {
      window.history.replaceState({}, "", window.location.pathname);
    }
    setOpen(false);
  }

  function advance() {
    // Track slide progression
    trackEvent.mutate({ event: "onboarding_slide_advance", properties: { from: idx, slide: s.id } });
    if (isLast) {
      if (!finished) { setFinished(true); return; }
      dismiss();
      navigate("/alignment-audit");
    } else {
      goNext();
    }
  }

  /* ── Finished state ── */
  if (finished) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "#080709" }}>
        <AmbientThreads />
        <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-lg mx-auto">
          <div style={{ color: T.thread, fontSize: "0.65rem", letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: "1.6rem", animation: "fadeUp 0.8s ease forwards" }}>
            Woven
          </div>
          <h1 style={{
            fontFamily: "Georgia, serif", fontWeight: 500,
            fontSize: "clamp(2.2rem,5.5vw,3.2rem)", lineHeight: 1.1, color: "white", marginBottom: "1.6rem",
            animation: "fadeUp 0.8s ease 0.15s both",
          }}>
            The first <span style={{ color: T.thread, fontStyle: "italic", textShadow: `0 0 40px ${T.thread}88` }}>thread</span> is yours.
          </h1>
          <p style={{
            color: T.ink, opacity: 0.82, fontSize: "clamp(1rem,1.8vw,1.12rem)", lineHeight: 1.7,
            maxWidth: 440, marginBottom: "2.4rem",
            animation: "fadeUp 0.8s ease 0.3s both",
          }}>
            Open your dashboard whenever you're ready. The system is waiting — and now it knows your name.
          </p>
          <button onClick={() => { trackEvent.mutate({ event: "onboarding_complete", properties: {} }); dismiss(); navigate("/alignment-audit"); }}
            style={{
              background: `linear-gradient(135deg, ${T.thread}, #c9a55a)`,
              color: "#1a1610", border: "none",
              padding: "1.05rem 2.8rem", borderRadius: 999,
              fontSize: "1rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              boxShadow: `0 0 40px rgba(216,184,120,0.45), 0 8px 32px rgba(0,0,0,0.4)`,
              animation: "fadeUp 0.8s ease 0.45s both",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.transform = "scale(1.04)"; (e.target as HTMLElement).style.boxShadow = `0 0 60px rgba(216,184,120,0.65), 0 12px 40px rgba(0,0,0,0.5)`; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = "scale(1)"; (e.target as HTMLElement).style.boxShadow = `0 0 40px rgba(216,184,120,0.45), 0 8px 32px rgba(0,0,0,0.4)`; }}>
            Take the Alignment Audit →
          </button>
          <button onClick={() => { setFinished(false); setIdx(0); }}
            style={{
              background: "transparent", color: T.quiet, border: "none",
              cursor: "pointer", fontSize: "0.88rem", fontFamily: "inherit", marginTop: "1.2rem",
              animation: "fadeUp 0.8s ease 0.6s both",
            }}>
            I want to feel it again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden select-none"
      style={{ background: s.bgColors[0] }}>

      {/* Keyframes */}
      <style>{`
        @keyframes thumbDrift { from { left: 28%; } to { left: 62%; } }
        @keyframes corePulse {
          0%,100% { box-shadow: 0 0 28px rgba(216,184,120,0.7), 0 0 70px rgba(216,184,120,0.4); }
          50%      { box-shadow: 0 0 44px rgba(216,184,120,1.0), 0 0 110px rgba(216,184,120,0.6); }
        }
        @keyframes ringPulse {
          0%,100% { opacity: 0.25; transform: translate(-50%,-50%) scale(0.94); }
          50%      { opacity: 0.75; transform: translate(-50%,-50%) scale(1.06); }
        }
        @keyframes haloBreath {
          0%,100% { opacity: 0.6; transform: translate(-50%,-50%) scale(0.95); }
          50%      { opacity: 1;   transform: translate(-50%,-50%) scale(1.05); }
        }
        @keyframes particleFloat {
          from { opacity: 0.1; transform: translateY(0); }
          to   { opacity: 0.5; transform: translateY(-8px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideGlide {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Loom mascot — bottom-right corner */}
      <div style={{ position: "absolute", bottom: 72, right: 20, zIndex: 50, pointerEvents: "none" }}>
        <Loom state={loomState} size={56} />
      </div>

      {/* Ambient threads */}
      <AmbientThreads />

      {/* Particle field */}
      <ParticleField color={s.eyebrowColor} />

      {/* Background gradient — transitions smoothly */}
      <div className="absolute inset-0"
        style={{
          background: `linear-gradient(160deg, ${s.bgColors[0]} 0%, ${s.bgColors[1]} 50%, ${s.bgColors[2]} 100%)`,
          transition: "background 1.2s ease",
        }} />

      {/* Parallax glow */}
      <div ref={glowRef} className="absolute inset-0 pointer-events-none" style={{ transition: "transform 0.5s ease", willChange: "transform" }}>
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse 90% 65% at ${s.glowPos.x}% ${s.glowPos.y}%, ${s.glowColor}, transparent 70%)`,
          transition: "background 1.2s ease",
        }} />
      </div>

      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none" style={{
        opacity: 0.035,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: "120px",
      }} />

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-20" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div className="h-full"
          style={{
            width: `${((idx + 1) / SLIDES.length) * 100}%`,
            background: `linear-gradient(90deg, ${s.eyebrowColor}88, ${s.eyebrowColor})`,
            transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)",
            boxShadow: `0 0 12px ${s.eyebrowColor}`,
          }} />
      </div>

      {/* Dot progress */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            style={{
              height: 5,
              width: i === idx ? 24 : 5,
              background: i === idx ? T.thread : i < idx ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
              borderRadius: 999,
              border: "none", cursor: "pointer", padding: 0,
              transition: "width 0.5s cubic-bezier(0.22,1,0.36,1), background 0.5s ease",
              boxShadow: i === idx ? `0 0 8px ${T.thread}` : "none",
            }} />
        ))}
      </div>

      {/* Slide counter */}
      <p className="absolute bottom-5 right-6 z-20 tabular-nums"
        style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.08)", letterSpacing: "0.1em" }}>
        {idx + 1} / {SLIDES.length}
      </p>

      {/* Sound toggle */}
      <button onClick={toggleSound}
        className="absolute top-5 z-20"
        style={{
          left: idx > 0 ? 52 : 20,
          background: "transparent",
          border: `1px solid ${soundOn ? T.thread + "55" : "rgba(255,255,255,0.1)"}`,
          color: soundOn ? T.thread : T.quiet,
          fontSize: "0.7rem", letterSpacing: "0.1em",
          padding: "0.42rem 0.8rem", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
          transition: "border-color 0.3s, color 0.3s",
        }}
        title={soundOn ? "Mute ambient sound" : "Enable ambient sound"}>
        {soundOn ? "♪ on" : "♪ off"}
      </button>

      {/* Skip */}
      {idx === 0 && (
        <button onClick={dismiss} className="absolute top-5 right-5 z-20"
          style={{
            background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
            color: T.quiet, fontSize: "0.68rem", letterSpacing: "0.14em",
            padding: "0.42rem 1rem", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.25)"; (e.target as HTMLElement).style.color = T.muted; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.target as HTMLElement).style.color = T.quiet; }}>
          Skip intro
        </button>
      )}

      {/* Back arrow */}
      {idx > 0 && (
        <button onClick={goPrev} className="absolute top-5 left-5 z-20"
          style={{
            background: "transparent", border: "none",
            color: T.quiet, fontSize: "1.2rem", cursor: "pointer", padding: "0.4rem",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.color = T.muted; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.color = T.quiet; }}>
          ←
        </button>
      )}

      {/* ── Scrollable slide content ── */}
      <div className="absolute inset-0 z-10 overflow-y-auto">
        <div className="flex flex-col items-center justify-start min-h-full px-6 pt-16 pb-28">
          <div style={{ width: "100%", maxWidth: 780, textAlign: "center" }}>

            {/* Eyebrow */}
            <div style={{
              fontSize: "0.65rem", letterSpacing: "0.26em", textTransform: "uppercase",
              color: s.eyebrowColor, marginBottom: "1.6rem",
              opacity: textIn ? 1 : 0,
              transition: "opacity 0.6s ease 0.05s",
              textShadow: `0 0 20px ${s.eyebrowColor}66`,
            }}>
              {s.eyebrow}
            </div>

            {/* Slide-specific art */}
            {s.id === "thesis"    && <Slide1Art active={artIn} />}
            {s.id === "oracle"    && <Slide4Art active={artIn} />}
            {s.id === "btw"       && <Slide5Art active={artIn} />}

            {/* Headline — word-by-word reveal */}
            <h1 style={{
              fontFamily: "Georgia, serif", fontWeight: 500,
              fontSize: "clamp(1.85rem, 4.5vw, 3rem)", lineHeight: 1.1,
              letterSpacing: "-0.015em", color: "white", marginBottom: "1.6rem",
            }}>
              {s.headlineParts.map((part, i) => {
                if (part.break) return <br key={i} />;
                const wordCount = s.headlineParts.slice(0, i).filter(p => !p.break && p.text).reduce((acc, p) => acc + (p.text?.split(" ").length ?? 0), 0);
                return (
                  <WordReveal
                    key={i}
                    text={part.text!}
                    active={textIn}
                    baseDelay={0.1 + wordCount * 0.055}
                    color={part.accent ? T.thread : undefined}
                    italic={part.italic}
                  />
                );
              })}
            </h1>

            {/* Sub */}
            <p style={{
              color: T.ink, opacity: textIn ? 0.82 : 0,
              fontSize: "clamp(0.95rem, 1.65vw, 1.12rem)", lineHeight: 1.7,
              maxWidth: 600, margin: "0 auto",
              transition: "opacity 0.8s ease 0.6s",
            }}>
              {s.sub}
            </p>

            {/* Slide-specific content */}
           {s.id === "close"      && <Slide7Art key={idx} active={artIn} />}
            {s.id === "framework" && <Slide3Art active={artIn} />}
            {s.id === "oracle"    && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.6rem", margin: "2rem auto 0", maxWidth: 540 }}>
                {ORACLE_MODES.map((m, i) => (
                  <div key={i} style={{
                    padding: "1rem 0.75rem",
                    background: T.card, border: `1px solid ${T.cardBorder}`,
                    borderRadius: 14, textAlign: "center",
                    opacity: artIn ? 1 : 0, transform: artIn ? "translateY(0)" : "translateY(12px)",
                    transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${0.5 + i * 0.1}s,
                                 transform 0.55s cubic-bezier(0.22,1,0.36,1) ${0.5 + i * 0.1}s`,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  }}>
                    <div style={{ color: T.thread, fontFamily: "Georgia, serif", fontSize: "1.05rem" }}>{m.name}</div>
                    <div style={{ color: T.muted, fontSize: "0.72rem", marginTop: "0.2rem", lineHeight: 1.4 }}>{m.when}</div>
                  </div>
                ))}
              </div>
            )}
            {s.id === "btw" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.6rem", maxWidth: 560, margin: "1.5rem auto 0" }}>
                {FEEL_STATES.map((f, i) => (
                  <div key={i} style={{
                    padding: "0.9rem 0.65rem",
                    background: T.card, border: `1px solid ${T.cardBorder}`,
                    borderRadius: 14, color: T.ink, fontSize: "0.84rem", textAlign: "center", lineHeight: 1.4,
                    opacity: artIn ? 1 : 0, transform: artIn ? "translateY(0)" : "translateY(10px)",
                    transition: `opacity 0.5s ease ${0.35 + i * 0.1}s, transform 0.5s ease ${0.35 + i * 0.1}s`,
                  }}>
                    {f}
                  </div>
                ))}
              </div>
            )}
            {s.id === "reset" && <Slide6Art active={artIn} />}
            {s.id === "close" && <Slide7Art active={artIn} />}

            {/* Whisper */}
            {s.whisper && (
              <p style={{
                color: T.quiet, fontSize: "0.8rem", letterSpacing: "0.04em",
                marginTop: "1.1rem", fontStyle: "italic",
                opacity: textIn ? 1 : 0, transition: "opacity 0.7s ease 1s",
              }}>
                {s.whisper}
              </p>
            )}

            {/* Signature on close slide */}
            {s.id === "close" && (
              <p style={{
                fontFamily: "Georgia, serif", fontStyle: "italic",
                color: T.thread, fontSize: "1.15rem", marginTop: "1.6rem",
                opacity: textIn ? 1 : 0, transition: "opacity 0.8s ease 0.9s",
                textShadow: `0 0 30px ${T.thread}66`,
              }}>
                — let's begin the weave.
              </p>
            )}

            {/* CTA row */}
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem",
              marginTop: "2.5rem",
              opacity: btnIn ? 1 : 0, transform: btnIn ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)",
            }}>
              <button onClick={advance}
                style={{
                  background: `linear-gradient(135deg, ${T.thread}, #c9a55a)`,
                  color: "#1a1610", border: "none",
                  padding: "1.05rem 2.8rem", borderRadius: 999,
                  fontSize: "0.98rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  boxShadow: `0 0 32px rgba(216,184,120,0.4), 0 8px 28px rgba(0,0,0,0.4)`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.transform = "scale(1.05) translateY(-1px)";
                  (e.target as HTMLElement).style.boxShadow = `0 0 52px rgba(216,184,120,0.65), 0 12px 36px rgba(0,0,0,0.5)`;
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.transform = "scale(1) translateY(0)";
                  (e.target as HTMLElement).style.boxShadow = `0 0 32px rgba(216,184,120,0.4), 0 8px 28px rgba(0,0,0,0.4)`;
                }}>
                {s.cta}
              </button>
              {idx === 0 && (
                <button onClick={advance}
                  style={{
                    background: "transparent", color: T.quiet, border: "none",
                    cursor: "pointer", fontSize: "0.88rem", fontFamily: "inherit", fontStyle: "italic",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = T.muted; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = T.quiet; }}>
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
