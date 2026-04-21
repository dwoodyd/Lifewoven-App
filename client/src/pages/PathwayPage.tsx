import { useState, useRef, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { LoomCorner } from "@/components/Loom";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowRight, Clock, Star, ChevronDown, ChevronUp, CheckCircle2, Circle, BookOpen, RotateCcw, Play, Pause, Timer } from "lucide-react";
import { trpc } from "@/lib/trpc";

const PATHWAYS: Record<string, any> = {
  align: {
    name: "Align", tagline: "Daily Grounding Practice", color: "state", badge: "Daily Foundation",
    description: "Align is your daily grounding ritual — the practice of returning to your center before the world asks anything of you. It takes five minutes and sets the tone for everything that follows.",
    duration: "5-10 minutes", frequency: "Every morning", source: "Lifewoven Original Practice",
    steps: [
      { title: "Arrive (1 min)", desc: "Sit comfortably. Close your eyes. Take three slow, deep breaths. Let your nervous system know: you are safe, you are here, you are present." },
      { title: "Body Scan (2 min)", desc: "Slowly scan from the top of your head to the soles of your feet. Notice any tension, tightness, or holding. Do not try to fix it — just notice it with curiosity." },
      { title: "Set Your Tone (2 min)", desc: "Choose one word or feeling that you want to carry through your day. Not a goal — a quality of being. Today I intend to feel... or Today I choose to be..." },
      { title: "Declaration Seal (2 min)", desc: "Speak your core declaration three times, slowly, with feeling. Let it land in your body, not just your mind." },
    ],
    declaration: "I am in alignment with the flow of well-being. Everything I need comes to me with ease.",
    journalPrompt: "What does alignment feel like in my body right now? What would today look like if I stayed in this state?",
  },
  resonance: {
    name: "Resonance", tagline: "Advanced Alignment Practice", color: "state",
    description: "Resonance is the practice of closing the gap between where you are and where your desires live — not through force, but through feeling.",
    duration: "20 minutes", frequency: "Daily or as needed", source: "Lifewoven Original Practice",
    steps: [
      { title: "Soften Resistance (4 min)", desc: "Release the need to figure it out. Let go of the how. Your only job right now is to feel good. Breathe into that permission." },
      { title: "Appreciation Rampage (5 min)", desc: "Begin with something small and easy to appreciate. Build momentum. Let one appreciation lead to another. Feel the energy rise." },
      { title: "Resonance Visualization (8 min)", desc: "Close your eyes. Imagine you are already living your desired reality. Feel it as if it is now. Use all your senses. This is not a future place — it is a present feeling." },
      { title: "Deliberate Intent (3 min)", desc: "From this high-alignment state, set your deliberate intent. What do you want to attract today? State it as if it is already done." },
    ],
    declaration: "I am in alignment. Everything I want is here, waiting for me to receive it.",
    journalPrompt: "What did I see, feel, and experience in my resonance visualization? What is already on its way to me?",
  },
  uplift: {
    name: "Uplift", tagline: "Emotional Set-Point Shifting", color: "state",
    description: "This practice uses the Lifewoven Emotional Compass to systematically move you up the emotional scale — not by forcing positivity, but by reaching for the next best-feeling thought.",
    duration: "10-20 minutes", frequency: "As needed", source: "Lifewoven Original Practice",
    steps: [
      { title: "Locate Yourself (2 min)", desc: "Identify your current emotional state on the Emotional Compass. Be honest. Despair, anger, frustration, boredom, contentment, joy — all are valid starting points." },
      { title: "Reach for Relief (5 min)", desc: "You do not need to jump to joy. Just reach for the next better-feeling thought. From despair, reach for anger. From anger, reach for frustration. Each step up is a win." },
      { title: "Momentum Building (5 min)", desc: "Once you find a slightly better feeling, build on it. Find evidence for it. Tell a better story about your situation. Not a false story — a more empowering one." },
      { title: "Anchor the Shift (3 min)", desc: "When you feel the shift, anchor it. Breathe it in. Acknowledge the movement. You just changed your set-point." },
    ],
    declaration: "I am always moving toward greater well-being. Every thought I choose moves me higher.",
    journalPrompt: "Where did I start on the emotional scale today? Where did I end up? What thought or reframe made the biggest difference?",
  },
  flow: {
    name: "Flow", tagline: "Creative Visualization Practice", color: "story",
    description: "An original Lifewoven guided visualization practice rooted in emotional immersion and mind science. You are not just imagining a future — you are flowing into it, feeling it as present reality.",
    duration: "15-25 minutes", frequency: "Daily", source: "Lifewoven Original Practice",
    steps: [
      { title: "Enter the Flow (3 min)", desc: "Imagine yourself floating in a warm, gentle current of energy. This is the Flow — the stream of life moving you toward everything you desire. Relax into it." },
      { title: "Feel Your Desired Life (10 min)", desc: "In the Flow, experience your desired life as already real. Do not watch it like a movie — be IN it. Feel the emotions, the sensations, the relationships, the freedom." },
      { title: "Speak Your Desires (5 min)", desc: "From inside the Flow, speak your desires as present-tense truths. I am... I have... I feel... Let the words come from the feeling, not the mind." },
      { title: "Gratitude Release (3 min)", desc: "Thank the Flow for bringing these experiences to you. Release attachment to the how and when. Trust the current." },
    ],
    declaration: "I am in the Flow of life. My desires are already real in the stream, and I am moving toward them now.",
    journalPrompt: "What did I experience in my Flow today? What felt most real and alive? What am I ready to receive?",
  },
  rhythms: {
    name: "Rhythms", tagline: "Identity-Based Habit Execution", color: "standards",
    description: "Rhythms is the Lifewoven approach to building habits that actually hold — not through willpower, but through identity. You are not trying to do more. You are becoming someone for whom these actions are natural.",
    duration: "Ongoing daily practice", frequency: "Daily", source: "Lifewoven Original Practice",
    steps: [
      { title: "Identity Declaration (2 min)", desc: "Before you begin, state who you are becoming. I am someone who... This is not aspiration — it is identity architecture. The habit follows the identity." },
      { title: "The Minimum Viable Action", desc: "Identify the smallest possible version of each habit. Not the ideal — the minimum. On hard days, this is what you do. On good days, you build from here." },
      { title: "Environment Design (one-time setup)", desc: "Make the right action obvious. Remove friction. Add cues. Your environment should do the work your willpower cannot." },
      { title: "The Two-Minute Rule", desc: "Any habit can start with two minutes. The goal is not the habit — it is showing up. Showing up consistently is the habit." },
      { title: "Celebrate the Return", desc: "When you miss a day, the only rule is: never miss twice. Celebrate coming back. The return is the practice." },
    ],
    declaration: "I am becoming the person I want to be, one small action at a time.",
    journalPrompt: "What identity am I building with today's actions? What did I show up for today, no matter how small?",
  },
  purpose: {
    name: "Purpose", tagline: "Meaning and Resilience Work", color: "strategy",
    description: "Purpose is the practice of returning to your why — the deep meaning that makes difficulty bearable and effort worthwhile. This is not motivational work. This is existential anchoring.",
    duration: "20-30 minutes", frequency: "Weekly or during difficulty", source: "Lifewoven Original Practice",
    steps: [
      { title: "The Meaning Inventory (5 min)", desc: "Ask: What am I doing, and why does it matter? Not to the world — to you. Write it down. Be specific. Vague meaning provides vague resilience." },
      { title: "The Difficulty Reframe (5 min)", desc: "Name the current difficulty. Then ask: What is this difficulty asking of me? What quality is it developing? Difficulty is not the enemy of purpose — it is often the path." },
      { title: "The Contribution Question (5 min)", desc: "Ask: Who benefits from me doing this well? Who is affected by my growth? Meaning expands when we connect our work to others." },
      { title: "The Core Statement (5 min)", desc: "Write one sentence: My life is meaningful because... Not because of what you have achieved — because of what you are committed to. This is your anchor." },
      { title: "The Forward Step (5 min)", desc: "From this place of meaning, choose one action that honors your purpose today. Not the biggest action — the most aligned one." },
    ],
    declaration: "My life has meaning. My work has purpose. I am here for a reason I am still discovering.",
    journalPrompt: "What is the deepest why behind what I am doing right now? How does this difficulty serve my purpose?",
  },
  reset: {
    name: "Reset", tagline: "Flagship Resilience Protocol", color: "stewardship", badge: "Start Here When Overwhelmed",
    description: "Reset is not a failure protocol. It is a return protocol. When life interrupts — and it will — Reset is how you come back without shame, without drama, without losing ground. This is the most important pathway in Lifewoven.",
    duration: "15-30 minutes", frequency: "Whenever you need to return", source: "Lifewoven Original Practice",
    steps: [
      { title: "The Honest Inventory (5 min)", desc: "Name what happened. Not a story — just the facts. I stopped. I got overwhelmed. I lost momentum. No shame in the naming. Clarity is the first act of return." },
      { title: "The Compassion Pause (3 min)", desc: "Before you plan, before you fix — pause. Place your hand on your chest. Say: I am human. Interruption is part of the process. I am allowed to begin again. Say it until you mean it." },
      { title: "The Smallest Honest Step (5 min)", desc: "What is the one smallest thing you could do right now that would feel like a genuine return? Not the ideal — the honest. Do that one thing. That is the reset." },
      { title: "Meaning Extraction (10 min)", desc: "Ask: What did this interruption teach me? What needs to change in my system? Setbacks are expensive — extract every lesson." },
      { title: "Identity Restoration (5 min)", desc: "Reconnect with who you are beneath the setback. The setback happened TO you — it is not you. State your core identity: I am still... I am becoming... This does not define me." },
      { title: "The Re-Alignment (5 min)", desc: "Use the Align pathway to return to your baseline. Set one small, achievable intention for the next 24 hours. One step. Just one." },
      { title: "The Commitment (5 min)", desc: "Write one sentence: Because of this setback, I am now committed to... This is how adversity becomes advantage. This is how you turn pain into purpose." },
    ],
    declaration: "I am not broken. I am returning. Every reset is a choice to begin again — and that choice is strength.",
    journalPrompt: "What did this interruption cost me? What did it teach me? What am I now committed to because of it?",
  },
};

