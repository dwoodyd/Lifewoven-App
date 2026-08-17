import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Share2, Copy } from "lucide-react";

// ─────────────────────────────────────────────
// CANONICAL QUESTIONS — source: lifeos-audit-copy-system.html
// ─────────────────────────────────────────────
const SCALE = ["Never", "Rarely", "Sometimes", "Often", "Almost always"] as const;
type ScaleValue = 1 | 2 | 3 | 4 | 5;

interface CoreQuestion {
  id: number;
  dimension: string;
  section: number;
  sectionLabel: string;
  text: string;
}

interface OptionalQuestion {
  id: number;
  dimension: string;
  text: string;
  options: string[];
}

const CORE_QUESTIONS: CoreQuestion[] = [
  { id: 1, dimension: "State", section: 1, sectionLabel: "Current felt experience", text: "Lately, I feel mentally scattered even when I care deeply about what I need to do." },
  { id: 2, dimension: "State", section: 1, sectionLabel: "Current felt experience", text: "I feel like I am carrying more internally than I know how to organize." },
  { id: 3, dimension: "State", section: 1, sectionLabel: "Current felt experience", text: "It has been hard to feel clear, steady, or grounded in daily life." },
  { id: 4, dimension: "Standards", section: 2, sectionLabel: "Friction pattern", text: "I often know what needs to happen, but struggle to begin." },
  { id: 5, dimension: "Standards", section: 2, sectionLabel: "Friction pattern", text: "When I lose momentum, I tend to avoid re-entering instead of starting again." },
  { id: 6, dimension: "State", section: 2, sectionLabel: "Friction pattern", text: "Small tasks can feel heavier than they should." },
  { id: 7, dimension: "Story", section: 3, sectionLabel: "Self-trust and inner narrative", text: "I am harder on myself than most people realize." },
  { id: 8, dimension: "Story", section: 3, sectionLabel: "Self-trust and inner narrative", text: "Part of me questions whether I can really rely on myself." },
  { id: 9, dimension: "Story", section: 3, sectionLabel: "Self-trust and inner narrative", text: "I often interpret inconsistency as a personal flaw." },
  { id: 10, dimension: "Standards", section: 4, sectionLabel: "Structure, direction, and stewardship", text: "I need more structure, but rigid systems usually stop working for me." },
  { id: 11, dimension: "Stewardship", section: 4, sectionLabel: "Structure, direction, and stewardship", text: "I have been neglecting my energy, health, or basic rhythms more than I want to admit." },
  { id: 12, dimension: "Strategy", section: 4, sectionLabel: "Structure, direction, and stewardship", text: "I am not always sure what deserves my focus first." },
];

const OPTIONAL_QUESTIONS: OptionalQuestion[] = [
  { id: 13, dimension: "Pattern clarifier", text: "When I get overwhelmed, I most often:", options: ["Shut down", "Overthink", "Distract myself", "Try to do everything", "Isolate", "Push harder than I should"] },
  { id: 14, dimension: "Need signal", text: "What sounds most true right now?", options: ["I need calm", "I need clarity", "I need structure", "I need motivation", "I need to recover", "I need a reset"] },
  { id: 15, dimension: "Module fit", text: "What do you most want help with first?", options: ["Emotional steadiness", "Identity and mindset", "Habits and follow-through", "Decisions and direction", "Health, energy, and balance"] },
];

// ─────────────────────────────────────────────
// SCORING — canonical logic
// ─────────────────────────────────────────────
function computeScores(answers: Record<number, ScaleValue>) {
  const state = (answers[1] ?? 0) + (answers[2] ?? 0) + (answers[3] ?? 0) + (answers[6] ?? 0);
  const standards = (answers[4] ?? 0) + (answers[5] ?? 0) + (answers[6] ?? 0) + (answers[10] ?? 0);
  const story = (answers[7] ?? 0) + (answers[8] ?? 0) + (answers[9] ?? 0);
  const strategy = (answers[10] ?? 0) + (answers[12] ?? 0);
  const stewardship = (answers[11] ?? 0);
  return {
    raw: { state, standards, story, strategy, stewardship },
    pct: {
      State: Math.round((state / 20) * 100),
      Story: Math.round((story / 15) * 100),
      Standards: Math.round((standards / 20) * 100),
      Strategy: Math.round((strategy / 10) * 100),
      Stewardship: Math.round((stewardship / 5) * 100),
    },
  };
}

