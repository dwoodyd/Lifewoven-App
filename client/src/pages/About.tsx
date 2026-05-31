import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, BookOpen, Brain, Compass, Heart, Layers, Sparkles, Target, Users, Zap, Info, ChevronDown } from "lucide-react";
import { useState } from "react";

const WISDOM_LINEAGE = [
  { name: "Ernest Holmes", years: "1887–1960", role: "Philosopher, Founder of Religious Science", contribution: "Holmes' Science of Mind established that consciousness shapes experience — that thought is creative and that a disciplined mental practice can transform every area of life. His work is the philosophical spine of the Lifewoven State and Story modules.", status: "Public Domain (pre-1928 works)" },
  { name: "Viktor Frankl", years: "1905–1997", role: "Psychiatrist, Founder of Logotherapy", contribution: "Frankl's logotherapy established that meaning — not pleasure or power — is the primary human drive. His insight that we can choose our response to any circumstance forms the philosophical foundation of the Purpose pathway and the Stewardship module.", status: "Inspiration Only — Original Lifewoven Content" },
  { name: "James Clear", years: "Contemporary", role: "Author, Behavioral Scientist", contribution: "Clear's work on identity-based habit formation — the idea that lasting change begins with who you believe you are — informs the Standards module and the Identity in Motion course. Lifewoven applies these principles through its own original framework.", status: "Inspiration Only — Original Lifewoven Content" },
  { name: "Wayne Dyer", years: "1940–2015", role: "Author, Self-Actualization Teacher", contribution: "Dyer's synthesis of Eastern philosophy, Jungian psychology, and practical spirituality — particularly his work on intention and the shift from ego to spirit — informs the deeper layers of the Lifewoven Story and Stewardship modules.", status: "Inspiration Only — Original Lifewoven Content" },
];

const MODULES = [
  { icon: Heart, label: "State", color: "text-rose-400", bg: "bg-rose-400/10", desc: "Emotional alignment, nervous system regulation, and daily grounding. Your inner weather before your outer work.", href: "/state" },
  { icon: BookOpen, label: "Story", color: "text-amber-400", bg: "bg-amber-400/10", desc: "Belief rewriting, identity design, and meaning-making. The narrative you hold about yourself determines everything.", href: "/story" },
  { icon: Target, label: "Standards", color: "text-emerald-400", bg: "bg-emerald-400/10", desc: "Habit architecture, daily scorecards, and deep work planning. Consistency as a practice, not a personality trait.", href: "/standards" },
  { icon: Compass, label: "Strategy", color: "text-blue-400", bg: "bg-blue-400/10", desc: "Decision clarity, leverage mapping, and AI-powered analysis. Think fewer, better thoughts — then act.", href: "/strategy" },
  { icon: Layers, label: "Stewardship", color: "text-purple-400", bg: "bg-purple-400/10", desc: "Energy, wealth consciousness, body rituals, and time sovereignty. Tend the vessel that carries everything else.", href: "/stewardship" },
];

const HOW_TO_STEPS = [
  { step: "01", icon: Compass, title: "Take the Alignment Audit", desc: "A 12-question diagnostic that maps your current state across all 5 dimensions and recommends your first pathway. Takes 5 minutes. Starts everything.", cta: "Begin the Audit", href: "/audit" },
  { step: "02", icon: Heart, title: "Enter Your First Module", desc: "Based on your audit results, you'll be guided to the module where your energy is most blocked. Start there. Don't try to do everything at once.", cta: "View Your Dashboard", href: "/dashboard" },
  { step: "03", icon: Sparkles, title: "Work With the Oracle", desc: "The Oracle is your AI companion — it reads your journal entries, habit patterns, and check-ins to surface insights you haven't seen yet. Ask it anything.", cta: "Meet the Oracle", href: "/oracle" },
  { step: "04", icon: Zap, title: "Follow a Pathway", desc: "Pathways are guided practice sequences — 10 to 45 minutes — designed to move you through a specific shift. Align, Reset, Uplift, Flow, Rhythms, Purpose.", cta: "Explore Pathways", href: "/pathways" },
  { step: "05", icon: Brain, title: "Build Your Ground Practice", desc: "The Ground is the spiritual foundation of the system — grounding, intention, and deliberate entry into your day before the noise begins.", cta: "Enter The Ground", href: "/ground" },
];

