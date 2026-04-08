import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Info } from "lucide-react";

const WISDOM_LINEAGE = [
  {
    name: "Ernest Holmes",
    years: "1887–1960",
    role: "Philosopher, Founder of Religious Science",
    contribution: "Holmes' Science of Mind established that consciousness shapes experience — that thought is creative and that a disciplined mental practice can transform every area of life. His work is the philosophical spine of the Lifewoven State and Story modules.",
    status: "Public Domain (pre-1928 works)",
  },
  {
    name: "Esther Hicks",
    years: "Contemporary",
    role: "Author, Law of Attraction Teacher",
    contribution: "The teachings channeled through Esther Hicks introduced a practical emotional navigation system — the idea that feelings are guidance, not obstacles, and that alignment precedes manifestation. These ideas inform the emotional orientation work in Lifewoven.",
    status: "Inspiration Only — Original Lifewoven Content",
  },
  {
    name: "Viktor Frankl",
    years: "1905–1997",
    role: "Psychiatrist, Founder of Logotherapy",
    contribution: "Frankl's logotherapy established that meaning — not pleasure or power — is the primary human drive. His insight that we can choose our response to any circumstance forms the philosophical foundation of the Why pathway and the Stewardship module.",
    status: "Inspiration Only — Original Lifewoven Content",
  },
  {
    name: "James Clear",
    years: "Contemporary",
    role: "Author, Behavioral Scientist",
    contribution: "Clear's work on identity-based habit formation — the idea that lasting change begins with who you believe you are — informs the Standards module and the Identity in Motion course. Lifewoven applies these principles through its own original framework.",
    status: "Inspiration Only — Original Lifewoven Content",
  },
  {
    name: "Summer McStravick",
    years: "Contemporary",
    role: "Author, Manifestation Teacher",
    contribution: "McStravick's work on emotional immersion as a tool for conscious creation informs the Flow pathway and the Emotional Futures practice in Lifewoven. Her core insight — that feeling the future is more powerful than visualizing it — is integrated into original Lifewoven content.",
    status: "Inspiration Only — Original Lifewoven Content",
  },
  {
    name: "Wayne Dyer",
    years: "1940–2015",
    role: "Author, Self-Actualization Teacher",
    contribution: "Dyer's synthesis of Eastern philosophy, Jungian psychology, and practical spirituality — particularly his work on intention and the shift from ego to spirit — informs the deeper layers of the Lifewoven Story and Stewardship modules.",
    status: "Inspiration Only — Original Lifewoven Content",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-24 pb-20 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">About</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-6">The Wisdom Behind Lifewoven</h1>
          <p className="text-muted-foreground text-lg font-light max-w-2xl mx-auto leading-relaxed">
            Lifewoven is built on a simple premise: the most powerful tools for human transformation have existed for decades — even centuries. They have been proven by millions of people across every culture and context. We have distilled them into a single, coherent, original system.
          </p>
        </div>

        {/* Non-Affiliation Disclaimer */}
        <div className="flex gap-3 p-5 rounded-2xl border border-border bg-secondary/40 mb-12">
          <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground font-light leading-relaxed">
            <strong className="text-foreground font-medium">Independence Notice.</strong> Lifewoven is an independently created platform. It is not affiliated with, endorsed by, sponsored by, or formally connected to any of the authors, teachers, estates, or public figures referenced on this page or elsewhere on the platform. All Lifewoven courses, tools, pathways, and content are original creations. They are informed by publicly known ideas, philosophical traditions, and teachings, but are not reproductions, adaptations, or licensed derivatives of any copyrighted work.
          </p>
        </div>

        <div className="p-8 rounded-2xl border border-border bg-card mb-12">
          <h2 className="font-serif text-2xl font-light text-foreground mb-4">The 5S Framework</h2>
          <p className="text-muted-foreground font-light leading-relaxed mb-6">
            The 5S Framework is the original organizing architecture of Lifewoven. It was developed by identifying the five universal domains that consistently determine the quality of a human life — across wisdom traditions, behavioral science, and philosophical inquiry.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { s: "State", desc: "Emotional alignment" },
              { s: "Story", desc: "Beliefs & identity" },
              { s: "Standards", desc: "Habits & systems" },
              { s: "Strategy", desc: "Decisions & leverage" },
              { s: "Stewardship", desc: "Energy & resources" },
            ].map(({ s, desc }) => (
              <div key={s} className="text-center p-3 rounded-xl bg-secondary">
                <p className="font-serif text-lg font-light text-foreground">{s}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <h2 className="font-serif text-2xl font-light text-foreground mb-3 text-center">Wisdom Lineage</h2>
        <p className="text-center text-sm text-muted-foreground font-light mb-8 max-w-xl mx-auto">
          The thinkers and traditions that informed the development of Lifewoven. Their ideas are acknowledged here as sources of inspiration, not as endorsers of this platform.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {WISDOM_LINEAGE.map(t => (
            <div key={t.name} className="p-6 rounded-2xl border border-border bg-card">
              <h3 className="font-serif text-xl font-light text-foreground mb-1">{t.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{t.years} · {t.role}</p>
              <p className="text-sm text-muted-foreground font-light leading-relaxed mb-4">{t.contribution}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{t.status}</span>
            </div>
          ))}
        </div>

        {/* Repeated disclaimer at bottom of influences section */}
        <div className="p-5 rounded-2xl border border-border bg-secondary/40 mb-12">
          <p className="text-xs text-muted-foreground font-light leading-relaxed text-center">
            The individuals listed above are acknowledged as intellectual and philosophical influences on the development of Lifewoven. None of them have reviewed, approved, endorsed, or sponsored this platform or its content. References to their work are made in the spirit of intellectual acknowledgment and do not imply any formal relationship, license, or affiliation.
          </p>
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/alignment-audit">
              <ArrowRight className="h-4 w-4" /> Begin Your Journey
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