const COLOR_MAP: Record<string, string> = {
  state: "text-state border-state/20 bg-state/5",
  story: "text-story border-story/20 bg-story/5",
  standards: "text-standards border-standards/20 bg-standards/5",
  strategy: "text-strategy border-strategy/20 bg-strategy/5",
  stewardship: "text-stewardship border-stewardship/20 bg-stewardship/5",
};

function parseStepMinutes(title: string): number {
  const m = title.match(/(\d+)(?:-(\d+))?\s*min/);
  if (!m) return 0;
  return parseInt(m[2] || m[1], 10);
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function PathwayPage() {
  const [, params] = useRoute("/pathway/:id");
  const id = (params?.id || "align").toLowerCase();
  const pathway = PATHWAYS[id] || PATHWAYS.align;
  const accentClass = COLOR_MAP[pathway.color] || COLOR_MAP.state;

  // Persist progress per pathway in localStorage
  const storageKey = `lifeos_pathway_${id}`;
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return new Set(JSON.parse(saved) as number[]);
    } catch {}
    return new Set();
  });
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [sessionStarted, setSessionStarted] = useState(() => {
    try { return localStorage.getItem(`${storageKey}_started`) === "1"; } catch { return false; }
  });
  const [sessionComplete, setSessionComplete] = useState(false);
  const [loomCelebrate, setLoomCelebrate] = useState(false);

  // Sync completedSteps to localStorage
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(Array.from(completedSteps))); } catch {}
  }, [completedSteps, storageKey]);

  // Sync sessionStarted to localStorage
  useEffect(() => {
    try { localStorage.setItem(`${storageKey}_started`, sessionStarted ? "1" : "0"); } catch {}
  }, [sessionStarted, storageKey]);

  // Per-step timer state
  const [activeTimerStep, setActiveTimerStep] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSteps = pathway.steps.length;
  const completedCount = completedSteps.size;
  const progressPct = Math.round((completedCount / totalSteps) * 100);

  // Timer tick
  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(s => {
          if (s <= 1) {
            setTimerRunning(false);
            toast.success("Step time complete — mark it done when ready.");
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  // Reset timer state on pathway change (not progress — that's persisted)
  useEffect(() => {
    setExpandedStep(0);
    setSessionComplete(false);
    setActiveTimerStep(null);
    setTimerSeconds(0);
    setTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [id]);

  function startTimer(stepIdx: number, stepTitle: string) {
    const mins = parseStepMinutes(stepTitle);
    if (!mins) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setActiveTimerStep(stepIdx);
    setTimerSeconds(mins * 60);
    setTimerRunning(true);
  }

  function toggleTimer() { setTimerRunning(r => !r); }

  function toggleStep(idx: number) {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
        // Stop timer if this step's timer was running
        if (activeTimerStep === idx) {
          setTimerRunning(false);
          setActiveTimerStep(null);
        }
        if (idx + 1 < totalSteps && !next.has(idx + 1)) {
          setTimeout(() => setExpandedStep(idx + 1), 300);
        }
        if (next.size === totalSteps) setSessionComplete(true);
        // Loom celebration pulse
        setLoomCelebrate(true);
        setTimeout(() => setLoomCelebrate(false), 900);
      }
      return next;
    });
  }

  function handleStartSession() {
    setSessionStarted(true);
    setExpandedStep(0);
    window.scrollTo({ top: 300, behavior: "smooth" });
  }

  const saveSession = trpc.pathways.saveSession.useMutation({
    onSuccess: () => toast.success("Session saved. Well done for showing up."),
    onError: () => toast.error("Could not save session. Please try again."),
  });

  function handleSaveSession() {
    saveSession.mutate({ pathway: id, stepsCompleted: completedCount, totalSteps });
  }

  function handleResetProgress() {
    setCompletedSteps(new Set());
    setSessionStarted(false);
    setSessionComplete(false);
    setExpandedStep(0);
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}_started`);
    } catch {}
    toast("Progress cleared. Ready to begin again.");
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {id !== "reset" && (
        <div className="fixed bottom-6 right-6 z-40">
          <Link href="/pathway/reset">
            <Button size="sm" variant="outline" className="gap-2 shadow-lg bg-background/90 backdrop-blur-sm border-stewardship/30 text-stewardship hover:bg-stewardship/5">
              <RotateCcw className="h-3.5 w-3.5" /> Need a Reset?
            </Button>
          </Link>
        </div>
      )}

      <div className="container pt-20 pb-32 max-w-3xl mx-auto px-4 sm:px-6">
        <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-2">Pathway</p>
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foreground">{pathway.name}</h1>
          {pathway.badge && <Badge variant="secondary" className="mt-2 shrink-0 text-xs">{pathway.badge}</Badge>}
        </div>
        <p className="text-muted-foreground text-lg font-light mb-6">{pathway.tagline}</p>
        <div className="flex flex-wrap gap-4 mb-8">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {pathway.duration}</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Star className="h-3.5 w-3.5" /> {pathway.frequency}</span>
          <span className="text-xs text-muted-foreground italic">Source: {pathway.source}</span>
        </div>
        <p className="text-foreground font-light leading-relaxed mb-8 text-base">{pathway.description}</p>

        <div className={`p-6 rounded-2xl border mb-8 ${accentClass}`}>
          <p className="text-xs font-mono tracking-widest uppercase mb-3 opacity-70">Core Declaration</p>
          <p className="font-serif text-xl font-light italic leading-relaxed">"{pathway.declaration}"</p>
        </div>

        {!sessionStarted && (
          <div className="flex gap-3 mb-10">
            <Button size="lg" className="gap-2 px-8" onClick={handleStartSession}>
              <Play className="h-4 w-4" /> Begin This Practice
            </Button>
            <Button variant="outline" size="lg" onClick={() => setSessionStarted(true)}>Read Through First</Button>
          </div>
        )}

        {sessionStarted && (
          <div className="mb-8 p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground font-medium">Your Progress</span>
              <span className="text-xs text-muted-foreground">{completedCount} of {totalSteps} steps</span>
            </div>
            <Progress value={progressPct} className="h-2 mb-2" />
            {sessionComplete && (
              <div className="mt-3 flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span>Practice complete. Well done for showing up.</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3 mb-10">
          <h2 className="font-serif text-2xl font-light text-foreground mb-4">The Practice</h2>
          {pathway.steps.map((step: any, i: number) => {
            const isCompleted = completedSteps.has(i);
            const isExpanded = expandedStep === i;
            const stepMins = parseStepMinutes(step.title);
            const isThisTimerActive = activeTimerStep === i;
            return (
              <div key={i} className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isCompleted ? "border-accent/30 bg-accent/3" : "border-border bg-card"}`}>
                <button
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedStep(isExpanded ? null : i)}
                >
                  <span
                    role="checkbox"
                    aria-checked={isCompleted}
                    onClick={e => { e.stopPropagation(); if (sessionStarted) toggleStep(i); }}
                    className={`shrink-0 transition-all ${sessionStarted ? "cursor-pointer hover:scale-110" : "cursor-default opacity-40"}`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-6 w-6 text-accent" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{i + 1}</span>
                      <h3 className={`font-medium text-base ${isCompleted ? "text-muted-foreground line-through" : "text-foreground"}`}>{step.title}</h3>
                    </div>
                  </div>
                  {/* Timer badge for active step */}
                  {isThisTimerActive && (
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${timerRunning ? "border-accent/40 text-accent bg-accent/10" : "border-border text-muted-foreground"}`}>
                      {formatTime(timerSeconds)}
                    </span>
                  )}
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-border/50 animate-in slide-in-from-top-1 duration-200">
                    <p className="text-base text-muted-foreground font-light leading-relaxed pt-4 mb-4">{step.desc}</p>
                    {sessionStarted && !isCompleted && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => toggleStep(i)}>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Mark Complete
                        </Button>
                        {stepMins > 0 && (
                          isThisTimerActive ? (
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-mono font-medium ${timerRunning ? "text-accent" : "text-muted-foreground"}`}>
                                {formatTime(timerSeconds)}
                              </span>
                              <Button size="sm" variant="ghost" className="gap-1.5 h-8 px-3" onClick={toggleTimer} aria-label={timerRunning ? "Pause timer" : "Resume timer"}>
                                {timerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                                {timerRunning ? "Pause" : "Resume"}
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="ghost" className="gap-1.5 h-8 px-3 text-muted-foreground" onClick={() => startTimer(i, step.title)} aria-label={`Start ${stepMins}-minute timer`}>
                              <Timer className="h-3.5 w-3.5" /> {stepMins} min timer
                            </Button>
                          )
                        )}
                      </div>
                    )}
                    {isCompleted && (
                      <button onClick={() => toggleStep(i)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Undo</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {sessionStarted && completedCount > 0 && (
          <div className="p-6 rounded-2xl border border-accent/20 bg-accent/3 mb-8">
            <h3 className="font-serif text-lg font-light text-foreground mb-2">
              {sessionComplete ? "Practice complete." : `${completedCount} step${completedCount > 1 ? "s" : ""} complete.`}
            </h3>
            <p className="text-base text-muted-foreground mb-4">
              {sessionComplete ? "You showed up. That is the whole practice." : "Your progress is saved — you can continue where you left off anytime."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button className="gap-2" onClick={handleSaveSession}><CheckCircle2 className="h-4 w-4" /> Save This Session</Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleResetProgress}>Start Over</Button>
            </div>
          </div>
        )}

        <div className="p-6 rounded-2xl border border-border bg-card mb-8">
          <h2 className="font-serif text-lg font-light text-foreground mb-3">
            <BookOpen className="inline h-4 w-4 mr-2 opacity-60" />Journal After This Practice
          </h2>
          <p className="text-base text-muted-foreground italic mb-4">"{pathway.journalPrompt}"</p>
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/journal?module=${pathway.color}&prompt=${encodeURIComponent(pathway.journalPrompt)}`}>
              <ArrowRight className="h-4 w-4" /> Open Journal with This Prompt
            </Link>
          </Button>
        </div>

        <div>
          <h3 className="font-serif text-lg font-light text-foreground mb-4">Other Pathways</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(PATHWAYS).filter(([k]) => k !== id).map(([k, p]: [string, any]) => (
              <Link key={k} href={`/pathway/${k}`}>
                <div className={`p-4 rounded-xl border border-border hover:border-muted-foreground transition-all cursor-pointer ${k === "reset" ? "border-stewardship/30 bg-stewardship/3" : ""}`}>
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <LoomCorner pulse={loomCelebrate} />
    </div>
  );
}
