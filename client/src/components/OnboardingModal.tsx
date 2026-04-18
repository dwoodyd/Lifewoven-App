import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const SCENES = [
  {
    bg: "linear-gradient(160deg, #07070f 0%, #0d0d1a 50%, #07070f 100%)",
    glow: "radial-gradient(ellipse 65% 45% at 50% 62%, rgba(180,140,60,0.16) 0%, transparent 70%)",
    eyebrow: null,
    headline: "You already know\nsomething needs\nto change.",
    sub: "You feel it — that quiet tension between who you are and who you're meant to be.",
    cta: "I feel it too",
  },
  {
    bg: "linear-gradient(160deg, #060c16 0%, #0b1220 50%, #060c16 100%)",
    glow: "radial-gradient(ellipse 80% 55% at 50% 50%, rgba(70,110,210,0.15) 0%, transparent 70%)",
    eyebrow: "THE 5S FRAMEWORK",
    headline: "Five dimensions.\nOne integrated life.",
    sub: "State · Story · Standards · Strategy · Stewardship — the architecture of a life fully lived.",
    cta: "Show me the way",
  },
  {
    bg: "linear-gradient(160deg, #0e0a06 0%, #1a1008 50%, #0e0a06 100%)",
    glow: "radial-gradient(ellipse 70% 50% at 50% 58%, rgba(200,130,50,0.2) 0%, transparent 70%)",
    eyebrow: "THE PRACTICE",
    headline: "This isn't\nself-help.\nIt's self-architecture.",
    sub: "You don't consume content here. You build — daily, deliberately, with guidance that meets you where you are.",
    cta: "I'm the builder",
  },
  {
    bg: "linear-gradient(160deg, #06080f 0%, #08091a 50%, #06080f 100%)",
    glow: "radial-gradient(ellipse 65% 65% at 50% 42%, rgba(120,80,210,0.18) 0%, transparent 70%)",
    eyebrow: "THE ORACLE",
    headline: "You'll never\npractice alone.",
    sub: "Your AI guide knows your pathways, your journal, your patterns. It speaks to your actual life — not a generic one.",
    cta: "I want that",
  },
  {
    bg: "linear-gradient(160deg, #0b0906 0%, #1c1508 50%, #0b0906 100%)",
    glow: "radial-gradient(ellipse 80% 60% at 50% 62%, rgba(215,175,70,0.22) 0%, transparent 65%)",
    eyebrow: "YOUR JOURNEY",
    headline: "Your alignment\nstarts now.",
    sub: "Choose your first pathway. Begin your practice. The life you've been designing in your mind is waiting.",
    cta: "Begin",
  },
];

const STORAGE_KEY = "lifewoven_onboarded_v3";

interface Props { userId?: number | null; }

export default function OnboardingModal({ userId }: Props) {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [scene, setScene] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);
  const [textIn, setTextIn] = useState(false);
  const [btnIn, setBtnIn] = useState(false);

  const completeMutation = trpc.profile.completeOnboarding.useMutation();

  useEffect(() => {
    if (!userId) return;
    const seen = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (!seen) setOpen(true);
  }, [userId]);

  useEffect(() => {
    if (!open) return;
    setFadeIn(false); setTextIn(false); setBtnIn(false);
    const t1 = setTimeout(() => setFadeIn(true), 30);
    const t2 = setTimeout(() => setTextIn(true), 350);
    const t3 = setTimeout(() => setBtnIn(true), 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [open, scene]);

  if (!open) return null;

  const s = SCENES[scene];
  const isLast = scene === SCENES.length - 1;

  function dismiss() {
    if (userId) localStorage.setItem(`${STORAGE_KEY}_${userId}`, "1");
    completeMutation.mutate({ recommendedPathway: "align" });
    setOpen(false);
  }

  function advance() {
    if (isLast) {
      dismiss();
      navigate("/pathways");
    } else {
      setScene(p => p + 1);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#07070f" }}
    >
      {/* Scene bg */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{ background: s.bg, opacity: fadeIn ? 1 : 0 }}
      />
      {/* Glow */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{ background: s.glow, opacity: fadeIn ? 1 : 0 }}
      />
      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${1 + (i % 2)}px`,
              height: `${1 + (i % 2)}px`,
              top: `${8 + (i * 19) % 84}%`,
              left: `${4 + (i * 27) % 92}%`,
              opacity: 0.06 + (i % 5) * 0.04,
              animation: `pulse ${3 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${(i * 0.5) % 4}s`,
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5 z-10">
        <div
          className="h-full bg-amber-400/60 transition-all duration-700"
          style={{ width: `${((scene + 1) / SCENES.length) * 100}%` }}
        />
      </div>

      {/* Progress dots */}
      <div className="absolute top-6 left-0 right-0 flex justify-center gap-2 z-10">
        {SCENES.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-500"
            style={{
              width: i === scene ? "24px" : "6px",
              height: "6px",
              background: i === scene ? "rgba(251,191,36,0.8)" : i < scene ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.1)",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-8 max-w-xs mx-auto"
        style={{
          opacity: textIn ? 1 : 0,
          transform: textIn ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        {s.eyebrow && (
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-7"
            style={{ color: "rgba(251,191,36,0.65)" }}>
            {s.eyebrow}
          </p>
        )}
        <h1
          className="font-serif font-light leading-tight whitespace-pre-line mb-6"
          style={{ fontSize: "clamp(1.9rem, 7vw, 2.6rem)", color: "rgba(255,255,255,0.95)" }}
        >
          {s.headline}
        </h1>
        <p
          className="text-sm leading-relaxed font-light max-w-[260px]"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          {s.sub}
        </p>
      </div>

      {/* CTA */}
      <div
        className="absolute bottom-14 left-0 right-0 flex flex-col items-center gap-4 z-10"
        style={{
          opacity: btnIn ? 1 : 0,
          transform: btnIn ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <button
          onClick={advance}
          className="px-10 py-3.5 rounded-full text-sm font-medium tracking-wide transition-all duration-200 active:scale-95"
          style={{
            background: "rgba(251,191,36,1)",
            color: "#0a0a0a",
            boxShadow: "0 0 32px rgba(251,191,36,0.25)",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(253,211,77,1)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(251,191,36,1)")}
        >
          {s.cta}
        </button>
        {scene === 0 && (
          <button
            onClick={dismiss}
            className="text-xs transition-colors"
            style={{ color: "rgba(255,255,255,0.2)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
          >
            Skip intro
          </button>
        )}
      </div>

      {/* Scene counter */}
      <p
        className="absolute bottom-6 right-7 text-xs tabular-nums z-10"
        style={{ color: "rgba(255,255,255,0.12)" }}
      >
        {scene + 1} / {SCENES.length}
      </p>
    </div>
  );
}