function detectFrictionTags(answers: Record<number, ScaleValue>): string[] {
  const tags: string[] = [];
  if ((answers[1] ?? 0) >= 4 && (answers[2] ?? 0) >= 4 && (answers[3] ?? 0) >= 4) tags.push("overwhelm");
  if ((answers[7] ?? 0) >= 4 && (answers[8] ?? 0) >= 4 && (answers[9] ?? 0) >= 4) tags.push("self-trust erosion");
  if ((answers[4] ?? 0) >= 4 && (answers[5] ?? 0) >= 4) tags.push("initiation friction");
  if ((answers[11] ?? 0) >= 4 && (answers[3] ?? 0) >= 4) tags.push("burnout");
  if ((answers[5] ?? 0) >= 4 && (answers[9] ?? 0) >= 4) tags.push("shame after interruption");
  return tags;
}

type ProfileKey = "The Overextended Mind" | "The Friction-Filled Starter" | "The Quiet Self-Trust Fracture" | "The Emotionally Flooded Achiever" | "The Direction-Drained Builder" | "The Burned-Out Steward";

interface Profile {
  name: ProfileKey;
  tags: string[];
  summary: string;
  bullets: string[];
  firstPathway: string;
  secondPathway: string;
  nextStep: string;
  truth: string;
}

const PROFILES: Record<ProfileKey, Profile> = {
  "The Overextended Mind": {
    name: "The Overextended Mind", tags: ["State", "Stewardship"],
    summary: "Right now, your main challenge does not look like a lack of desire. It looks more like overload. You may be carrying too much mentally, emotionally, or practically, which makes even simple things feel heavier than they should. Before you push harder, your system may need more steadiness, clarity, and a gentler way to re-enter.",
    bullets: ["You may be trying to function at a level your current capacity does not fully support.", "You may need relief from internal pressure before adding more goals.", "You may be mistaking overload for failure."],
    firstPathway: "Reset", secondPathway: "Align",
    nextStep: "Take 3 minutes to complete a reset check-in and choose one small promise for today.",
    truth: "You do not need to earn your way back. You only need a better place to begin.",
  },
  "The Friction-Filled Starter": {
    name: "The Friction-Filled Starter", tags: ["Standards", "Strategy"],
    summary: "You may not be struggling because you lack motivation. You may be struggling because getting started has become heavier than it looks from the outside. When the first step feels noisy, loaded, or unclear, even meaningful work can become hard to begin.",
    bullets: ["You may be carrying too many open loops at once.", "You may need more entry support, not more pressure.", "You may work better with smaller, clearer starting points than rigid expectations."],
    firstPathway: "Rhythms", secondPathway: "Purpose",
    nextStep: "Choose one task you care about and reduce it to the smallest honest first move.",
    truth: "Starting gently still counts as starting.",
  },
  "The Quiet Self-Trust Fracture": {
    name: "The Quiet Self-Trust Fracture", tags: ["Story", "Standards"],
    summary: "You are not without desire. But somewhere along the way, inconsistency may have started turning into self-doubt. When you mean well and still struggle to follow through, it can quietly damage trust in yourself. Not in a dramatic way. In small private moments.",
    bullets: ["You may be carrying the weight of broken private promises.", "You may be interpreting friction as evidence against your character.", "You may need repair before you need bigger goals."],
    firstPathway: "Reset", secondPathway: "Story",
    nextStep: "Choose one promise small enough to keep without force.",
    truth: "Self-trust is not rebuilt through pressure. It is rebuilt through honest returns.",
  },
  "The Emotionally Flooded Achiever": {
    name: "The Emotionally Flooded Achiever", tags: ["State", "Story"],
    summary: "You may be capable of a great deal, but your system does not feel steady enough to carry all that pressure cleanly right now. When your inner state is overloaded, even meaningful goals can start to feel sharp, heavy, or impossible to hold.",
    bullets: ["You may be trying to execute from a flooded state.", "You may be carrying more emotional weight than you have named.", "You may need regulation before planning."],
    firstPathway: "Align", secondPathway: "Uplift",
    nextStep: "Take one guided state check-in before making any decisions about what the rest of the day should look like.",
    truth: "Calm is not avoidance. For you, it may be the doorway back into honest strength.",
  },
  "The Direction-Drained Builder": {
    name: "The Direction-Drained Builder", tags: ["Strategy", "Story"],
    summary: "You may not need more effort right now. You may need a clearer center. When too many things matter at once, focus can break down. You may be doing a lot, thinking a lot, and still feel strangely unanchored.",
    bullets: ["You may be spending energy without enough internal prioritization.", "You may need a stronger sense of what matters now, not just what matters in general.", "You may be missing direction more than discipline."],
    firstPathway: "Purpose", secondPathway: "Strategy",
    nextStep: "Choose one area of your life that needs a decision more than more thought.",
    truth: "Clarity is not found by doing more. It is found by returning to what matters most.",
  },
  "The Burned-Out Steward": {
    name: "The Burned-Out Steward", tags: ["Stewardship", "State"],
    summary: "You may be asking more from yourself than your current rhythms can faithfully support. When energy, rest, or basic care have been neglected for too long, the whole system starts to feel harder to carry.",
    bullets: ["You may be trying to build from depletion.", "You may need restoration before optimization.", "You may be underestimating how much your physical and energetic state is shaping everything else."],
    firstPathway: "Reset", secondPathway: "Stewardship",
    nextStep: "Complete a quick rhythm check and choose one act of repair for your body, energy, or schedule today.",
    truth: "You are not behind because you need restoration. Restoration is part of the work.",
  },
};

