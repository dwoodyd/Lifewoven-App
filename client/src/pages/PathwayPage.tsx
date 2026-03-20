import { useRoute } from "wouter";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Play, Clock, Star } from "lucide-react";

const PATHWAYS: Record<string, any> = {
  align: {
    name: "Align",
    tagline: "Daily Grounding Practice",
    color: "state",
    description: "Begin each day in alignment. This 15-minute morning practice combines breath awareness, emotional check-in, and intention-setting to anchor you in your highest vibration before the world gets in.",
    duration: "15 minutes",
    frequency: "Daily",
    source: "Abraham-Hicks, Ernest Holmes",
    steps: [
      { title: "Breath Anchor (2 min)", desc: "Settle into stillness. Take 10 slow, conscious breaths. Feel your body. Let go of yesterday." },
      { title: "Emotional Check-In (3 min)", desc: "Where are you on the Emotional Guidance Scale right now? Name it without judgment. Awareness is the first step to shift." },
      { title: "Appreciation Activation (5 min)", desc: "Find 5 genuine things to appreciate. Feel each one. Appreciation is the fastest path to alignment. — Abraham-Hicks" },
      { title: "Intention Setting (3 min)", desc: "Set one clear intention for today. Not a task — a state of being. 'Today I intend to feel...' or 'Today I choose to be...'" },
      { title: "Affirmation Seal (2 min)", desc: "Speak your core affirmation three times, slowly, with feeling. Let it land in your body, not just your mind." },
    ],
    affirmation: "I am in alignment with the flow of well-being. Everything I need comes to me with ease.",
    journalPrompt: "What does alignment feel like in my body right now? What would today look like if I stayed in this state?",
  },
  vortex: {
    name: "Vortex",
    tagline: "Advanced Vibrational Practice",
    color: "state",
    description: "The Vortex is the vibrational space where everything you have ever wanted already exists. This practice helps you close the gap between where you are and where your desires live.",
    duration: "20 minutes",
    frequency: "Daily or as needed",
    source: "Abraham-Hicks, The Vortex",
    steps: [
      { title: "Soften Resistance (4 min)", desc: "Release the need to figure it out. Let go of the 'how.' Your only job right now is to feel good. Breathe into that permission." },
      { title: "Appreciation Rampage (5 min)", desc: "Begin with something small and easy to appreciate. Build momentum. Let one appreciation lead to another. Feel the energy rise." },
      { title: "Vortex Visualization (8 min)", desc: "Close your eyes. Imagine you are already living your desired reality. Feel it as if it is now. Use all your senses. The Vortex is not a future place — it is a present feeling." },
      { title: "Deliberate Intent (3 min)", desc: "From this high-vibration state, set your deliberate intent. What do you want to attract today? State it as if it is already done." },
    ],
    affirmation: "I am in the Vortex. Everything I want is here, waiting for me to align with it.",
    journalPrompt: "What did I see, feel, and experience in my Vortex visualization? What is already on its way to me?",
  },
  uplift: {
    name: "Uplift",
    tagline: "Emotional Set-Point Shifting",
    color: "state",
    description: "Based on the Abraham-Hicks Emotional Guidance Scale, this practice systematically moves you up the emotional scale — not by forcing positivity, but by reaching for the next best-feeling thought.",
    duration: "10–20 minutes",
    frequency: "As needed",
    source: "Abraham-Hicks, Esther Hicks",
    steps: [
      { title: "Locate Yourself (2 min)", desc: "Identify your current emotional state on the scale. Be honest. Despair, anger, frustration, boredom, contentment, joy — all are valid starting points." },
      { title: "Reach for Relief (5 min)", desc: "You don't need to jump to joy. Just reach for the next better-feeling thought. From despair, reach for anger. From anger, reach for frustration. Each step up is a win." },
      { title: "Momentum Building (5 min)", desc: "Once you find a slightly better feeling, build on it. Find evidence for it. Tell a better story about your situation. Not a false story — a more empowering one." },
      { title: "Anchor the Shift (3 min)", desc: "When you feel the shift, anchor it. Breathe it in. Acknowledge the movement. You just changed your set-point." },
    ],
    affirmation: "I am always moving toward greater well-being. Every thought I choose moves me higher.",
    journalPrompt: "Where did I start on the emotional scale today? Where did I end up? What thought or reframe made the biggest difference?",
  },
  flow: {
    name: "Flow",
    tagline: "Creative Visualization Practice",
    color: "story",
    description: "Summer McStravick's Flowdreaming meets Ernest Holmes' Science of Mind in this guided visualization practice. You are not just imagining a future — you are flowing into it.",
    duration: "15–25 minutes",
    frequency: "Daily",
    source: "Summer McStravick, Ernest Holmes",
    steps: [
      { title: "Enter the Flow (3 min)", desc: "Imagine yourself floating in a warm, gentle current of energy. This is the Flow — the stream of life moving you toward everything you desire. Relax into it." },
      { title: "Feel Your Desired Life (10 min)", desc: "In the Flow, experience your desired life as already real. Don't watch it like a movie — be IN it. Feel the emotions, the sensations, the relationships, the freedom." },
      { title: "Speak Your Desires (5 min)", desc: "From inside the Flow, speak your desires as present-tense truths. 'I am...' 'I have...' 'I feel...' Let the words come from the feeling, not the mind." },
      { title: "Gratitude Release (3 min)", desc: "Thank the Flow for bringing these experiences to you. Release attachment to the 'how' and 'when.' Trust the current." },
    ],
    affirmation: "I am in the Flow of life. My desires are already real in the stream, and I am moving toward them now.",
    journalPrompt: "What did I experience in my Flow today? What felt most real and alive? What am I ready to receive?",
  },
  stack: {
    name: "Stack",
    tagline: "Atomic Habit Execution",
    color: "standards",
    description: "James Clear's Atomic Habits framework meets identity-based transformation. This practice helps you design, stack, and execute the habits that make your desired identity inevitable.",
    duration: "5–10 minutes",
    frequency: "Daily",
    source: "James Clear, Atomic Habits",
    steps: [
      { title: "Identity Affirmation (1 min)", desc: "State your identity: 'I am the kind of person who...' This is not motivation — it is identity. Every habit vote you cast today is evidence of who you are." },
      { title: "Review Your Stack (2 min)", desc: "Look at your habit stack for today. Each habit is linked to a cue and a reward. Review the chain. Prepare your environment." },
      { title: "Execute with Awareness (ongoing)", desc: "As you complete each habit, acknowledge it. 'I did it. This is who I am.' The two-minute rule: if you're struggling, just start. Just show up. The habit is the starting." },
      { title: "Daily Scorecard (2 min)", desc: "At the end of the day, score yourself. Not on perfection — on identity. Did you show up as the person you're becoming? What's one thing to improve tomorrow?" },
    ],
    affirmation: "I am building the identity of my highest self, one small action at a time. Every habit is a vote.",
    journalPrompt: "Which habit felt most natural today? Which felt like resistance? What does that tell me about my identity?",
  },
  why: {
    name: "Why",
    tagline: "Meaning & Resilience Practice",
    color: "story",
    description: "Viktor Frankl's logotherapy teaches that meaning is not found — it is created. This practice helps you connect to your deepest 'why' and use it as an unshakeable source of resilience.",
    duration: "15–20 minutes",
    frequency: "Weekly or during challenges",
    source: "Viktor Frankl, Man's Search for Meaning",
    steps: [
      { title: "The Last Freedom (3 min)", desc: "Recall Frankl's insight: between stimulus and response, there is a space. In that space is your freedom. No matter what is happening, you choose your response. Sit with that power." },
      { title: "Find Your Why (7 min)", desc: "Ask: What gives my life meaning right now? It could be a person, a mission, a creative work, or even the commitment to grow through suffering. Write it down. Make it specific." },
      { title: "The Meaning Reframe (5 min)", desc: "Take your current challenge. Ask: What meaning can I find in this? How is this making me stronger, wiser, more compassionate? What is this teaching me that I could not have learned any other way?" },
      { title: "Future Self Letter (5 min)", desc: "Write a brief message from your future self — the one who has grown through this challenge — to your present self. What do they want you to know?" },
    ],
    affirmation: "I choose the meaning I give to my experiences. My suffering is not wasted — it is being transformed into wisdom.",
    journalPrompt: "What is my deepest 'why' right now? How does connecting to it change how I see my current situation?",
  },
  reset: {
    name: "Reset After Setback",
    tagline: "The Flagship Resilience Protocol",
    color: "stewardship",
    description: "This is the most important pathway in LifeOS. Setbacks are not failures — they are data. This protocol guides you through the full cycle of acknowledging, processing, learning, and returning to alignment after any difficulty.",
    duration: "30–45 minutes",
    frequency: "After any significant setback",
    source: "Abraham-Hicks, Viktor Frankl, Ernest Holmes, James Clear",
    steps: [
      { title: "Acknowledge Without Armor (5 min)", desc: "Don't bypass the pain. Don't rush to positivity. Sit with what happened. Name it clearly. 'This happened. I feel...' Resistance to what is creates more suffering than what is." },
      { title: "Emotional First Aid (10 min)", desc: "Use the Uplift pathway to move from your current emotional state to at least neutral. You don't need to feel great yet. You just need to stop the downward spiral." },
      { title: "The Learning Extraction (10 min)", desc: "Ask Frankl's question: What meaning can I find here? Then ask Clear's question: What system failed, and how do I redesign it? Extract every lesson. Setbacks are expensive teachers — get your money's worth." },
      { title: "Identity Restoration (5 min)", desc: "Reconnect with who you are beneath the setback. The setback happened TO you — it is not you. State your core identity. 'I am still...' 'I am becoming...' 'This does not define me.'" },
      { title: "The Re-Alignment (5 min)", desc: "Use the Align pathway to return to your baseline. Set one small, achievable intention for the next 24 hours. One step. Just one." },
      { title: "The Commitment (5 min)", desc: "Write one sentence: 'Because of this setback, I am now committed to...' This is how adversity becomes advantage. This is how you turn pain into purpose." },
    ],
    affirmation: "I am not broken. I am being refined. Every setback is the setup for my greatest comeback.",
    journalPrompt: "What did this setback cost me? What did it teach me? What am I now committed to because of it?",
  },
};

