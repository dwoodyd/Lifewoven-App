import { useEffect, useRef, useState } from "react";

/**
 * Lumin — the living thread mascot of Lifewoven.
 *
 * Lumin is a small creature made of five interwoven colored threads
 * (matching the 5S palette). It has no face — it communicates entirely
 * through motion: tightening threads when aligned, loosening when
 * something is off, and weaving itself into existence from nothing.
 *
 * States:
 *  - "idle"    : gentle breathing bob, threads slowly shifting
 *  - "emerge"  : threads fly in from different directions and weave together
 *  - "react"   : a quick excited pulse + thread burst
 *  - "farewell": unweaves outward in all directions
 *  - "hidden"  : invisible
 */

const T = {
  state:       "#F59E0B", // amber
  story:       "#8B5CF6", // violet
  standards:   "#10B981", // emerald
  strategy:    "#3B82F6", // blue
  stewardship: "#F43F5E", // rose
};

const THREADS = [
  { color: T.state,       angle: -30 },
  { color: T.story,       angle: -15 },
  { color: T.standards,   angle:   0 },
  { color: T.strategy,    angle:  15 },
  { color: T.stewardship, angle:  30 },
];

export type LuminState = "hidden" | "idle" | "emerge" | "react" | "farewell";

interface LuminProps {
  state?: LuminState;
  size?: number;
  className?: string;
  onEmergeComplete?: () => void;
}