function assignProfile(raw: ReturnType<typeof computeScores>["raw"], frictionTags: string[]): ProfileKey {
  if (frictionTags.includes("shame after interruption")) return "The Quiet Self-Trust Fracture";
  if (frictionTags.includes("burnout")) return "The Burned-Out Steward";
  const dims = [
    { key: "state" as const, score: raw.state },
    { key: "standards" as const, score: raw.standards },
    { key: "story" as const, score: raw.story },
    { key: "strategy" as const, score: raw.strategy },
    { key: "stewardship" as const, score: raw.stewardship },
  ].sort((a, b) => b.score - a.score);
  const top1 = dims[0]?.key;
  const top2 = dims[1]?.key;
  if (top1 === "stewardship") return "The Burned-Out Steward";
  if (top1 === "state" && top2 === "story") return "The Emotionally Flooded Achiever";
  if (top1 === "state") return "The Overextended Mind";
  if (top1 === "story") return "The Quiet Self-Trust Fracture";
  if (top1 === "standards") return "The Friction-Filled Starter";
  if (top1 === "strategy") return "The Direction-Drained Builder";
  return "The Friction-Filled Starter";
}

const DIM_COLORS: Record<string, string> = {
  State: "bg-state", Story: "bg-story", Standards: "bg-standards",
  Strategy: "bg-strategy", Stewardship: "bg-stewardship",
};

type Step = "entry" | "consent" | "preframe" | "quiz" | "optional_prompt" | "optional" | "mind_works" | "results";

