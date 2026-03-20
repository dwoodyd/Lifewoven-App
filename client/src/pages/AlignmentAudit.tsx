import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Nav from "@/components/Nav";
import { ArrowRight, ArrowLeft, CheckCircle2, Waves, BookOpen, Target, Compass, Leaf } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const questions = [
  { id: 1, module: "state", text: "How often do you feel emotionally reactive, anxious, or unable to access a sense of calm?", options: [
    { label: "Almost always — I feel overwhelmed most days", score: 1 },
    { label: "Often — it takes effort to regulate", score: 2 },
    { label: "Sometimes — I have good days and hard days", score: 3 },
    { label: "Rarely — I generally feel grounded", score: 4 },
  ]},
  { id: 2, module: "state", text: "When you imagine your ideal life, how connected do you feel to that vision right now?", options: [
    { label: "Completely disconnected — it feels impossible", score: 1 },
    { label: "Distant — I can see it but can't feel it", score: 2 },
    { label: "Occasionally close — in good moments", score: 3 },
    { label: "Fairly aligned — I feel it most of the time", score: 4 },
  ]},
  { id: 3, module: "story", text: "How much do your internal beliefs support your goals and desires?", options: [
    { label: "They actively work against me — I self-sabotage", score: 1 },
    { label: "Mixed — some support, some undermine", score: 2 },
    { label: "Mostly supportive — with some doubt", score: 3 },
    { label: "Strongly aligned — I believe in myself", score: 4 },
  ]},
  { id: 4, module: "story", text: "How clear is your sense of identity and purpose?", options: [
    { label: "Very unclear — I feel lost or undefined", score: 1 },
    { label: "Somewhat unclear — I'm searching", score: 2 },
    { label: "Emerging — I have a sense but it's not solid", score: 3 },
    { label: "Clear and grounded — I know who I am", score: 4 },
  ]},
  { id: 5, module: "standards", text: "How consistently do you follow through on the habits and commitments you set for yourself?", options: [
    { label: "Rarely — I start but rarely sustain", score: 1 },
    { label: "Inconsistently — good weeks and bad weeks", score: 2 },
    { label: "Mostly — with occasional lapses", score: 3 },
    { label: "Consistently — I keep my promises to myself", score: 4 },
  ]},
  { id: 6, module: "standards", text: "How intentional is your daily structure and use of time?", options: [
    { label: "Reactive — I respond to whatever comes", score: 1 },
    { label: "Somewhat structured — but easily derailed", score: 2 },
    { label: "Mostly intentional — with room to improve", score: 3 },
    { label: "Highly intentional — I design my days", score: 4 },
  ]},
  { id: 7, module: "strategy", text: "How confident are you in the quality of your major life decisions?", options: [
    { label: "Not confident — I often regret or second-guess", score: 1 },
    { label: "Somewhat — I decide but without a clear framework", score: 2 },
    { label: "Mostly — I think things through fairly well", score: 3 },
    { label: "Very confident — I have a solid decision process", score: 4 },
  ]},
  { id: 8, module: "strategy", text: "How well are you leveraging your unique strengths in your work or life?", options: [
    { label: "Poorly — I feel stuck or misaligned", score: 1 },
    { label: "Somewhat — I see the opportunity but haven't acted", score: 2 },
    { label: "Moderately — I'm moving in the right direction", score: 3 },
    { label: "Well — I'm operating in my zone of genius", score: 4 },
  ]},
  { id: 9, module: "stewardship", text: "How well are you caring for your physical energy — sleep, movement, nutrition, and recovery?", options: [
    { label: "Poorly — I'm depleted and running on empty", score: 1 },
    { label: "Inconsistently — some areas better than others", score: 2 },
    { label: "Mostly well — with some gaps", score: 3 },
    { label: "Very well — my body feels like an asset", score: 4 },
  ]},
  { id: 10, module: "stewardship", text: "How aligned is your relationship with money and resources to your values and goals?", options: [
    { label: "Misaligned — money feels like a source of stress or shame", score: 1 },
    { label: "Somewhat — I manage but without real intention", score: 2 },
    { label: "Mostly — I'm building but there's more to do", score: 3 },
    { label: "Aligned — I steward my resources with clarity", score: 4 },
  ]},
];

const pathwayMap: Record<string, { pathway: string; title: string; desc: string; icon: React.ElementType; color: string }> = {
  state: { pathway: "align", title: "Begin with Align", desc: "Your emotional state is the foundation. The Align pathway will guide you into daily grounding, vibrational alignment, and nervous system regulation.", icon: Waves, color: "text-state" },
  story: { pathway: "why", title: "Begin with Why", desc: "Your beliefs and identity are the architecture of your life. The Why pathway will help you excavate meaning, rewrite limiting narratives, and build an identity that supports your vision.", icon: BookOpen, color: "text-story" },
  standards: { pathway: "stack", title: "Begin with Stack", desc: "Your daily execution is the bridge between vision and reality. The Stack pathway will help you design identity-based habits and build the consistency that creates lasting change.", icon: Target, color: "text-standards" },
  strategy: { pathway: "flow", title: "Begin with Flow", desc: "Your strategic clarity shapes your trajectory. The Flow pathway will help you visualize your future self and align your actions with your deepest intentions.", icon: Compass, color: "text-strategy" },
  stewardship: { pathway: "uplift", title: "Begin with Uplift", desc: "Your energy and resources are your capacity for life. The Uplift pathway will help you audit your energy, shift your emotional set-point, and build the foundation you need.", icon: Leaf, color: "text-stewardship" },
};

