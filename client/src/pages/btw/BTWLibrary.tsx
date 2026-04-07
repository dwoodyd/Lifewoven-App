import Nav from "@/components/Nav";
import { BookOpen, Headphones, FileText, ExternalLink } from "lucide-react";

const TEACHINGS = [
  {
    category: "Contemplative Formation",
    items: [
      { title: "The Practice of the Presence of God", author: "Brother Lawrence", type: "text", desc: "A classic on practicing awareness of God's presence in ordinary moments. Public domain.", link: null },
      { title: "The Interior Castle", author: "Teresa of Ávila", type: "text", desc: "A guide to the soul's journey inward. Public domain.", link: null },
      { title: "Abandonment to Divine Providence", author: "Jean-Pierre de Caussade", type: "text", desc: "On surrendering the present moment. Public domain.", link: null },
    ],
  },
  {
    category: "Grounded Prayer",
    items: [
      { title: "Before the Words — Introduction", author: "Original Content", type: "reflection", desc: "The foundational teaching behind this pathway. What it means to settle before you speak.", link: null },
      { title: "What Is Inner Posture?", author: "Original Content", type: "reflection", desc: "The difference between what you say and the state from which you say it.", link: null },
      { title: "The Five States of Entry", author: "Original Content", type: "reflection", desc: "Bracing, Striving, Drifting, Depleted, and Settled — and what each one needs.", link: null },
    ],
  },
  {
    category: "Companion Practices",
    items: [
      { title: "Lectio Divina — A Beginner's Guide", author: "Original Content", type: "practice", desc: "A four-movement practice for reading scripture slowly and receptively.", link: null },
      { title: "The Examen", author: "Ignatian Tradition", type: "practice", desc: "A daily review of consolation and desolation. Five minutes at the end of the day.", link: null },
      { title: "Centering Prayer — Introduction", author: "Thomas Keating (tradition)", type: "practice", desc: "A method of silent prayer that opens the practitioner to God's presence.", link: null },
    ],
  },
  {
    category: "For the Hard Seasons",
    items: [
      { title: "Praying When You Don't Feel Like It", author: "Original Content", type: "reflection", desc: "On the difference between emotional readiness and faithful return.", link: null },
      { title: "When the Words Don't Come", author: "Original Content", type: "reflection", desc: "What to do when prayer feels hollow, forced, or impossible.", link: null },
      { title: "Grief and the Ground", author: "Original Content", type: "reflection", desc: "On carrying loss into prayer without pretending it isn't there.", link: null },
    ],
  },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  text: <BookOpen className="h-3.5 w-3.5" />,
  reflection: <FileText className="h-3.5 w-3.5" />,
  practice: <Headphones className="h-3.5 w-3.5" />,
  audio: <Headphones className="h-3.5 w-3.5" />,
};

export default function BTWLibrary() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-24 pb-20 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Before the Words</p>
          <h1 className="font-serif text-4xl font-light text-foreground mb-3">The Library</h1>
          <p className="text-muted-foreground font-light max-w-md mx-auto">
            Teachings, reflections, and companion practices for the contemplative formation journey.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-secondary/30 border border-border mb-10 text-center">
          <p className="text-xs text-muted-foreground font-light">
            Public domain texts are offered freely. Original content is proprietary to Steadora. Third-party practices are credited to their traditions.
          </p>
        </div>

        <div className="space-y-10">
          {TEACHINGS.map(section => (
            <div key={section.category}>
              <h2 className="font-serif text-xl font-light text-foreground mb-5">{section.category}</h2>
              <div className="space-y-3">
                {section.items.map(item => (
                  <div key={item.title} className="p-5 rounded-2xl border border-border bg-card hover:bg-secondary/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-muted-foreground">{TYPE_ICONS[item.type]}</span>
                          <h3 className="text-sm font-light text-foreground">{item.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{item.author}</p>
                        <p className="text-xs text-muted-foreground font-light leading-relaxed">{item.desc}</p>
                      </div>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl border border-border bg-card text-center">
          <p className="font-serif text-lg font-light text-foreground mb-2">More coming with the book</p>
          <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-md mx-auto">
            The full Before the Words library will expand alongside the book release, including companion teachings, audio reflections, and guided practices.
          </p>
        </div>
      </div>
    </div>
  );
}