export default function AlignmentAudit() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState<Step>("entry");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, ScaleValue>>({});
  const [optionalAnswers, setOptionalAnswers] = useState<Record<number, string>>({});
  const [optionalQ, setOptionalQ] = useState(0);
  const [result, setResult] = useState<{ profile: Profile; scores: ReturnType<typeof computeScores>; frictionTags: string[] } | null>(null);
  const [mindPatterns, setMindPatterns] = useState<string[]>([]);
  const [luminPulse, setLoomPulse] = useState(false);

  const utils = trpc.useUtils();
  const saveAudit = trpc.audit.save.useMutation({
    onSuccess: () => {
      toast.success("Results saved to your profile.");
      // Invalidate homeContext so the home screen immediately reflects the completed audit
      utils.profile.homeContext.invalidate();
      utils.auth.me.invalidate();
    },
  });
  const saveMindPatterns = trpc.profile.saveMindPatterns.useMutation();
  const trackAuditEvent = trpc.system.trackAuditEvent.useMutation();

  // Build a shareable URL encoding the profile key in the hash so no server round-trip is needed
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const totalQ = CORE_QUESTIONS.length;
  const progress = step === "quiz" ? Math.round((currentQ / totalQ) * 100) : step === "results" ? 100 : 0;

  // Track audit_started once when the user begins the quiz
  useEffect(() => {
    if (step === "quiz" && currentQ === 0) {
      trackAuditEvent.mutate({ event: "audit_started" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function finalize(finalAnswers: Record<number, ScaleValue>) {
    const scores = computeScores(finalAnswers);
    const frictionTags = detectFrictionTags(finalAnswers);
    const profileKey = assignProfile(scores.raw, frictionTags);
    setResult({ profile: PROFILES[profileKey], scores, frictionTags });
    // Build shareable URL: /audit#result=<urlencoded-profile-key>
    const encoded = encodeURIComponent(profileKey);
    const url = `${window.location.origin}/audit#result=${encoded}`;
    setShareUrl(url);
    // Track audit_completed
    trackAuditEvent.mutate({ event: "audit_completed", properties: { profile: profileKey } });
    setStep("optional_prompt");
  }

  function handleAnswer(qId: number, value: ScaleValue) {
    const updated = { ...answers, [qId]: value };
    setAnswers(updated);
    setLoomPulse(true);
    setTimeout(() => setLoomPulse(false), 900);
    if (currentQ < totalQ - 1) { setTimeout(() => setCurrentQ(q => q + 1), 280); }
    else { finalize(updated); }
  }

  function handleOptionalAnswer(qId: number, value: string) {
    const updated = { ...optionalAnswers, [qId]: value };
    setOptionalAnswers(updated);
    if (optionalQ < OPTIONAL_QUESTIONS.length - 1) { setTimeout(() => setOptionalQ(q => q + 1), 280); }
    else { setStep("mind_works"); }
  }

  function handleSaveResults() {
    if (!isAuthenticated) {
      // Track signup click before redirecting
      trackAuditEvent.mutate({ event: "audit_signup_click", properties: { profile: result?.profile.name } });
      // Carry the result into onboarding via the return path
      window.location.href = getLoginUrl("/audit");
      return;
    }
    if (result) {
      const stringAnswers: Record<string, number> = {};
      Object.entries(answers).forEach(([k, v]) => { stringAnswers[k] = v; });
      saveAudit.mutate({ answers: stringAnswers, scores: result.scores.pct as Record<string, number>, recommendedPathway: result.profile.firstPathway.toLowerCase() });
    }
  }

  const handleShare = useCallback(async () => {
    if (!shareUrl || !result) return;
    trackAuditEvent.mutate({ event: "audit_share_click", properties: { profile: result.profile.name } });
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Lifewoven Alignment Profile: ${result.profile.name}`,
          text: `I just completed the Lifewoven Soul Engineer Assessment. My profile is "${result.profile.name}". Find out yours:`,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled native share — fall through to clipboard
      }
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy link. Try manually copying the URL.");
    }
  }, [shareUrl, result, trackAuditEvent]);

  const q = CORE_QUESTIONS[currentQ];
  const oq = OPTIONAL_QUESTIONS[optionalQ];

  if (step === "entry" || step === "consent" || step === "preframe") return (
    <div className="min-h-screen bg-background">
      {/* Lumin points the way — energetic, guiding through the audit */}
      <Nav />
      <div className="container max-w-xl mx-auto pt-24 pb-20 text-center px-4 sm:px-6 lumin-text">
        <p className="instrument-label mb-4">Lifewoven · Load-Bearing Survey</p>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foreground mb-6 leading-tight">Find your clearest<br />place to begin.</h1>
        <p className="text-muted-foreground text-base leading-relaxed mb-6 max-w-md mx-auto">The Load-Bearing Survey reads which dimensions are carrying weight, where tolerance is thin, and what needs reinforcement first. There are four short sections. Answer from the structure you are actually living in.</p>
        <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
          {["12 questions", "3 to 5 minutes", "Free, no account required"].map(tag => (
            <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" /> {tag}
            </span>
          ))}
        </div>
        <div className="p-4 rounded-xl border border-border bg-card text-left mb-6">
          <p className="text-sm font-medium text-foreground mb-1">A note on personalization</p>
          <p className="text-sm text-muted-foreground leading-relaxed">Your responses can be used to personalize your recommendations inside Lifewoven. This audit is not a diagnosis. You can change this preference any time in settings.</p>
        </div>
        <div className="space-y-3 mb-4">
          <Button size="lg" className="w-full gap-2" onClick={() => setStep("quiz")}><CheckCircle2 className="h-4 w-4" /> Start the Survey <ArrowRight className="h-4 w-4" /></Button>
        </div>
        <p className="text-xs text-muted-foreground">Your responses stay private and are used only to guide your experience.</p>
      </div>
    </div>
  );

  if (step === "quiz" && q) {
    const isNewSection = currentQ === 0 || CORE_QUESTIONS[currentQ - 1]?.section !== q.section;
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="container max-w-xl mx-auto pt-24 pb-20 px-4 sm:px-6">
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Question {currentQ + 1} of {totalQ}</span><span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
          {isNewSection && (
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-mono tracking-wider">
                Section {q.section} of 4 · {q.sectionLabel}
              </span>
            </div>
          )}
          <div className="p-5 sm:p-8 rounded-2xl border border-border bg-card mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="font-serif text-lg sm:text-xl md:text-2xl font-light text-foreground leading-relaxed mb-6">{q.text}</p>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {SCALE.map((label, idx) => {
                const value = (idx + 1) as ScaleValue;
                const isSelected = answers[q.id] === value;
                return (
                  <button key={label} onClick={() => handleAnswer(q.id, value)}
                    className={`flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl border transition-all duration-200 ${isSelected ? "border-accent bg-accent/10 text-accent" : "border-border bg-background hover:border-accent/50 hover:bg-accent/5 text-muted-foreground"}`}>
                    <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-xs font-mono font-medium transition-all ${isSelected ? "border-accent bg-accent text-background" : "border-current"}`}>{value}</span>
                    <span className="text-[10px] sm:text-xs text-center leading-tight">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {currentQ > 0 && <button onClick={() => setCurrentQ(q => q - 1)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Previous question</button>}
        </div>
      </div>
    );
  }

  if (step === "optional_prompt") return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container max-w-xl mx-auto pt-24 pb-20 text-center px-4 sm:px-6 lumin-text">
        <div className="p-5 sm:p-8 rounded-2xl border border-border bg-card">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Almost there</p>
          <h2 className="font-serif text-2xl font-light text-foreground mb-4">A few optional questions to sharpen your results.</h2>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">These take about 60 seconds and can be skipped.</p>
          <div className="space-y-3">
            <Button className="w-full gap-2" onClick={() => setStep("optional")}>Answer optional questions <ArrowRight className="h-4 w-4" /></Button>
            <Button variant="outline" className="w-full" onClick={() => setStep("results")}>Skip to my results</Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (step === "optional" && oq) return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container max-w-xl mx-auto pt-24 pb-20 px-4 sm:px-6">
        <div className="mb-8">
          <Progress value={((optionalQ + 1) / OPTIONAL_QUESTIONS.length) * 100} className="h-1.5" />
        </div>
        <div className="p-5 sm:p-8 rounded-2xl border border-border bg-card animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">Optional {optionalQ + 1} of {OPTIONAL_QUESTIONS.length}</p>
          <p className="font-serif text-xl font-light text-foreground mb-6">{oq.text}</p>
          <div className="space-y-2">
            {oq.options.map(opt => (
              <button key={opt} onClick={() => handleOptionalAnswer(oq.id, opt)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${optionalAnswers[oq.id] === opt ? "border-accent bg-accent/10 text-foreground" : "border-border bg-background hover:border-accent/40 text-muted-foreground hover:text-foreground"}`}>
                {opt}
              </button>
            ))}
          </div>
          <button onClick={() => setStep("results")} className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors">Skip remaining →</button>
        </div>
      </div>
    </div>
  );

  const MIND_PATTERNS = [
    { id: "scattered", label: "My thoughts scatter easily" },
    { id: "overwhelmed", label: "I get overwhelmed by too many options" },
    { id: "starting", label: "Starting is the hardest part" },
    { id: "time", label: "Time feels slippery or unpredictable" },
    { id: "energy", label: "My energy is inconsistent" },
    { id: "reading", label: "Long text or instructions tire me out" },
  ];

  if (step === "mind_works") return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container max-w-xl mx-auto pt-24 pb-20 px-4 sm:px-6">
        <div className="p-5 sm:p-8 rounded-2xl border border-border bg-card animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">One last thing</p>
          <h2 className="font-serif text-2xl font-light text-foreground mb-2">How does your mind work?</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">Select anything that feels true. This helps Lifewoven adapt to how you actually think — not how you think you should.</p>
          <div className="space-y-2 mb-6">
            {MIND_PATTERNS.map(p => (
              <button key={p.id} onClick={() => setMindPatterns(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${
                  mindPatterns.includes(p.id) ? "border-amber-400/60 bg-amber-400/10 text-amber-900 dark:text-amber-100" : "border-border bg-background hover:border-amber-400/30 text-muted-foreground hover:text-foreground"
                }`}>
                {mindPatterns.includes(p.id) ? "✓ " : ""}{p.label}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            <Button className="w-full" onClick={() => { if (isAuthenticated && mindPatterns.length > 0) saveMindPatterns.mutate({ patterns: mindPatterns }); setStep("results"); }}>See my results →</Button>
            <button onClick={() => setStep("results")} className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center">Skip this step</button>
          </div>
        </div>
      </div>
    </div>
  );

  if (step === "results" && result) {
    const { profile, scores, frictionTags } = result;
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="container max-w-2xl mx-auto pt-24 pb-20 px-4 sm:px-6">
          {/* Hero CTA — pathway recommendation first */}
          <div className="p-6 sm:p-8 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/8 to-accent/3 mb-5">
            <p className="text-xs font-mono tracking-widest text-accent uppercase mb-2">Your Recommended Path</p>
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-foreground mb-1">
              Start with <span className="text-accent">{profile.firstPathway}</span>
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-1">
              Based on your responses, this is the most important place to begin. Right now, support matters more than pressure.
            </p>
            <p className="text-sm text-muted-foreground mb-5">Then continue into <strong className="text-foreground">{profile.secondPathway}</strong> to deepen the work.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="gap-2">
                <a href={`/pathway/${profile.firstPathway.toLowerCase()}`}>Start {profile.firstPathway} <ArrowRight className="h-4 w-4" /></a>
              </Button>
              <Button variant="outline" asChild><a href="/pathways">Explore all pathways</a></Button>
            </div>
          </div>

          {/* Profile name + pattern */}
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-1">Your Current Pattern</p>
          <h2 className="font-serif text-xl sm:text-2xl font-light text-foreground mb-1">
            <span className="text-accent">{profile.name}</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-4">This reflects patterns in your responses, not fixed traits. Patterns shift.</p>
          {frictionTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {frictionTags.map(tag => <Badge key={tag} variant="secondary" className="text-xs capitalize">{tag}</Badge>)}
            </div>
          )}
          <div className="p-6 rounded-2xl border border-border bg-card mb-4">
            <h3 className="font-serif text-lg font-light text-foreground mb-3">What this pattern looks like</h3>
            <p className="text-muted-foreground leading-relaxed text-base">{profile.summary}</p>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-card mb-4">
            <h3 className="font-serif text-lg font-light text-foreground mb-3">What may be happening</h3>
            <ul className="space-y-2">
              {profile.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-base text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />{b}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-2xl border border-accent/20 bg-accent/3 mb-4">
            <h3 className="font-sans text-lg font-semibold text-foreground mb-1">Five structural readings</h3>
            <p className="text-xs text-muted-foreground mb-4">Where your energy is going right now, based on your responses.</p>
            <div className="space-y-3">
              {(["State", "Story", "Standards", "Strategy", "Stewardship"] as const).map(dim => (
                <div key={dim} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-muted-foreground shrink-0">{dim}</span>
                  <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${DIM_COLORS[dim] ?? "bg-accent"}`} style={{ width: `${scores.pct[dim]}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{scores.pct[dim]}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-accent/20 bg-accent/5 mb-4 text-center">
            <p className="font-serif text-base font-light text-foreground italic">"{profile.truth}"</p>
          </div>

          {/* Oracle nudge — connects lowest 5S dimension to upgrade */}
          {(() => {
            const lowestDim = (Object.entries(scores.pct) as [string, number][])
              .sort(([, a], [, b]) => a - b)[0]?.[0] ?? "State";
            const dimDescriptions: Record<string, string> = {
              State: "your emotional regulation and inner state",
              Story: "the beliefs and identity narratives shaping you",
              Standards: "your habits, rituals, and daily execution",
              Strategy: "your decisions, leverage, and long-term direction",
              Stewardship: "your energy, body, and stewardship rhythms",
            };
            return (
              <div className="p-6 rounded-2xl border mb-4" style={{
                background: "linear-gradient(135deg, rgba(111,143,196,0.08), rgba(216,184,120,0.05))",
                borderColor: "rgba(111,143,196,0.28)",
              }}>
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: "rgba(111,143,196,0.15)", color: "#6f8fc4" }}>◎</div>
                  <div className="flex-1">
                    <p className="text-xs font-mono tracking-widest uppercase mb-1" style={{ color: "#6f8fc4" }}>Your Oracle is ready</p>
                    <h3 className="font-serif text-lg font-light text-foreground mb-2">
                      Your <span style={{ color: "#6f8fc4" }}>{lowestDim}</span> dimension needs the most attention right now.
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      The Oracle works directly on {dimDescriptions[lowestDim] ?? "your growth areas"} — drawing from your audit results, your journal, and your patterns to give you guidance that is specific to <em>you</em>, not generic advice.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {isAuthenticated ? (
                        <Button size="sm" asChild style={{ background: "linear-gradient(135deg, #6f8fc4, #8ba8d4)", color: "white", border: "none" }}>
                          <a href="/oracle">Ask the Oracle about my {lowestDim} →</a>
                        </Button>
                      ) : (
                        <Button size="sm" asChild style={{ background: "linear-gradient(135deg, #6f8fc4, #8ba8d4)", color: "white", border: "none" }}>
                          <a href={getLoginUrl("/audit")}>Unlock the Oracle →</a>
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" asChild>
                        <a href="/pricing">See Oracle plans</a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
          {/* Share your result */}
          {shareUrl && (
            <div className="p-5 rounded-2xl border border-border bg-card/60 mb-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-medium text-foreground mb-0.5">Share your profile</p>
                <p className="text-xs text-muted-foreground">Let others discover their alignment pattern</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={handleShare}>
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
          )}
          {/* Save / Sign-up CTA */}
          <div className="p-6 rounded-2xl border border-border bg-card mb-6">
            {isAuthenticated ? (
              <>
                <h3 className="font-serif text-lg font-light text-foreground mb-2">Save your results to your profile</h3>
                <p className="text-base text-muted-foreground mb-4">Your audit results will be stored and used to personalise your Oracle, pathway recommendations, and progress tracking over time.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="gap-2" onClick={handleSaveResults} disabled={saveAudit.isPending}>
                    <CheckCircle2 className="h-4 w-4" /> {saveAudit.isPending ? "Saving..." : "Save My Results"}
                  </Button>
                  <Button variant="ghost" asChild><a href="/dashboard">Go to dashboard</a></Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-serif text-lg font-light text-foreground mb-2">Create your free account to begin</h3>
                <p className="text-base text-muted-foreground mb-4">Your profile — <strong className="text-foreground">{result?.profile.name}</strong> — will be saved automatically when you sign up. Your Oracle, pathway, and progress will be personalised to these results from day one.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="gap-2" onClick={handleSaveResults}>
                    <CheckCircle2 className="h-4 w-4" /> Start free — save my results
                  </Button>
                  <Button variant="ghost" asChild><a href="/">Back to home</a></Button>
                </div>
              </>
            )}
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border border-border">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Disclaimer:</strong> The Soul Engineer Assessment is a reflective tool, not a medical or psychological diagnosis. It is designed to identify current patterns and help guide your experience inside Lifewoven. If you are dealing with significant mental health concerns, please seek support from a qualified professional.
            </p>
          </div>
        </div>
       </div>
    );
  }
  return null;
}