function calculateScores(answers: Record<number, number>) {
  const moduleScores: Record<string, number[]> = { state: [], story: [], standards: [], strategy: [], stewardship: [] };
  questions.forEach((q) => { const score = answers[q.id]; if (score !== undefined) moduleScores[q.module].push(score); });
  const averages: Record<string, number> = {};
  Object.entries(moduleScores).forEach(([mod, scores]) => {
    averages[mod] = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 25) : 50;
  });
  const lowest = Object.entries(averages).sort((a, b) => a[1] - b[1])[0][0];
  return { scores: averages, recommendedModule: lowest };
}

export default function AlignmentAudit() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<{ scores: Record<string, number>; recommendedModule: string } | null>(null);
  const { isAuthenticated } = useAuth();
  const saveAudit = trpc.audit.save.useMutation();

  const question = questions[currentQ];
  const progress = (currentQ / questions.length) * 100;

  function handleSelect(score: number) { setSelectedOption(score); }

  function handleNext() {
    if (selectedOption === null) return;
    const newAnswers = { ...answers, [question.id]: selectedOption };
    setAnswers(newAnswers);
    setSelectedOption(null);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const { scores, recommendedModule } = calculateScores(newAnswers);
      setResult({ scores, recommendedModule });
      setCompleted(true);
      if (isAuthenticated) {
        const pathway = pathwayMap[recommendedModule]?.pathway || "align";
        saveAudit.mutate({ answers: newAnswers, scores, recommendedPathway: pathway });
      }
    }
  }

  function handleBack() {
    if (currentQ > 0) { setCurrentQ(currentQ - 1); setSelectedOption(answers[questions[currentQ - 1].id] ?? null); }
  }

  if (completed && result) {
    const rec = pathwayMap[result.recommendedModule];
    const Icon = rec.icon;
    const moduleOrder = ["state", "story", "standards", "strategy", "stewardship"];
    const moduleLabels: Record<string, string> = { state: "State", story: "Story", standards: "Standards", strategy: "Strategy", stewardship: "Stewardship" };
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="container pt-28 pb-20 max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
              <CheckCircle2 className="h-7 w-7 text-accent" />
            </div>
            <h1 className="font-serif text-4xl font-light text-foreground mb-3">Your Alignment Audit is complete.</h1>
            <p className="text-muted-foreground text-lg font-light">Here is where you stand across the 5S dimensions.</p>
          </div>
          <div className="space-y-4 mb-10">
            {moduleOrder.map((mod) => {
              const score = result.scores[mod] ?? 50;
              const isLowest = mod === result.recommendedModule;
              return (
                <div key={mod} className={`p-4 rounded-xl border ${isLowest ? "border-accent/40 bg-accent/5" : "border-border bg-card"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isLowest ? "text-accent" : "text-foreground"}`}>
                      {moduleLabels[mod]}
                      {isLowest && <Badge className="ml-2 text-xs bg-accent/20 text-accent border-accent/30">Start Here</Badge>}
                    </span>
                    <span className="text-sm font-mono text-muted-foreground">{score}%</span>
                  </div>
                  <Progress value={score} className="h-1.5" />
                </div>
              );
            })}
          </div>
          <div className="p-6 rounded-xl border border-border bg-card mb-8">
            <div className="inline-flex p-2 rounded-lg bg-secondary mb-4"><Icon className={`h-5 w-5 ${rec.color}`} /></div>
            <h2 className="font-serif text-2xl font-light text-foreground mb-2">{rec.title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5">{rec.desc}</p>
            <Button asChild className="gap-2">
              <a href={`/pathway/${rec.pathway}`}>Enter the {rec.pathway.charAt(0).toUpperCase() + rec.pathway.slice(1)} Pathway <ArrowRight className="h-4 w-4" /></a>
            </Button>
          </div>
          {!isAuthenticated && (
            <div className="p-4 rounded-xl border border-border bg-secondary/30 text-center">
              <p className="text-sm text-muted-foreground mb-3">Create a free account to save your results and track your progress over time.</p>
              <Button variant="outline" size="sm" asChild><a href="/dashboard">Save My Results</a></Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-28 pb-20 max-w-2xl mx-auto">
        <div className="mb-10">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">Alignment Audit — Question {currentQ + 1} of {questions.length}</p>
          <Progress value={progress} className="h-1 mb-6" />
          <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground leading-snug">{question.text}</h1>
        </div>
        <div className="space-y-3 mb-10">
          {question.options.map((opt, i) => (
            <button key={i} onClick={() => handleSelect(opt.score)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-150 ${
                selectedOption === opt.score ? "border-accent bg-accent/5 text-foreground" : "border-border bg-card text-muted-foreground hover:border-muted-foreground hover:text-foreground"
              }`}>
              <span className="text-sm leading-relaxed">{opt.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack} disabled={currentQ === 0} className="gap-1.5 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={handleNext} disabled={selectedOption === null} className="gap-2">
            {currentQ === questions.length - 1 ? "See My Results" : "Next"} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
