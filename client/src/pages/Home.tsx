import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Nav from "@/components/Nav";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { LUMIN_VIDEOS } from "@/data/lumin";
import { getLumenPoster } from "@shared/lumenMedia";
import { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import NewMemberHome from "@/components/NewMemberHome";

// Pick the floating/idle Lumin video for the hero
const HERO_LUMIN = LUMIN_VIDEOS.find((v) => v.id === "floating_center") ?? LUMIN_VIDEOS[0];
const ORACLE_LUMIN = LUMIN_VIDEOS.find((v) => v.id === "core_unfurls") ?? LUMIN_VIDEOS[1];
const BOUNCY_LUMIN = LUMIN_VIDEOS.find((v) => v.id === "bouncing_joyfully") ?? LUMIN_VIDEOS[2];

function LuminVideo({ video, className }: { video: typeof LUMIN_VIDEOS[0]; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const poster = getLumenPoster(video.id);

  useEffect(() => {
    const target = hostRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (shouldLoad && ref.current) {
      ref.current.play().catch(() => {});
    }
  }, [shouldLoad]);

  return (
    <div ref={hostRef} className={className}>
      <video
        ref={ref}
        {...(shouldLoad ? { src: video.url } : {})}
        poster={poster}
        preload="none"
        autoPlay={shouldLoad}
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-contain"
        style={{ mixBlendMode: "normal" }}
      />
    </div>
  );
}

const modules = [
  { id: "state", label: "State", color: "oklch(0.62 0.14 200)", desc: "Emotional alignment and nervous system regulation." },
  { id: "story", label: "Story", color: "oklch(0.60 0.14 280)", desc: "Belief rewriting and identity building." },
  { id: "standards", label: "Standards", color: "oklch(0.58 0.16 145)", desc: "Habit design and identity-based execution." },
  { id: "strategy", label: "Strategy", color: "oklch(0.52 0.14 240)", desc: "Decision quality and leverage thinking." },
  { id: "stewardship", label: "Stewardship", color: "oklch(0.62 0.12 55)", desc: "Energy, body, time, and wealth as sacred resources." },
];

const pathways = [
  { slug: "align", label: "Align", desc: "Daily grounding" },
  { slug: "resonance", label: "Resonance", desc: "Advanced alignment" },
  { slug: "uplift", label: "Uplift", desc: "Emotional set-point" },
  { slug: "flow", label: "Flow", desc: "Future-self activation" },
  { slug: "rhythms", label: "Rhythms", desc: "Habit execution" },
  { slug: "purpose", label: "Purpose", desc: "Meaning and resilience" },
  { slug: "reset", label: "Reset", desc: "Flagship protocol" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  // Fetch home context only when authenticated
  const { data: homeCtx, isLoading: homeCtxLoading } = trpc.profile.homeContext.useQuery(
    undefined,
    { enabled: isAuthenticated, refetchOnMount: "always" }
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loginError = params.get("login_error");
    if (loginError) {
      const messages: Record<string, string> = {
        invalid_token: "Login failed — the session token was invalid. Please try again.",
        expired_code: "Login link expired. Please sign in again.",
        used_code: "This login link has already been used. Please sign in again.",
        missing_code: "Login failed — missing verification code. Please try again.",
        oauth_error: "Login failed — OAuth error. Please try again.",
      };
      const msg = messages[loginError] ?? "Login failed. Please try again.";
      toast.error("Sign-in error", { description: msg });
      const clean = window.location.pathname;
      window.history.replaceState({}, "", clean);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // ── Branch: authenticated users ──────────────────────────────────────────────
  if (isAuthenticated) {
    // Still loading context — show nothing (avoids flash)
    if (homeCtxLoading || !homeCtx) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <span className="text-muted-foreground text-sm font-light">Loading…</span>
        </div>
      );
    }
    // Returning member (has prior activity) → go straight to dashboard
    if (homeCtx.hasActivity) {
      window.location.replace("/dashboard");
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <span className="text-muted-foreground text-sm font-light">Loading…</span>
        </div>
      );
    }
    // First-time user: no activity yet — show the welcome + assessment CTA
    return <NewMemberHome userName={homeCtx.userName} />;
  }

  // ── Branch: logged-out → full marketing landing ───────────────────────────────
  return (
    <div className="min-h-screen bg-[oklch(0.10_0.015_260)] text-[oklch(0.95_0.01_60)]">
      <Nav />

      {/* ─── HERO ─── */}
      <section className="relative min-h-[max(680px,100svh)] overflow-hidden">
        {/* Deep navy gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.08_0.02_260)] via-[oklch(0.10_0.015_260)] to-[oklch(0.12_0.025_280)]" />

        {/* Lumen stays in the open right field; copy never crosses her face or tendrils. */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-full items-center justify-center sm:w-[70%] sm:justify-end">
          <LuminVideo
            video={HERO_LUMIN}
            className="relative aspect-video w-[min(98vw,1160px)] opacity-90 sm:w-[min(76vw,1160px)]"
          />
          <div className="absolute inset-y-0 left-0 w-[38%] bg-gradient-to-r from-[oklch(0.08_0.02_260/0.92)] via-[oklch(0.08_0.02_260/0.42)] to-transparent" aria-hidden="true" />
        </div>

        {/* A shaped copy field protects readable typography without obscuring Lumen. */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,oklch(0.08_0.02_260)_0%,oklch(0.08_0.02_260/0.96)_42%,oklch(0.08_0.02_260/0.52)_63%,transparent_84%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(0deg,oklch(0.08_0.02_260)_0%,transparent_100%)]" />

        {/* Content */}
        <div className="relative z-10 w-full">
          <div className="flex min-h-[max(680px,100svh)] max-w-7xl items-center px-6 pb-20 pt-28 sm:px-10">
            <div className="max-w-xl text-left">
            {/* Eyebrow */}
            <p className="mb-8 font-mono text-xs uppercase tracking-[0.24em] text-[oklch(0.78_0.12_55)]">
              The 5S Personal Transformation System
            </p>

            {/* Headline */}
            <h1
              className="mb-8 leading-[1.03] tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.8rem, 5.5vw, 5.6rem)", fontWeight: 400 }}
            >
              One intelligent
              <br />
              <em style={{ color: "oklch(0.82 0.14 55)", fontStyle: "italic" }}>operating system</em>
              <br />
              for your whole life.
            </h1>

            <p className="mb-10 max-w-xl text-lg font-light leading-relaxed text-[oklch(0.84_0.01_75)] sm:text-xl">
              Lifewoven brings together emotional alignment, belief work, habit execution, strategic clarity, and holistic stewardship — in one guided, intelligent platform.
            </p>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link
                href="/audit"
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-medium transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, oklch(0.75 0.14 55), oklch(0.65 0.18 45))",
                  color: "oklch(0.12 0.02 260)",
                  boxShadow: "0 0 40px oklch(0.75 0.14 55 / 0.35)",
                }}
              >
                Take the Load-Bearing Survey
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#system"
                className="flex items-center gap-2 rounded-full border border-[oklch(0.82_0.01_75/0.5)] px-6 py-4 text-sm font-light text-[oklch(0.9_0.01_75)] transition-all duration-300 hover:border-[oklch(0.72_0.12_55)/0.5] hover:text-[oklch(0.82_0.14_55)]"
              >
                Explore Lifewoven
              </a>
            </div>

            <p className="mt-6 text-xs text-[oklch(0.78_0.01_75)]">
              Free to start · No credit card required ·{" "}
              <Link href="/beta" className="text-[oklch(0.72_0.12_55)] hover:underline">
                Have a beta code?
              </Link>
            </p>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[oklch(0.10_0.015_260)] to-transparent pointer-events-none" />
      </section>

      {/* ─── TRUST BAR ─── */}
      <section className="border-y border-border py-6 bg-[oklch(0.10_0.015_260)]">
        <div className="max-w-5xl mx-auto px-6">
          <p className="font-mono text-[9px] tracking-[0.3em] text-[oklch(0.40_0.01_260)] uppercase text-center mb-4">
            Informed by wisdom traditions including
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-[oklch(0.45_0.01_260)] text-xs font-light tracking-wide">
            {["Mind Science", "Emotional Guidance System", "Behavioral Science", "Meaning-Centered Philosophy", "Conscious Creation"].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE SYSTEM ─── */}
      <section id="system" className="py-32 bg-[oklch(0.10_0.015_260)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-[oklch(0.72_0.12_55)] uppercase mb-6">The Framework</p>
              <h2
                className="leading-[1.1] mb-6"
                style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 400, color: "oklch(0.93 0.02 60)" }}
              >
                Five dimensions.
                <br />
                <em style={{ color: "oklch(0.82 0.14 55)", fontStyle: "italic" }}>One coherent life.</em>
              </h2>
              <p className="text-[oklch(0.60_0.01_260)] text-lg font-light leading-relaxed">
                The 5S Framework organizes every tool, practice, and insight into five interconnected domains — each essential, each supporting the others. When one dimension shifts, they all shift.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {modules.map((mod) => (
                <Link key={mod.id} href={`/${mod.id}`}>
                  <div
                    className="group flex items-center gap-5 p-5 rounded-2xl border border-border bg-[oklch(0.12_0.015_260)] hover:border-border transition-all duration-300 cursor-pointer"
                  >
                    <div
                      className="w-1 h-12 rounded-full shrink-0"
                      style={{ background: mod.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[oklch(0.88_0.02_60)] mb-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {mod.label}
                      </p>
                      <p className="text-sm text-[oklch(0.50_0.01_260)] font-light">{mod.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[oklch(0.35_0.01_260)] group-hover:text-[oklch(0.72_0.12_55)] group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Oracle feature block */}
          <div className="relative rounded-3xl overflow-hidden border border-[oklch(0.72_0.12_55)/0.25] bg-[oklch(0.11_0.02_260)]">
            {/* Lumin in the background */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end pointer-events-none overflow-hidden">
              <LuminVideo
                video={ORACLE_LUMIN}
                className="w-[min(55vw,500px)] h-[min(55vw,500px)] object-contain opacity-50"
              />
            </div>
            <div className="relative z-10 p-10 md:p-16 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[oklch(0.72_0.12_55)/0.30] bg-[oklch(0.72_0.12_55)/0.08] mb-6">
                <Sparkles className="h-3 w-3 text-[oklch(0.82_0.14_55)]" />
                <span className="font-mono text-[9px] tracking-[0.25em] text-[oklch(0.82_0.14_55)] uppercase">Oracle Tier</span>
              </div>
              <h2
                className="leading-[1.1] mb-5"
                style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3.5vw, 3rem)", fontWeight: 400, color: "oklch(0.93 0.02 60)" }}
              >
                The Oracle knows
                <br />
                <em style={{ color: "oklch(0.82 0.14 55)", fontStyle: "italic" }}>where you are.</em>
              </h2>
              <p className="text-[oklch(0.60_0.01_260)] text-lg font-light leading-relaxed mb-8">
                As you journal, check in, and move through pathways, the Oracle recognizes patterns across all five dimensions and tells you exactly what to work on next. You are never alone in this.
              </p>
              <Link
                href="/oracle"
                className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, oklch(0.75 0.14 55), oklch(0.65 0.18 45))",
                  color: "oklch(0.12 0.02 260)",
                  boxShadow: "0 0 30px oklch(0.75 0.14 55 / 0.25)",
                }}
              >
                Meet the Oracle
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PATHWAYS ─── */}
      <section id="pathways" className="py-32 bg-[oklch(0.09_0.015_260)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="font-mono text-[10px] tracking-[0.3em] text-[oklch(0.72_0.12_55)] uppercase mb-5">Guided Experiences</p>
            <h2
              className="leading-[1.1] mb-5"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 400, color: "oklch(0.93 0.02 60)" }}
            >
              Enter through your{" "}
              <em style={{ color: "oklch(0.82 0.14 55)", fontStyle: "italic" }}>present need.</em>
            </h2>
            <p className="text-[oklch(0.55_0.01_260)] text-lg font-light max-w-xl mx-auto">
              Seven curated pathways. Each a complete transformation protocol, not just a feature list.
            </p>
          </div>
          {/* Row 1: first 4 cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {pathways.slice(0, 4).map((p, i) => (
              <Link key={p.slug} href={`/pathway/${p.slug}`}>
                <div className="group p-6 rounded-2xl border border-border bg-[oklch(0.12_0.015_260)] hover:border-[oklch(0.72_0.12_55)/0.40] hover:bg-[oklch(0.13_0.02_260)] transition-all duration-300 cursor-pointer h-full">
                  <p className="font-mono text-[9px] tracking-[0.25em] text-[oklch(0.40_0.01_260)] uppercase mb-3">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3
                    className="text-lg mb-1 text-[oklch(0.88_0.02_60)] group-hover:text-[oklch(0.82_0.14_55)] transition-colors"
                    style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
                  >
                    {p.label}
                  </h3>
                  <p className="text-xs text-[oklch(0.45_0.01_260)] font-light">{p.desc}</p>
                </div>
              </Link>
            ))}
          </div>
          {/* Row 2: last 3 cards — centred so no orphan */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:max-w-[75%] sm:mx-auto">
            {pathways.slice(4).map((p, i) => (
              <Link key={p.slug} href={`/pathway/${p.slug}`}>
                <div className="group p-6 rounded-2xl border border-border bg-[oklch(0.12_0.015_260)] hover:border-[oklch(0.72_0.12_55)/0.40] hover:bg-[oklch(0.13_0.02_260)] transition-all duration-300 cursor-pointer h-full">
                  <p className="font-mono text-[9px] tracking-[0.25em] text-[oklch(0.40_0.01_260)] uppercase mb-3">
                    {String(i + 5).padStart(2, "0")}
                  </p>
                  <h3
                    className="text-lg mb-1 text-[oklch(0.88_0.02_60)] group-hover:text-[oklch(0.82_0.14_55)] transition-colors"
                    style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
                  >
                    {p.label}
                  </h3>
                  <p className="text-xs text-[oklch(0.45_0.01_260)] font-light">{p.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHERE TO BEGIN ─── */}
      <section className="py-32 bg-[oklch(0.10_0.015_260)]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="font-mono text-[10px] tracking-[0.3em] text-[oklch(0.72_0.12_55)] uppercase mb-5">Your Starting Point</p>
            <h2
              className="leading-[1.1] mb-5"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 400, color: "oklch(0.93 0.02 60)" }}
            >
              Overwhelmed?{" "}
              <em style={{ color: "oklch(0.82 0.14 55)", fontStyle: "italic" }}>Start here.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Take the Load-Bearing Survey", desc: "A 12-question diagnostic. 5 minutes. Tells you exactly where to begin.", cta: "Begin the survey", href: "/audit" },
              { step: "02", title: "Enter Your First Pathway", desc: "Follow the guided protocol recommended for you. Step-by-step. No guesswork.", cta: "See All Pathways", href: "/pathways" },
              { step: "03", title: "Let the Oracle Guide You", desc: "As you journal and check in, the Oracle recognizes your patterns and tells you what to work on next.", cta: "Meet the Oracle", href: "/oracle" },
            ].map((item) => (
              <div key={item.step} className="p-8 rounded-2xl border border-border bg-[oklch(0.12_0.015_260)]">
                <p className="font-mono text-[9px] tracking-[0.3em] text-[oklch(0.72_0.12_55)] uppercase mb-5">{item.step}</p>
                <h3
                  className="text-xl mb-4 text-[oklch(0.88_0.02_60)]"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
                >
                  {item.title}
                </h3>
                <p className="text-sm text-[oklch(0.50_0.01_260)] font-light leading-relaxed mb-6">{item.desc}</p>
                <Link href={item.href} className="text-sm text-[oklch(0.72_0.12_55)] flex items-center gap-1 hover:gap-2 transition-all">
                  {item.cta} <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BEFORE THE WORDS ─── */}
      <section className="py-24 bg-[oklch(0.09_0.015_260)]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-3xl border border-[oklch(0.72_0.12_55)/0.20] bg-[oklch(0.11_0.02_260)] p-10 md:p-16 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <p className="font-mono text-[9px] tracking-[0.3em] text-[oklch(0.72_0.12_55)] uppercase mb-5">Companion Practice</p>
              <h2
                className="leading-[1.1] mb-5"
                style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 400, color: "oklch(0.93 0.02 60)" }}
              >
                The Ground
              </h2>
              <p className="text-[oklch(0.55_0.01_260)] font-light leading-relaxed mb-3 max-w-md">
                A contemplative formation practice for people who know the right words — but want to be settled before they say them.
              </p>
              <p className="text-[oklch(0.55_0.01_260)] font-light leading-relaxed mb-8 max-w-md">
                A companion to <em>Build a Life That Does Not Break You</em>. A practice for the space before prayer, conversation, and decision.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/ground">
                  <button
                    className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.75 0.14 55), oklch(0.65 0.18 45))",
                      color: "oklch(0.12 0.02 260)",
                    }}
                  >
                    Enter the Practice <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/ground/ground-check">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-light border border-border text-[oklch(0.60_0.01_260)] hover:border-[oklch(0.72_0.12_55)/0.5] transition-all">
                    Take the Ground Check
                  </button>
                </Link>
              </div>
            </div>
            <div className="shrink-0 text-center">
              <div
                className="w-28 h-28 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[oklch(0.72_0.12_55)/0.25]"
                style={{ background: "oklch(0.72 0.12 55 / 0.08)" }}
              >
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: "oklch(0.82 0.14 55)", fontWeight: 400, lineHeight: 1.2 }}>The<br/>Ground</span>
              </div>
              <p className="text-xs text-[oklch(0.40_0.01_260)]">Available now</p>
              <p className="text-xs text-[oklch(0.40_0.01_260)]">Free with Explorer</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOUNDER'S NOTE ─── */}
      <section className="py-32 bg-[oklch(0.10_0.015_260)]">
        <div className="max-w-3xl mx-auto px-6">
          <p className="font-mono text-[9px] tracking-[0.3em] text-[oklch(0.40_0.01_260)] uppercase mb-10">A note from the founder</p>
          <blockquote
            className="leading-relaxed mb-10 text-[oklch(0.80_0.02_60)]"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", fontWeight: 400 }}
          >
            &ldquo;I built Lifewoven because I kept chasing change and ending up with notes in a hundred different places — books underlined, journals half-filled, fragments of who I was becoming scattered everywhere with nothing to hold them together.
            <br /><br />
            The insights were real. The intention was real. But without one place to see it all, the growth stayed invisible. I needed somewhere a person could bring every piece of their inner work and actually watch their life change in front of them.
            <br /><br />
            That is what this is.&rdquo;
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-[oklch(0.20_0.02_260)]" />
            <div className="flex items-center gap-3 shrink-0">
              <img
                src="/manus-storage/dewayne-woods-founder_4f2325f0.webp"
                alt="DeWayne Woods"
                className="w-12 h-12 rounded-full object-cover object-top border border-border"
              />
              <div className="text-right">
                <p className="text-sm font-medium text-[oklch(0.80_0.02_60)]">DeWayne Woods</p>
                <p className="text-xs text-[oklch(0.40_0.01_260)]">Founder &amp; Creator, Lifewoven</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-32 bg-[oklch(0.09_0.015_260)]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="font-mono text-[10px] tracking-[0.3em] text-[oklch(0.72_0.12_55)] uppercase mb-5">Investment</p>
            <h2
              className="leading-[1.1] mb-5"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 400, color: "oklch(0.93 0.02 60)" }}
            >
              Choose your path.
            </h2>
            <p className="text-[oklch(0.55_0.01_260)] text-lg font-light">
              Every tier creates real transformation. Start free. Upgrade when you are ready.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                name: "Explorer",
                price: "$0",
                desc: "Lumen walks beside you. Begin your alignment journey.",
                features: ["Load-Bearing Survey diagnostic", "Daily emotional check-in", "The Weave (30 entries)", "Align & Uplift pathways", "5S Framework overview"],
                cta: "Start Free",
                href: "/audit",
                highlight: false,
              },
              {
                name: "Seeker",
                price: "$19",
                period: "/mo",
                desc: "Lumen opens the full system. Every tool, every pathway — fully unlocked.",
                features: ["Everything in Explorer", "Unlimited Weave entries", "All 7 pathways", "Full 5S module suite", "Habit tracker & scorecard", "Decision journal", "Energy audit & trends"],
                cta: "Begin Transformation",
                href: getLoginUrl(),
                highlight: true,
              },
              {
                name: "Oracle",
                price: "$49",
                period: "/mo",
                desc: "Lumen and the Oracle work continuously. The AI layer that reads your patterns.",
                features: ["Everything in Seeker", "Unlimited Oracle AI chat", "AI Weave reflections", "Cross-module pattern insights", "Monthly Oracle deep-dive report", "1-on-1 onboarding call"],
                cta: "Unlock the Oracle",
                href: getLoginUrl(),
                highlight: false,
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className="p-8 rounded-2xl border flex flex-col"
                style={{
                  borderColor: tier.highlight ? "oklch(0.72 0.12 55 / 0.50)" : "oklch(0.20 0.02 260)",
                  background: tier.highlight ? "oklch(0.12 0.02 260)" : "oklch(0.11 0.015 260)",
                  boxShadow: tier.highlight ? "0 0 60px oklch(0.75 0.14 55 / 0.12)" : "none",
                }}
              >
                {tier.highlight && (
                  <div className="inline-flex mb-4">
                    <span
                      className="font-mono text-[9px] tracking-[0.25em] uppercase px-3 py-1 rounded-full"
                      style={{ background: "oklch(0.72 0.12 55 / 0.15)", color: "oklch(0.82 0.14 55)" }}
                    >
                      Most Popular
                    </span>
                  </div>
                )}
                <h3
                  className="text-2xl mb-2 text-[oklch(0.88_0.02_60)]"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
                >
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-light text-[oklch(0.88_0.02_60)]">{tier.price}</span>
                  {tier.period && <span className="text-sm text-[oklch(0.40_0.01_260)]">{tier.period}</span>}
                </div>
                <p className="text-sm text-[oklch(0.50_0.01_260)] font-light mb-6 leading-relaxed">{tier.desc}</p>
                <ul className="space-y-2 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[oklch(0.65_0.01_260)]">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "oklch(0.72 0.12 55)" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href={tier.href}>
                  <button
                    className="w-full py-3.5 rounded-full text-sm font-medium transition-all duration-300"
                    style={
                      tier.highlight
                        ? {
                            background: "linear-gradient(135deg, oklch(0.75 0.14 55), oklch(0.65 0.18 45))",
                            color: "oklch(0.12 0.02 260)",
                            boxShadow: "0 0 30px oklch(0.75 0.14 55 / 0.25)",
                          }
                        : {
                            border: "1px solid oklch(0.25 0.02 260)",
                            color: "oklch(0.60 0.01 260)",
                            background: "transparent",
                          }
                    }
                  >
                    {tier.cta}
                  </button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="relative py-40 overflow-hidden bg-[oklch(0.08_0.02_260)]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <LuminVideo
            video={BOUNCY_LUMIN}
            className="w-[min(80vw,700px)] h-[min(80vw,700px)] object-contain opacity-30"
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,transparent_0%,oklch(0.08_0.02_260)_65%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <p className="font-mono text-[10px] tracking-[0.3em] text-[oklch(0.72_0.12_55)] uppercase mb-6">Start Here</p>
          <h2
            className="leading-[1.05] mb-6"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 400, color: "oklch(0.93 0.02 60)" }}
          >
            Take the Load-Bearing Survey.
          </h2>
          <p className="text-[oklch(0.55_0.01_260)] text-lg font-light mb-10 max-w-xl mx-auto">
            A 12-question diagnostic that identifies where you are across the 5S dimensions and recommends your starting pathway. Takes 5 minutes. Changes everything.
          </p>
          <Link
            href="/audit"
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-full text-base font-medium transition-all duration-300 mx-auto"
            style={{
              background: "linear-gradient(135deg, oklch(0.75 0.14 55), oklch(0.65 0.18 45))",
              color: "oklch(0.12 0.02 260)",
              boxShadow: "0 0 60px oklch(0.75 0.14 55 / 0.40)",
            }}
          >
            Begin the Assessment
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border py-16 bg-[oklch(0.08_0.02_260)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663270045694/kRrwoPFbyNWaiJXLmscJ4t/app-icon_e26b6bab.png"
                  alt="Lifewoven"
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", color: "oklch(0.88 0.02 60)", fontWeight: 400 }}>
                  Lifewoven
                </span>
              </div>
              <p className="text-sm text-[oklch(0.40_0.01_260)] max-w-xs leading-relaxed font-light">
                A personal transformation operating system rooted in timeless wisdom and powered by intelligent design.
              </p>
            </div>
            <div>
              <p className="font-mono text-[9px] tracking-[0.25em] text-[oklch(0.35_0.01_260)] uppercase mb-4">Platform</p>
              <div className="space-y-2.5">
                {[
                  { label: "Pathways", href: "/pathways" },
                  { label: "Library", href: "/library" },
                  { label: "Community (Coming Soon)", href: "/community" },
                  { label: "Pricing", href: "/pricing" },
                  { label: "Sources & Influences", href: "/sources" },
                ].map((l) => (
                  <div key={l.label}>
                    <Link href={l.href} className="text-sm text-[oklch(0.40_0.01_260)] hover:text-[oklch(0.72_0.12_55)] transition-colors">
                      {l.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono text-[9px] tracking-[0.25em] text-[oklch(0.35_0.01_260)] uppercase mb-4">Legal</p>
              <div className="space-y-2.5">
                {[
                  { label: "Terms of Service", href: "/legal/terms" },
                  { label: "Privacy Policy", href: "/legal/privacy" },
                  { label: "Refund Policy", href: "/legal/refunds" },
                  { label: "Contact & Support", href: "/support" },
                ].map((l) => (
                  <div key={l.label}>
                    <Link href={l.href} className="text-sm text-[oklch(0.40_0.01_260)] hover:text-[oklch(0.72_0.12_55)] transition-colors">
                      {l.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border">
            <p className="text-xs text-[oklch(0.30_0.01_260)]">
              © {new Date().getFullYear()} Lifewoven. Built on the wisdom of the ages. Designed for the present moment.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
