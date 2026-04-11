import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Download, FileText, Headphones, Star, CheckCircle2 } from "lucide-react";
import { useRoute } from "wouter";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663270045694/kRrwoPFbyNWaiJXLmscJ4t";

const PRODUCTS: Record<string, {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  price: string;
  category: string;
  description: string;
  longDescription: string;
  includes: string[];
  downloadUrl: string;
  tags: string[];
}> = {
  "alignment-workbook": {
    id: "alignment-workbook",
    icon: "📓",
    category: "workbook",
    title: "The Alignment Workbook",
    subtitle: "A 90-Day Practice for Living in Coherence",
    price: "$27",
    description: "A beautifully designed 90-day guided journal with daily prompts, weekly reviews, and the full 5S framework woven throughout.",
    longDescription: `This workbook is not a journal. A journal asks you to record what happened. This workbook asks you to practice — to apply the five dimensions of the Lifewoven 5S Framework to your actual daily life with enough consistency that they become the operating system of your living, not a set of ideas you think about occasionally.\n\nNinety days. One prompt per day. Thirteen weekly reviews.\n\nThe daily prompts rotate through the five dimensions of the framework — State, Story, Standards, Strategy, Stewardship — so that over the course of three months, you develop a working relationship with each one. Some days the prompt will land immediately. Others will feel flat or difficult or like you have nothing to say. Write anyway. Resistance is usually the sign that something worth addressing is present.\n\nThe only rule: Write before you evaluate whether you are writing well. The quality of your thinking in this workbook is not the point. The quality of your attention is.`,
    includes: [
      "90 daily prompts across all 5S dimensions",
      "13 weekly integration reviews",
      "The complete 5S Framework orientation",
      "Printable PDF — 33 pages",
      "Immediate download after purchase"
    ],
    downloadUrl: `${CDN}/alignment-workbook_a818a4d9.pdf`,
    tags: ["Journal", "PDF", "90 days", "5S Framework"],
  },
  "wisdom-card-deck": {
    id: "wisdom-card-deck",
    icon: "🃏",
    category: "cards",
    title: "Wisdom Card Deck",
    subtitle: "52 Cards — One Per Week for a Year",
    price: "$34",
    description: "52 beautifully designed digital cards featuring distilled wisdom from the four wisdom traditions at the heart of the Lifewoven platform.",
    longDescription: `One card. One week. One practice.\n\nDo not rush through this deck. Each card is a single distilled insight from one of the four wisdom traditions at the heart of the Lifewoven platform. The instruction is to sit with each card for seven days — to let it work on you through the week rather than consuming it in a sitting.\n\nRead it on Monday. Return to it on Wednesday. Let it find you in a moment on Friday when it is suddenly more relevant than it was at the beginning of the week.\n\nA year of this practice is a year of quiet, cumulative formation — the kind that does not announce itself and does not require dramatic effort. It simply asks your attention, one week at a time.\n\nThe 52 cards draw from four wisdom lineages: Mind Science (Ernest Holmes and New Thought), Vibrational Alignment (Law of Attraction), Meaning-Centered Philosophy (Viktor Frankl and Logotherapy), and Behavioral Science (identity-based habit formation).`,
    includes: [
      "52 wisdom cards — one per week for a year",
      "Cards from all four Lifewoven wisdom traditions",
      "Usage guide and practice instructions",
      "Printable PDF — 12 pages",
      "Immediate download after purchase"
    ],
    downloadUrl: `${CDN}/wisdom-card-deck_f5c3a5dd.pdf`,
    tags: ["Cards", "PDF", "52 cards", "Year-long practice"],
  },
  "morning-alignment-audio": {
    id: "morning-alignment-audio",
    icon: "🎧",
    category: "audio",
    title: "Morning Alignment Series",
    subtitle: "7 Guided Morning Practices",
    price: "$37",
    description: "Seven 15-minute guided audio sessions — one for each day of the week — to start your day in alignment.",
    longDescription: `These fifteen minutes belong entirely to you — before the week asks anything of you, before the calendar fills, before the first message arrives.\n\nThe Morning Alignment Series is seven complete guided sessions, one for each day of the week, each approximately fifteen minutes. Each session moves through five elements: Arrive, Acknowledge, Appreciate, Intend, and Release — a complete interior practice that sets the vibrational tone for everything that follows.\n\nThe sessions are designed to be used in sequence across a week, or individually on the days when a specific practice is most needed. Monday's Foundation session establishes the week's ground. Each subsequent day builds on a specific dimension of the Lifewoven framework.\n\nThis download includes the complete narrated scripts — formatted for professional recording or personal use. Each script includes narrator pacing notes, pause markers, and breath cues.`,
    includes: [
      "7 complete guided session scripts (one per day of the week)",
      "Professional narrator pacing notes and pause markers",
      "Breath cues and ambient sound suggestions",
      "~15 minutes per session",
      "PDF download — 50 pages",
      "Immediate download after purchase"
    ],
    downloadUrl: `${CDN}/morning-alignment-audio_f184f493.pdf`,
    tags: ["Audio Scripts", "Morning Practice", "7 sessions", "PDF"],
  },
  "belief-rewrite-workbook": {
    id: "belief-rewrite-workbook",
    icon: "✍️",
    category: "workbook",
    title: "Belief Rewrite Workbook",
    subtitle: "Rewire Your Story in 30 Days",
    price: "$19",
    description: "A focused 30-day workbook for identifying and rewriting the limiting beliefs that are holding you back. Rooted in the Story module of the 5S Framework.",
    longDescription: `The Story module of the 5S Framework begins with a single premise: the story you tell about yourself is not a description of reality. It is a set of instructions. The beliefs you hold about who you are, what you are capable of, and what is available to you are not passive observations — they are active directives that shape what you attempt, what you notice, and what you allow yourself to receive.\n\nThis workbook is a 30-day structured process for surfacing, examining, and rewriting the specific beliefs that are most actively limiting your experience. It is not a positive-thinking exercise. It is a rigorous inquiry into the actual content of your current story — followed by a deliberate, evidence-based process for writing a more accurate one.`,
    includes: [
      "30-day structured belief rewrite process",
      "Belief surfacing and examination exercises",
      "Evidence-gathering and rewrite protocols",
      "Story module orientation from the 5S Framework",
      "Printable PDF",
      "Immediate download after purchase"
    ],
    downloadUrl: "",
    tags: ["Beliefs", "PDF", "30 days", "Story Module"],
  },
  "identity-stack-workbook": {
    id: "identity-stack-workbook",
    icon: "🧱",
    category: "workbook",
    title: "The Identity Stack Workbook",
    subtitle: "Design the Habits That Make You, You",
    price: "$22",
    description: "A practical workbook for designing, stacking, and anchoring identity-based habits. Includes the Minimum Viable Habit framework and the Better Mirror tracking system.",
    longDescription: `Most habit change fails not because of a lack of discipline but because of a mismatch between the desired behavior and the underlying identity. The Identity Stack Workbook addresses the root.\n\nThis workbook walks you through the complete identity-based habit design process: surfacing the current identity architecture, writing a credible identity declaration, designing the habit stack that carries that identity into daily life, and building the recovery protocols that make consistency possible over time.\n\nIncludes the Minimum Viable Habit framework — the practice of designing habits small enough to survive your worst days — and the Better Mirror tracking system, which counts returns as demonstrations rather than treating missed days as failures.`,
    includes: [
      "Complete identity-based habit design process",
      "Minimum Viable Habit framework",
      "Better Mirror tracking system",
      "Identity declaration templates",
      "Weekly review structure",
      "Printable PDF",
      "Immediate download after purchase"
    ],
    downloadUrl: "",
    tags: ["Habits", "Identity", "PDF", "Behavior Science"],
  },
  "reset-protocol-audio": {
    id: "reset-protocol-audio",
    icon: "🔄",
    category: "audio",
    title: "Reset Audio",
    subtitle: "The Full Resilience Protocol",
    price: "$27",
    description: "A guided audio experience walking you through the complete Reset pathway. For the moments when you need to return to yourself.",
    longDescription: `The Reset pathway is built on a single premise: returning is not failure. It is the practice.\n\nThis guided audio experience walks you through the complete Reset protocol — a 45-minute journey from wherever you are to a place of genuine re-ground. It is not a motivational session. It is not a pep talk. It is a structured, compassionate process for the specific experience of having lost your footing and needing to find it again.\n\nThe Reset Audio is for the moments when you know something has shifted — when the alignment feels distant, when the story has gone dark, when the energy is low and the path forward is unclear. It meets you there, without judgment, and walks you back.`,
    includes: [
      "Complete 45-minute Reset protocol script",
      "Professional narrator pacing notes",
      "Pause and breath markers",
      "PDF download",
      "Immediate download after purchase"
    ],
    downloadUrl: "",
    tags: ["Audio Scripts", "Resilience", "45 min", "Reset Pathway"],
  },
};

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id ?? "";
  const product = PRODUCTS[productId];

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="container pt-24 pb-20 max-w-3xl mx-auto">
          <Link href="/store">
            <p className="text-base text-muted-foreground mb-6 hover:text-foreground transition-colors cursor-pointer flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Store
            </p>
          </Link>
          <h1 className="font-serif text-4xl font-light text-foreground mb-3">Product Coming Soon</h1>
          <p className="text-muted-foreground font-light text-base mb-8">This product is currently in development. Check back soon.</p>
          <Button asChild variant="outline"><Link href="/store">Browse All Products</Link></Button>
        </div>
      </div>
    );
  }

  const CategoryIcon = product.category === "audio" ? Headphones : product.category === "cards" ? Star : FileText;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-24 pb-20 max-w-3xl mx-auto">
        <Link href="/store">
          <p className="text-base text-muted-foreground mb-8 hover:text-foreground transition-colors cursor-pointer flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </p>
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <CategoryIcon className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">{product.category}</p>
          </div>
          <div className="text-4xl mb-4">{product.icon}</div>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-3">{product.title}</h1>
          <p className="text-xl text-muted-foreground font-light mb-5">{product.subtitle}</p>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="text-2xl font-light text-foreground">{product.price}</span>
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{tag}</span>
              ))}
            </div>
          </div>
          {product.downloadUrl ? (
            <a href={product.downloadUrl} download target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2">
                <Download className="h-4 w-4" /> Download — {product.price}
              </Button>
            </a>
          ) : (
            <Button size="lg" disabled className="gap-2 opacity-60">
              <Download className="h-4 w-4" /> Coming Soon
            </Button>
          )}
        </div>

        {/* Description */}
        <div className="mb-10 p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-serif text-2xl font-light text-foreground mb-4">About This {product.category === "audio" ? "Series" : product.category === "cards" ? "Deck" : "Workbook"}</h2>
          {product.longDescription.split("\n\n").map((p, i) => (
            <p key={i} className="text-base text-muted-foreground font-light leading-relaxed mb-3 last:mb-0">{p}</p>
          ))}
        </div>

        {/* What's Included */}
        <div className="mb-10 p-6 rounded-2xl border border-border bg-secondary/20">
          <h2 className="font-serif text-2xl font-light text-foreground mb-4">What's Included</h2>
          <ul className="space-y-2">
            {product.includes.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-base text-foreground/80 font-light">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-2xl border border-border bg-card text-center">
          <h3 className="font-serif text-2xl font-light text-foreground mb-3">Ready to Begin?</h3>
          <p className="text-base text-muted-foreground font-light mb-6 max-w-md mx-auto">
            {product.downloadUrl
              ? "Your download will begin immediately. No account required."
              : "This product is currently in development. Check back soon."}
          </p>
          {product.downloadUrl ? (
            <a href={product.downloadUrl} download target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2">
                <Download className="h-4 w-4" /> Download {product.title} — {product.price}
              </Button>
            </a>
          ) : (
            <Button size="lg" disabled className="gap-2 opacity-60">
              Coming Soon
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