export function Lumin({ state = "idle", size = 64, className = "", onEmergeComplete }: LuminProps) {
  const [phase, setPhase] = useState<LuminState>("hidden");
  const [tick, setTick] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const prevState = useRef<LuminState>("hidden");

  // Animate tick for idle breathing
  useEffect(() => {
    if (phase !== "idle") return;
    let running = true;
    function loop(ts: number) {
      if (!running) return;
      setTick(ts);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  // State machine transitions
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;

    if (state === "emerge") {
      setPhase("emerge");
      startRef.current = null;
      const timeout = setTimeout(() => {
        setPhase("idle");
        onEmergeComplete?.();
      }, 1400);
      return () => clearTimeout(timeout);
    }
    if (state === "react") {
      setPhase("react");
      const timeout = setTimeout(() => setPhase("idle"), 700);
      return () => clearTimeout(timeout);
    }
    if (state === "farewell") {
      setPhase("farewell");
      const timeout = setTimeout(() => setPhase("hidden"), 1000);
      return () => clearTimeout(timeout);
    }
    setPhase(state);
  }, [state, onEmergeComplete]);

  if (phase === "hidden") return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.28; // knot radius

  // Idle breathing: slow sinusoidal scale
  const breathe = phase === "idle"
    ? 1 + 0.04 * Math.sin(tick / 800)
    : 1;

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    display: "inline-block",
    position: "relative",
    flexShrink: 0,
  };

  return (
    <div style={containerStyle} className={className}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          <filter id="lumin-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="lumin-core-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g
          transform={`translate(${cx},${cy}) scale(${breathe})`}
          style={{
            animation:
              phase === "emerge"   ? `lumin-emerge 1.2s cubic-bezier(0.22,1,0.36,1) both` :
              phase === "react"    ? `lumin-react 0.6s cubic-bezier(0.22,1,0.36,1) both` :
              phase === "farewell" ? `lumin-farewell 0.9s cubic-bezier(0.55,0,1,0.45) both` :
              "none",
          }}
        >
          {/* Woven thread body — 5 curved arcs that cross each other */}
          {THREADS.map((th, i) => {
            const rad = (th.angle * Math.PI) / 180;
            const spread = r * 1.1;
            const x1 = -Math.cos(rad) * spread;
            const y1 = -Math.sin(rad) * spread;
            const x2 =  Math.cos(rad) * spread;
            const y2 =  Math.sin(rad) * spread;
            const perp = rad + Math.PI / 2;
            const cp1x = x1 * 0.3 + Math.cos(perp) * r * 0.45;
            const cp1y = y1 * 0.3 + Math.sin(perp) * r * 0.45;
            const cp2x = x2 * 0.3 - Math.cos(perp) * r * 0.45;
            const cp2y = y2 * 0.3 - Math.sin(perp) * r * 0.45;
            const d = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
            const emergeDelay = i * 0.08;

            return (
              <g key={i}>
                {/* Glow trail */}
                <path
                  d={d}
                  fill="none"
                  stroke={th.color}
                  strokeWidth={size * 0.055}
                  strokeLinecap="round"
                  opacity={0.22}
                  style={phase === "emerge" ? {
                    animation: `lumin-thread-emerge 0.9s cubic-bezier(0.22,1,0.36,1) ${emergeDelay}s both`,
                  } : undefined}
                />
                {/* Main thread */}
                <path
                  d={d}
                  fill="none"
                  stroke={th.color}
                  strokeWidth={size * 0.032}
                  strokeLinecap="round"
                  filter="url(#lumin-glow)"
                  style={phase === "emerge" ? {
                    animation: `lumin-thread-emerge 0.9s cubic-bezier(0.22,1,0.36,1) ${emergeDelay}s both`,
                  } : undefined}
                />
              </g>
            );
          })}

          {/* Central golden knot — the "soul" of Lumin */}
          <circle
            cx={0}
            cy={0}
            r={size * 0.09}
            fill="#F59E0B"
            filter="url(#lumin-core-glow)"
            opacity={0.95}
            style={phase === "emerge" ? {
              animation: `lumin-orb-emerge 0.6s cubic-bezier(0.22,1,0.36,1) 0.7s both`,
            } : undefined}
          />
          <circle
            cx={0}
            cy={0}
            r={size * 0.05}
            fill="#FDE68A"
            opacity={0.9}
            style={phase === "emerge" ? {
              animation: `lumin-orb-emerge 0.6s cubic-bezier(0.22,1,0.36,1) 0.75s both`,
            } : undefined}
          />
        </g>
      </svg>

      <style>{`
        @keyframes lumin-emerge {
          from { opacity: 0; transform: translate(${cx}px,${cy}px) scale(0.1) rotate(-180deg); }
          to   { opacity: 1; transform: translate(${cx}px,${cy}px) scale(1) rotate(0deg); }
        }
        @keyframes lumin-thread-emerge {
          from { opacity: 0; stroke-dashoffset: 200; stroke-dasharray: 200; }
          to   { opacity: 1; stroke-dashoffset: 0;   stroke-dasharray: 200; }
        }
        @keyframes lumin-orb-emerge {
          from { r: 0; opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lumin-react {
          0%   { transform: translate(${cx}px,${cy}px) scale(1); }
          30%  { transform: translate(${cx}px,${cy}px) scale(1.35) rotate(15deg); }
          60%  { transform: translate(${cx}px,${cy}px) scale(0.9) rotate(-8deg); }
          100% { transform: translate(${cx}px,${cy}px) scale(1) rotate(0deg); }
        }
        @keyframes lumin-farewell {
          from { opacity: 1; transform: translate(${cx}px,${cy}px) scale(1); }
          to   { opacity: 0; transform: translate(${cx}px,${cy}px) scale(2.5) rotate(90deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * LuminCorner — a small persistent Lumin that sits in the bottom-right
 * corner of a page. Pulses gently, reacts when you interact with it.
 */
interface LuminCornerProps {
  /** Trigger a react pulse from outside */
  pulse?: boolean;
  size?: number;
  tooltip?: string;
  onClick?: () => void;
}

export function LuminCorner({ pulse = false, size = 48, tooltip, onClick }: LuminCornerProps) {
  const [luminState, setLuminState] = useState<LuminState>("hidden");
  const pulsed = useRef(false);

  // Screenshot mode — hide when user has enabled it in Settings
  const [screenshotMode, setScreenshotMode] = useState(
    () => localStorage.getItem("lifeos_screenshot_mode") === "true"
  );
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "lifeos_screenshot_mode") setScreenshotMode(e.newValue === "true");
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    // Emerge after a short delay on mount
    const t = setTimeout(() => setLuminState("emerge"), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (pulse && !pulsed.current) {
      pulsed.current = true;
      setLuminState("react");
      setTimeout(() => {
        pulsed.current = false;
        setLuminState("idle");
      }, 700);
    }
  }, [pulse]);

  if (screenshotMode) return null;

  return (
    <div
      title={tooltip}
      onClick={onClick}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 40,
        cursor: onClick ? "pointer" : "default",
        filter: "drop-shadow(0 2px 8px rgba(245,158,11,0.35))",
        transition: "transform 0.2s",
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.15)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
    >
      <Lumin state={luminState} size={size} />
    </div>
  );
}