export default function PathwayPage() {
  const [, params] = useRoute("/pathway/:id");
  const id = params?.id || "align";
  const pathway = PATHWAYS[id] || PATHWAYS.align;

  const colorMap: Record<string, string> = {
    state: "text-state border-state/20 bg-state/5",
    story: "text-story border-story/20 bg-story/5",
    standards: "text-standards border-standards/20 bg-standards/5",
    strategy: "text-strategy border-strategy/20 bg-strategy/5",
    stewardship: "text-stewardship border-stewardship/20 bg-stewardship/5",
  };
  const accentClass = colorMap[pathway.color] || colorMap.state;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-24 pb-20 max-w-3xl mx-auto">
        <div className="mb-2">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">Pathway</p>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-2">{pathway.name}</h1>
        <p className="text-muted-foreground text-lg font-light mb-6">{pathway.tagline}</p>
        <div className="flex flex-wrap gap-3 mb-8">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {pathway.duration}</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Star className="h-3.5 w-3.5" /> {pathway.frequency}</span>
          <span className="text-xs text-muted-foreground">Source: {pathway.source}</span>
        </div>
        <p className="text-foreground font-light leading-relaxed mb-10 text-base">{pathway.description}</p>
        <div className={`p-6 rounded-2xl border mb-10 ${accentClass}`}>
          <p className="text-xs font-mono tracking-widest uppercase mb-3 opacity-70">Core Affirmation</p>
          <p className="font-serif text-xl font-light italic leading-relaxed">"{pathway.affirmation}"</p>
        </div>
        <div className="space-y-4 mb-10">
          <h2 className="font-serif text-2xl font-light text-foreground mb-6">The Practice</h2>
          {pathway.steps.map((step: any, i: number) => (
            <div key={i} className="flex gap-4 p-5 rounded-2xl border border-border bg-card">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-xs font-mono text-muted-foreground">{i + 1}</span>
              </div>
              <div>
                <h3 className="font-medium text-foreground text-sm mb-1.5">{step.title}</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 rounded-2xl border border-border bg-card mb-8">
          <h2 className="font-serif text-lg font-light text-foreground mb-3">Journal After This Practice</h2>
          <p className="text-sm text-muted-foreground italic mb-4">"{pathway.journalPrompt}"</p>
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/journal?module=${pathway.color}&prompt=${encodeURIComponent(pathway.journalPrompt)}`}>
              <ArrowRight className="h-4 w-4" /> Open Journal with This Prompt
            </Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(PATHWAYS).filter(([k]) => k !== id).slice(0, 3).map(([k, p]: [string, any]) => (
            <Link key={k} href={`/pathway/${k}`}>
              <div className="p-3 rounded-xl border border-border hover:border-muted-foreground transition-all cursor-pointer">
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
