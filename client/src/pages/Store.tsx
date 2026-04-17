import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShoppingBag, BookOpen, Headphones, Layers, Star } from "lucide-react";
import { useState } from "react";
import { PayPalButton } from "@/components/PayPalButton";
import { useAuth } from "@/_core/hooks/useAuth";

const PRODUCTS = [
  {
    id: "alignment-fundamentals",
    category: "course",
    icon: "📐",
    title: "Alignment Fundamentals",
    subtitle: "The 5S Framework in Practice",
    price: "$97",
    description: "Six weeks. Five dimensions. One coherent life. Alignment Fundamentals is the complete introduction to the 5S Framework — State, Story, Standards, Strategy, Stewardship — built for people who are ready to move from insight to practice.",
    tags: ["5S Framework", "Foundations", "6 weeks"],
  },
  {
    id: "the-alignment-current",
    category: "course",
    icon: "🌀",
    title: "The Alignment Current",
    subtitle: "Advanced Alignment Practice",
    price: "$147",
    description: "Most people touch alignment occasionally. This course teaches you to live there. The Alignment Current is a four-week deep-immersion in the daily practices, emotional tools, and inner conditions that make sustained interior coherence not a peak experience but a way of being.",
    tags: ["Interior Alignment", "Advanced", "4 weeks"],
  },
  {
    id: "identity-in-motion",
    category: "course",
    icon: "⚛️",
    title: "Identity in Motion",
    subtitle: "Habit Architecture for the Whole Self",
    price: "$127",
    description: "Behavior change fails when it is built on willpower. Identity in Motion teaches you to build habits from the inside out — starting with who you are becoming, then designing the daily practices that make that identity real. Behavior science, applied to the whole self.",
    tags: ["Habits", "Identity", "Behavior Science"],
  },
  {
    id: "the-meaning-foundation",
    category: "course",
    icon: "🔍",
    title: "The Meaning Foundation",
    subtitle: "Purpose, Resilience & the Unshakeable Why",
    price: "$97",
    description: "Meaning is not found — it is made. The Meaning Foundation is a four-week course in the practice of meaning-centered living: how to locate your deepest why, use it as an anchor through difficulty, and build a life that holds its shape under pressure.",
    tags: ["Meaning", "Purpose", "Resilience"],
  },
  {
    id: "belief-rewrite-workbook",
    category: "workbook",
    icon: "✍️",
    title: "Belief Rewrite Workbook",
    subtitle: "Rewire Your Story in 30 Days",
    price: "$19",
    description: "The story you tell about yourself is not a description of reality. It is a set of instructions. This 30-day workbook is a structured process for surfacing the specific beliefs that are most actively limiting your experience — and rewriting them with evidence, not optimism.",
    tags: ["Beliefs", "PDF", "30 days"],
  },
  {
    id: "identity-stack-workbook",
    category: "workbook",
    icon: "🧱",
    title: "The Identity Stack Workbook",
    subtitle: "Design the Habits That Make You, You",
    price: "$22",
    description: "Who you are becoming shapes what you do. This workbook walks you through the complete identity-based habit design process — from surfacing your current identity architecture to writing a credible identity declaration to building the habit stack that carries it into daily life.",
    tags: ["Habits", "Identity", "PDF"],
  },
  {
    id: "morning-alignment-audio",
    category: "audio",
    icon: "🎧",
    title: "Morning Alignment Series",
    subtitle: "7 Guided Morning Practices",
    price: "$37",
    description: "Fifteen minutes, before the day asks anything of you. The Morning Alignment Series is seven complete guided sessions — one for each day of the week — moving through Arrive, Acknowledge, Appreciate, Intend, and Release. A full interior practice that sets the tone for everything that follows.",
    tags: ["Audio", "Morning", "7 sessions"],
  },
  {
    id: "reset-protocol-audio",
    category: "audio",
    icon: "🔄",
    title: "Reset Audio",
    subtitle: "The Full Resilience Protocol",
    price: "$27",
    description: "Returning is not failure. It is the practice. The Reset Audio is a 45-minute guided experience for the specific moment when alignment feels distant and the path forward is unclear. It meets you where you are — without judgment — and walks you back. (Narrated audio; AI-voiced first edition, owner-voiced version coming.)",
    tags: ["Audio", "Resilience", "45 min"],
  },
  {
    id: "wisdom-card-deck",
    category: "cards",
    icon: "🃏",
    title: "Wisdom Card Deck",
    subtitle: "52 Cards of Timeless Insight",
    price: "$34",
    description: "One card. One week. One practice. The Wisdom Card Deck is 52 distilled insights from the four wisdom traditions at the heart of Lifewoven — Mind Science, Interior Alignment, Meaning-Centered Philosophy, and Behavioral Science. Sit with each card for seven days and let it work on you.",
    tags: ["Cards", "PDF", "52 cards"],
  },
];

const CATEGORIES = [
  { id: "all", label: "All Products", icon: ShoppingBag },
  { id: "course", label: "Courses", icon: Layers },
  { id: "workbook", label: "Workbooks", icon: BookOpen },
  { id: "audio", label: "Audio", icon: Headphones },
  { id: "cards", label: "Card Decks", icon: Star },
];

export default function Store() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { user, isAuthenticated } = useAuth();
  const filtered = activeCategory === "all" ? PRODUCTS : PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Store</p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foreground mb-4">Wisdom Tools</h1>
          <p className="text-muted-foreground text-lg font-light max-w-xl mx-auto">
            Courses, workbooks, audio programs, and card decks — each one an original Lifewoven creation, distilling timeless wisdom into practical tools for modern life.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-colors ${
                  activeCategory === cat.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-muted-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {cat.label}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map(product => (
            <Link key={product.id} href={product.category === "course" ? `/course/${product.id}` : `/product/${product.id}`}>
              <div className="p-4 sm:p-6 rounded-2xl border border-border bg-card hover:border-muted-foreground transition-all cursor-pointer h-full flex flex-col">
                <div className="text-3xl mb-4">{product.icon}</div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-serif text-lg font-light text-foreground">{product.title}</h3>
                  <span className="text-sm font-medium text-foreground flex-shrink-0">{product.price}</span>
                </div>
                <p className="text-base text-muted-foreground mb-3">{product.subtitle}</p>
                <p className="text-base text-muted-foreground font-light leading-relaxed flex-1 mb-4">{product.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-12 p-6 sm:p-8 rounded-2xl border border-border bg-card text-center">
          <h2 className="font-serif text-2xl font-light text-foreground mb-3">Bundle & Save</h2>
          <p className="text-muted-foreground text-base mb-6 max-w-md mx-auto">
            Get the complete Lifewoven toolkit — all courses, workbooks, audio programs, and card decks — at one transformational price.
          </p>
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-muted-foreground line-through text-lg">$566</span>
            <span className="text-3xl font-light text-foreground">$297</span>
            <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">Save 52%</span>
          </div>
          {isAuthenticated ? (
            <div className="flex justify-center">
              <PayPalButton productSlug="complete-bundle" priceUsd={297} />
            </div>
          ) : (
            <Button size="lg" className="gap-2" asChild>
              <Link href="/store"><ShoppingBag className="h-4 w-4" /> Get the Complete Bundle — Sign in to Purchase</Link>
            </Button>
          )}
        </div>
        <p className="text-center text-base text-muted-foreground mt-8 max-w-2xl mx-auto">
          All Lifewoven courses, workbooks, and audio programs are original creations. They are informed by wisdom traditions and personal development ideas but are independently produced and not affiliated with, endorsed by, or licensed by any named author, teacher, or publisher.
        </p>
      </div>
    </div>
  );
}