export default function About() {
  const [expandedLineage, setExpandedLineage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* Hero */}
      <section className="pt-20 pb-14 container max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">What Is Lifewoven</p>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-6 leading-tight">
              One system.{" "}
              <span className="italic text-muted-foreground">Five dimensions.</span>{" "}
              Your whole life.
            </h1>
            <p className="text-lg text-muted-foreground font-light leading-relaxed mb-8">
              Lifewoven is a personal transformation operating system. It brings together emotional alignment, belief work, habit execution, strategic clarity, and holistic stewardship — not as separate practices, but as one coherent, intelligent whole.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/audit">
                <Button className="gap-2">Take the Alignment Audit <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="gap-2 bg-background">Go to Dashboard</Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:block mt-4">
            <div className="relative p-8 rounded-3xl border border-border bg-card">
              <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-6">The 5S Framework</p>
              <div className="space-y-3">
                {MODULES.map(({ icon: Icon, label, color, bg, desc }) => (
                  <div key={label} className={`flex items-start gap-3 p-3 rounded-xl ${bg}`}>
                    <Icon className={`h-4 w-4 ${color} mt-0.5 shrink-0`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground font-light leading-relaxed">{desc.split(".")[0]}.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Exists */}
      <section className="py-20 border-t border-border">
        <div className="container max-w-3xl mx-auto text-center">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Why Lifewoven Exists</p>
          <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-8">You already know what to do.<br />Something else is in the way.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 text-left mt-10">
            {[
              { title: "The books aren't enough", body: "You've read the books. You understand the concepts. But understanding and embodying are not the same thing. Lifewoven is the bridge." },
              { title: "Fragmented tools don't work", body: "A habit app here. A journaling app there. A meditation timer. None of them talk to each other. Lifewoven integrates everything into one coherent practice." },
              { title: "You need a system, not a hack", body: "Transformation isn't a trick. It's a practice. Lifewoven gives you a repeatable, intelligent system that adapts to where you actually are — not where you think you should be." },
            ].map(({ title, body }) => (
              <div key={title} className="p-6 rounded-2xl border border-border bg-card">
                <h3 className="font-serif text-lg font-light text-foreground mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The 5S Modules */}
      <section className="py-20 border-t border-border">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">The Framework</p>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground">The 5S Personal Transformation System</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {MODULES.map(({ icon: Icon, label, color, bg, desc, href }) => (
              <Link key={label} href={href}>
                <div className={`p-6 rounded-2xl border border-border ${bg} hover:border-muted-foreground transition-all cursor-pointer group h-full`}>
                  <Icon className={`h-6 w-6 ${color} mb-3 group-hover:scale-110 transition-transform`} />
                  <h3 className="font-serif text-xl font-light text-foreground mb-2">{label}</h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">{desc}</p>
                </div>
              </Link>
            ))}
            <div className="p-6 rounded-2xl border border-border bg-secondary/20 flex flex-col justify-center">
              <Users className="h-6 w-6 text-muted-foreground mb-3" />
              <h3 className="font-serif text-xl font-light text-foreground mb-2">Community</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">Connect with others doing the work. Share insights, ask questions, and be witnessed in your practice.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use It */}
      <section className="py-20 border-t border-border bg-secondary/10">
        <div className="container max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Getting Started</p>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground">How to use Lifewoven</h2>
            <p className="text-muted-foreground font-light mt-4 max-w-xl mx-auto">Follow this sequence for your first week. After that, the platform adapts to you.</p>
          </div>
          <div className="space-y-4">
            {HOW_TO_STEPS.map(({ step, icon: Icon, title, desc, cta, href }) => (
              <div key={step} className="p-4 sm:p-6 rounded-2xl border border-border bg-card">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <span className="text-xs font-mono text-muted-foreground">{step}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium text-foreground text-sm sm:text-base">{title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed mb-3">{desc}</p>
                    <Link href={href}>
                      <Button variant="outline" size="sm" className="gap-1.5 bg-background text-xs">
                        {cta} <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wisdom Lineage */}
      <section className="py-20 border-t border-border">
        <div className="container max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Wisdom Lineage</p>
            <h2 className="font-serif text-3xl font-light text-foreground mb-4">Standing on the shoulders of giants</h2>
          </div>
          <div className="flex gap-3 p-4 rounded-xl border border-border bg-secondary/40 mb-8">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              <strong className="text-foreground font-medium">Independence Notice.</strong> Lifewoven is an independently created platform. It is not affiliated with, endorsed by, sponsored by, or formally connected to any of the individuals listed below or their estates. The 5S Framework, Seven Pathways, and their interactions are original to Lifewoven. The ideas they draw on are not — and we believe transparency about that is a mark of integrity.{" "}<a href="/sources" className="underline text-foreground hover:text-accent transition-colors">See our full Sources &amp; Influences page →</a>
            </p>
          </div>
          <div className="space-y-3">
            {WISDOM_LINEAGE.map((person) => (
              <div key={person.name} className="rounded-2xl border border-border bg-card overflow-hidden">
                <button
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-secondary/20 transition-colors"
                  onClick={() => setExpandedLineage(expandedLineage === person.name ? null : person.name)}
                >
                  <div>
                    <p className="font-medium text-foreground">{person.name} <span className="text-muted-foreground font-light text-sm">{person.years}</span></p>
                    <p className="text-xs text-muted-foreground font-light">{person.role}</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedLineage === person.name ? "rotate-180" : ""}`} />
                </button>
                {expandedLineage === person.name && (
                  <div className="px-5 pb-5 border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground font-light leading-relaxed mb-3">{person.contribution}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{person.status}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border">
        <div className="container max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-4">Ready to begin?</h2>
          <p className="text-muted-foreground font-light mb-8">The Alignment Audit takes 5 minutes and tells you exactly where to start.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/audit">
              <Button size="lg" className="gap-2">Take the Alignment Audit <ArrowRight className="h-4 w-4" /></Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="bg-background">View Pricing</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
