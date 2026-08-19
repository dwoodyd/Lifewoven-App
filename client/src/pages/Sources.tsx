import { Link } from "wouter";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Nav from "@/components/Nav";

const INFLUENCES = [
  {
    category: "Identity & Habit Formation",
    works: [
      {
        author: "James Clear",
        title: "Atomic Habits",
        contribution: "The identity-based habit framework — the idea that lasting change begins with who you believe you are, not what you do — is foundational to the Standards and Strategy modules. The four-stage habit loop (cue, craving, response, reward) informs how Lifewoven structures habit creation.",
        url: "https://jamesclear.com/atomic-habits",
      },
    ],
  },
  {
    category: "Meaning & Purpose",
    works: [
      {
        author: "Viktor Frankl",
        title: "Man's Search for Meaning",
        contribution: "The principle that meaning is not found but built through deliberate engagement with life is central to the Story and Stewardship modules. The observation that a space exists between stimulus and response — and that our growth lives in that space — shapes the Lifewoven approach to emotional regulation and conscious choice.",
        url: "https://www.viktorfrankl.org/",
      },
    ],
  },
  {
    category: "Interior Alignment & Emotional Guidance",
    works: [
      {
        author: "Esther Hicks / Abraham-Hicks",
        title: "The Law of Attraction teachings",
        contribution: "The Emotional Guidance Scale used in the State module's check-in system is adapted from the Abraham-Hicks emotional scale. The broader concept that interior state precedes and shapes outer experience is a core influence on the Lifewoven framework.",
        url: "https://www.abraham-hicks.com/",
      },
    ],
  },
  {
    category: "Productivity & Strategic Design",
    works: [
      {
        author: "Tim Ferriss",
        title: "The 4-Hour Workweek",
        contribution: "The Strategy module's Leverage Mapper and the practice of designing life around outcomes rather than effort draws on Ferriss's work on elimination, automation, and the 80/20 principle applied to personal productivity.",
        url: "https://tim.blog/",
      },
      {
        author: "Vilfredo Pareto / Richard Koch",
        title: "The 80/20 Principle",
        contribution: "The Leverage Mapper in the Strategy module is built on the Pareto principle — the observation that 80% of results come from 20% of inputs. Lifewoven applies this to personal energy, habits, and goal selection.",
        url: "https://www.amazon.com/80-20-Principle-Secret-Achieving/dp/0385491743",
      },
    ],
  },
  {
    category: "Flow & Peak Performance",
    works: [
      {
        author: "Mihaly Csikszentmihalyi",
        title: "Flow: The Psychology of Optimal Experience",
        contribution: "The concept of flow — complete absorption where time dissolves and performance peaks — informs the Flow pathway and the Stewardship module's approach to deep work and energy management. Lifewoven treats flow not as luck but as a designable condition.",
        url: "https://www.amazon.com/Flow-Psychology-Experience-Perennial-Classics/dp/0061339202",
      },
    ],
  },
  {
    category: "Vulnerability & Wholehearted Living",
    works: [
      {
        author: "Brené Brown",
        title: "The Gifts of Imperfection / Daring Greatly",
        contribution: "Brown's research on vulnerability, shame resilience, and wholehearted living shapes the Story module's belief-rewriting work and the Stewardship module's emphasis on self-compassion. The idea that courage requires showing up imperfectly is woven into the Lifewoven ethos.",
        url: "https://brenebrown.com/",
      },
    ],
  },
  {
    category: "Consciousness & Manifestation",
    works: [
      {
        author: "Neville Goddard",
        title: "The Power of Awareness",
        contribution: "Goddard's teaching that consciousness is the only reality — and that assuming the feeling of the wish fulfilled is the mechanism of change — informs the Resonance and Flow pathways, and the Oracle's approach to visualization and identity-level affirmation.",
        url: "https://www.amazon.com/Power-Awareness-Neville-Goddard/dp/1607963604",
      },
    ],
  },
  {
    category: "Spiritual & Philosophical Foundations",
    works: [
      {
        author: "Ernest Holmes",
        title: "The Science of Mind",
        contribution: "Holmes's teaching that consciousness shapes experience — that the inner world is the cause and the outer world is the effect — is a philosophical underpinning of the entire Lifewoven framework, particularly the State and Story modules.",
        url: "https://www.scienceofmind.com/",
      },
      {
        author: "Wayne Dyer",
        title: "The Power of Intention",
        contribution: "Dyer's work on intention as a field of energy rather than a force of will informs the Lifewoven approach to goal-setting in the Strategy module — the idea that alignment with intention matters more than effortful striving.",
        url: "https://www.drwaynedyer.com/",
      },
    ],
  },
];

export default function Sources() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container max-w-3xl mx-auto pt-20 pb-24 px-4 sm:px-6">
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm" className="gap-2 mb-6 -ml-2 text-muted-foreground">
            <Link href="/about"><ArrowLeft className="h-4 w-4" /> Back to About</Link>
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-accent/10">
              <BookOpen className="h-5 w-5 text-accent" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-foreground">Sources & Influences</h1>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Lifewoven is a synthesis — not an invention from nothing. The 5S Framework, Seven Pathways, and the interactions between them are original to Lifewoven. The ideas they draw on are not. We believe transparency about intellectual lineage is a mark of integrity, and that standing openly on the shoulders of great thinkers is more trustworthy than pretending to stand alone.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Below are the primary works and thinkers whose ideas have shaped this platform. We are grateful to each of them.
          </p>
        </div>

        <div className="space-y-10">
          {INFLUENCES.map((section) => (
            <div key={section.category}>
              <h2 className="font-serif text-lg font-light text-foreground mb-4 pb-2 border-b border-border">
                {section.category}
              </h2>
              <div className="space-y-6">
                {section.works.map((work) => (
                  <div key={work.title} className="p-5 rounded-2xl border border-border bg-card">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-medium text-foreground">{work.title}</p>
                        <p className="text-sm text-muted-foreground">{work.author}</p>
                      </div>
                      <a
                        href={work.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        aria-label={`Learn more about ${work.title}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{work.contribution}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl border border-accent/20 bg-accent/5">
          <h3 className="font-serif text-base font-light text-foreground mb-2">What is original to Lifewoven</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The 5S Framework (State, Story, Standards, Strategy, Stewardship) as an integrated system is original to Lifewoven. The Seven Pathways, the Load-Bearing Survey, the Identity Stack methodology, the Belief Rewrite process, and the interactions between the five dimensions are the proprietary synthesis that makes Lifewoven distinct. We synthesize; we do not merely curate.
          </p>
        </div>
      </div>
    </div>
  );
}
